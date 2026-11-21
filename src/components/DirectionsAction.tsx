import { useState } from "react";
import { Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "./LanguageProvider";
export function DirectionsAction({ url }: { url: string }) {
 const [open, setOpen] = useState(false);const [copied, setCopied] = useState(false);const { t } = useLanguage();
 const openDirections = () => {
  // Open synchronously from the click to avoid popup blocking. Clear the opener
  // before leaving the blank page so Google Maps cannot access the app window.
  const popup = window.open("", "_blank", "popup=yes,width=1000,height=800");
  if (popup) { popup.opener = null; popup.location.replace(url); }
  else { setCopied(false); setOpen(true); }
 };
 return <><Button size="sm" onClick={openDirections}><Navigation />{t("Directions")}</Button><Button size="icon" variant="outline" className="size-9" title={t("Copy Directions Link")} aria-label={t("Copy Directions Link")} onClick={() => { setCopied(false); setOpen(true); }}><Copy /></Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="w-[calc(100%-2rem)] rounded-lg" closeLabel={t("Close")}><DialogTitle>{t("Open Google Maps Separately")}</DialogTitle><DialogDescription>{t("If the directions window is blocked, open Google Maps below or copy this link into a new browser tab or the Google Maps app.")}</DialogDescription><input aria-label={t("Directions Link")} readOnly value={url} className="w-full min-w-0 rounded-md border bg-card p-3 text-sm" onFocus={(e) => e.target.select()} /><Button asChild><a href={url} target="_blank" rel="noopener noreferrer"><Navigation />{t("Open Google Maps")}</a></Button><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } }}><Copy />{t(copied ? "Copied" : "Copy Link")}</Button></DialogContent></Dialog></>;
}
