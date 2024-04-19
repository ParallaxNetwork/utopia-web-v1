import * as z from "zod";

export const userIdSchema = z.object({
    id: z.number().optional(),
})

export const userUpdatePasswordSchema = z.object({
    id: z.number(),
    password: z
        .string({ required_error: "Password is required" })
        .trim()
        .min(6, {
            message: "Password must be at least 6 chars",
        })
        .max(255, { message: "Password must not be more than 1024 chars long" }),
})

export const userSchema = z.object({
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, {
            message: "Name must be at least 3 chars",
        })
        .max(255, { message: "Name must not be more than 255 chars long" }),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .min(3, {
            message: "Email must be at least 3 chars",
        })
        .max(255, { message: "Email must not be more than 255 chars long" }),
    password: z
        .string({ required_error: "Password is required" })
        .trim()
        .min(6, {
            message: "Password must be at least 6 chars",
        })
        .max(255, { message: "Password must not be more than 1024 chars long" })
})

export const userUpdateSchema = z.object({
    id: z.number(),
    name: z
        .string({ required_error: "Name is required" })
        .trim()
        .min(3, {
            message: "Name must be at least 3 chars",
        })
        .max(255, { message: "Name must not be more than 255 chars long" }),
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .min(3, {
            message: "Email must be at least 3 chars",
        })
        .max(255, { message: "Email must not be more than 255 chars long" }),
    password: z
        .string({ required_error: "Password is required" })
        .trim()
        .min(6, {
            message: "Password must be at least 6 chars",
        })
        .max(255, { message: "Password must not be more than 1024 chars long" })
        .optional()
});

export type IUserCreate = z.infer<typeof userSchema>;
export type IUserUpdate = z.infer<typeof userUpdateSchema>;