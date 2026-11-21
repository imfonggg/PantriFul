import { useLanguage } from "./LanguageProvider";
import { getProviderDetails, type PublishedFact } from "@/data/providerDetails";
import { allowedProviderLink } from "@/data/providerIdentity";

export function ResourceVisitDetails({ resourceId }: { resourceId: string }) {
  const { t, language } = useLanguage();
  const details = getProviderDetails(resourceId);
  const sections: { label: string; fact: PublishedFact | undefined }[] = [
    { label: "Who it's for", fact: details.eligibility },
    { label: "Before You Go", fact: details.requirements },
    { label: "Food & Essentials", fact: details.food },
    { label: "Dietary Information", fact: details.dietary },
    { label: "Languages Spoken", fact: details.languages },
  ];

  return <div className="mt-3 space-y-3">
    {sections.map(({ label, fact }) => fact && <div key={label} className="text-sm leading-relaxed">
      <p className="font-semibold">{t(label)}</p>
      <p>{fact[language]}{" "}{fact.sources.filter(source => allowedProviderLink(resourceId, source)).map((source, index) => <a
        key={source}
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        title={`${t("Published Information")}: ${new URL(source).hostname}`}
        aria-label={`${t("Published Information")}: ${new URL(source).hostname} — ${t(label)}`}
        className="ms-1 text-xs font-semibold text-plum underline underline-offset-2"
      >[{index + 1}]</a>)}</p>
    </div>)}
    {!details.dietary && <p className="text-sm text-muted-foreground">{t("Dietary options unconfirmed")}</p>}
    {!details.languages && <div className="text-sm"><p className="font-semibold">{t("Languages Spoken")}</p><p className="text-muted-foreground">{t("Languages not published")}</p></div>}
    {!details.eligibility && !details.requirements && <p className="text-xs leading-relaxed text-muted-foreground">{t("Eligibility and document requirements are not published for this location.")}</p>}
  </div>;
}