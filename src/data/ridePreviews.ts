export const DONATION_AMOUNTS = [10, 25, 50, 100] as const;
export function validDonationAmount(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
export function donationPreview(value: string) {
  const amount = validDonationAmount(value);
  return amount === null ? null : { amountUsd: amount, charged: false as const };
}
export function ridePreview(destinationId: string) {
  return { destinationId, riderCostUsd: 0, booked: false as const };
}