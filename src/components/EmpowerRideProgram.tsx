import { Link } from "@tanstack/react-router";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";
import { EMPOWER_PRICING } from "@/data/empowerProgram";

export function EmpowerPricing() {
  const { t, language } = useLanguage();
  const currency = (value: number) => new Intl.NumberFormat(language === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" }).format(value);
  return <section className="mt-8 border-t border-brown pt-6">
    <h2 className="text-2xl font-bold">{t("Empower Driver Pricing — Tampa / Orlando")}</h2>
    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="border-s-4 border-green ps-4"><dt className="font-semibold">{t("Monthly Plan")}</dt><dd className="mt-1 text-2xl font-bold">{currency(EMPOWER_PRICING.monthlyUsd)} <span className="text-base font-normal">{t("per month")}</span></dd></div>
      <div className="border-s-4 border-plum ps-4"><dt className="font-semibold">{t("Weekly Plan")}</dt><dd className="mt-1 text-2xl font-bold">{currency(EMPOWER_PRICING.weeklyUsd)} <span className="text-base font-normal">{t("per week")}</span></dd></div>
    </dl>
    <p className="mt-5 leading-relaxed">{t("Both plans provide unlimited access for their subscription period. New drivers receive a 30-day, no-obligation free trial. Empower takes zero commission from rides provided using its platform.")}</p>
    <p className="mt-3 text-sm text-muted-foreground">{t("These are driver subscription prices, not passenger fares. No PantriFul subscription discount is confirmed. Pricing checked November 21, 2026; Empower's current terms apply.")}</p>
    <Button asChild variant="outline" className="mt-4 h-auto min-h-10 whitespace-normal"><a href={EMPOWER_PRICING.source} target="_blank" rel="noopener noreferrer">{t("Official Tampa / Orlando Pricing")}<ExternalLink className="shrink-0" /></a></Button>
  </section>;
}

export function EmpowerRideProgram({ showSupport = true }: { showSupport?: boolean }) {
  const { t } = useLanguage();
  return <section className="mt-8 border-t border-brown pt-6">
    <HeartHandshake className="size-7 text-green" aria-hidden="true" />
    <h2 className="mt-3 text-2xl font-bold">{t("PantriFul × Empower Ride Fund")}</h2>
    <h3 className="mt-6 text-xl font-bold">{t("Donor-Funded Rides")}</h3>
    <p className="mt-4 leading-relaxed">{t("The PantriFul Ride Fund is designed to cover Empower rides to food assistance through donor contributions. For approved, fully funded trips, riders pay $0 and drivers keep their ride earnings under Empower's zero-commission rules.")}</p>
    <ol className="mt-5 list-decimal space-y-3 ps-5 leading-relaxed">
      <li>{t("Donors contribute to the PantriFul Ride Fund.")}</li>
      <li>{t("PantriFul uses the fund to pay participating drivers for approved food-assistance trips, under an agreed payment arrangement.")}</li>
      <li>{t("The rider pays $0 for an approved, fully funded trip.")}</li>
      <li>{t("Drivers receive their ride earnings under Empower's rules: Empower takes no ride commission. Driver subscription charges remain separate unless an agreement covers them.")}</li>
    </ol>
    {showSupport && <Button asChild variant="outline" className="mt-5"><Link to="/donations">{t("The PantriFul Ride Fund")}<HeartHandshake /></Link></Button>}
  </section>;
}