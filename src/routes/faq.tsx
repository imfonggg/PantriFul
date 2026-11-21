import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/faq")({ head: () => pageHead("Food assistance FAQ", "Answers about free food, eligibility, dietary needs, directions and transportation in Hillsborough County."), component: Faq });
function Faq() { return <InfoPage kind="faq" />; }
