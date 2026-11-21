import { describe, expect, it } from "vitest";
import { getProviderDetails, providerWebsite } from "@/data/providerDetails";
import { FOOD_RESOURCES } from "@/data/foodResources";

describe("Source-derived provider visit rules", () => {
  it.each([
    ["ftb-23799", "marketAppointmentRequired", true],
    ["ftb-23799", "marketVisitFrequencyDays", 30],
    ["ftb-23799", "marketMaximumShoppers", 2],
    ["ftb-23799", "bistroWalkInsAccepted", true],
    ["ftb-23801", "appointmentRequired", false],
    ["ftb-23473", "birthCertificateAccepted", true],
    ["ftb-23473", "addressProofMaximumAgeDays", 30],
    ["ftb-23473", "emergencyVisitFrequencyMonths", 4],
    ["ftb-23485", "addressProofMaximumAgeDays", 30],
    ["ftb-23485", "emergencyVisitFrequencyMonths", 4],
    ["ftb-23435", "foodStorageAndCookingRequired", true],
    ["ftb-23435", "visitFrequencyMonths", 1],
    ["ftb-23470", "membershipFloridaIdRequired", true],
    ["ftb-23470", "membershipAppointmentRequired", true],
    ["ftb-23470", "visitFrequencyDays", 14],
    ["ftb-23470", "alternativeDriveThroughAvailable", true],
    ["ftb-23421", "epicEnrollmentRequired", true],
    ["ftb-23421", "monthlyFoodItemLimit", 10],
    ["ftb-23421", "monthlyPersonalCareItemLimit", 10],
    ["ftb-54507", "anyZipCode", true],
    ["ftb-54507", "idRequired", true],
    ["ftb-54507", "proofOfIncomeRequired", false],
    ["ftb-54507", "churchAttendanceRequired", false],
    ["ftb-23491", "idRequired", false],
    ["ftb-23447", "firstVisitWithoutPaperworkAllowed", true],
    ["ftb-23453", "registrationOpensWeekday", 4],
    ["ftb-23453", "registrationOpensHour", 9],
    ["ftb-23453", "registeredAdultsMustAttend", true],
    ["ftb-23472", "firstVisitAppointmentRequired", false],
    ["ftb-23472", "returnVisitAppointmentRequired", true],
    ["ftb-23448", "saturdayGateDeadlineHour", 10],
    ["usf-feed-a-bull", "currentlyEnrolledUsfOnly", true],
    ["usf-feed-a-bull", "visitFrequencyDays", 7],
    ["usf-feed-a-bull", "lockerOrderMinimumHours", 24],
    ["directory-fl_33612_reasonable-service", "appointmentRequired", true],
    ["directory-fl_33626_rock-church-of-tampa-bay", "proofOfAddressRequired", true],
    ["ftb-23434", "csfpMinimumAge", 60],
    ["ftb-23406", "tefapPovertyPercent", 300],
  ] as const)("preserves %s's published %s rule", (id, rule, value) => {
    expect(getProviderDetails(id).rules?.[rule]).toBe(value);
  });

  it("keeps ECHO's two service ZIP sets separate", () => {
    expect(getProviderDetails("ftb-23473").rules?.["serviceZipCodes"]).toEqual(["33510", "33511", "33527", "33584", "33592", "33594", "33596", "33610"]);
    expect(getProviderDetails("ftb-23485").rules?.["serviceZipCodes"]).toEqual(["33534", "33547", "33569", "33570", "33572", "33573", "33578", "33579", "33619"]);
  });
  it("does not infer requirements when the provider's page could not be read", () => {
    expect(getProviderDetails("st-mark-evangelist").requirements).toBeUndefined();
    expect(getProviderDetails("st-mark-evangelist").rules).toBeUndefined();
  });
  it("limits Causeway dietary claims to the published meal service", () => {
    expect(getProviderDetails("ftb-23799").rules?.["dietaryAppliesTo"]).toBe("Bistro");
    expect(getProviderDetails("ftb-23494").dietary).toBeUndefined();
  });
  it("links every published fact to evidence and includes both offered languages", () => {
    for (const resource of FOOD_RESOURCES) {
      const details = getProviderDetails(resource.id);
      for (const fact of [details.eligibility, details.requirements, details.food, details.dietary]) {
        if (!fact) continue;
        expect(fact.sources.length).toBeGreaterThan(0);
        for (const source of fact.sources) expect(new URL(source).protocol).toBe("https:");
        expect(Boolean(fact.en && fact.es)).toBe(true);
      }
    }
  });
  it("labels a directory fallback rather than inventing an official website", () => {
    const resource = FOOD_RESOURCES.find(r => r.id === "ftb-23443");
    if (!resource) throw new Error("Missing New Life Assembly");
    expect(providerWebsite(resource)).toEqual({ url: "https://feedingtampabay.org/findfood", isDirectory: true });
  });
});