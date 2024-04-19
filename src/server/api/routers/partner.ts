import { Prisma } from "@prisma/client";
import {
    createTRPCRouter,
    protectedProcedure, publicProcedure,
} from "~/server/api/trpc";
import { partnerIdSchema, partnerSchema, partnerUpdateSchema } from "~/validation/partnerValidation";

export const partnerRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) => {
    return ctx.db.partner.findMany({
      where: {
        status: {
          not: "DELETED"
        }
      },
      orderBy: { createdAt: "asc" },
      include: { images: true },
    });
  }),

  create: protectedProcedure
    .input(partnerSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.create({
        data: {
            name: input.name,
            description: input.description,
            status: "DRAFT",
            createdBy: { connect : { id : Number(ctx.session.user.id)}},
            images: {
                create: input.images!.map((image) => ({
                    path: image,
                }))
            }
        },
      });
    }
  ),

  update: protectedProcedure
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
                path: image
              }))
            }
          }),
        },
      });
    }
  ),

  delete: protectedProcedure
    .input(partnerIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.partner.update({
        where: { id: input.id },
        data: {
          status: 'DELETED'
        }
      })
    }
  ),
});



export type PartnerWithImages = Prisma.PartnerGetPayload<{
  include: { images: true };
}>;
