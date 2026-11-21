import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, HeartHandshake, Sprout, BusFront, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { aboutSections, faqItems, rideSections, valueSections } from "@/data/pages";
import { useLanguage } from "./LanguageProvider";
import { EmpowerRideProgram } from "./EmpowerRideProgram";
import { FundedRideBooking } from "./FundedRideBooking";

export function InfoPage({ kind }: { kind: "about" | "faq" | "mission" | "rides" }) {
  const { t } = useLanguage();
  const title = { about: "About PantriFul", faq: "Frequently asked questions", mission: "Our mission & values", rides: "Getting to food assistance" }[kind];
  const subtitle = { about: "Food access, with dignity.", faq: "Before you head out", mission: "Our mission", rides: "Ride options through Empower" }[kind];
  const intro = { about: "PantriFul brings food-assistance information into one place for people across Hillsborough County, including the USF Tampa community.", faq: "", mission: "Make it easier to find free food and take the next step toward getting it, without adding barriers.", rides: "Empower connects riders with independent drivers through its app. Drivers set their own rates. Visit Empower to check service availability, fares and rider information." }[kind];
  const sections = { about: aboutSections, faq: faqItems, mission: valueSections, rides: rideSections }[kind];
  const Icon = { about: HeartHandshake, faq: CircleHelp, mission: Sprout, rides: BusFront }[kind];
  return <main>
    <section className="bg-beige">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Icon className="mb-4 size-9 text-green" aria-hidden="true" />
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t(title)}</h1>
        <p className="mt-4 text-xl font-semibold text-plum">{t(subtitle)}</p>
        {intro && <p className="mt-4 max-w-3xl text-base leading-relaxed sm:text-lg">{t(intro)}</p>}
        {kind === "rides" && <Button asChild className="mt-6"><a href="https://driveempower.com/" target="_blank" rel="noreferrer">{t("Visit Empower")}<ExternalLink /></a></Button>}
        {kind === "rides" && <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/donations">{t("Support PantriFul")}</Link></Button><Button asChild variant="outline"><Link to="/empower-drivers">{t("Drive With Empower")}</Link></Button></div>}
      </div>
    </section>
    <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="divide-y divide-brown">
        {sections.map(([heading, text]) => kind === "faq" ? <details key={heading} className="group py-5">
          <summary className="cursor-pointer text-lg font-semibold text-plum">{t(heading ?? "")}</summary>
          <p className="mt-3 leading-relaxed">{t(text ?? "")}</p>
        </details> : <article key={heading} className="py-6 first:pt-0">
          <h2 className="text-xl font-bold">{t(heading ?? "")}</h2><p className="mt-3 max-w-3xl leading-relaxed">{t(text ?? "")}</p>
        </article>)}
      </div>
      {kind === "rides" && <><EmpowerRideProgram /><FundedRideBooking /></>}
      {kind === "about" && <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-plum"><a className="underline" href="https://www.foodpantries.org/co/fl-hillsborough" target="_blank" rel="noreferrer">FoodPantries.org</a></div>}
      <Button asChild className="mt-8"><Link to="/">{t("Browse food")}<ArrowRight /></Link></Button>
    </section>
  </main>;
}
