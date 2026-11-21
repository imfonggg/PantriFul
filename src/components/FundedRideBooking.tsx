import { useState } from "react";
import { BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOOD_RESOURCES } from "@/data/foodResources";
import { ridePreview } from "@/data/ridePreviews";
import { useLanguage } from "./LanguageProvider";

export function FundedRideBooking() {
  const { t } = useLanguage();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [returnTrip, setReturnTrip] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const resource = FOOD_RESOURCES.find((item) => item.id === destination);
  const preview = ridePreview(destination);
  return <section className="mt-8 border-t border-brown pt-6" aria-labelledby="funded-booking">
    <BusFront className="size-7 text-green" aria-hidden="true" />
    <h2 id="funded-booking" className="mt-3 text-2xl font-bold">{t("Funded Ride Booking")}</h2>
    <p className="mt-3 leading-relaxed">{t("Choose your food destination and visit time to review a donor-funded trip.")}</p>
    <p className="mt-3 border-s-4 border-green ps-4 text-sm font-semibold">{t("Booking preview only. No ride is requested, funding approved or driver assigned.")}</p>
    <form className="mt-6 space-y-5" onSubmit={(event) => { event.preventDefault(); setReviewed(true); }} onChange={() => setReviewed(false)}>
      <label className="block font-semibold">{t("Food Destination")}<select required value={destination} onChange={(event) => setDestination(event.target.value)} className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base font-normal"><option value="">{t("Choose a food location")}</option>{[...FOOD_RESOURCES].sort((a, b) => a.name.localeCompare(b.name)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      {resource && <p className="text-sm">{resource.address}</p>}
      <label className="block font-semibold">{t("Visit Date & Time")}<input required type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base font-normal" /></label>
      <label className="flex items-center gap-3"><input type="checkbox" checked={returnTrip} onChange={(event) => setReturnTrip(event.target.checked)} className="size-4 accent-green" />{t("Include a return trip")}</label>
      <Button type="submit"><BusFront />{t("Review Funded Ride")}</Button>
    </form>
    {reviewed && resource && <div role="status" className="mt-6 border-s-4 border-green ps-4 leading-relaxed"><h3 className="font-bold">{t("Ride Preview")}</h3><p>{resource.name}</p><p>{date.replace("T", " · ")}</p><p>{t(returnTrip ? "Round Trip" : "One Way")}</p><p>{t("Rider Fare")}: ${preview.riderCostUsd}</p><p className="mt-2 font-semibold">{t("Not booked. This preview does not arrange transportation.")}</p></div>}
  </section>;
}