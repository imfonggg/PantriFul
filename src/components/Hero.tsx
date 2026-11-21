import { useState, type FormEvent } from 'react'
import type { ChatResult, LatLng } from '../../shared/types'
import { askAssistant } from '../lib/api'

interface Props {
  onAnswer: (answer: ChatResult | null) => void
  answer: ChatResult | null
  location?: LatLng | null
}

const EXAMPLES = ['I have no car and need groceries tonight', 'Hot meal today, no ID', 'Halal-friendly options']

export default function Hero({ onAnswer, answer, location }: Props) {
  const [message, setMessage] = useState('')
  const [asking, setAsking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ask(text: string) {
    if (!text.trim()) return
    setAsking(true)
    setError(null)
    try {
      onAnswer(await askAssistant(text, location ?? undefined))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setAsking(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void ask(message)
  }

  return (
    <section aria-labelledby="hero-title" className="bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
        <h1 id="hero-title" className="max-w-2xl text-2xl font-emph sm:text-4xl lg:text-5xl">
          Find free food near you, no sign-up needed.
        </h1>
        <p className="mt-3 max-w-2xl text-base sm:text-lg">
          Pantries, food banks and free meals around USF Tampa. Browse the list below, or tell us what you
          need and we'll point you to the right place.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <label htmlFor="ask" className="sr-only">
            What do you need?
          </label>
          <input
            id="ask"
            className="min-h-12 flex-1 rounded-lg border-2 border-clay bg-white px-4 py-2 placeholder:text-ink/60"
            placeholder="What do you need? e.g. groceries tonight, no car"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={asking}
            className="min-h-12 rounded-lg bg-plum px-6 py-2 font-emph text-white disabled:opacity-60"
          >
            {asking ? 'Thinking…' : 'Find food'}
          </button>
        </form>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Example questions">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  setMessage(ex)
                  void ask(ex)
                }}
                className="min-h-10 rounded-full border border-clay bg-paper px-3 py-1 text-left text-sm hover:bg-white"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>

        <div aria-live="polite" className="mt-4 max-w-2xl">
          {error && (
            <p role="alert" className="rounded-lg bg-white p-3 font-emph text-brick">
              {error}
            </p>
          )}
          {answer && (
            <div className="rounded-lg border-2 border-leaf bg-white p-4">
              <p>{answer.reply}</p>
              <button type="button" onClick={() => onAnswer(null)} className="mt-2 text-sm text-plum underline">
                Clear suggestions
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
