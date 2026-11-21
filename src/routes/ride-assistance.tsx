import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/ride-assistance")({ head: () => pageHead("Ride assistance through Empower", "Book a donor-funded ride to food assistance on PantriFul. Choose your food destination and visit time, review the trip, and pay $0 for approved rides."), component: Rides });
function Rides() { return <InfoPage kind="rides" />; }
