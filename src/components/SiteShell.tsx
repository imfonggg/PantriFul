import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CircleHelp, Languages, UserRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "./LanguageProvider";
import { HelpTutorial } from "./HelpTutorial";
import type { Language } from "@/data/translations";
import { useAuth } from "./AuthProvider";
const mainLinks = [{ to: "/", label: "Food finder" }, { to: "/ride-assistance", label: "Ride assistance" }, { to: "/about", label: "About" }, { to: "/mission-values", label: "Mission & values" }, { to: "/faq", label: "FAQ" }] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [font, setFont] = useState<"nexa" | "montserrat">("montserrat");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKey, setHelpKey] = useState(0);
  useEffect(() => {
    try { if (!sessionStorage.getItem("pantriful-guide-seen")) setHelpOpen(true); } catch { /* Guide can still be opened manually. */ }
  }, []);
  useEffect(() => { document.documentElement.dataset["font"] = font; }, [font]);
  const changeHelp = (open: boolean) => {
    setHelpOpen(open);
    if (!open) { try { sessionStorage.setItem("pantriful-guide-seen", "1"); } catch { /* Nonessential preference. */ } }
  };
  return <div className="flex min-h-screen flex-col">
    <header className="bg-green text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="font-brand text-3xl font-bold" dir="ltr">PantriFul</Link>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-sm"><Languages className="size-4" aria-hidden="true" /><span className="sr-only">{t("Language")}</span>
            <select aria-label={t("Language")} value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="h-9 max-w-28 rounded-md border border-primary-foreground/50 bg-green px-2 text-primary-foreground">
              <option value="en">English</option><option value="es">Español</option><option value="ar">العربية</option>
            </select>
          </label>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={() => { setHelpKey((v) => v + 1); changeHelp(true); }}><CircleHelp />{t("Help")}</Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"><Link to={user ? "/account" : "/auth"}><UserRound />{t(user ? "My Account" : "Sign Up / Log In")}</Link></Button>
          {user && <Button variant="ghost" title={t("Log Out")} aria-label={t("Log Out")} className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={() => void signOut()}><LogOut /></Button>}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/25 pt-3">
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
            {mainLinks.map((item) => <Link key={item.to} to={item.to} activeProps={{ className: "underline underline-offset-4" }} activeOptions={{ exact: true }}>{t(item.label)}</Link>)}
          </nav>
          <div role="radiogroup" aria-label={t("Font option")} className="flex shrink-0 gap-1 text-xs" dir="ltr">
            {(["nexa", "montserrat"] as const).map((f) => <Button key={f} role="radio" aria-checked={font === f} size="sm" variant="ghost" onClick={() => setFont(f)} className={font === f ? "bg-primary-foreground text-green hover:bg-primary-foreground hover:text-green" : "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"}>{f === "nexa" ? "A · Nexa" : "B · Montserrat"}</Button>)}
          </div>
        </div>
      </div>
    </header>
    <div className="flex-1">{children}</div>
    <footer className="bg-green text-primary-foreground"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><nav aria-label="Footer" className="mb-5 flex flex-wrap gap-5 text-sm font-semibold">{mainLinks.map(item => <Link key={item.to} to={item.to} className="underline underline-offset-4">{t(item.label)}</Link>)}</nav><p className="text-sm leading-relaxed">{t("PantriFul supports UN Sustainable Development Goal 2: Zero Hunger. Hours and eligibility can change, so call ahead when you can.")}</p><nav aria-label={t("Ways To Help")} className="mt-4 flex flex-wrap gap-5 text-sm font-semibold"><Link to="/donations" className="underline underline-offset-4">{t("Support PantriFul")}</Link><Link to="/empower-drivers" className="underline underline-offset-4">{t("Drive With Empower")}</Link></nav></div></footer>
    <HelpTutorial key={helpKey} open={helpOpen} onOpenChange={changeHelp} />
  </div>;
}
