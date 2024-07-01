import * as z from "zod";

export const updateAppSettingSchema = z.object({
  id: z.number(),
  value: z.string(),
});

export type IAppSetting = z.infer<typeof updateAppSettingSchema>;