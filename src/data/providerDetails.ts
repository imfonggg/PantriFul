import snapshot from "./providerDetailsSnapshot.json";
import type { FoodResource } from "./types";

export interface PublishedFact {
  en: string;
  es: string;
  sources: string[];
}

export interface ProviderDetails {
  checked: string;
  eligibility?: PublishedFact;
  requirements?: PublishedFact;
  food?: PublishedFact;
  dietary?: PublishedFact;
  rules?: Record<string, string | number | boolean | string[]>;
}

const records: Record<string, ProviderDetails> = snapshot.records;
export function getProviderDetails(id: string): ProviderDetails {
  return records[id] ?? { checked: snapshot.checked };
}

// Official links checked against provider pages or their directory action links.
// A directory page is explicitly labeled as such, never presented as an official site.
const officialWebsites: Record<string, string> = {
  "ftb-23411": "https://beth-el.org/",
  "ftb-23413": "https://www.bbftt.org/pantry",
  "ftb-23417": "https://comorbaptistchurch.org/church/home-page/",
  "ftb-23435": "https://www.metromin.org/get-help/",
  "ftb-23447": "https://theharborfl.org/ministries/food-pantry/",
  "ftb-23448": "https://www.ourladyspantry.com/",
  "ftb-23453": "https://sohopefl.org/food-bank-registration-procedure/",
  "ftb-23467": "https://tampadeliverance.com/",
  "ftb-23472": "https://www.thecommunityfoodpantry.com/client-info",
  "ftb-23473": "https://www.echofl.org/need-help",
  "ftb-23485": "https://www.echofl.org/need-help",
  "ftb-23543": "https://www.hcfl.edu/food-2-finish",
  "ftb-23799": "https://ftb.org/causeway/the-market",
  "usf-feed-a-bull": "https://www.usf.edu/student-affairs/student-health-services/services/feed-a-bull-food-pantry.aspx",
};

export function providerWebsite(resource: FoodResource) {
  const official = officialWebsites[resource.id] ?? resource.website;
  return { url: official ?? resource.source ?? "https://ftb.org/findfood", isDirectory: !official };
}