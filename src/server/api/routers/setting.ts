import { type Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { updateAppSettingSchema } from "~/validation/appSettingsValidation";

export const appSettingsRouter = createTRPCRouter({
  getAppSetting: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.appSetting.findMany();
  }),
  update: protectedProcedure.input(updateAppSettingSchema).mutation(async ({ ctx, input }) => {
    return ctx.db.partner.update({
      where: { id: input.id },
      data: {
        ...(input.value && { name: input.value }),
      },
    });
  }),
});



export type AppSettingPayload = Prisma.AppSettingGetPayload<object>;
