// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { currentUser, getProfile, saveBookmark, saveProfile, signIn, signOut, signUp } from "@/lib/localAccounts";
import { FOOD_RESOURCES } from "@/data/foodResources";

describe("prototype accounts", () => {
  beforeEach(() => localStorage.clear());
  it("signs up with any email, keeps the profile, and logs back in", async () => {
    await signUp({ email: "Test@Test.com", password: "password1" });
    expect(currentUser()?.email).toBe("test@test.com");
    await saveProfile({ data: { display_name: "Sam", household_size: 3, household: "families", dietary: "halal", city: "Tampa" } });
    await saveBookmark({ data: { resourceId: FOOD_RESOURCES[0]!.id, saved: true } });
    await signOut();
    expect(currentUser()).toBeNull();
    await expect(signIn({ email: "test@test.com", password: "wrongpass" })).rejects.toThrow("Wrong email or password.");
    await signIn({ email: "test@test.com", password: "password1" });
    const profile = await getProfile();
    expect(profile.dietary).toBe("halal");
    expect(profile.saved_resource_ids).toEqual([FOOD_RESOURCES[0]!.id]);
    expect(localStorage.getItem("pantriful-accounts")).not.toContain("password1");
  });
  it("refuses a second account with the same email", async () => {
    await signUp({ email: "a@b.co", password: "password1" });
    await expect(signUp({ email: "a@b.co", password: "password2" })).rejects.toThrow("already exists");
  });
});
