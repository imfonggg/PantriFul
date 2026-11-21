import { ChevronDown } from "lucide-react";
import { fmt, openingStatus, tampaClock, todayHours } from "@/data/hours";
import type { FoodResource } from "@/data/types";
import published from "@/data/publishedSchedules.json";
import { runsThisWeek, slotLines } from "@/data/publishedSlots";
import { hasHoursOn } from "@/data/resourceFilters";
import { useLanguage } from "./LanguageProvider";
const schedules: Record<string, Record<string, string[]>> = published;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function ResourceHours({resource, now}: {resource: FoodResource; now: Date | null}) {
 const {t}=useLanguage(); const status=now?openingStatus(resource,now):"unknown";
 const hours=now?todayHours(resource,now):null;const raw=schedules[resource.id];const day=now?tampaClock(now).day:0;const todayRaw=now?raw?.[String(day)]:undefined;
 const listedDays=days.map((_,index)=>index).filter(index=>hasHoursOn(resource,index));
 const thisWeek=todayRaw&&now?todayRaw.filter(slot=>runsThisWeek(slot,now)):[];
 const slotList=(slots:string[],dayIndex:number,note?:string)=><span className="block">{note&&<span className="block font-semibold">{note}</span>}{slots.map((slot,i)=>{const line=slotLines(slot,dayIndex,t);return <span key={i} className="block"><bdi>{line.main}</bdi>{line.weeks&&<span className="block text-xs text-muted-foreground">{line.weeks}</span>}</span>;})}</span>;
 const todayNode=todayRaw&&now?(thisWeek.length?slotList(thisWeek,day):slotList(todayRaw,day,t("Not this week"))):undefined;
 return <div className="mt-3 text-sm"><span className={`inline-block rounded-full px-3 py-1 font-semibold ${status==="open"?"bg-green text-primary-foreground":status==="closed"||status==="soon"?"bg-status-alert text-primary-foreground":"bg-beige text-foreground"}`}>{t({unknown:"Hours Unconfirmed",open:"Open",closed:"Closed Now",soon:"Closes Soon"}[status])}</span><div className="mt-2"><strong>{t("Today's Hours")}: </strong>{hours?<bdi>{hours}</bdi>:todayNode??<bdi>{t(resource.scheduleKnown?"No Listed Service Today":"Unconfirmed — Call Ahead")}</bdi>}</div>{listedDays.length?<details className="group mt-2"><summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-plum"><span>{t("Weekly Hours")}</span><ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180"/></summary><dl className="mt-3 space-y-2">{listedDays.map(index=>{const day=days[index]!;return <div key={day} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2"><dt className="font-semibold">{t(day)}</dt><dd className="min-w-0 break-words">{resource.hours[index as 0 | 1 | 2 | 3 | 4 | 5 | 6]?.length?<bdi>{resource.hours[index as 0 | 1 | 2 | 3 | 4 | 5 | 6]!.map(slot=>`${fmt(slot.open)}–${fmt(slot.close)}`).join(", ")}</bdi>:slotList(raw?.[String(index)]??[],index)}</dd></div>;})}</dl><p className="mt-3 text-xs text-muted-foreground">{t("Published schedule; call before visiting.")}</p>{!resource.scheduleKnown&&<p className="mt-1 text-xs">{t("Hours may be monthly or appointment-only; confirm with the provider.")}</p>}</details>:resource.scheduleKnown&&<p className="mt-2">{t("No service days published — call ahead.")}</p>}</div>;
}
