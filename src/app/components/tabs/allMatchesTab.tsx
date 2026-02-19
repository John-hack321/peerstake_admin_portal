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
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-6 w-full max-w-sm shadow-2xl"
        style={{ background: "#0F1729", border: "1px solid #1D283A" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-sm">Record Score</h3>
          <button
            onClick={onClose}
            className="text-[#9CA1A9] hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Match title */}
        <div
          className="rounded-lg px-4 py-3 mb-5 text-center"
          style={{ background: "#1D283A" }}
        >
          <p className="text-[#9CA1A9] text-xs mb-1">{fixture.league_name}</p>
          <p className="text-white font-medium text-sm">
            {fixture.home_team}{" "}
            <span className="text-[#FED800] mx-2">vs</span>{" "}
            {fixture.away_team}
          </p>
          <p className="text-[#9CA1A9] text-xs mt-1">{fixture.match_date}</p>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <label className="text-[#9CA1A9] text-xs block mb-1 text-center">
              {fixture.home_team}
            </label>
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
              className="w-full text-center text-white text-2xl font-bold rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-[#FED800]"
              style={{ background: "#1D283A", border: "1px solid #2A3A4A" }}
            />
          </div>

          <div
            className="text-[#9CA1A9] text-lg font-bold px-2 pt-5"
          >
            –
          </div>

          <div className="flex-1">
            <label className="text-[#9CA1A9] text-xs block mb-1 text-center">
              {fixture.away_team}
            </label>
            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
              className="w-full text-center text-white text-2xl font-bold rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-[#FED800]"
              style={{ background: "#1D283A", border: "1px solid #2A3A4A" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#9CA1A9] hover:text-white transition-colors"
            style={{ background: "#1D283A" }}
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={posting}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            style={{ background: "#FED800", color: "#0F1729" }}
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
  const hasScore = fixture.score_string !== null && fixture.score_string !== undefined

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-all hover:translate-y-[-1px]"
      style={{
        background: "#0F1729",
        border: "1px solid #1D283A",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* League + Date row */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "#1D283A", color: "#9CA1A9" }}
        >
          {fixture.league_name || "Unknown League"}
        </span>
        <span className="text-[#9CA1A9] text-xs">
          {new Date(fixture.match_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className="text-white font-semibold text-sm">{fixture.home_team}</p>
          <p className="text-[#9CA1A9] text-xs">Home</p>
        </div>

        {/* Score display */}
        <div
          className="px-4 py-2 rounded-lg text-center min-w-[72px]"
          style={{ background: "#1D283A" }}
        >
          {hasScore ? (
            <span className="text-[#FED800] font-bold text-lg tracking-widest">
              {fixture.score_string}
            </span>
          ) : (
            <span className="text-[#9CA1A9] text-xs font-medium">vs</span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <p className="text-white font-semibold text-sm">{fixture.away_team}</p>
          <p className="text-[#9CA1A9] text-xs">Away</p>
        </div>
      </div>

      {/* Live indicator */}
      {fixture.is_match_live && (
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">LIVE</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onRecordScore(fixture)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "#1D283A",
            color: "#9CA1A9",
            border: "1px solid #2A3A4A",
          }}
        >
          ✏️ Record Score
        </button>
        <button
          onClick={() => onPostScore(fixture)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: hasScore ? "#FED800" : "#1D283A",
            color: hasScore ? "#0F1729" : "#9CA1A9",
            border: hasScore ? "none" : "1px solid #2A3A4A",
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
      style={{ background: "#0F1729", border: "1px solid #1D283A" }}
    >
      <div className="flex justify-between">
        <div className="h-5 w-24 rounded-full" style={{ background: "#1D283A" }} />
        <div className="h-5 w-20 rounded" style={{ background: "#1D283A" }} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-8 rounded" style={{ background: "#1D283A" }} />
        <div className="w-16 h-10 rounded-lg" style={{ background: "#1D283A" }} />
        <div className="flex-1 h-8 rounded" style={{ background: "#1D283A" }} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 rounded-lg" style={{ background: "#1D283A" }} />
        <div className="flex-1 h-8 rounded-lg" style={{ background: "#1D283A" }} />
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

  // Filter by search
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
    // If no score yet, open the modal to record first
    if (!fixture.score_string) {
      setScoreModalFixture(fixture)
      return
    }
    // Otherwise post directly
    setPostingId(fixture.match_id)
    try {
      // TODO: replace with real API call
      // await post_score_to_backend(fixture.match_id, fixture.score_string)
      console.log("Posting score for match:", fixture.match_id, fixture.score_string)
      await new Promise((r) => setTimeout(r, 800)) // simulated delay
    } finally {
      setPostingId(null)
    }
  }

  const handleModalPost = async (
    matchId: number,
    homeScore: number,
    awayScore: number
  ) => {
    // TODO: replace with real API call
    console.log("Posting score:", matchId, homeScore, awayScore)
    await new Promise((r) => setTimeout(r, 800))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "#1D283A" }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs"
          style={{ background: "#0F1729", border: "1px solid #1D283A" }}
        >
          <span className="text-[#9CA1A9] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search team or league…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-sm placeholder-[#9CA1A9] focus:outline-none w-full"
          />
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-4 text-xs text-[#9CA1A9]">
          <span>
            <span className="text-white font-medium">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "match" : "matches"}
          </span>
          {fixtureState.data.some((f) => f.is_match_live) && (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400">
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
          className="px-3 py-2 rounded-lg text-xs font-medium text-[#9CA1A9] hover:text-white transition-colors"
          style={{ background: "#0F1729", border: "1px solid #1D283A" }}
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
            <p className="text-[#9CA1A9] text-sm">
              {search ? "No matches found for your search." : "No matches loaded yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#FED800] hover:underline"
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