import { useEffect, useState, type FormEvent } from 'react'
import type { ChatResult, FoodResourceWithDistance, LatLng } from '../shared/types'
import { FoodMap } from './components/FoodMap'
import { ResourceCard } from './components/ResourceCard'
import { askAssistant, getFoodResources } from './lib/api'

/**
 * Functional layout: assistant + map + list. The designed UI can restyle or
 * replace this; FoodMap and ResourceCard are reusable building blocks.
 */
export default function App() {
  const [resources, setResources] = useState<FoodResourceWithDistance[]>([])
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<ChatResult | null>(null)
  const [asking, setAsking] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    getFoodResources(userLocation ?? undefined).then(setResources, (e: Error) => setError(e.message))
  }, [userLocation])

  function useMyLocation() {
    if (!navigator.geolocation) return setError('Location is not available in this browser')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('Could not get your location. Showing distances from USF.')
        setLocating(false)
      },
      { timeout: 10000 },
    )
  }

  async function onAsk(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setAsking(true)
    setError(null)
    setSelectedId(null)
    try {
      setAnswer(await askAssistant(message, userLocation ?? undefined))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAsking(false)
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

  const recommendedIds = answer?.recommendedIds ?? []
  const shown = resources
    .filter((r) => !openOnly || r.openNow)
    .sort((a, b) => Number(recommendedIds.includes(b.id)) - Number(recommendedIds.includes(a.id)))

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <header className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-xl font-bold text-green-800">PantriFul</h1>
        <p className="text-sm text-slate-600">Free food near USF Tampa</p>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section aria-label="Find food" className="flex flex-col gap-3">
          <form onSubmit={onAsk} className="flex flex-col gap-2">
            <label htmlFor="ask" className="font-medium">
              What do you need?
            </label>
            <div className="flex gap-2">
              <input
                id="ask"
                className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
                placeholder="e.g. I'm a student with no car and need groceries tonight"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
              />
              <button className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50" disabled={asking}>
                {asking ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          <div aria-live="polite">
            {answer && <p className="rounded bg-green-50 p-3">{answer.reply}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              {locating ? 'Locating…' : userLocation ? 'Location on ✓' : 'Use my location'}
            </button>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
              Open now only
            </label>
            <span className="text-slate-600">
              {shown.length} place{shown.length === 1 ? '' : 's'}
            </span>
          </div>

          <ul className="flex flex-col gap-3">
            {shown.map((r) => (
              <ResourceCard
                key={r.id}
                resource={r}
                recommended={recommendedIds.includes(r.id)}
                selected={selectedId === r.id}
                onSelect={() => setSelectedId(r.id)}
              />
            ))}
            {shown.length === 0 && resources.length > 0 && (
              <li className="text-slate-600">Nothing is open right now. Untick "Open now only" or call 211.</li>
            )}
          </ul>
        </section>

        <section aria-label="Map" className="h-[60vh] lg:sticky lg:top-4 lg:h-[calc(100vh-6rem)]">
          <FoodMap
            resources={shown}
            recommendedIds={recommendedIds}
            selectedId={selectedId}
            onSelect={setSelectedId}
            userLocation={userLocation}
          />
        </section>
      </main>
    </div>
  )
}
