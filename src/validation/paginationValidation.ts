import * as z from "zod";

export const paginationSchema = z.object({
    limit: z.number().min(1).default(10),
    page: z.number().default(1),
    cursor: z.number().nullish(),
    direction: z.enum(["forward", "backward"]).default("backward"),
})

export type IPagination = z.infer<typeof paginationSchema>;