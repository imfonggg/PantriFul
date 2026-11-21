import { z } from "zod";
export const credentialsSchema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8).max(128) });
export const profileSchema = z.object({ display_name: z.string().trim().max(100), household_size: z.number().int().min(1).max(20).nullable(), household: z.enum(["", "individuals", "families", "seniors", "students"]), dietary: z.enum(["", "vegetarian", "vegan", "halal", "gluten_free"]), city: z.string().trim().max(100) });
export const bookmarkSchema = z.object({ resourceId: z.string().min(1).max(150), saved: z.boolean() });
