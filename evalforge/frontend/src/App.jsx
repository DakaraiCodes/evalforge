import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
console.log('API_BASE_URL:', API_BASE_URL)

const AVAILABLE_MODELS = [
  'gpt-4.1-mini',
  'gpt-4.1',
  'claude-sonnet',
  'gemini-pro',
]

const SCORE_FIELDS = [
  'correctness',
  'clarity',
  'usefulness',
  'style',
  'overall',
]

function App() {
  console.log('API_BASE_URL:', API_BASE_URL)
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState([
    'gpt-4.1-mini',
    'gpt-4.1',
  ])
  const [results, setResults] = useState([])
  const [scores, setScores] = useState({})

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  const [dashboardData, setDashboardData] = useState({
    total_runs: 0,
    avg_overall_score: null,
    avg_latency: null,
    best_model: '--',
    model_stats: [],
  })
  const [recentExperiments, setRecentExperiments] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [historyModelFilter, setHistoryModelFilter] = useState('all')
  const [sortOption, setSortOption] = useState('newest')

  const toggleModel = (modelName) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelName)) {
        return prev.filter((model) => model !== modelName)
      }
      return [...prev, modelName]
    })
  }

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, experimentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard`),
        fetch(`${API_BASE_URL}/experiments`),
      ])

      if (!dashboardResponse.ok || !experimentsResponse.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const dashboardJson = await dashboardResponse.json()
      const experimentsJson = await experimentsResponse.json()

      setDashboardData(dashboardJson)
      setRecentExperiments(experimentsJson)
    } catch (err) {
      console.error(err)
      setError('Something went wrong when loading dashboard data.')
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRunEvaluation = async () => {
    setLoading(true)
    setError('')
    setSaveMessage('')
    setResults([])
    setScores({})

    try {
      const response = await fetch(`${API_BASE_URL}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          models: selectedModels,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to run evaluation')
      }

      const data = await response.json()
      setResults(data.results)

      const initialScores = {}
      data.results.forEach((result) => {
        initialScores[result.model] = {
          correctness: 3,
          clarity: 3,
          usefulness: 3,
          style: 3,
          overall: 3,
        }
      })
      setScores(initialScores)
    } catch (err) {
      setError(err.message ||'Something went wrong when calling the backend.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreChange = (modelName, field, value) => {
    setScores((prev) => ({
      ...prev,
      [modelName]: {
        ...prev[modelName],
        [field]: Number(value),
      },
    }))
  }

  const handleSaveExperiment = async () => {
    setSaving(true)
    setError('')
    setSaveMessage('')

    try {
      const payload = {
        prompt,
        results: results.map((result) => ({
          model: result.model,
          output: result.output,
          latency_ms: result.latency_ms,
          correctness: scores[result.model]?.correctness ?? 3,
          clarity: scores[result.model]?.clarity ?? 3,
          usefulness: scores[result.model]?.usefulness ?? 3,
          style: scores[result.model]?.style ?? 3,
          overall: scores[result.model]?.overall ?? 3,
        })),
      }

      const response = await fetch(`${API_BASE_URL}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save experiment')
      }

      const data = await response.json()
      setSaveMessage(`${data.message} (${data.saved_count} rows saved)`)
      await fetchDashboardData()
    } catch (err) {
      setError('Something went wrong when saving the experiment.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getAverageOverallScore = () => {
    if (results.length === 0) return '--'

    const total = results.reduce((sum, result) => {
      const overall = scores[result.model]?.overall ?? 0
      return sum + overall
    }, 0)

    return (total / results.length).toFixed(2)
  }

  const getBestModel = () => {
    if (results.length === 0) return '--'

    let bestModel = results[0].model
    let bestScore = scores[bestModel]?.overall ?? 0

    results.forEach((result) => {
      const currentScore = scores[result.model]?.overall ?? 0
      if (currentScore > bestScore) {
        bestScore = currentScore
        bestModel = result.model
      }
    })

    return bestModel
  }

  const getSourceBadgeClasses = (source) => {
    if (source === 'openai') {
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
    }
    if (source === 'mock') {
      return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
    }
    if (source === 'error') {
      return 'border-red-400/20 bg-red-400/10 text-red-300'
    }
    return 'border-white/10 bg-white/5 text-slate-300'
  }

  const getSourceLabel = (source) => {
    if (source === 'openai') return 'OpenAI'
    if (source === 'mock') return 'Mock'
    if (source === 'error') return 'Error'
    return 'Unknown'
  }

  const statCards = [
    {
      label: 'Total Saved Runs',
      value: dashboardLoading ? '--' : dashboardData.total_runs,
    },
    {
      label: 'Avg. Saved Score',
      value: dashboardLoading
        ? '--'
        : dashboardData.avg_overall_score ?? '--',
    },
    {
      label: 'Avg. Saved Latency',
      value: dashboardLoading
        ? '--'
        : dashboardData.avg_latency !== null
          ? `${dashboardData.avg_latency} ms`
          : '--',
    },
    {
      label: 'Best Saved Model',
      value: dashboardLoading ? '--' : dashboardData.best_model,
    },
  ]

  const chartData = dashboardData.model_stats.map((stat) => ({
    model: stat.model,
    avgScore: stat.avg_score ?? 0,
    avgLatency: stat.avg_latency ?? 0,
    runCount: stat.run_count ?? 0,
  }))

  const filteredExperiments = useMemo(() => {
    let items = [...recentExperiments]

    if (historyModelFilter !== 'all') {
      items = items.filter((item) => item.model === historyModelFilter)
    }

    const q = searchTerm.trim().toLowerCase()
    if (q) {
      items = items.filter((item) => {
        return (
          item.model.toLowerCase().includes(q) ||
          item.prompt.toLowerCase().includes(q) ||
          item.output.toLowerCase().includes(q)
        )
      })
    }

    items.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'highest_score':
          return b.overall - a.overall
        case 'lowest_latency':
          return a.latency_ms - b.latency_ms
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

    return items
  }, [recentExperiments, historyModelFilter, searchTerm, sortOption])

  const availableHistoryModels = useMemo(() => {
    return [...new Set(recentExperiments.map((item) => item.model))]
  }, [recentExperiments])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              LLM Evaluation Platform
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              EvalForge
            </h1>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 md:block">
            Compare • Score • Save • Analyze
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
              Portfolio Project
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Evaluate model outputs with a clean human-in-the-loop workflow.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Run the same prompt across multiple models, score outputs on a
              rubric, save results to a database, and review real dashboard
              analytics from prior experiments.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                FastAPI
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                React
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                SQLite
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                SQLAlchemy
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Prompt Runner
              </p>
              <h3 className="mt-2 text-2xl font-bold">Run Comparison</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter one prompt, choose multiple models, and compare outputs
                side by side.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-44 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                  placeholder="Ask something like: Summarize the key differences between REST and GraphQL for a junior developer."
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Models
                </p>
                <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950 p-4">
                  {AVAILABLE_MODELS.map((modelName) => (
                    <label
                      key={modelName}
                      className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-sm text-slate-200 transition hover:border-white/10 hover:bg-white/5"
                    >
                      <span>{modelName}</span>
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(modelName)}
                        onChange={() => toggleModel(modelName)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleRunEvaluation}
                  disabled={loading || !prompt.trim() || selectedModels.length === 0}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Running...' : 'Run Evaluation'}
                </button>

                <button
                  onClick={handleSaveExperiment}
                  disabled={saving || results.length === 0}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Experiment'}
                </button>
              </div>

              {saveMessage && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  {saveMessage}
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            {error && (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Comparison Results
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">Model Outputs</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Review outputs and score each response using the rubric below.
                  </p>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                  Manual Scoring
                </div>
              </div>

              {results.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950 p-10 text-center">
                  <p className="text-sm text-slate-400">
                    No results yet. Run a prompt to compare multiple model outputs.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 2xl:grid-cols-2">
                  {results.map((result) => (
                    <div
                      key={result.model}
                      className="rounded-3xl border border-white/10 bg-slate-950 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                            Model
                          </p>
                          <h4 className="mt-1 text-xl font-semibold text-white">
                            {result.model}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${getSourceBadgeClasses(result.source)}`}
                          >
                            {getSourceLabel(result.source)}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            {result.latency_ms} ms
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                          Output
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-200">
                          {result.output}
                        </p>
                      </div>

                      <div className="mt-5">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                          Scoring Rubric
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {SCORE_FIELDS.map((field) => (
                            <div key={field}>
                              <label className="mb-2 block text-sm font-medium capitalize text-slate-300">
                                {field}
                              </label>
                              <select
                                value={scores[result.model]?.[field] ?? 3}
                                onChange={(e) =>
                                  handleScoreChange(result.model, field, e.target.value)
                                }
                                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                              </select>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                            Current Overall Score
                          </p>
                          <p className="mt-1 text-xl font-bold text-white">
                            {scores[result.model]?.overall ?? 3}/5
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Analytics
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">Saved Experiment Dashboard</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Real metrics from your saved evaluation history.
                  </p>
                </div>

                <button
                  onClick={fetchDashboardData}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-3xl border border-white/10 bg-slate-950 p-5"
                  >
                    <p className="text-sm text-slate-400">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                  <h4 className="text-lg font-semibold">Current Session Summary</h4>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Current Compared Models</span>
                      <span className="font-semibold">{results.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Avg. Score</span>
                      <span className="font-semibold">{getAverageOverallScore()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Best Model</span>
                      <span className="font-semibold">{getBestModel()}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                  <h4 className="text-lg font-semibold">Model Performance Snapshot</h4>

                  <div className="mt-4 space-y-3">
                    {dashboardData.model_stats.length === 0 && (
                      <p className="text-sm text-slate-400">
                        No saved model stats yet.
                      </p>
                    )}

                    {dashboardData.model_stats.map((stat) => (
                      <div
                        key={stat.model}
                        className="rounded-2xl border border-white/10 bg-slate-900 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{stat.model}</p>
                          <span className="text-xs text-slate-400">
                            {stat.run_count} runs
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-300">
                          <p>Avg. Score: {stat.avg_score ?? '--'}</p>
                          <p>Avg. Latency: {stat.avg_latency ?? '--'} ms</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                  <h4 className="text-lg font-semibold">Average Score by Model</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Based on saved experiment history.
                  </p>

                  <div className="mt-6 h-72">
                    {chartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50">
                        <p className="text-sm text-slate-400">
                          No saved score data yet.
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="model" stroke="#94a3b8" />
                          <YAxis domain={[0, 5]} stroke="#94a3b8" />
                          <Tooltip />
                          <Bar dataKey="avgScore" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950 p-5">
                  <h4 className="text-lg font-semibold">Average Latency by Model</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Lower latency means faster responses on average.
                  </p>

                  <div className="mt-6 h-72">
                    {chartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/50">
                        <p className="text-sm text-slate-400">
                          No saved latency data yet.
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="model" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip />
                          <Bar dataKey="avgLatency" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                    History
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">Recent Saved Experiments</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Search, filter, and sort your saved evaluation history.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search prompt/output/model"
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  />

                  <select
                    value={historyModelFilter}
                    onChange={(e) => setHistoryModelFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="all">All models</option>
                    {availableHistoryModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="highest_score">Highest score</option>
                    <option value="lowest_latency">Lowest latency</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 text-sm text-slate-400">
                Showing {filteredExperiments.length} of {recentExperiments.length} saved rows
              </div>

              <div className="space-y-4">
                {filteredExperiments.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950 p-8 text-center">
                    <p className="text-sm text-slate-400">No experiments match your current filters.</p>
                  </div>
                )}

                {filteredExperiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="rounded-3xl border border-white/10 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {experiment.model}
                        </h4>
                        <p className="mt-1 text-sm text-slate-400">
                          {new Date(experiment.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                          Overall: {experiment.overall}/5
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                          {experiment.latency_ms} ms
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                            Prompt
                          </p>
                          <p className="mt-2 text-sm text-slate-200">
                            {experiment.prompt}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                            Output
                          </p>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            {experiment.output}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                          <p className="text-xs text-slate-400">Correctness</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {experiment.correctness}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                          <p className="text-xs text-slate-400">Clarity</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {experiment.clarity}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                          <p className="text-xs text-slate-400">Usefulness</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {experiment.usefulness}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
                          <p className="text-xs text-slate-400">Style</p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {experiment.style}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App