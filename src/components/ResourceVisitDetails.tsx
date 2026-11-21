import { useLanguage } from "./LanguageProvider";
import { getProviderDetails, type PublishedFact } from "@/data/providerDetails";

export function ResourceVisitDetails({ resourceId }: { resourceId: string }) {
  const { t, language } = useLanguage();
  const details = getProviderDetails(resourceId);
  const sections: { label: string; fact: PublishedFact | undefined }[] = [
    { label: "Who it's for", fact: details.eligibility },
    { label: "Before You Go", fact: details.requirements },
    { label: "Food & Essentials", fact: details.food },
    { label: "Dietary Information", fact: details.dietary },
  ];

  return <div className="mt-3 space-y-3">
    {sections.map(({ label, fact }) => fact && <div key={label} className="text-sm leading-relaxed">
      <p className="font-semibold">{t(label)}</p>
      <p>{fact[language]}{" "}{fact.sources.map((source, index) => <a
        key={source}
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        title={`${t("Published Information")}: ${new URL(source).hostname}`}
        aria-label={`${t("Published Information")}: ${new URL(source).hostname} — ${t(label)}`}
        className="ms-1 text-xs font-semibold text-plum underline underline-offset-2"
      >[{index + 1}]</a>)}</p>
    </div>)}
    {!details.eligibility && !details.requirements && <p className="text-xs leading-relaxed text-muted-foreground">{t("Eligibility and document requirements are not published for this location.")}</p>}
  </div>;
}