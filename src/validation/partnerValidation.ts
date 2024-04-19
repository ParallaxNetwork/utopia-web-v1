import * as z from "zod";

export const partnerIdSchema = z.object({
    id: z.number().optional(),
})

export const partnerSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
})

export const partnerUpdateSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
}).merge(partnerIdSchema);

export type IPartner = z.infer<typeof partnerSchema>;
export type IPartnerId = z.infer<typeof partnerIdSchema>;
export type IPartnerUpdate = z.infer<typeof partnerUpdateSchema>;