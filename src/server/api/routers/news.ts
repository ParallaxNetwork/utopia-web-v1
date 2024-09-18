import {type Prisma} from "@prisma/client";
import {createTRPCRouter, protectedProcedure, publicProcedure} from "~/server/api/trpc";
import {partnerIdSchema} from "~/validation/partnerValidation";
import {gallerySchema} from "~/validation/galleryValidation";
import {uploadImage} from "~/server/api/services/UploadService";

interface UpdateNewsInput {
  name?: string;
  description?: string;
  url?: string;
  image?: object;
}

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

    const imageUpload = input.image ? await uploadImage(
      {
        module: 'news',
        file: input.image,
      }) : null;

    if (!imageUpload) {
      throw new Error('Failed to upload image');
    }

    return ctx.db.news.create({
      data: {
        name: input.name,
        description: input.description,
        url: input.url,
        status: "ACTIVE",
        createdBy: { connect: { id: Number(ctx.session.user.id) } },
        image: {
          create: {
            path: imageUpload.uri,
            thumbnail: imageUpload.thumbnail,
          }
        }
      },
    });
  }),

  update: protectedProcedure.input(gallerySchema).mutation(async ({ ctx, input }) => {

    const data: UpdateNewsInput = {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.url && { url: input.url }),
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
      };
    }

      return ctx.db.news.update({
        where: {id: input.id},
        data: data,
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

export type NewsWithImage = Prisma.NewsGetPayload<{
  include: { image: true };
}>;
