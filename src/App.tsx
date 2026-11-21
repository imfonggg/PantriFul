import { useEffect, useState, type FormEvent } from 'react'
import type { ChatResult, FoodResourceWithDistance } from '../shared/types'
import { askAssistant, getFoodResources } from './lib/api'

/**
 * Placeholder shell so the API can be tried end to end.
 * The real UI (map, styling) comes from the design and replaces this.
 */
export default function App() {
  const [resources, setResources] = useState<FoodResourceWithDistance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState<ChatResult | null>(null)
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    getFoodResources().then(setResources, (e: Error) => setError(e.message))
  }, [])

  async function onAsk(e: FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setAsking(true)
    setError(null)
    try {
      setAnswer(await askAssistant(message))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAsking(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 font-sans text-slate-900">
      <h1 className="text-2xl font-bold">PantriFul</h1>
      <p className="text-slate-600">Free food near USF Tampa</p>

      <form onSubmit={onAsk} className="mt-4 flex gap-2">
        <label htmlFor="ask" className="sr-only">
          What do you need?
        </label>
        <input
          id="ask"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          placeholder="e.g. I'm a student with no car and need groceries tonight"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="rounded bg-green-700 px-4 py-2 text-white disabled:opacity-50" disabled={asking}>
          {asking ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-red-700">
          {error}
        </p>
      )}
      {answer && <p className="mt-3 rounded bg-green-50 p-3">{answer.reply}</p>}

      <ul className="mt-6 space-y-3">
        {resources.map((r) => (
          <li
            key={r.id}
            className={`rounded border p-3 ${answer?.recommendedIds.includes(r.id) ? 'border-green-700' : 'border-slate-200'}`}
          >
            <div className="flex justify-between">
              <strong>{r.name}</strong>
              <span className="text-sm">{r.distanceMiles} mi</span>
            </div>
            <div className="text-sm text-slate-600">{r.address}</div>
            <div className="text-sm">{r.openNow ? 'Open now' : 'Closed now'} · {r.eligibility}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
