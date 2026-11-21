import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";
export function SignupPrompt({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
 const { t } = useLanguage();
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="w-[calc(100%-2rem)] rounded-lg" closeLabel={t("Close")}><Bookmark className="size-8 text-green" /><DialogTitle>{t("Save For Future Visits")}</DialogTitle><DialogDescription>{t("Want to keep your household preferences and saved food locations for next time? Create an optional account. We do not use tracking cookies to save your browsing data.")}</DialogDescription><Button asChild><Link to="/auth" onClick={() => onOpenChange(false)}>{t("Sign Up / Log In")}</Link></Button><Button variant="ghost" onClick={() => onOpenChange(false)}>{t("Continue Without An Account")}</Button></DialogContent></Dialog>;
}
export function SaveSignupButton() {
 const [open, setOpen] = useState(false);const { t } = useLanguage();
 return <><Button variant="outline" onClick={() => setOpen(true)}><Bookmark />{t("Save For Future Visits")}</Button><SignupPrompt open={open} onOpenChange={setOpen} /></>;
}
