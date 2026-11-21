export default function Header() {
  return (
    <header className="bg-leaf text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3">
        <a href="/" className="font-brand text-2xl font-normal tracking-tight sm:text-3xl">
          PantriFul
        </a>
        <p className="text-sm">Free food near USF Tampa</p>
      </div>
    </header>
  )
}
