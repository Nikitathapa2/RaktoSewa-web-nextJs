import { z } from "zod";

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^[0-9+]+$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;





export const registerSchema = z.union([
  // Donor schema
  z.object({
    userType: z.literal("donor"),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .min(10, "Phone number is required")
      .regex(/^[0-9+]+$/, "Invalid phone number"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], { message: "Select your blood group" }),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(3, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),

  // Organization schema
  z.object({
    userType: z.literal("organization"),
    organizationName: z.string().min(2, "Organization name is required"),
    headOfOrganization: z.string().min(2, "Head of organization is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z
      .string()
      .min(10, "Phone number is required")
      .regex(/^[0-9+]+$/, "Invalid phone number"),
    address: z.string().min(3, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
]);

export type RegisterSchemaType = z.infer<typeof registerSchema>;
