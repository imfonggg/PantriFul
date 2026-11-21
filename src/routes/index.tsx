import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation, Search, RotateCcw, ExternalLink, Phone, HeartHandshake, Bookmark, ChevronDown, ChevronLeft, ChevronRight, BusFront, Car, Footprints, Bike, Sparkles, type LucideIcon } from "lucide-react";
import ResourceMap from "@/components/ResourceMap";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { FOOD_RESOURCES } from "@/data/foodResources";
import type { MapPoint, ResourceType } from "@/data/types";
import { ResourceHours } from "@/components/ResourceHours";
import { ResourceVisitDetails } from "@/components/ResourceVisitDetails";
import { providerWebsite } from "@/data/providerDetails";
import { normalizeZipInput } from "@/data/zipCodes";
import { directionsUrl, filterResources, type TravelMode } from "@/data/resourceFilters";
import { pageHead } from "@/data/pages";
import { RESULT_LIMITS, DEFAULT_RESULT_LIMIT, paginateResults } from "@/data/resultPagination";
import { providerDonationUrl } from "@/data/donationLinks";
import { DirectionsAction } from "@/components/DirectionsAction";
import { SaveSignupButton, SignupPrompt } from "@/components/SignupPrompt";
import { RideOfferDialog } from "@/components/RideOfferDialog";
import { needsRide } from "@/data/rideIntent";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile, saveBookmark } from "@/lib/profile.functions";
import { AssistantPanel } from "@/components/AssistantPanel";
import { toAssistantProfile, type AssistantResult } from "@/data/assistant";

export const Route = createFileRoute("/")({
  head: () => pageHead("Free food in Hillsborough County", "Browse Hillsborough County food pantries, food banks and free meals without signing up. Filter by household, dietary needs and city, and get directions."),
  component: Index,
});

const USF = { lat: 28.0637, lng: -82.4131 };
const MAPS_KEY = (import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] ?? import.meta.env["VITE_GOOGLE_MAPS_API_KEY"]) as string | undefined;
const GoogleFoodMap = lazy(() => import("@/components/GoogleFoodMap"));
const TYPES: { id: ResourceType; label: string }[] = [{ id: "pantry", label: "Food pantry" }, { id: "food_bank", label: "Food bank" }, { id: "hot_meal", label: "Hot meals" }, { id: "mobile_pantry", label: "Mobile pantry" }, { id: "benefits", label: "Benefits help" }];
const HOUSEHOLDS = [{ id: "individuals", label: "Individuals" }, { id: "families", label: "Families with children" }, { id: "seniors", label: "Older adults" }, { id: "students", label: "Students" }];
const DIETS = [{ id: "vegetarian", label: "Vegetarian" }, { id: "vegan", label: "Vegan" }, { id: "halal", label: "Halal" }, { id: "gluten_free", label: "Gluten-free" }];
const MODES: { id: TravelMode; label: string; icon: LucideIcon }[] = [{ id: "transit", label: "Transit", icon: BusFront }, { id: "driving", label: "Drive", icon: Car }, { id: "walking", label: "Walk", icon: Footprints }, { id: "bicycling", label: "Bike", icon: Bike }];
const CITIES = [...new Set(FOOD_RESOURCES.map((r) => r.city).filter((city): city is string => Boolean(city)))].sort();
const selectClass = "h-11 w-full min-w-0 rounded-lg border-2 border-brown bg-card px-3 text-base";

