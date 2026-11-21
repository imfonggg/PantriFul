import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { askAssistant } from "@/lib/assistant.functions";
import type { AssistantProfile, AssistantResult } from "@/data/assistant";
import type { LatLng } from "@/data/types";

const LOCAL: Record<"es" | "ar", Record<string, string>> = {
  es: {
    "Ask PantriFul AI": "Pregunta a PantriFul IA",
    "Tell us what you need and Gemini will suggest places that fit.":
      "Cuéntanos qué necesitas y Gemini te sugerirá lugares adecuados.",
    "e.g. I'm a student with no car and need groceries tonight":
      "p. ej. Soy estudiante, no tengo auto y necesito comida esta noche",
    Ask: "Preguntar",
    "Finding places…": "Buscando lugares…",
    Clear: "Borrar",
    "No car, need groceries tonight": "Sin auto, necesito comida esta noche",
    "Hot meal today, no ID": "Comida caliente hoy, sin identificación",
    "Halal food for my family": "Comida halal para mi familia",
    "Suggested places are highlighted below.": "Los lugares sugeridos están resaltados abajo.",
    "Using your saved profile preferences.": "Usando las preferencias de tu perfil.",
  },
  ar: {
    "Ask PantriFul AI": "اسأل مساعد PantriFul",
    "Tell us what you need and Gemini will suggest places that fit.":
      "أخبرنا بما تحتاجه وسيقترح Gemini أماكن مناسبة.",
    "e.g. I'm a student with no car and need groceries tonight":
      "مثال: أنا طالب بلا سيارة وأحتاج طعامًا الليلة",
    Ask: "اسأل",
    "Finding places…": "جارٍ البحث عن أماكن…",
    Clear: "مسح",
    "No car, need groceries tonight": "بلا سيارة، أحتاج طعامًا الليلة",
    "Hot meal today, no ID": "وجبة ساخنة اليوم، بدون هوية",
    "Halal food for my family": "طعام حلال لعائلتي",
    "Suggested places are highlighted below.": "الأماكن المقترحة مميزة في الأسفل.",
    "Using your saved profile preferences.": "نستخدم تفضيلات ملفك الشخصي المحفوظة.",
  },
};

const EXAMPLES = [
  "No car, need groceries tonight",
  "Hot meal today, no ID",
  "Halal food for my family",
];

interface Props {
  origin: LatLng;
  hasLocation: boolean;
  result: AssistantResult | null;
  /** Saved account preferences; Gemini uses them to tailor suggestions. */
  profile?: AssistantProfile | undefined;
  onResult: (result: AssistantResult | null) => void;
}

/** Gemini-powered "describe what you need" box. Results highlight cards and pins. */
export function AssistantPanel({ origin, hasLocation, result, profile, onResult }: Props) {
  const { language, t: baseT } = useLanguage();
  const t = (text: string) => (language !== "en" && LOCAL[language]?.[text]) || baseT(text);
  const ask = useServerFn(askAssistant);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setMessage(trimmed);
    setBusy(true);
    setError("");
    try {
      onResult(await ask({ data: { message: trimmed, origin: hasLocation ? origin : undefined, profile } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label={t("Ask PantriFul AI")}
      className="mt-6 rounded-lg border-2 border-plum bg-card p-4 sm:p-5"
    >
      <h2 className="flex items-center gap-2 text-lg font-bold text-plum">
        <Sparkles className="size-5" aria-hidden="true" />
        {t("Ask PantriFul AI")}
      </h2>
      <p className="mt-1 text-sm">
        {t("Tell us what you need and Gemini will suggest places that fit.")}
      </p>
      {profile && (profile.dietary || profile.household || profile.householdSize) && (
        <p className="mt-1 text-sm font-semibold text-green">
          {t("Using your saved profile preferences.")}
        </p>
      )}
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void run(message);
        }}
        className="mt-3 flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="assistant-input" className="sr-only">
          {t("Ask PantriFul AI")}
        </label>
        <textarea
          id="assistant-input"
          value={message}
          maxLength={1000}
          rows={3}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends; Shift+Enter adds a new line.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void run(message);
            }
          }}
          placeholder={t("e.g. I'm a student with no car and need groceries tonight")}
          className="min-h-28 w-full min-w-0 flex-1 resize-none rounded-lg border-2 border-brown bg-background px-4 py-3 text-lg leading-snug outline-none focus:border-plum sm:h-12 sm:min-h-12 sm:py-2.5 sm:text-base"
        />
        <Button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-lg bg-plum px-6 font-bold sm:w-auto text-primary-foreground hover:bg-plum/90"
        >
          {busy ? t("Finding places…") : t("Ask")}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Button
            key={example}
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => void run(t(example))}
            className="h-auto min-h-9 whitespace-normal rounded-full border-2 border-brown"
          >
            {t(example)}
          </Button>
        ))}
      </div>
      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
        {result && (
          <div className="mt-4 rounded-lg bg-beige p-4">
            <p className="whitespace-pre-line text-base">{result.reply}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {result.recommendedIds.length > 0 && (
                <p className="text-sm font-semibold text-green">
                  {t("Suggested places are highlighted below.")}
                </p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onResult(null);
                  setMessage("");
                }}
              >
                <X />
                {t("Clear")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
