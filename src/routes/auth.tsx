import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { signUpConfirmed } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { credentialsSchema } from "@/data/accountSchemas";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/auth")({ head: () => pageHead("Sign Up / Log In", "Optional PantriFul accounts save your household preferences and food locations. Food browsing never requires an account."), component: Auth });
function Auth() {
 const { user } = useAuth();const createAccount = useServerFn(signUpConfirmed);const { t } = useLanguage();const navigate = useNavigate();
 const [mode, setMode] = useState<"login" | "signup" | "reset">("signup"); const [email, setEmail] = useState("");const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{if(user) void navigate({to:"/account"});},[user,navigate]);
 async function submit(event: React.FormEvent) {
  event.preventDefault();setMessage("");setBusy(true);
  try {
   if(mode==="reset") {
    const valid=credentialsSchema.shape.email.safeParse(email);if(!valid.success){setMessage(t("Enter a valid email address."));return;}
    const {error}=await supabase.auth.resetPasswordForEmail(valid.data,{redirectTo:window.location.origin+"/reset-password"});if(error)throw error;setMessage(t("Check your email for a password reset link."));return;
   }
   const valid=credentialsSchema.safeParse({email,password});if(!valid.success){setMessage(t("Enter a valid email and a password of at least 8 characters."));return;}
   if(mode==="signup") {
    // Accounts are created already confirmed, so people can log in right away.
    const created=await createAccount({data:valid.data});
    if(created.status==="exists"){setMessage(t("An account with this email already exists. Log in instead."));setMode("login");return;}
    if(created.status==="created"){const {error}=await supabase.auth.signInWithPassword(valid.data);if(error)throw error;await navigate({to:"/account"});return;}
    // Server can't create accounts: use the normal sign-up. With email confirmation off in Supabase it signs in at once.
    const {data,error}=await supabase.auth.signUp({...valid.data,options:{emailRedirectTo:window.location.origin}});if(error)throw error;
    if(data.session){await navigate({to:"/account"});return;}
    setMessage(t("Check your email to confirm your account before signing in."));}
   else {const {error}=await supabase.auth.signInWithPassword(valid.data);if(error)throw error;await navigate({to:"/account"});}
  } catch(error){setMessage(error instanceof Error?error.message:t("Please try again."));}finally{setBusy(false);}
 }

 return <main className="mx-auto max-w-xl px-4 py-10 sm:py-14"><h1 className="text-3xl font-bold">{t("Sign Up / Log In")}</h1><p className="mt-4 leading-relaxed">{t("An account is optional. Save your profile only when you choose to; browse food without signing up.")}</p><div className="mt-6 flex gap-2" role="tablist">{(["signup","login"] as const).map(v=><Button key={v} role="tab" aria-selected={mode===v} variant={mode===v?"default":"outline"} onClick={()=>{setMode(v);setMessage("");}}>{t(v==="signup"?"Sign Up":"Log In")}</Button>)}</div>
 <form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-semibold">{t("Email")}<input type="email" autoComplete="email" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>{mode!=="reset"&&<label className="grid gap-2 text-sm font-semibold">{t("Password")}<input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>}<Button type="submit" disabled={busy} className="h-12">{t(busy?"Please Wait…":mode==="reset"?"Send Reset Link":mode==="signup"?"Create Account":"Log In")}</Button></form>
 <Button variant="link" className="mt-2" onClick={()=>{setMode(mode==="reset"?"login":"reset");setMessage("");}}>{t(mode==="reset"?"Back To Log In":"Forgot Password?")}</Button>{message&&<p role="status" className="mt-4 rounded-md border border-brown bg-beige p-3 text-sm">{message}</p>}
 <p className="mt-6 text-sm text-muted-foreground">{t("We do not use tracking cookies. Signing in uses essential secure session storage to keep you logged in.")}</p><Button asChild variant="link" className="mt-3"><Link to="/">{t("Continue Without An Account")}</Link></Button></main>;
}
