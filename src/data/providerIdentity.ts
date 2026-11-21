import snapshot from "./providerIdentitySnapshot.json";
import type { FoodResource } from "./types";

interface Identity {
  name?: string;
  nameSource?: string;
  website?: string;
  directory?: string;
  languages?: { en: string; es: string; sources: string[] };
}
const records: Record<string, Identity> = snapshot.records;
export function providerIdentity(id: string): Identity { return records[id] ?? {}; }
export function withProviderIdentity(resource: FoodResource): FoodResource {
  const identity = providerIdentity(resource.id);
  return { ...resource, name: identity.name ?? resource.name, ...(identity.website ? { website: identity.website } : {}) };
}
// These are operated by Feeding Tampa Bay, not merely directory partners.
export function isFeedingTampaBayListing(id: string) { return ["ftb-23799", "ftb-23801"].includes(id); }
export function allowedProviderLink(id: string, url: string) {
  const hostname = new URL(url).hostname;
  const isFoodBank = /(^|\.)(ftb\.org|feedingtampabay\.org)$/.test(hostname);
  return !isFoodBank || isFeedingTampaBayListing(id);
}