import type { FoodResource } from "./types";
import directory from "./directory.json";
import { withProviderIdentity } from "./providerIdentity";

/** Public directory snapshot, retrieved 2026-11-21. Not an exhaustive or live service guarantee. */
export const FOOD_RESOURCES: FoodResource[] = [...directory as FoodResource[], {
  id: "st-mark-evangelist",
  name: "St. Mark the Evangelist — SVDP Food Pantry",
  type: "pantry" as const,
  address: "9724 Cross Creek Blvd, Tampa, FL 33647",
  city: "Tampa",
  phone: "813-907-7746",
  website: "https://stmarktampa.org/foodpantry",
  source: "https://stmarktampa.org/foodpantry",
  hours: {},
  scheduleKnown: false,
  household: [], dietary: [], offers: [], verified: false,
  eligibility: "People in need in the North Tampa area. Confirm service-area eligibility with the provider.",
  notes: "First, third and fifth Tuesday of each month, 1pm–4pm. Clients can visit once a month; confirm before visiting.",
}].map(withProviderIdentity);
export const DIRECTORY_CHECKED = "2026-11-21";
