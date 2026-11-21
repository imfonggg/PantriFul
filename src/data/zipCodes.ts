/** ZIP entry is an address filter, not geocoding or an inferred service-area rule. */
export function normalizeZipInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function publishedZipCode(address: string) {
  return address.match(/\b(\d{5})(?:-\d{4})?\s*$/)?.[1] ?? null;
}

export function matchesZipCode(address: string, zipCode = "") {
  // Keep current results while the visitor is still entering a ZIP.
  if (!/^\d{5}$/.test(zipCode)) return true;
  return publishedZipCode(address) === zipCode;
}