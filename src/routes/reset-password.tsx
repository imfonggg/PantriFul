import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect,useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { credentialsSchema } from "@/data/accountSchemas";
import { pageHead } from "@/data/pages";
export const Route=createFileRoute("/reset-password")({head:()=>pageHead("Reset Password","Set a new password for your PantriFul account using a secure recovery link."),component:Reset});
function Reset(){const {t}=useLanguage();const [recovery,setRecovery]=useState(false);const [password,setPassword]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);useEffect(()=>{setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type")==="recovery");},[]);
 async function submit(e:React.FormEvent){e.preventDefault();const valid=credentialsSchema.shape.password.safeParse(password);if(!valid.success){setMessage(t("Use at least 8 characters."));return;}setBusy(true);try{const {error}=await supabase.auth.updateUser({password:valid.data});if(error)throw error;setMessage(t("Password Updated"));setRecovery(false);}catch(error){setMessage(error instanceof Error?error.message:t("Please try again."));}finally{setBusy(false);}}
 return <main className="mx-auto max-w-xl px-4 py-12"><h1 className="text-3xl font-bold">{t("Reset Password")}</h1>{recovery?<form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-2">{t("New Password")}<input type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} className="h-12 rounded-md border bg-card px-3" /></label><Button disabled={busy}>{t("Update Password")}</Button></form>:<p className="mt-4">{t("Open a valid password reset link from your email to continue.")}</p>}{message&&<p role="status" className="mt-4">{message}</p>}<Button asChild variant="link" className="mt-6"><Link to="/auth">{t("Back To Log In")}</Link></Button></main>;
}
