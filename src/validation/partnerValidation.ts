import * as z from "zod";

export const partnerGroupSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
})

export type IPartnerGroup = z.infer<typeof partnerGroupSchema>;


export const partnerIdSchema = z.object({
    id: z.number().optional(),
})

export const partnerSchema = z.object({
    name: z.string(),
    partnerCategoryId: z.number(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
})

export const partnerUpdateSchema = z.object({
    name: z.string().optional(),
    partnerCategoryId: z.number().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
}).merge(partnerIdSchema);

export type IPartner = z.infer<typeof partnerSchema>;
export type IPartnerId = z.infer<typeof partnerIdSchema>;
export type IPartnerUpdate = z.infer<typeof partnerUpdateSchema>;