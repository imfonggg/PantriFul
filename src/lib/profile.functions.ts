import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bookmarkSchema, profileSchema } from "@/data/accountSchemas";
import { FOOD_RESOURCES } from "@/data/foodResources";

export const getProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("profiles").select("display_name, household_size, household, dietary, city, saved_resource_ids").eq("id", context.userId).single();
  if (error) throw new Error("Your saved profile could not be loaded. Please try again.");
  return data;
});
export const saveProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ context, data }) => {
  const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
  if (error) throw new Error("Your profile could not be saved. Please try again.");
  return { saved: true };
});
export const saveBookmark = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => bookmarkSchema.parse(input)).handler(async ({ context, data }) => {
  if (!FOOD_RESOURCES.some((resource) => resource.id === data.resourceId)) throw new Error("Food location not found.");
  const { data: row, error: readError } = await context.supabase.from("profiles").select("saved_resource_ids").eq("id", context.userId).single();
  if (readError || !row) throw new Error("Your saved locations could not be loaded.");
  const ids = data.saved ? [...new Set([...row.saved_resource_ids, data.resourceId])] : row.saved_resource_ids.filter((id) => id !== data.resourceId);
  const { error } = await context.supabase.from("profiles").update({ saved_resource_ids: ids }).eq("id", context.userId);
  if (error) throw new Error("This location could not be saved. Please try again.");
  return ids;
});
