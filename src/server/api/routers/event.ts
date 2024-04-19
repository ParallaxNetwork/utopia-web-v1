import { type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { eventSchema, eventIdSchema, eventUpdateSchema } from "~/validation/eventValidation";
import { paginationSchema } from "~/validation/paginationValidation";

export const eventRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        NOT: {
          status: "DELETED"
        }
      },
      orderBy: { createdAt: "desc" },
      include: { images: true },
    });
  }),

  getFront: publicProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.event.findMany({
        where: {
          status: "PUBLISHED"
        },
        include: {
          images: true
        },
        // skip: (input.page - 1) * input.limit,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: input.direction === "forward" ? "asc" : "desc",
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (data.length > input.limit) {
        const nextItem = data.pop();
        nextCursor = nextItem!.id;
      }

      return {
        data,
        total: data.length,
        next_page: nextCursor,
        // next_page: input.page + 1,
        last_page: Math.ceil(data.length / input.limit),
        per_page: input.limit,
      }
    }
  ),

  create: protectedProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          name: input.name,
          description: input.description,
          status: "DRAFT",
          createdBy: { connect : { id : Number(ctx.session.user.id)}},
          images: {
            create: input.images!.map((image) => ({
              path: image
            }))
          }
        },
      });
    }
  ),

  update: protectedProcedure
    .input(eventUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
          ...((input.images?.length ?? 0) && { 
            images: {
              set: [],
              create: input.images!.map((image) => ({
                path: image
              }))
            }
          }),
        },
      });
    }
  ),

  publish: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED'
        }
      })  
    }
  ),

  unpublish: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT'
        }
      })
    }
  ),

  delete: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'DELETED'
        }
      })
    }
  ),
});


export type EventWithImages = Prisma.EventGetPayload<{
  include: { images: true };
}>;