function Index() {
  const { t } = useLanguage();
  const mapSection = useRef<HTMLElement | null>(null);
  const { user } = useAuth();
  const loadProfile = useServerFn(getProfile); const bookmark = useServerFn(saveBookmark); const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile", user?.id], queryFn: () => loadProfile(), enabled: Boolean(user) });
  const [signupOpen, setSignupOpen] = useState(false); const [saveMessage, setSaveMessage] = useState("");
  const [limit, setLimit] = useState<number>(DEFAULT_RESULT_LIMIT); const [page, setPage] = useState(1);
  const [types, setTypes] = useState<ResourceType[]>([]);
  const [household, setHousehold] = useState("");
  const [dietary, setDietary] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [includeUnknown, setIncludeUnknown] = useState(true);
  const [openOnly, setOpenOnly] = useState(false);
  const [maxMiles, setMaxMiles] = useState(0);
  const [day, setDay] = useState<number | "">("");
  const [origin, setOrigin] = useState(USF);
  const [hasLocation, setHasLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [query, setQuery] = useState("");
  const [rideOfferOpen, setRideOfferOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>("transit");
  const [aiResult, setAiResult] = useState<AssistantResult | null>(null);
  const suggested = aiResult?.recommendedIds ?? [];

  useEffect(() => {
    setNow(new Date()); setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const list = useMemo(() => {
    const rows = filterResources(FOOD_RESOURCES, { types, household, dietary, includeUnknown, city, zipCode, day, openOnly, maxMiles, origin, now, query });
    // Places Gemini suggested float to the top, in the order it suggested them.
    const rank = (id: string) => { const i = suggested.indexOf(id); return i === -1 ? Infinity : i; };
    return suggested.length ? [...rows].sort((a, b) => rank(a.id) - rank(b.id)) : rows;
  }, [types, household, dietary, includeUnknown, city, zipCode, day, openOnly, maxMiles, origin, now, query, suggested]);
  const handleAiResult = (result: AssistantResult | null) => {
    setAiResult(result); setPage(1);
    setSelectedId(result?.recommendedIds.find((id) => FOOD_RESOURCES.some((r) => r.id === id && r.location)) ?? null);
  };
  const paginated = paginateResults(list, limit, page);
  const visibleList = paginated.rows;
  useEffect(() => { setPage(1); }, [types, household, dietary, includeUnknown, city, zipCode, day, openOnly, maxMiles, query, limit]);
  const mapPoints = useMemo<MapPoint[]>(() => visibleList.flatMap((r) => r.location && r.miles !== null ? [{ id: r.id, name: r.name, address: r.address, location: r.location, open: r.open, miles: r.miles, scheduleKnown: r.scheduleKnown === true }] : []), [visibleList]);
  useEffect(() => { if (selectedId && !visibleList.some((r) => r.id === selectedId)) setSelectedId(null); }, [visibleList, selectedId]);
  const toggleType = (type: ResourceType) => setTypes((current) => current.includes(type) ? current.filter((value) => value !== type) : [...current, type]);
  const reset = () => { setTypes([]); setHousehold(""); setDietary(""); setCity(""); setZipCode(""); setDay(""); setQuery(""); setIncludeUnknown(true); setOpenOnly(false); setMaxMiles(0); };
  const useLocation = () => {
    if (!navigator.geolocation) { setLocationError(true); return; }
    navigator.geolocation.getCurrentPosition((position) => { setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude }); setHasLocation(true); setLocationError(false); }, () => setLocationError(true), { timeout: 10000 });
  };
  const originLabel = hasLocation ? t("Your location") : "USF Tampa";

  return <>
    <section className="bg-beige">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="mb-3 text-sm font-semibold text-green">{t("Free food in Hillsborough County")}</p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{t("Find free food near you.")}</h1>
        <p className="mt-4 max-w-2xl text-base font-normal text-foreground sm:text-lg">{t("Pantries, food banks and free meals across Hillsborough County.")}</p>
        <form onSubmit={(event) => { event.preventDefault(); document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }); if (needsRide(query)) setRideOfferOpen(true); }} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute start-4 top-4 size-5 text-muted-foreground" aria-hidden="true" /><input aria-label={t("Search by name, city or ZIP")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Try: Tampa, 33612, Trinity")} className="h-12 w-full min-w-0 rounded-lg border-2 border-brown bg-card pe-4 ps-12 text-base outline-none focus:border-plum sm:text-lg" /></div>
          <Button type="submit" className="h-12 rounded-lg px-6 font-bold">{t("Find food")}<Search /></Button>
        </form>
        <Button type="button" variant="ghost" className="mt-3 h-auto w-full justify-start px-0 text-sm font-semibold text-plum underline underline-offset-4 hover:bg-transparent hover:text-plum/80" onClick={() => { setQuery("no car, need groceries tonight"); setRideOfferOpen(true); }}>
          <BusFront className="size-4" />{t("No car, need groceries tonight?")}
        </Button>
        <AssistantPanel origin={origin} hasLocation={hasLocation} result={aiResult} onResult={handleAiResult} profile={profile.data ? toAssistantProfile(profile.data) : undefined} />
      </div>
    </section>
    <main id="results" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h2 className="text-2xl font-bold sm:text-3xl">{t("Food near you")}</h2>
      <section aria-label={t("What kind of help?")} className="mt-5 border-y border-brown py-5">
        <p className="font-bold">{t("What kind of help?")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("Shows places offering any of the kinds you pick. The other filters narrow the list.")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((type) => <Button key={type.id} variant="outline" aria-pressed={types.includes(type.id)} onClick={() => toggleType(type.id)} className={`min-h-10 h-auto whitespace-normal rounded-full border-2 px-4 py-2 font-semibold ${types.includes(type.id) ? "border-plum bg-plum text-primary-foreground hover:bg-plum/90 hover:text-primary-foreground" : "border-brown bg-card hover:bg-beige hover:text-foreground"}`}>{t(type.label)}</Button>)}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <label className="grid min-w-0 gap-2 text-sm font-semibold">{t("Household")}<select aria-label={t("Household")} className={selectClass} value={household} onChange={(event) => setHousehold(event.target.value)}><option value="">{t("All households")}</option>{HOUSEHOLDS.map((option) => <option key={option.id} value={option.id}>{t(option.label)}</option>)}</select></label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold">{t("Dietary needs")}<select aria-label={t("Dietary needs")} className={selectClass} value={dietary} onChange={(event) => setDietary(event.target.value)}><option value="">{t("Any diet")}</option>{DIETS.map((option) => <option key={option.id} value={option.id}>{t(option.label)}</option>)}</select></label>
          <label className="grid min-w-0 gap-2 text-sm font-semibold">{t("City")}<select aria-label={t("City")} className={selectClass} value={city} onChange={(event) => setCity(event.target.value)}><option value="">{t("All cities")}</option>{CITIES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        </div>
        {!user && <div className="mt-4"><SaveSignupButton /></div>}
        <label className="mt-4 flex items-start gap-3 text-sm"><input type="checkbox" checked={includeUnknown} onChange={(event) => setIncludeUnknown(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-plum" />{t("Include places with unconfirmed household or dietary details")}</label>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("Availability varies. Call to confirm dietary needs; gluten-free is not an allergy-safety guarantee.")}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button aria-pressed={openOnly} onClick={() => setOpenOnly((value) => !value)} className={`h-11 bg-green font-bold text-primary-foreground hover:bg-green/90 ${openOnly ? "ring-2 ring-green ring-offset-2" : ""}`}>{openOnly ? "✓ " : ""}{t("Open now")}</Button>
          <label className="flex min-w-0 items-center gap-2 text-sm">{t("Open on")}<select aria-label={t("Open on")} value={day} onChange={(event) => setDay(event.target.value === "" ? "" : Number(event.target.value))} className="h-11 max-w-44 rounded-lg border-2 border-brown bg-card px-2"><option value="">{t("Any day")}</option>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((name, index) => <option key={name} value={index}>{t(name)}</option>)}</select></label>
          <label className="flex min-w-0 items-center gap-2 text-sm">{t("Within")}<select value={maxMiles} onChange={(event) => setMaxMiles(Number(event.target.value))} className="h-11 max-w-44 rounded-lg border-2 border-brown bg-card px-2">{[0, 1, 5, 10, 25, 50].map((miles) => <option key={miles} value={miles}>{miles ? `${miles} mi` : t("Any distance")}</option>)}</select></label>
          <Button variant="outline" className="h-11 border-2 border-plum text-plum" onClick={useLocation}><Navigation />{t("Use my location")}</Button>
          <Button variant="ghost" onClick={reset}><RotateCcw />{t("Reset filters")}</Button>
        </div>
        {zipCode.length > 0 && zipCode.length < 5 && <p id="zip-error" role="status" className="mt-2 text-sm text-plum">{t("Enter a 5-digit ZIP code.")}</p>}
        {locationError && <p role="status" className="mt-3 text-sm text-plum">{t("Location unavailable. You can still search by city or ZIP.")}</p>}
      </section>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3"><p role="status" className="text-sm font-semibold">{t("Showing")} {visibleList.length} {t("of")} {list.length} {t("resources")}</p><label className="flex items-center gap-2 text-sm">{t("Results Per Page")}<select aria-label={t("Results Per Page")} value={limit} onChange={e => setLimit(Number(e.target.value))} className="h-10 rounded-md border bg-card px-2">{RESULT_LIMITS.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
        <div role="radiogroup" aria-label={t("Travel mode")} className="flex flex-wrap gap-1">
          {MODES.map(({ id, label, icon: Icon }) => <Button key={id} role="radio" aria-checked={travelMode === id} variant={travelMode === id ? "default" : "outline"} size="sm" onClick={() => setTravelMode(id)} title={t(label)}><Icon />{t(label)}</Button>)}
        </div>
      </div>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section ref={mapSection} aria-label={t("Map of food places")} className="min-w-0 scroll-mt-4 lg:sticky lg:top-4 lg:order-2">
          <div className="h-[45vh] min-h-72 overflow-hidden rounded-lg border-2 border-beige lg:h-[calc(100vh-7rem)]">
            {mounted && (MAPS_KEY && !mapsFailed ? <Suspense fallback={<div className="h-full w-full bg-beige" aria-busy="true" />}><GoogleFoodMap points={mapPoints} origin={origin} originLabel={originLabel} selectedId={selectedId} onSelect={setSelectedId} travelMode={travelMode} onFail={() => setMapsFailed(true)} /></Suspense> : <ResourceMap points={mapPoints} origin={origin} originLabel={originLabel} selectedId={selectedId} onSelect={setSelectedId} travelMode={travelMode} />)}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("Only locations with published coordinates appear on the map.")}</p>
        </section>
        <ul className="grid min-w-0 content-start gap-4 lg:order-1">
          {visibleList.map((resource) => {
            const donationUrl = providerDonationUrl(resource);
            const website = providerWebsite(resource);
            const saved = profile.data?.saved_resource_ids.includes(resource.id) ?? false;
            return <li key={resource.id} onClick={(event) => { if (!resource.location || (event.target as HTMLElement).closest("a, button, input, select, [role=dialog]")) return; const id = resource.id; // Defer so the <details> toggle from this click lands first.
              window.setTimeout(() => setSelectedId(id), 0); }} className={`min-w-0 cursor-pointer rounded-lg border-2 bg-card p-5 shadow-sm ${selectedId === resource.id ? "border-plum ring-2 ring-plum" : suggested.includes(resource.id) ? "border-green" : "border-beige"}`}>
              {suggested.includes(resource.id) && <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-green px-3 py-1 text-xs font-bold text-primary-foreground"><Sparkles className="size-3.5" aria-hidden="true" />{t("Suggested for you")}</p>}
              <details className="location-details" open={selectedId === resource.id ? true : undefined}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4"><div className="min-w-0"><h3 className="break-words text-lg font-bold leading-snug" lang="en" dir="ltr">{resource.name}</h3>
              <p className="mt-1 text-sm font-semibold text-plum">{(resource.serviceTypes ?? [resource.type]).map((type) => t(TYPES.find((item) => item.id === type)?.label ?? "Food pantry")).join(" · ")}</p><p className="mt-2 break-words text-sm" lang="en" dir="ltr">{resource.address}</p></div><ChevronDown className="location-chevron mt-1 size-5 shrink-0 text-plum transition-transform" /></summary>
              {dietary && <p className="mt-2 text-sm font-semibold text-plum">{resource.dietary?.includes(dietary) ? `${t("Listed dietary options")}: ${t(DIETS.find(diet => diet.id === dietary)?.label ?? dietary)}` : t("Dietary options unconfirmed")}</p>}
              <div className="mt-4 border-t border-brown pt-1">
              <ResourceHours resource={resource} now={now} />
              <p className="mt-2 text-sm">{resource.miles !== null ? `${resource.miles.toFixed(1)} mi` : t("Distance unconfirmed")}</p>
              <ResourceVisitDetails resourceId={resource.id} />
              <div className="mt-4 flex flex-wrap gap-2">
                <DirectionsAction url={directionsUrl(resource.address, travelMode, hasLocation ? origin : undefined)} />
                <Button size="sm" variant="outline" aria-pressed={saved} aria-label={t(saved ? "Unsave Location" : "Save Location") + ": " + resource.name} onClick={async () => { if (!user) { setSignupOpen(true); return; } try { await bookmark({data: {resourceId: resource.id, saved: !saved}}); await queryClient.invalidateQueries({queryKey: ["profile"]}); setSaveMessage(t(saved ? "Location Removed" : "Location Saved")); } catch { setSaveMessage(t("Please try again.")); } }}><Bookmark />{t(saved ? "Saved" : "Save")}</Button>
                {resource.location && <Button variant="outline" size="sm" onClick={() => { setSelectedId(resource.id); mapSection.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}><MapPin />{t("Show on map")}</Button>}
                {resource.phone
                  ? <Button asChild variant="outline" size="sm"><a href={`tel:${resource.phone.replace(/[^+\d]/g, "")}`} aria-label={`${t("Call")} ${resource.name}`}><Phone /><span dir="ltr">{resource.phone}</span></a></Button>
                  : <Button asChild variant="outline" size="sm"><a href="tel:211" title={t("No phone listed. 211 can connect you.")}><Phone />{t("Call 211")}</a></Button>}
                {donationUrl && <Button asChild variant="outline" size="sm"><a href={donationUrl} target="_blank" rel="noopener noreferrer"><HeartHandshake />{t("Donate")}</a></Button>}
                {website.url && <Button asChild variant="outline" size="sm"><a href={website.url} target="_blank" rel="noopener noreferrer">{t("Website")}<ExternalLink /><span className="sr-only"> ({t("opens in a new tab")})</span></a></Button>}
              </div>
              </div></details>
            </li>;
          })}
          {!list.length && <li className="border-y border-brown py-8 text-muted-foreground">{t("No places match. Try removing a filter.")}<Button variant="outline" className="mt-4 block" onClick={reset}>{t("Reset filters")}</Button></li>}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm">{t("Page")} {paginated.current} {t("of")} {paginated.pages}</p><div className="flex gap-2"><Button variant="outline" disabled={paginated.current === 1} onClick={() => { setPage(paginated.current - 1); document.getElementById("results")?.scrollIntoView(); }}><ChevronLeft />{t("Previous")}</Button><Button variant="outline" disabled={paginated.current === paginated.pages} onClick={() => { setPage(paginated.current + 1); document.getElementById("results")?.scrollIntoView(); }}>{t("Next")}<ChevronRight /></Button></div></div>
      {saveMessage && <p role="status" className="mt-3 text-sm text-plum">{saveMessage}</p>}
      <SignupPrompt open={signupOpen} onOpenChange={setSignupOpen} />
      <RideOfferDialog open={rideOfferOpen} onOpenChange={setRideOfferOpen} />
      <div className="mt-8 border-t border-brown pt-5 text-sm leading-relaxed text-muted-foreground">
        <p>{t("Directory snapshot: November 21, 2026. Not a complete or live inventory.")}</p>
        <a href="https://feedingtampabay.org/findfood" target="_blank" rel="noreferrer" className="mt-2 inline-block text-plum underline">{t("Check Feeding Tampa Bay for more pantries and changing mobile distributions.")}</a>
      </div>
    </main>
  </>;
}
