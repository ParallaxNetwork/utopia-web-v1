import { type Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  partnerGroupSchema,
  partnerIdSchema,
  partnerSchema,
  partnerUpdateSchema,
} from "~/validation/partnerValidation";

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
            images: true,
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
      return ctx.db.partner.create({
        data: {
          name: input.name!,
          description: input.description,
          images: {
            create: input.images!.map((image) => ({
              path: image,
            })),
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
      return ctx.db.partner.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description && { description: input.description }),
          ...((input.images?.length ?? 0) && {
            images: {
              set: [],
              create: input.images!.map((image) => ({
                path: image,
              })),
            },
          }),
        },
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
  include: { images: true; partnerGroup: true };
}>;
