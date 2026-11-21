import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Search, SlidersHorizontal, CircleHelp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";

const steps = [
  { title: "Search your area", text: "Enter a pantry name, city or ZIP code. You can browse without creating an account.", icon: Search },
  { title: "Choose what you need", text: "Choose a service, household and dietary preference. Unconfirmed options stay visible unless you turn them off.", icon: SlidersHorizontal },
  { title: "Plan your visit", text: "Check source details and call ahead. Choose transit, driving, walking or cycling, then open Directions.", icon: MapPin },
  { title: "Come back anytime", text: "Reopen this guide with Help at the top of any page. Change your language there, too.", icon: CircleHelp },
];
export function HelpTutorial({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(0);
  const current = steps[step];
  if (!current) return null;
  const Icon = current.icon;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent closeLabel={t("Close")} className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg" dir={language === "ar" ? "rtl" : "ltr"}>
      <DialogTitle>{t("Welcome to PantriFul")}</DialogTitle>
      <DialogDescription>{t("Find food, one step at a time.")}</DialogDescription>
      <div className="mt-2 flex size-12 items-center justify-center rounded-lg bg-beige text-plum"><Icon aria-hidden="true" /></div>
      <p className="text-xs font-semibold text-muted-foreground">{t("Step")} {step + 1} / {steps.length}</p>
      <h2 className="text-xl font-bold">{t(current.title)}</h2>
      <p className="leading-relaxed">{t(current.text)}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("Skip tutorial")}</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="outline" onClick={() => setStep((v) => v - 1)}><ArrowLeft />{t("Back")}</Button>}
          <Button onClick={() => step === steps.length - 1 ? onOpenChange(false) : setStep((v) => v + 1)}>{t(step === steps.length - 1 ? "Done" : "Next")}{step === steps.length - 1 ? <Check /> : <ArrowRight />}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
