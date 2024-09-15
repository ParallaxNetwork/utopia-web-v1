import {type Prisma} from "@prisma/client";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "~/server/api/trpc";
import {eventIdSchema, eventSchema, eventUpdateSchema} from "~/validation/eventValidation";
import {paginationSchema} from "~/validation/paginationValidation";
import {uploadImage} from "~/server/api/services/UploadService";

interface UpdateEventInput {
  name?: string;
  description?: string;
  image?: object;
}

export const eventRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.db.event.findMany({
      where: {
        NOT: {
          status: "DELETED",
        },
      },
      orderBy: { createdAt: "desc" },
      include: { image: true }, // One-to-one relationship
    });
  }),

  getFront: publicProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.event.findMany({
        where: {
          status: "PUBLISHED",
        },
        include: {
          image: true, // One-to-one relationship
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
      };
    }),

  create: protectedProcedure
    .input(eventSchema)
    .mutation(async ({ ctx, input }) => {

      const imageUpload = input.image ? await uploadImage(
        {
          module: 'news',
          file: input.image,
        }) : null;

      if (!imageUpload) {
        throw new Error('Failed to upload image');
      }

      return ctx.db.event.create({
        data: {
          name: input.name,
          description: input.description ?? "",
          status: "DRAFT",
          createdBy: { connect: { id: Number(ctx.session.user.id) } },
          image: {
            create: {
              path: imageUpload.uri, // Handling a single image
              thumbnail: imageUpload.thumbnail, // Handling a single image
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(eventUpdateSchema)
    .mutation(async ({ ctx, input }) => {

      const data: UpdateEventInput = {
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
      }
      if (input.image){
        const imageUpload = await uploadImage(
          {
            module: 'news',
            file: input.image,
          });

        if (!imageUpload) {
          throw new Error('Failed to upload image');
        }
        data.image = {
          create: {
            path: imageUpload.uri,
            thumbnail: imageUpload.thumbnail,
          }
        }
      }

      return ctx.db.event.update({
        where: { id: input.id },
        data: data,
      });
    }),

  publish: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'PUBLISHED',
        },
      });
    }),

  unpublish: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'DRAFT',
        },
      });
    }),

  delete: protectedProcedure
    .input(eventIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.id },
        data: {
          status: 'DELETED',
        },
      });
    }),
});

export type EventWithImage = Prisma.EventGetPayload<{
  include: { image: true }; // Reflecting the one-to-one relationship with image
}>;
