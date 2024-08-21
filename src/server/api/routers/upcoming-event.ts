import { type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { eventSchema, eventIdSchema, eventUpdateSchema } from "~/validation/eventValidation";
import { paginationSchema } from "~/validation/paginationValidation";
import {
  upcomingEventIdSchema,
  upcomingEventSchema,
  upcomingEventUpdateSchema
} from "~/validation/upcomingEventValidation";

export const upcomingEventRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.upcomingEvent.findMany({
      where: {
        NOT: {
          status: "DELETED"
        }
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getFront: publicProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.upcomingEvent.findMany({
        where: {
          status: "PUBLISHED"
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
    .input(upcomingEventSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.upcomingEvent.create({
        data: {
          title: input.title,
          locationUrl: input.locationUrl,
          date: input.date,
          registerUrl: input.registerUrl,
          status: "DRAFT",
          createdBy: { connect : { id : Number(ctx.session.user.id)}},
        },
      });
    }
  ),

  update: protectedProcedure
    .input(upcomingEventUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.upcomingEvent.update({
        where: { id: input.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.registerUrl && { registerUrl: input.registerUrl }),
          ...(input.locationUrl && { locationUrl: input.locationUrl }),
          ...(input.date && { date: input.date }),
        },
      });
    }
  ),

  publish: protectedProcedure
    .input(upcomingEventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.upcomingEvent.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED'
        }
      })  
    }
  ),

  unpublish: protectedProcedure
    .input(upcomingEventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.upcomingEvent.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT'
        }
      })
    }
  ),

  delete: protectedProcedure
    .input(upcomingEventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.upcomingEvent.update({
        where: { id: input.id },
        data: {
          status: 'DELETED'
        }
      })
    }
  ),
});


export type UpcomingEventPayload = Prisma.UpcomingEventGetPayload<object>;