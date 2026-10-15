import { z } from "zod";
export const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  phone: z.string().regex(/^\+[1-9][0-9 ()-]{6,24}$/),
  country: z.string().trim().min(2).max(80),
  experience: z.enum(["beginner", "some", "experienced"]),
  reason: z.string().trim().min(10).max(2000),
  duration: z.enum(["6", "12", "unsure"]),
  privacy: z.literal(true),
  marketing: z.boolean(),
  language: z.enum(["sq", "en"]),
  website: z.string().max(0),
});
export const statuses = [
  "New",
  "Contacted",
  "Interested",
  "Follow-up Required",
  "Joined",
  "Not Ready",
  "Closed",
] as const;
export const adminUpdateSchema = z.object({
  id: z.uuid(),
  status: z.enum(statuses),
  notes: z.string().max(10000),
  withdrawMarketing: z.boolean().optional(),
});
