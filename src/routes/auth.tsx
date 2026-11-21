import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signIn, signUp } from "@/lib/localAccounts";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/auth")({ head: () => pageHead("Sign Up / Log In", "Optional PantriFul accounts save your household preferences and food locations. Food browsing never requires an account."), component: Auth });
function Auth() {
 const { user } = useAuth();const { t } = useLanguage();const navigate = useNavigate();
 const [mode, setMode] = useState<"login" | "signup">("signup"); const [email, setEmail] = useState("");const [password,setPassword]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 useEffect(()=>{if(user) void navigate({to:"/account"});},[user,navigate]);
 async function submit(event: React.FormEvent) {
  event.preventDefault();setMessage("");setBusy(true);
  try {
   // Prototype accounts live in this browser: no email check, works instantly.
   if(mode==="signup") await signUp({email,password}); else await signIn({email,password});
   await navigate({to:"/account"});
  } catch(error){setMessage(error instanceof Error?t(error.message):t("Please try again."));}finally{setBusy(false);}
 }

 return <main className="mx-auto max-w-xl px-4 py-10 sm:py-14"><h1 className="text-3xl font-bold">{t("Sign Up / Log In")}</h1><p className="mt-4 leading-relaxed">{t("An account is optional. Save your profile only when you choose to; browse food without signing up.")}</p><p className="mt-3 rounded-md border-s-4 border-green bg-beige p-3 text-sm">{t("Prototype accounts: any email and password works, and your account is saved in this browser only.")}</p><div className="mt-6 flex gap-2" role="tablist">{(["signup","login"] as const).map(v=><Button key={v} role="tab" aria-selected={mode===v} variant={mode===v?"default":"outline"} onClick={()=>{setMode(v);setMessage("");}}>{t(v==="signup"?"Sign Up":"Log In")}</Button>)}</div>
 <form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2 text-sm font-semibold">{t("Email")}<input type="email" autoComplete="email" maxLength={255} value={email} onChange={e=>setEmail(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>{<label className="grid gap-2 text-sm font-semibold">{t("Password")}<input type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={8} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required className="h-12 rounded-md border-2 bg-card px-3 text-base" /></label>}<Button type="submit" disabled={busy} className="h-12">{t(busy?"Please Wait…":mode==="signup"?"Create Account":"Log In")}</Button></form>
 {message&&<p role="status" className="mt-4 rounded-md border border-brown bg-beige p-3 text-sm">{message}</p>}
 <p className="mt-6 text-sm text-muted-foreground">{t("We do not use tracking cookies. Signing in uses essential secure session storage to keep you logged in.")}</p><Button asChild variant="link" className="mt-3"><Link to="/">{t("Continue Without An Account")}</Link></Button></main>;
}
