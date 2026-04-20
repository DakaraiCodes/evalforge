function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-3xl font-bold tracking-tight">EvalForge</h1>
          <p className="mt-1 text-sm text-slate-400">
            Compare LLM outputs, score results, and track experiments.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-1">
            <h2 className="text-xl font-semibold">Prompt Runner</h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter a prompt, choose models, and run an evaluation.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Prompt
                </label>
                <textarea
                  className="min-h-44 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                  placeholder="Ask something like: Summarize the key differences between REST and GraphQL for a junior developer."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Model
                </label>
                <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-500">
                  <option>gpt-4.1-mini</option>
                  <option>gpt-4.1</option>
                  <option>claude-sonnet</option>
                  <option>gemini-pro</option>
                </select>
              </div>

              <button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90">
                Run Evaluation
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Model Output</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Responses will appear here after you run a prompt.
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                MVP
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6">
              <p className="text-sm leading-7 text-slate-300">
                No results yet. In the next step, we’ll connect this screen to the
                FastAPI backend and return a real response.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Experiment Dashboard Preview</h2>
          <p className="mt-2 text-sm text-slate-400">
            Later this section will show average score, latency, total runs, and
            best-performing model.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Total Runs</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Avg. Score</p>
              <p className="mt-2 text-2xl font-bold">--</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Avg. Latency</p>
              <p className="mt-2 text-2xl font-bold">--</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Best Model</p>
              <p className="mt-2 text-2xl font-bold">--</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App