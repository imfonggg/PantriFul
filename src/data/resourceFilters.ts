import type { FoodResource, LatLng, ResourceType } from "./types";
import { isOpenNow, milesBetween } from "./hours";
import { matchesZipCode } from "./zipCodes";
import published from "./publishedSchedules.json";

const schedules: Record<string, Record<string, string[]>> = published;

/** True when the place lists any hours on that weekday (0 = Sunday). */
export function hasHoursOn(resource: FoodResource, day: number) {
  return Boolean(resource.hours[day as 0 | 1 | 2 | 3 | 4 | 5 | 6]?.length || schedules[resource.id]?.[String(day)]?.length);
}

export interface ResourceFilters {
  types: ResourceType[];
  household: string;
  dietary: string;
  includeUnknown: boolean;
  city: string;
  zipCode?: string;
  query: string;
  /** Weekday the place must have hours on (0 = Sunday), or "" / undefined for any day. */
  day?: number | "";
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
      && matchesNeed(resource.dietary, filters.dietary, filters.includeUnknown)
      && (!filters.city || resource.city === filters.city)
      && matchesZipCode(resource.address, filters.zipCode)
      && terms.every((term) => haystack.includes(term))
      && (filters.day === undefined || filters.day === "" || hasHoursOn(resource, filters.day))
      && (!filters.openOnly || resource.open)
      && (!filters.maxMiles || (resource.miles !== null && resource.miles <= filters.maxMiles));
  }).sort((a, b) => {
    const dietaryRank = filters.dietary ? Number(Boolean(b.dietary?.includes(filters.dietary))) - Number(Boolean(a.dietary?.includes(filters.dietary))) : 0;
    return dietaryRank || (a.miles ?? Infinity) - (b.miles ?? Infinity) || a.name.localeCompare(b.name);
  });
}

export type TravelMode = "driving" | "transit" | "walking" | "bicycling";
export function directionsUrl(address: string, mode: TravelMode, origin?: LatLng) {
  const params = new URLSearchParams({ api: "1", destination: address, travelmode: mode });
  if (origin) params.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}