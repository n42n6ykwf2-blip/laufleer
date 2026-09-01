import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 1-bosqich: email + parol */
export const customerSignUpSchema = z
  .object({
    email: z.string().trim().regex(emailPattern, "emailInvalid"),
    password: z.string().min(8, "passwordTooShort").max(128),
    passwordConfirm: z.string(),
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

/** 3-bosqich: ism / familiya / telefon (telefon ixtiyoriy) */
export const customerProfileSchema = z
  .object({
    firstName: z.string().trim().min(2, "firstNameRequired").max(60),
    lastName: z.string().trim().min(2, "lastNameRequired").max(60),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const phone = data.phone?.trim();
    if (phone && !isValidPhoneNumber(phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "phoneInvalid",
      });
    }
  });

export const customerSignInSchema = z.object({
  email: z.string().trim().regex(emailPattern, "emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

export type CustomerSignUpInput = z.infer<typeof customerSignUpSchema>;
export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type CustomerSignInInput = z.infer<typeof customerSignInSchema>;
