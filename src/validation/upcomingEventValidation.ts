import * as z from "zod";

export const upcomingEventIdSchema = z.object({
  id: z.number().optional(),
})

export const upcomingEventSchema = z.object({
  title: z.string().min(1).max(255, { message: "Name must not be more than 255 chars long" }),
  locationUrl: z.string().min(1).max(255, { message: "Name must not be more than 255 chars long" }),
  date: z.date(),
  registerUrl: z.string().max(255, { message: "Name must not be more than 255 chars long" }).optional(),
})

export const upcomingEventUpdateSchema = z.object({
  title: z.string().min(1).max(255, { message: "Name must not be more than 255 chars long" }),
  locationUrl: z.string().min(1).max(255, { message: "Name must not be more than 255 chars long" }),
  date: z.date(),
  registerUrl: z.string().max(255, { message: "Name must not be more than 255 chars long" }).optional(),
}).merge(upcomingEventIdSchema);

export type IUpcomingEventUpdate = z.infer<typeof upcomingEventUpdateSchema>;