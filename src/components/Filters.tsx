import type { ResourceType } from '../../shared/types'
import { TYPE_LABELS } from '../lib/format'

export interface FilterState {
  types: ResourceType[]
  openNow: boolean
  radius: number | null
}

interface Props {
  value: FilterState
  onChange: (next: FilterState) => void
  onUseLocation: () => void
  locating: boolean
  locationNote: string | null
}

const RADII = [1, 3, 5, 10]

export default function Filters({ value, onChange, onUseLocation, locating, locationNote }: Props) {
  const toggleType = (t: ResourceType) =>
    onChange({
      ...value,
      types: value.types.includes(t) ? value.types.filter((x) => x !== t) : [...value.types, t],
    })

  return (
    <section aria-label="Filter food resources" className="rounded-xl border border-clay bg-white p-4">
      <fieldset>
        <legend className="mb-2 font-emph">What kind of help?</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABELS) as ResourceType[]).map((t) => (
            <label
              key={t}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 py-1 text-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-plum ${
                value.types.includes(t) ? 'border-brick bg-brick text-white' : 'border-clay bg-paper'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={value.types.includes(t)}
                onChange={() => toggleType(t)}
              />
              {TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
        <label className="flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            className="size-5 accent-plum"
            checked={value.openNow}
            onChange={(e) => onChange({ ...value, openNow: e.target.checked })}
          />
          Open now
        </label>

        <label className="flex min-h-11 items-center gap-2">
          Within
          <select
            className="min-h-11 flex-1 rounded-lg border-2 border-clay bg-white px-2 py-1 sm:flex-none"
            value={value.radius ?? ''}
            onChange={(e) => onChange({ ...value, radius: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Any distance</option>
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r} {r === 1 ? 'mile' : 'miles'}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onUseLocation}
          disabled={locating}
          className="min-h-11 w-full rounded-lg border-2 border-plum px-4 py-1 font-emph text-plum disabled:opacity-60 sm:w-auto"
        >
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>
      {locationNote && (
        <p role="status" className="mt-2 text-sm">
          {locationNote}
        </p>
      )}
    </section>
  )
}
