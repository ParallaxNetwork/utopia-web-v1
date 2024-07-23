import {type Prisma} from "@prisma/client";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "~/server/api/trpc";
import {partnerIdSchema} from "~/validation/partnerValidation";
import {gallerySchema} from "~/validation/galleryValidation";

export const newsRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.db.news.findMany({
      where: {
        status: {
          not: "DELETED",
        },
      },
      orderBy: { createdAt: "asc" },
      include: { image: true },
    });
  }),

  getFront: publicProcedure.query(({ ctx }) => {
    return ctx.db.news.findMany({
      where: {
        status: {
          not: "DELETED",
        },
      },
      orderBy: { createdAt: "desc" },
      include: { image: true },
      take: 9,
    });
  }),

  create: protectedProcedure.input(gallerySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.news.create({
      data: {
        name: input.name,
        description: input.description,
        url: input.url,
        status: "ACTIVE",
        createdBy: { connect: { id: Number(ctx.session.user.id) } },
        image: {
          create: {
            path: input.image,
          },
        },
      },
    });
  }),

  update: protectedProcedure.input(gallerySchema).mutation(async ({ ctx, input }) => {
    return ctx.db.news.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
        ...(input.url && { url: input.url }),
        ...(input.image && {
          image: {
            create: {
              path: input.image,
            },
          },
        }),
      },
    });
  }),

  delete: protectedProcedure.input(partnerIdSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.news.update({
      where: { id: input.id },
      data: {
        status: "DELETED",
      },
    });
  }),
});

export type GalleryWithImage = Prisma.NewsGetPayload<{
  include: { image: true };
}>;
