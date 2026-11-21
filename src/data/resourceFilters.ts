import type { FoodResource, LatLng, ResourceType } from "./types";
import { isOpenNow, milesBetween } from "./hours";
import { matchesZipCode } from "./zipCodes";

export interface ResourceFilters {
  types: ResourceType[];
  household: string;
  dietary: string;
  includeUnknown: boolean;
  city: string;
  zipCode?: string;
  query: string;
  openOnly: boolean;
  maxMiles: number;
  origin: LatLng;
  now: Date | null;
}

export function matchesNeed(values: string[] | undefined, need: string, includeUnknown: boolean) {
  if (!need) return true;
  if (!values?.length) return includeUnknown;
  return values.includes(need);
}

export function filterResources(resources: FoodResource[], filters: ResourceFilters) {
  const terms = filters.query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return resources.map((resource) => ({ ...resource,
    miles: resource.location ? milesBetween(filters.origin, resource.location) : null,
    open: filters.now ? isOpenNow(resource, filters.now) : false,
  })).filter((resource) => {
    const haystack = [resource.name, resource.address, resource.city, resource.eligibility, ...resource.offers, ...(resource.serviceNames ?? [])].join(" ").toLocaleLowerCase();
    return (!filters.types.length || filters.types.some((type) => (resource.serviceTypes ?? [resource.type]).includes(type)))
      && matchesNeed(resource.household, filters.household, filters.includeUnknown)
      && (!filters.dietary || Boolean(resource.dietary?.includes(filters.dietary)) || filters.includeUnknown)
      && (!filters.city || resource.city === filters.city)
      && matchesZipCode(resource.address, filters.zipCode)
      && terms.every((term) => haystack.includes(term))
      && (!filters.openOnly || resource.open)
      && (!filters.maxMiles || (resource.miles !== null && resource.miles <= filters.maxMiles));
  }).sort((a, b) => (a.miles ?? Infinity) - (b.miles ?? Infinity) || a.name.localeCompare(b.name));
}

export type TravelMode = "driving" | "transit" | "walking" | "bicycling";
export function directionsUrl(address: string, mode: TravelMode, origin?: LatLng) {
  const params = new URLSearchParams({ api: "1", destination: address, travelmode: mode });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}