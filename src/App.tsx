import { useEffect, useMemo, useState } from 'react'
import type { ChatResult, FoodResourceWithDistance } from '../shared/types'
import Filters, { type FilterState } from './components/Filters'
import Header from './components/Header'
import Hero from './components/Hero'
import ResourceCard from './components/ResourceCard'
import { getFoodResources } from './lib/api'

const NO_FILTERS: FilterState = { types: [], openNow: false, radius: null }

export default function App() {
  const [resources, setResources] = useState<FoodResourceWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<ChatResult | null>(null)
  const [filters, setFilters] = useState<FilterState>(NO_FILTERS)
  const [locating, setLocating] = useState(false)
  const [locationNote, setLocationNote] = useState<string | null>(null)

  useEffect(() => {
    getFoodResources()
      .then(setResources, (e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationNote('Your browser can’t share location. Showing distances from USF.')
      return
    }
    setLocating(true)
    setLocationNote(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setResources(await getFoodResources({ lat: pos.coords.latitude, lng: pos.coords.longitude }))
          setLocationNote('Distances are now from your location.')
        } catch (e) {
          setError((e as Error).message)
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocationNote('We couldn’t get your location. Showing distances from USF.')
        setLocating(false)
      },
    )
  }

  const visible = useMemo(
    () =>
      resources.filter(
        (r) =>
          (filters.types.length === 0 || filters.types.includes(r.type)) &&
          (!filters.openNow || r.openNow) &&
          (filters.radius === null || r.distanceMiles <= filters.radius),
      ),
    [resources, filters],
  )

  const suggested = useMemo(() => answer?.recommendedIds ?? [], [answer])
  // Suggested places float to the top, otherwise keep distance order.
  const ordered = useMemo(
    () => [...visible].sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id))),
    [visible, suggested],
  )

  return (
    <>
      <a href="#listings" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-2">
        Skip to food listings
      </a>
      <Header />
      <Hero answer={answer} onAnswer={setAnswer} />

      <main id="listings" className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-4 text-2xl font-bold">Food near you</h2>
        <Filters
          value={filters}
          onChange={setFilters}
          onUseLocation={handleUseLocation}
          locating={locating}
          locationNote={locationNote}
        />

        <div aria-live="polite" className="mt-4">
          {loading && <p>Loading food resources…</p>}
          {error && (
            <p role="alert" className="font-medium text-brick">
              {error}
            </p>
          )}
          {!loading && !error && (
            <p className="text-sm">
              Showing {ordered.length} of {resources.length} places
            </p>
          )}
        </div>

        {!loading && !error && ordered.length === 0 ? (
          <p className="mt-4 rounded-xl bg-sand p-4">
            Nothing matches those filters.{' '}
            <button type="button" className="text-plum underline" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {ordered.map((r) => (
              <ResourceCard key={r.id} resource={r} recommended={suggested.includes(r.id)} />
            ))}
          </ul>
        )}
      </main>

      <footer className="bg-sand px-4 py-6 text-sm">
        <p className="mx-auto max-w-5xl">
          PantriFul supports UN Sustainable Development Goal 2: Zero Hunger. Hours and eligibility can change, so
          call ahead when you can.
        </p>
      </footer>
    </>
  )
}
