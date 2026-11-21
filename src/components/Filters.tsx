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
        <legend className="mb-2 font-semibold">What kind of help?</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_LABELS) as ResourceType[]).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-full border-2 px-3 py-1 text-sm has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-plum ${
                value.types.includes(t) ? 'border-plum bg-plum text-white' : 'border-clay bg-paper'
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

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="size-5 accent-plum"
            checked={value.openNow}
            onChange={(e) => onChange({ ...value, openNow: e.target.checked })}
          />
          Open now
        </label>

        <label className="flex items-center gap-2">
          Within
          <select
            className="rounded-lg border-2 border-clay bg-white px-2 py-1"
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
          className="rounded-lg border-2 border-plum px-3 py-1 font-medium text-plum disabled:opacity-60"
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
