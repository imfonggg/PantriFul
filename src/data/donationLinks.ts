import type { FoodResource } from "./types";
/** Only provider-published donation links; never redirect partner donations to the umbrella food bank. */
const links: Record<string, string> = {
 "Feeding Tampa Bay: Causeway Center": "https://ftb.org/donate/",
 "Trinity Cafe": "https://ftb.org/donate/",
 "ECHO of Brandon": "https://www.echofl.org/donations",
 "ECHO of Riverview": "https://www.echofl.org/donations",
 "Metropolitan Ministries": "https://give.metromin.org/campaign/703276/donate",
 "EPIC Tampa": "https://myepic.org/online-donations/",
 "United Food Bank of Plant City": "https://ufbpc.org/donate-today-2/",
 "The Well": "https://www.thewellfedcommunity.org/donate",
 "Harvest Hope Park": "https://www.uacdc.org/donate/",
};
export function providerDonationUrl(resource: FoodResource) { return links[resource.name] ?? null; }
