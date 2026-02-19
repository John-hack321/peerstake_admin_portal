'use client'

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../appState/store"
import { get_all_fixtures_from_backend } from "../../api/fixtures"
import { updateAllFixturesData } from "../../appState/slices/matchData"
import { Fixture } from "../../schemas/match_schemas"

// ─── Score Modal ──────────────────────────────────────────────────────────────

interface ScoreModalProps {
  fixture: Fixture
  onClose: () => void
  onPost: (matchId: number, homeScore: number, awayScore: number) => void
}

function ScoreModal({ fixture, onClose, onPost }: ScoreModalProps) {
  const [homeScore, setHomeScore] = useState<number>(0)
  const [awayScore, setAwayScore] = useState<number>(0)
  const [posting, setPosting] = useState(false)

  const handlePost = async () => {
    setPosting(true)
    await onPost(fixture.match_id, homeScore, awayScore)
    setPosting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,41,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm" style={{ color: "#1a202c" }}>
            Record Score
          </h3>
          <button
            onClick={onClose}
            className="text-lg leading-none transition-colors hover:text-slate-700"
            style={{ color: "#94a3b8" }}
          >
            ✕
          </button>
        </div>

        {/* Match title */}
        <div
          className="rounded-xl px-4 py-3 mb-5 text-center"
          style={{ background: "#f0f4f8", border: "1px solid #e2e8f0" }}
        >
          <p className="text-xs mb-1" style={{ color: "#64748b" }}>
            {fixture.league_name}
          </p>
          <p className="font-medium text-sm" style={{ color: "#1a202c" }}>
            {fixture.home_team}{" "}
            <span style={{ color: "#2563eb" }} className="mx-2">vs</span>{" "}
            {fixture.away_team}
          </p>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
            {fixture.match_date}
          </p>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <label className="text-xs block mb-1 text-center" style={{ color: "#64748b" }}>
              {fixture.home_team}
            </label>
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="w-full text-center text-2xl font-bold rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                background: "#f7f9fc",
                border: "1.5px solid #e2e8f0",
                color: "#1a202c",
              }}
            />
          </div>
          <div className="text-lg font-bold px-2 pt-5" style={{ color: "#94a3b8" }}>
            –
          </div>
          <div className="flex-1">
            <label className="text-xs block mb-1 text-center" style={{ color: "#64748b" }}>
              {fixture.away_team}
            </label>
            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="w-full text-center text-2xl font-bold rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                background: "#f7f9fc",
                border: "1.5px solid #e2e8f0",
                color: "#1a202c",
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "#f0f4f8",
              color: "#64748b",
              border: "1px solid #e2e8f0",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={posting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            style={{ background: "#2563eb", color: "#ffffff" }}
          >
            {posting ? "Posting…" : "Post Score"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
  fixture: Fixture
  onRecordScore: (fixture: Fixture) => void
  onPostScore: (fixture: Fixture) => void
}

function MatchCard({ fixture, onRecordScore, onPostScore }: MatchCardProps) {
  const hasScore =
    fixture.score_string !== null && fixture.score_string !== undefined

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* League + Date row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: "#dbeafe", color: "#2563eb" }}
        >
          {fixture.league_name || "Unknown League"}
        </span>
        <span className="text-xs" style={{ color: "#94a3b8" }}>
          {new Date(fixture.match_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right">
          <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
            {fixture.home_team}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            Home
          </p>
        </div>

        <div
          className="px-4 py-2 rounded-xl text-center min-w-[72px]"
          style={{ background: "#f0f4f8", border: "1px solid #e2e8f0" }}
        >
          {hasScore ? (
            <span
              className="font-bold text-lg tracking-widest"
              style={{ color: "#2563eb" }}
            >
              {fixture.score_string}
            </span>
          ) : (
            <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
              vs
            </span>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
            {fixture.away_team}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            Away
          </p>
        </div>
      </div>

      {/* Live indicator */}
      {fixture.is_match_live && (
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-600 text-xs font-medium">LIVE</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onRecordScore(fixture)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
          style={{
            background: "#f7f9fc",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}
        >
          ✏️ Record Score
        </button>
        <button
          onClick={() => onPostScore(fixture)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
          style={{
            background: hasScore ? "#2563eb" : "#f7f9fc",
            color: hasScore ? "#ffffff" : "#64748b",
            border: hasScore ? "none" : "1px solid #e2e8f0",
          }}
        >
          🚀 Post Score
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function MatchCardSkeleton() {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 animate-pulse"
      style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
    >
      <div className="flex justify-between">
        <div className="h-5 w-24 rounded-full" style={{ background: "#f0f4f8" }} />
        <div className="h-5 w-20 rounded" style={{ background: "#f0f4f8" }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-8 rounded" style={{ background: "#f0f4f8" }} />
        <div className="w-16 h-10 rounded-xl" style={{ background: "#f0f4f8" }} />
        <div className="flex-1 h-8 rounded" style={{ background: "#f0f4f8" }} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 rounded-lg" style={{ background: "#f0f4f8" }} />
        <div className="flex-1 h-8 rounded-lg" style={{ background: "#f0f4f8" }} />
      </div>
    </div>
  )
}

// ─── All Matches Main Component ───────────────────────────────────────────────

export default function AllMatchesTab() {
  const dispatch = useDispatch<AppDispatch>()
  const fixtureState = useSelector((state: RootState) => state.allFixturesData)

  const [scoreModalFixture, setScoreModalFixture] = useState<Fixture | null>(null)
  const [search, setSearch] = useState("")
  const [postingId, setPostingId] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      const data = await get_all_fixtures_from_backend()
      if (data) dispatch(updateAllFixturesData(data))
    }
    load()
  }, [dispatch])

  const filtered = fixtureState.data.filter((f) => {
    const q = search.toLowerCase()
    return (
      f.home_team.toLowerCase().includes(q) ||
      f.away_team.toLowerCase().includes(q) ||
      f.league_name?.toLowerCase().includes(q)
    )
  })

  const handleRecordScore = (fixture: Fixture) => {
    setScoreModalFixture(fixture)
  }

  const handlePostScore = async (fixture: Fixture) => {
    if (!fixture.score_string) {
      setScoreModalFixture(fixture)
      return
    }
    setPostingId(fixture.match_id)
    try {
      console.log("Posting score for match:", fixture.match_id, fixture.score_string)
      await new Promise((r) => setTimeout(r, 800))
    } finally {
      setPostingId(null)
    }
  }

  const handleModalPost = async (
    matchId: number,
    homeScore: number,
    awayScore: number
  ) => {
    console.log("Posting score:", matchId, homeScore, awayScore)
    await new Promise((r) => setTimeout(r, 800))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
          style={{ background: "#f7f9fc", border: "1px solid #e2e8f0" }}
        >
          <span className="text-sm" style={{ color: "#94a3b8" }}>🔍</span>
          <input
            type="text"
            placeholder="Search team or league…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm placeholder-slate-400 focus:outline-none w-full"
            style={{ color: "#1a202c" }}
          />
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-xs" style={{ color: "#64748b" }}>
          <span>
            <span className="font-semibold" style={{ color: "#1a202c" }}>
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "match" : "matches"}
          </span>
          {fixtureState.data.some((f) => f.is_match_live) && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600">
                {fixtureState.data.filter((f) => f.is_match_live).length} live
              </span>
            </span>
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={async () => {
            const data = await get_all_fixtures_from_backend()
            if (data) dispatch(updateAllFixturesData(data))
          }}
          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-slate-50"
          style={{
            background: "#f7f9fc",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {fixtureState.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <span className="text-4xl">⚽</span>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {search
                ? "No matches found for your search."
                : "No matches loaded yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs hover:underline"
                style={{ color: "#2563eb" }}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((fixture) => (
              <MatchCard
                key={fixture.match_id}
                fixture={fixture}
                onRecordScore={handleRecordScore}
                onPostScore={handlePostScore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Score Modal */}
      {scoreModalFixture && (
        <ScoreModal
          fixture={scoreModalFixture}
          onClose={() => setScoreModalFixture(null)}
          onPost={handleModalPost}
        />
      )}
    </div>
  )
}