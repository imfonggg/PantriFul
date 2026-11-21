import { directionsUrl } from '../../shared/geo'
import type { FoodResourceWithDistance } from '../../shared/types'

const TYPE_LABEL: Record<FoodResourceWithDistance['type'], string> = {
  pantry: 'Food pantry',
  food_bank: 'Food bank',
  hot_meal: 'Free meal',
  mobile_pantry: 'Mobile pantry',
  benefits: 'Benefits help',
}

interface Props {
  resource: FoodResourceWithDistance
  recommended: boolean
  selected: boolean
  onSelect: () => void
}

export function ResourceCard({ resource: r, recommended, selected, onSelect }: Props) {
  return (
    <li
      className={`rounded-lg border p-3 ${
        selected ? 'border-green-700 ring-2 ring-green-700' : recommended ? 'border-green-600' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onSelect} className="text-left font-semibold hover:underline">
          {r.name}
        </button>
        <span className="shrink-0 text-sm text-slate-600">{r.distanceMiles} mi</span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1 text-xs">
        {recommended && <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">Suggested for you</span>}
        <span className={`rounded px-2 py-0.5 ${r.openNow ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
          {r.openNow ? 'Open now' : 'Closed now'}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">{TYPE_LABEL[r.type]}</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">{r.address}</p>
      <p className="text-sm text-slate-700">
        <span className="font-medium">Who:</span> {r.eligibility}
        {r.requirements && (
          <>
            {' '}
            · <span className="font-medium">Bring:</span> {r.requirements}
          </>
        )}
      </p>
      <div className="mt-2 flex gap-3 text-sm">
        <a className="text-green-700 underline" href={directionsUrl(r.location)} target="_blank" rel="noreferrer">
          Directions
        </a>
        {r.website && (
          <a className="text-green-700 underline" href={r.website} target="_blank" rel="noreferrer">
            Website
          </a>
        )}
      </div>
    </li>
  )
}
