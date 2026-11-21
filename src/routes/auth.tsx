import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { credentialsSchema } from "@/data/accountSchemas";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/auth")({ head: () => pageHead("Sign Up / Log In", "Optional PantriFul accounts save your household preferences and food locations. Food browsing never requires an account."), component: Auth });
function Auth() {
 const { user } = useAuth();const { t } = useLanguage();const navigate = useNavigate();
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
   if(mode==="signup") {const {error}=await supabase.auth.signUp({...valid.data,options:{emailRedirectTo:window.location.origin}});if(error)throw error;setMessage(t("Check your email to confirm your account before signing in."));}
   else {const {error}=await supabase.auth.signInWithPassword(valid.data);if(error)throw error;await navigate({to:"/account"});}
  } catch(error){setMessage(error instanceof Error?error.message:t("Please try again."));}finally{setBusy(false);}
 }
 async function social(provider:"google"|"lovable") {setBusy(true);setMessage("");try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+"/auth"});if(result.error){setMessage(result.error.message);return;}if(!result.redirected)await navigate({to:"/account"});}catch{setMessage(t("Sign-in could not be completed. Please try again."));}finally{setBusy(false);}}
 return <main className="mx-auto max-w-xl px-4 py-10 sm:py-14"><h1 className="text-3xl font-bold">{t("Sign Up / Log In")}</h1><p className="mt-4 leading-relaxed">{t("An account is optional. Save your profile only when you choose to; browse food without signing up.")}</p><div className="mt-6 flex gap-2" role="tablist">{(["signup","login"] as const).map(v=><Button key={v} role="tab" aria-selected={mode===v} variant={mode===v?"default":"outline"} onClick={()=>{setMode(v);setMessage("");}}>{t(v==="signup"?"Sign Up":"Log In")}</Button>)}</div>
 <form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-semibold">{t("Email")}<input type="email" autoComplete="email" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>{mode!=="reset"&&<label className="grid gap-2 text-sm font-semibold">{t("Password")}<input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>}<Button type="submit" disabled={busy} className="h-12">{t(busy?"Please Wait…":mode==="reset"?"Send Reset Link":mode==="signup"?"Create Account":"Log In")}</Button></form>
 <Button variant="link" className="mt-2" onClick={()=>{setMode(mode==="reset"?"login":"reset");setMessage("");}}>{t(mode==="reset"?"Back To Log In":"Forgot Password?")}</Button>{message&&<p role="status" className="mt-4 rounded-md border border-brown bg-beige p-3 text-sm">{message}</p>}
 <div className="mt-6 grid gap-3"><Button variant="outline" className="google-signin h-12" disabled={busy} onClick={()=>void social("google")}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>{t("Continue with Google")}</Button><Button variant="outline" className="h-12" disabled={busy} onClick={()=>void social("lovable")}><LovableMark />{t("Continue with Lovable")}</Button></div><p className="mt-6 text-sm text-muted-foreground">{t("We do not use tracking cookies. Signing in uses essential secure session storage to keep you logged in.")}</p><Button asChild variant="link" className="mt-3"><Link to="/">{t("Continue Without An Account")}</Link></Button></main>;
}
