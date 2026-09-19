import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const patientRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    dob: z.string().min(1, "Date of birth is required"),
    bloodGroup: z.string().min(1, "Blood group is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type PatientRegisterFormData = z.infer<typeof patientRegisterSchema>;

export const doctorRegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    specialization: z.string().min(1, "Specialization is required"),
    licenseNumber: z.string().min(1, "License number is required"),
    clinicName: z.string().min(1, "Clinic name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type DoctorRegisterFormData = z.infer<typeof doctorRegisterSchema>;

export const prescriptionSchema = z.object({
  diagnosis: z.string().min(1, "Diagnosis is required"),
  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Medication name is required"),
        dosage: z.string().min(1, "Dosage is required"),
        duration: z.string().min(1, "Duration is required"),
      })
    )
    .min(1, "At least one medication is required"),
  notes: z.string().optional(),
});

export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
