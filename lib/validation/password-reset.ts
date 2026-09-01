import { z } from "zod";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 1-bosqich: emailga tiklash havolasini so'rash */
export const passwordResetRequestSchema = z.object({
  email: z.string().trim().regex(emailPattern, "emailInvalid"),
});

/** 2-bosqich: yangi parol o'rnatish */
export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "passwordTooShort").max(128),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["passwordConfirm"],
        message: "passwordMismatch",
      });
    }
  });

export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
