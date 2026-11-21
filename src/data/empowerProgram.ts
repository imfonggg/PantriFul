/** Empower's published Tampa/Orlando driver plans, checked November 21, 2026. */
export const EMPOWER_PRICING = {
  source: "https://faq.driveempower.com/hc/en-us/articles/47565808865293-How-much-does-Empower-cost-in-the-Tampa-Orlando-market",
  checked: "2026-11-21",
  monthlyUsd: 49.99,
  weeklyUsd: 19.99,
  freeTrialDays: 30,
  rideCommissionPercent: 0,
} as const;

/** Intent only: do not use these values to claim rides can currently be booked. */
export const PANTRIFUL_RIDE_PROGRAM = {
  status: "project-scenario",
  realPartnershipAgreed: false,
  intendedRiderCostUsd: 0,
  payer: "PantriFul donor fund",
  paymentsEnabled: false,
} as const;