import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CircleHelp, Languages, UserRound, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from "./LanguageProvider";
import { HelpTutorial } from "./HelpTutorial";
import type { Language } from "@/data/translations";
import { useAuth } from "./AuthProvider";
const mainLinks = [{ to: "/", label: "Food finder" }, { to: "/ride-assistance", label: "Ride assistance" }, { to: "/about", label: "About" }, { to: "/mission-values", label: "Mission & values" }, { to: "/faq", label: "FAQ" }] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const { user, signOut } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKey, setHelpKey] = useState(0);
  useEffect(() => {
    try { if (!sessionStorage.getItem("pantriful-guide-seen")) setHelpOpen(true); } catch { /* Guide can still be opened manually. */ }
  }, []);
  const changeHelp = (open: boolean) => {
    setHelpOpen(open);
    if (!open) { try { sessionStorage.setItem("pantriful-guide-seen", "1"); } catch { /* Nonessential preference. */ } }
  };
  return <div className="flex min-h-screen flex-col">
    <header className="bg-green text-primary-foreground">
      <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/" className="font-brand text-4xl font-bold sm:text-3xl" dir="ltr">PantriFul</Link>
        {/* Phones: language, help and account live in one small menu at the right edge. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="ms-auto h-9 gap-1.5 px-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:hidden" aria-label={t("Menu")}><Menu className="size-5" />{t("Menu")}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 text-sm">
            <DropdownMenuLabel className="flex items-center gap-1 text-xs"><Languages className="size-3.5" aria-hidden="true" />{t("Language")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { setHelpKey((v) => v + 1); changeHelp(true); }}><CircleHelp />{t("Help")}</DropdownMenuItem>
            <DropdownMenuItem asChild><Link to={user ? "/account" : "/auth"}><UserRound />{t(user ? "My Account" : "Sign Up / Log In")}</Link></DropdownMenuItem>
            {user && <DropdownMenuItem onSelect={() => void signOut()}><LogOut />{t("Log Out")}</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="hidden flex-wrap items-center gap-2 sm:flex">
          <label className="flex items-center gap-1 text-sm"><Languages className="size-4" aria-hidden="true" /><span className="sr-only">{t("Language")}</span>
            <select aria-label={t("Language")} value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="h-9 max-w-28 rounded-md border border-primary-foreground/50 bg-green px-2 text-primary-foreground">
              <option value="en">English</option><option value="es">Español</option>
            </select>
          </label>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={() => { setHelpKey((v) => v + 1); changeHelp(true); }}><CircleHelp />{t("Help")}</Button>
          <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"><Link to={user ? "/account" : "/auth"}><UserRound />{t(user ? "My Account" : "Sign Up / Log In")}</Link></Button>
          {user && <Button variant="ghost" title={t("Log Out")} aria-label={t("Log Out")} className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" onClick={() => void signOut()}><LogOut /></Button>}
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-primary-foreground/25 pt-3">
          <nav aria-label="Main" className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm font-semibold">
            {mainLinks.map((item) => <Link key={item.to} to={item.to} className="rounded-md bg-green px-3 py-1.5 text-primary-foreground transition-colors duration-300 ease-out hover:bg-beige hover:text-foreground focus-visible:bg-beige focus-visible:text-foreground active:bg-beige active:text-foreground" activeProps={{ className: "!bg-beige !text-foreground" }} activeOptions={{ exact: true }}>{t(item.label)}</Link>)}
          </nav>
        </div>
      </div>
    </header>
    <div className="flex-1">{children}</div>
    <footer className="bg-green text-primary-foreground"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm font-semibold">{mainLinks.map(item => <Link key={item.to} to={item.to} className="underline underline-offset-4">{t(item.label)}</Link>)}</nav><nav aria-label={t("Ways To Help")} className="mt-4 flex flex-wrap gap-5 text-sm font-semibold"><Link to="/donations" className="underline underline-offset-4">{t("Support PantriFul")}</Link><Link to="/empower-drivers" className="underline underline-offset-4">{t("Drive With Empower")}</Link></nav></div></footer>
    <HelpTutorial key={helpKey} open={helpOpen} onOpenChange={changeHelp} />
  </div>;
}
