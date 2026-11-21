import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { currentUser } from "@/lib/localAccounts";
export const Route = createFileRoute("/_authenticated")({
 ssr: false,
 beforeLoad: () => {
  if (!currentUser()) throw redirect({to:"/auth"});
 },
 component: Outlet,
});
