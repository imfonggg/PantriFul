import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { pageHead } from "@/data/pages";
export const Route = createFileRoute("/about")({ head: () => pageHead("About PantriFul", "Learn about PantriFul's Hillsborough County food assistance directory, community focus and sources."), component: About });
function About() { return <InfoPage kind="about" />; }
