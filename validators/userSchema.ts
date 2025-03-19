import { z } from "zod";

export const signUpSchema = z.object({
    username: z.string().min(3, "Username must be atleast 3 characters long"),
    email: z.string().email("Invalid Email format"),
    password: z.string().min(6, "Password must be atleast 6 characters long")
})

export type signUpData = z.infer<typeof signUpSchema>

export const loginSchema = z.object({
    email: z.string().email("Invalid Email format"),
    password: z.string().min(6, "Password must be atleast 6 characters long")
})

export type loginData = z.infer<typeof loginSchema>