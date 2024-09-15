import * as z from "zod";

export const eventIdSchema = z.object({
    id: z.number().optional(),
})

export const eventSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    image: z.string().optional(),
})

export const eventUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
}).merge(eventIdSchema);

export type IEvent = z.infer<typeof eventSchema>;
export type IEventId = z.infer<typeof eventIdSchema>;
export type IEventUpdate = z.infer<typeof eventUpdateSchema>;