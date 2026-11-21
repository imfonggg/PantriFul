import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/mission-values")({ head: () => pageHead("Mission and values", "PantriFul's mission: easier food access, dignity, accessibility, honesty, community and Zero Hunger."), component: Mission });
function Mission() { return <InfoPage kind="mission" />; }
