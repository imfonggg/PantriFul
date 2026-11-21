import type { ResourceType, WeeklyHours } from '../../shared/types'
import { tampaClock } from '../../shared/geo'

export const TYPE_LABELS: Record<ResourceType, string> = {
  pantry: 'Food pantry',
  food_bank: 'Food bank',
  hot_meal: 'Hot meals',
  mobile_pantry: 'Mobile pantry',
  benefits: 'Benefits help',
}

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`
}

/** "9am–12pm, 1pm–3pm" for today in Tampa, or "Closed today". */
export function todaysHours(hours: WeeklyHours, now: Date = new Date()): string {
  const { day } = tampaClock(now)
  const slots = hours[day as keyof WeeklyHours] ?? []
  if (slots.length === 0) return 'Closed today'
  return slots.map((s) => `${to12h(s.open)}–${to12h(s.close)}`).join(', ')
}
