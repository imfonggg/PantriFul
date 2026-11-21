import { useState } from "react";
import { Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "./LanguageProvider";
export function DirectionsAction({ url }: { url: string }) {
 const [open, setOpen] = useState(false);const [copied, setCopied] = useState(false);const { t } = useLanguage();
 return <><Button size="sm" onClick={() => { setCopied(false); setOpen(true); }}><Navigation />{t("Directions")}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="w-[calc(100%-2rem)] rounded-lg" closeLabel={t("Close")}><DialogTitle>{t("Open Google Maps Separately")}</DialogTitle><DialogDescription>{t("If your browser blocks the new tab, copy this link and paste it into a new browser tab or the Google Maps app.")}</DialogDescription><input aria-label={t("Directions Link")} readOnly value={url} className="w-full min-w-0 rounded-md border bg-card p-3 text-sm" onFocus={(e) => e.target.select()} /><Button onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } }}><Copy />{t(copied ? "Copied" : "Copy Link")}</Button></DialogContent></Dialog></>;
}
