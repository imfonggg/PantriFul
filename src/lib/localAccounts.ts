/**
 * Prototype accounts kept in this browser's localStorage: any email and
 * password works instantly, with no email check and no outside service.
 * Accounts and saved places stay on this device only. Passwords are stored
 * as salted SHA-256 hashes, never as plain text.
 */
import { bookmarkSchema, credentialsSchema, profileSchema } from "@/data/accountSchemas";
import { FOOD_RESOURCES } from "@/data/foodResources";

export interface LocalProfile {
  display_name: string;
  household_size: number | null;
  household: string;
  dietary: string;
  city: string;
  saved_resource_ids: string[];
}
export interface LocalUser {
  id: string;
  email: string;
}
interface StoredAccount extends LocalUser {
  passwordHash: string;
  profile: LocalProfile;
}

const ACCOUNTS_KEY = "pantriful-accounts";
const SESSION_KEY = "pantriful-session";
const CHANGE_EVENT = "pantriful-auth-change";
const EMPTY_PROFILE: LocalProfile = { display_name: "", household_size: null, household: "", dietary: "", city: "", saved_resource_ids: [] };

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
function readAccounts(): Record<string, StoredAccount> {
  try {
    return JSON.parse(storage()?.getItem(ACCOUNTS_KEY) ?? "{}") as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}
function writeAccounts(accounts: Record<string, StoredAccount>) {
  const store = storage();
  if (!store) throw new Error("This browser is blocking saved data, so accounts can't be used here.");
  store.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}
async function hashPassword(email: string, password: string) {
  const bytes = new TextEncoder().encode(`pantriful:${email}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function normalize(input: { email: string; password: string }) {
  const valid = credentialsSchema.safeParse(input);
  if (!valid.success) throw new Error("Enter a valid email and a password of at least 8 characters.");
  return { email: valid.data.email.toLowerCase(), password: valid.data.password };
}
function currentAccount(): StoredAccount | null {
  const email = storage()?.getItem(SESSION_KEY);
  return email ? readAccounts()[email] ?? null : null;
}

export function currentUser(): LocalUser | null {
  const account = currentAccount();
  return account ? { id: account.id, email: account.email } : null;
}
/** Call `listener` whenever someone signs in or out (in this tab or another). */
export function onAuthChange(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => { if (event.key === SESSION_KEY || event.key === ACCOUNTS_KEY) listener(); };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(CHANGE_EVENT, listener); window.removeEventListener("storage", onStorage); };
}

export async function signUp(input: { email: string; password: string }) {
  const { email, password } = normalize(input);
  const accounts = readAccounts();
  if (accounts[email]) throw new Error("An account with this email already exists. Log in instead.");
  accounts[email] = { id: crypto.randomUUID(), email, passwordHash: await hashPassword(email, password), profile: { ...EMPTY_PROFILE } };
  writeAccounts(accounts);
  storage()?.setItem(SESSION_KEY, email);
  notify();
}
export async function signIn(input: { email: string; password: string }) {
  const { email, password } = normalize(input);
  const account = readAccounts()[email];
  if (!account || account.passwordHash !== (await hashPassword(email, password))) throw new Error("Wrong email or password.");
  storage()?.setItem(SESSION_KEY, email);
  notify();
}
export async function signOut() {
  storage()?.removeItem(SESSION_KEY);
  notify();
}

function requireAccount() {
  const account = currentAccount();
  if (!account) throw new Error("Please log in first.");
  return account;
}
function updateProfile(change: (profile: LocalProfile) => LocalProfile) {
  const account = requireAccount();
  const accounts = readAccounts();
  accounts[account.email] = { ...account, profile: change(account.profile) };
  writeAccounts(accounts);
  return accounts[account.email]!.profile;
}

/** Same call shapes as the old server functions, so pages barely change. */
export async function getProfile(): Promise<LocalProfile> {
  return { ...EMPTY_PROFILE, ...requireAccount().profile };
}
export async function saveProfile({ data }: { data: unknown }) {
  const valid = profileSchema.parse(data);
  updateProfile((profile) => ({ ...profile, ...valid }));
  return { saved: true };
}
export async function saveBookmark({ data }: { data: unknown }) {
  const valid = bookmarkSchema.parse(data);
  if (!FOOD_RESOURCES.some((resource) => resource.id === valid.resourceId)) throw new Error("Food location not found.");
  return updateProfile((profile) => ({
    ...profile,
    saved_resource_ids: valid.saved
      ? [...new Set([...profile.saved_resource_ids, valid.resourceId])]
      : profile.saved_resource_ids.filter((id) => id !== valid.resourceId),
  })).saved_resource_ids;
}
