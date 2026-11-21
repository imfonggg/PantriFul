import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/ride-assistance")({ head: () => pageHead("Ride assistance through Empower", "Explore Empower rider information and plan transport to food assistance. Confirm local availability and fares before booking."), component: Rides });
function Rides() { return <InfoPage kind="rides" />; }
