import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signInSchema = z.object({
  email: z.string().regex(emailPattern, "emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

export const signUpSchema = z
  .object({
    email: z.string().regex(emailPattern, "emailInvalid"),
    password: z.string().min(8, "passwordTooShort").max(128),
    passwordConfirm: z.string(),
    contactName: z.string().min(2, "contactNameRequired").max(100),
    acceptTerms: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirm"],
        message: "passwordMismatch",
      });
    }
    if (!data.acceptTerms) {
      ctx.addIssue({
        code: "custom",
        path: ["acceptTerms"],
        message: "termsRequired",
      });
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
