import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { DONATION_AMOUNTS, donationPreview } from "@/data/ridePreviews";
import { pageHead } from "@/data/pages";

export const Route = createFileRoute("/donor-payment")({ head: () => pageHead("Donate to the Ride Fund", "Choose a donation amount for PantriFul's donor-funded Empower ride fund. Payment preview only; no money is collected."), component: DonorPayment });
function DonorPayment() {
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState("25");
  const [reviewed, setReviewed] = useState(false);
  const preview = donationPreview(amount);
  const currency = (value: number) => new Intl.NumberFormat(language === "es" ? "es-US" : "en-US", { style: "currency", currency: "USD" }).format(value);
  return <main><section className="bg-beige"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><HeartHandshake className="size-9 text-green" /><h1 className="mt-4 text-3xl font-bold sm:text-5xl">{t("Donate to the Ride Fund")}</h1><p className="mt-5 max-w-3xl text-lg">{t("Help keep Empower rides free for PantriFul riders experiencing food insecurity.")}</p></div></section>
    <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><p className="border-s-4 border-green ps-4 font-semibold">{t("Payment preview only. No money is collected and no card details are needed.")}</p>
      <form className="mt-8 space-y-6" onSubmit={(event) => { event.preventDefault(); if (preview) setReviewed(true); }}>
        <fieldset><legend className="text-xl font-bold">{t("Choose Your Donation")}</legend><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{DONATION_AMOUNTS.map((value) => <Button key={value} type="button" variant={amount === String(value) ? "default" : "outline"} aria-pressed={amount === String(value)} onClick={() => { setAmount(String(value)); setReviewed(false); }}>{currency(value)}</Button>)}</div></fieldset>
        <label className="block font-semibold">{t("Amount (USD)")}<input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => { setAmount(event.target.value); setReviewed(false); }} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base" /></label>
        <p className="leading-relaxed">{t("Your selected contribution is intended for driver payments on approved food-assistance trips, so riders pay $0. Empower driver subscription fees are separate.")}</p>
        <Button type="submit" disabled={!preview}><HeartHandshake />{t("Review Donation")}</Button>
      </form>
      {reviewed && preview && <div role="status" className="mt-8 border-t border-brown pt-6"><h2 className="text-xl font-bold">{t("Donation Preview")}</h2><p className="mt-3 text-3xl font-bold text-green">{currency(preview.amountUsd)}</p><p className="mt-3 font-semibold">{t("No payment made. Your donation selection has not been submitted or saved.")}</p><Button variant="outline" className="mt-4" onClick={() => setReviewed(false)}>{t("Change Amount")}</Button></div>}
      <Button asChild variant="link" className="mt-8"><Link to="/ride-assistance">{t("Ride assistance")}<ArrowRight /></Link></Button>
    </section></main>;
}