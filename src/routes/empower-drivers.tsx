import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageProvider";
import { pageHead } from "@/data/pages";
import { EmpowerPricing, EmpowerRideProgram } from "@/components/EmpowerRideProgram";
export const Route=createFileRoute("/empower-drivers")({head:()=>pageHead("Drive With Empower","View Empower's published Tampa/Orlando pricing and PantriFul's fictional donor-funded project partnership. Empower has not agreed to this partnership."),component:Drivers});
function Drivers(){const {t}=useLanguage();return <main className="mx-auto max-w-4xl px-4 py-10"><Car className="size-9 text-green"/><h1 className="mt-4 text-3xl font-bold">{t("Drive With Empower")}</h1><p className="mt-5 leading-relaxed">{t("Interested in driving? Apply through Empower's official driver website. Empower, not PantriFul, handles driver approval, subscription pricing and availability.")}</p><Button asChild className="mt-6"><a href="https://driveempower.com/drivers/" target="_blank" rel="noopener noreferrer">{t("Sign Up With Empower")}<ExternalLink/></a></Button><EmpowerPricing /><EmpowerRideProgram /><Button asChild variant="outline" className="mt-6 h-auto min-h-10 whitespace-normal"><a href="https://driveempower.com/partner-with-us/" target="_blank" rel="noopener noreferrer">{t("Empower Partnership Information")}<ExternalLink className="shrink-0"/></a></Button></main>;}
