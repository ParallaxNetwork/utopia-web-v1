import {type Prisma} from "@prisma/client";
import {createTRPCRouter, protectedProcedure, publicProcedure,} from "~/server/api/trpc";
import {partnerGroupSchema, partnerIdSchema, partnerUpdateSchema,} from "~/validation/partnerValidation";
import {uploadImage} from "~/server/api/services/UploadService";

interface UpdatePartnerInput {
  name?: string;
  description?: string;
  image?: object;
}

export const partnerRouter = createTRPCRouter({
  getPartnerGroups: publicProcedure.query(({ ctx }) => {
    return ctx.db.partnerGroup.findMany({
      where: {
        status: {
          not: "DELETED",
        },
      },
      orderBy: { createdAt: "asc" },
      include: {
        partners: {
          where: {
            status: {
              not: "DELETED",
            },
          },
          orderBy: { createdAt: "asc" },
          include: {
            image: true,
            partnerGroup: true,
          },
        },
      },
    });
  }),

  createPartnerGroup: protectedProcedure
    .input(partnerGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partnerGroup.create({
        data: {
          name: input.name,
          status: "ACTIVE",
          createdBy: { connect: { id: Number(ctx.session.user.id) } },
        },
      });
    }),

  updatePartnerGroup: protectedProcedure
    .input(partnerGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partnerGroup.update({
        where: { id: input.id },
        data: {
          name: input.name,
        },
      });
    }),

  deletePartnerGroup: protectedProcedure
    .input(partnerIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partnerGroup.update({
        where: { id: input.id },
        data: {
          status: "DELETED",
        },
      });
    }),

  createPartner: protectedProcedure
    .input(partnerUpdateSchema)
    .mutation(async ({ ctx, input }) => {

      const imageUpload = input.image ? await uploadImage(
        {
          module: 'news',
          file: input.image,
        }) : null;

      if (!imageUpload) {
        throw new Error('Failed to upload image');
      }


      return ctx.db.partner.create({
        data: {
          name: input.name!,
          description: input.description,
          image: {
            create: {
              path: imageUpload.uri,
              thumbnail: imageUpload.thumbnail
            },
          },
          status: "DRAFT",
          partnerGroup: { connect: { id: input.partnerCategoryId } },
          createdBy: { connect: { id: Number(ctx.session.user.id) } },
        },
      });
    }),

  updatePartner: protectedProcedure
    .input(partnerUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const data: UpdatePartnerInput = {
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
      };

      if(input.image){
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

      return ctx.db.partner.update({
        where: { id: input.id },
        data: data,
      });
    }),

  deletePartner: protectedProcedure
    .input(partnerIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.update({
        where: { id: input.id },
        data: {
          status: "DELETED",
        },
      });
    }),
});

export type PartnerWithImages = Prisma.PartnerGetPayload<{
  include: { image: true; partnerGroup: true };
}>;
