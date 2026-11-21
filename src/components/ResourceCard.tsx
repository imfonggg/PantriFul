import { directionsUrl } from '../../shared/geo'
import type { FoodResourceWithDistance } from '../../shared/types'
import { TYPE_LABELS, todaysHours } from '../lib/format'

interface Props {
  resource: FoodResourceWithDistance
  recommended: boolean
  selected?: boolean
  onSelect?: () => void
}

export default function ResourceCard({ resource: r, recommended, selected = false, onSelect }: Props) {
  return (
    <li
      className={`rounded-xl border-2 bg-white p-4 ${selected ? 'border-plum ring-2 ring-plum' : recommended ? 'border-leaf' : 'border-sand'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold">
            {onSelect ? (
              <button type="button" onClick={onSelect} className="text-left hover:underline">
                {r.name}
                <span className="sr-only"> (show on map)</span>
              </button>
            ) : (
              r.name
            )}
          </h3>
          <p className="text-sm text-plum">{TYPE_LABELS[r.type]}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {recommended && <span className="rounded-full bg-leaf px-2 py-0.5 font-semibold">Suggested for you</span>}
          <span
            className={`rounded-full border px-2 py-0.5 font-semibold ${
              r.openNow ? 'border-ink bg-leaf text-ink' : 'border-brick text-brick'
            }`}
          >
            {r.openNow ? 'Open now' : 'Closed now'}
          </span>
          <span>{r.distanceMiles} mi</span>
        </div>
      </div>

      <p className="mt-2">{r.address}</p>
      <p className="text-sm">Today: {todaysHours(r.hours)}</p>
      <p className="mt-2 text-sm">
        <span className="font-semibold">Who it's for:</span> {r.eligibility}
      </p>
      {r.requirements && (
        <p className="text-sm">
          <span className="font-semibold">Bring:</span> {r.requirements}
        </p>
      )}
      {r.offers.length > 0 && <p className="mt-1 text-sm">Offers: {r.offers.join(', ')}</p>}
      {!r.verified && (
        <p className="mt-2 text-xs italic">Details not yet verified. Call ahead to confirm hours.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
        {r.phone && (
          <a className="text-plum underline" href={`tel:${r.phone}`}>
            Call {r.phone}
          </a>
        )}
        {r.website && (
          <a className="text-plum underline" href={r.website} target="_blank" rel="noreferrer">
            Website<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        <a
          className="text-plum underline"
          href={directionsUrl(r.location)}
          target="_blank"
          rel="noreferrer"
        >
          Directions<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </li>
  )
}
