import { createServerFn } from "@tanstack/react-start";
import { credentialsSchema } from "@/data/accountSchemas";

/**
 * Create an email/password account that is already confirmed, so testers can
 * log in right away without a confirmation email. Needs SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY on the server; without them it reports
 * "unavailable" and the page falls back to the normal sign-up.
 * Never logs the email or password.
 */
export const signUpConfirmed = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentialsSchema.parse(input))
  .handler(async ({ data }): Promise<{ status: "created" | "exists" | "unavailable"; message?: string }> => {
    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_SERVICE_ROLE_KEY"]) return { status: "unavailable" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (!error) return { status: "created" };
    if (/already|registered|exists/i.test(error.message)) return { status: "exists" };
    console.error(`signup failed: status=${error.status ?? "?"} ${error.message.slice(0, 200)}`);
    return { status: "unavailable", message: error.message };
  });
