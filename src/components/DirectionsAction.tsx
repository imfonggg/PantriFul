import { useState } from "react";
import { Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "./LanguageProvider";
export function DirectionsAction({ url }: { url: string }) {
 const [open, setOpen] = useState(false);const [copied, setCopied] = useState(false);const [addressCopied, setAddressCopied] = useState(false);const { t } = useLanguage();
 const address = new URL(url).searchParams.get("destination") ?? "";
 const copyAddress = async () => {
  try { await navigator.clipboard.writeText(address); setAddressCopied(true); }
  catch { setAddressCopied(false); setCopied(false); setOpen(true); }
 };
 const openDirections = () => {
  // Open synchronously from the click to avoid popup blocking. Clear the opener
  // before leaving the blank page so Google Maps cannot access the app window.
  const popup = window.open("", "_blank", "popup=yes,width=1000,height=800");
  if (popup) { popup.opener = null; popup.location.replace(url); }
  else { setCopied(false); setOpen(true); }
 };
 return <><Button size="sm" onClick={openDirections}><Navigation />{t("Directions")}</Button><Button size="sm" variant="outline" title={t("Copy Address")} aria-label={t("Copy Address")} onClick={copyAddress}><Copy />{t(addressCopied ? "Address Copied" : "Copy Address")}</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="w-[calc(100%-2rem)] rounded-lg" closeLabel={t("Close")}><DialogTitle>{t("Open Google Maps Separately")}</DialogTitle><DialogDescription>{t("If the directions window is blocked, open Google Maps below or copy this link into a new browser tab or the Google Maps app.")}</DialogDescription><label className="grid gap-2 text-sm font-semibold">{t("Address")}<input aria-label={t("Address")} readOnly value={address} className="w-full min-w-0 rounded-md border bg-card p-3 text-sm" onFocus={(e) => e.target.select()} /></label><Button variant="outline" onClick={copyAddress}><Copy />{t(addressCopied ? "Address Copied" : "Copy Address")}</Button><input aria-label={t("Directions Link")} readOnly value={url} className="w-full min-w-0 rounded-md border bg-card p-3 text-sm" onFocus={(e) => e.target.select()} /><Button asChild><a href={url} target="_blank" rel="noopener noreferrer"><Navigation />{t("Open Google Maps")}</a></Button><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } }}><Copy />{t(copied ? "Copied" : "Copy Link")}</Button></DialogContent></Dialog></>;
}
