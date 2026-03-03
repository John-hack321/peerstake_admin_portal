'use client'
import { Fixture } from "@/app/schemas/match_schemas"
import { formatMatchDate } from "@/app/config/uitlity_functions"
import { truncateTeamName } from "@/app/config/uitlity_functions"
import { useState } from "react"

// redux data setup
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { log_live_match_scores } from "@/app/api/fixtures"
import { ApiError } from "@/app/api/api_utils"


interface Toast {
  id: number
  message: string
  type: "success" | "error"
}


// Toast
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer transition-all
            ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
        >
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}


// ─── Live Match Card ──────────────────────────────────────────────────────────

interface LiveMatchCardProps {
  fixture: Fixture
  selectedTeam: SelectedTeam
  isLogging: boolean
  onHomeClick: () => void
  onAwayClick: () => void
  onLogScore: () => void   // fires the API call
}

function LiveMatchCard({
  fixture,
  selectedTeam,
  isLogging,
  onHomeClick,
  onAwayClick,
  onLogScore,
}: LiveMatchCardProps) {
  const hasScore =
    fixture.score_string !== null && fixture.score_string !== undefined

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-white border border-[#e8edf2]">

      {/* always green since these are live matches */}
      <div className="h-1 w-full bg-green-400" />

      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            🏆 {fixture.league_name || "Unknown League"}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {formatMatchDate(fixture.match_date)}
          </span>
        </div>

        {/* Teams row */}
        <div className="flex items-center justify-between gap-2 py-1">

          {/* ── Home team ── */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <button
              onClick={onHomeClick}
              disabled={isLogging}
              title={`Select ${fixture.home_team} goal`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-150
                border-2 active:scale-90
                ${isLogging
                  ? "cursor-wait opacity-60 bg-slate-100 border-slate-200 text-slate-400"
                  : selectedTeam === "home"
                    ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200 scale-110"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                }`}
            >
              {fixture.home_team[0].toUpperCase()}
            </button>

            <p className="text-xs font-semibold text-slate-700 text-center leading-tight">
              {truncateTeamName(fixture.home_team, 14)}
            </p>
            <span className="text-[10px] text-slate-400">Home</span>
          </div>

          {/* ── Score / VS ── */}
          <div className="flex flex-col items-center gap-0.5 px-2">
            {hasScore ? (
              <div className="bg-blue-600 text-white text-sm font-bold px-3 py-1.5 rounded-xl tracking-widest shadow-sm">
                {fixture.score_string}
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                VS
              </div>
            )}

            {/* Live pill */}
            <span className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-600 font-semibold">LIVE</span>
            </span>
          </div>

          {/* ── Away team ── */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <button
              onClick={onAwayClick}
              disabled={isLogging}
              title={`Select ${fixture.away_team} goal`}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-150
                border-2 active:scale-90
                ${isLogging
                  ? "cursor-wait opacity-60 bg-slate-100 border-slate-200 text-slate-400"
                  : selectedTeam === "away"
                    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200 scale-110"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                }`}
            >
              {fixture.away_team[0].toUpperCase()}
            </button>

            <p className="text-xs font-semibold text-slate-700 text-center leading-tight">
              {truncateTeamName(fixture.away_team, 14)}
            </p>
            <span className="text-[10px] text-slate-400">Away</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">#{fixture.match_id}</span>

          {/* Right side: hint text OR the Log Score button */}
          {selectedTeam === null ? (
            // Nothing selected yet — show a quiet hint
            <span className="text-[11px] text-slate-400 italic">
              Tap a team to select
            </span>
          ) : (
            // A team is selected — show the Log Score button
            <button
              onClick={onLogScore}
              disabled={isLogging}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all
                ${isLogging
                  ? "bg-slate-300 text-slate-500 cursor-wait"
                  : selectedTeam === "home"
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                    : "bg-orange-500 text-white hover:bg-orange-600 shadow-sm hover:shadow"
                }`}
            >
              {isLogging ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Logging…</span>
                </>
              ) : (
                <>
                  <span>⚽</span>
                  <span>
                    Log {selectedTeam === "home"
                      ? truncateTeamName(fixture.home_team, 10)
                      : truncateTeamName(fixture.away_team, 10)} goal
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}


// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#e8edf2] animate-pulse">
      <div className="h-1 w-full bg-slate-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-5 w-28 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded bg-slate-100" />
        </div>
        <div className="flex items-center gap-2 py-1">
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="h-3 w-16 rounded bg-slate-100" />
          </div>
          <div className="w-12 h-8 rounded-xl bg-slate-100" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="h-3 w-16 rounded bg-slate-100" />
          </div>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-100">
          <div className="h-4 w-10 rounded bg-slate-100" />
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}


// ─── Main Component ───────────────────────────────────────────────────────────

// which team button is currently selected per match — no API call yet
type SelectedTeam = "home" | "away" | null

interface MatchScoringState {
  selectedTeam: SelectedTeam  // which button is highlighted (selection only)
  isLogging: boolean          // true only while the API call is in flight
}


export default function LiveMatchLogging() {
  const dispatch = useDispatch<AppDispatch>()
  const fixtureState = useSelector((state: RootState) => state.allFixturesData)

  const [search, setSearch] = useState<string>("")
  const [toasts, setToasts] = useState<Toast[]>([])

  // Per-match UI state: matchId → { selectedTeam, isLogging }
  const [matchStates, setMatchStates] = useState<Record<number, MatchScoringState>>({})

  // ── Helpers ──

  const getMatchState = (matchId: number): MatchScoringState =>
    matchStates[matchId] ?? { selectedTeam: null, isLogging: false }

  const setMatchState = (matchId: number, update: Partial<MatchScoringState>) =>
    setMatchStates((prev) => ({
      ...prev,
      [matchId]: { ...getMatchState(matchId), ...update },
    }))

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  // ── Team button click — only updates selection, NO API call ──

  const handleTeamClick = (matchId: number, team: "home" | "away") => {
    const current = getMatchState(matchId)

    // Clicking the already-selected team deselects it (toggle)
    const next: SelectedTeam = current.selectedTeam === team ? null : team
    setMatchState(matchId, { selectedTeam: next })
  }

  // ── Log Score button click — THIS fires the API call ──

  const handleLogScore = async (matchId: number) => {
    const { selectedTeam } = getMatchState(matchId)
    if (!selectedTeam) return  // should never happen but guard anyway

    const homeScore = selectedTeam === "home" ? 1 : 0
    const awayScore = selectedTeam === "away" ? 1 : 0

    setMatchState(matchId, { isLogging: true })

    try {
      const response = await log_live_match_scores(matchId, homeScore, awayScore)

      if (response && response.status_code === "200") {
        showToast(
          `⚽ Goal logged for ${selectedTeam === "home" ? "home" : "away"} team!`,
          "success"
        )
        // Reset selection after a successful log
        setMatchState(matchId, { selectedTeam: null, isLogging: false })
      } else {
        showToast(response?.message || "Something went wrong.", "error")
        setMatchState(matchId, { isLogging: false })
      }
    } catch (error) {
      if (error instanceof ApiError) {
        showToast(error.message, "error")
        if (error.statusCode === 401) {
          setTimeout(() => { window.location.href = "/login" }, 2000)
        }
      } else {
        showToast("An unexpected error occurred.", "error")
        console.error("Unexpected error:", error)
      }
      setMatchState(matchId, { isLogging: false })
    }
  }

  // ── Only show live matches ──

  const liveFixtures = fixtureState.data.filter((f) => {
    if (!f.is_match_live) return false
    const q = search.toLowerCase()
    return (
      f.home_team.toLowerCase().includes(q) ||
      f.away_team.toLowerCase().includes(q) ||
      f.league_name?.toLowerCase().includes(q)
    )
  })

  // ── Render ──

  return (
    <div className="w-full">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e2e8f0] bg-main-page-bg-color">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs bg-white border border-[#e2e8f0]">
          <span className="text-sm text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search team or league…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm placeholder:text-slate-400 focus:outline-none w-full text-slate-700"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-600 font-medium">
            {liveFixtures.length} live {liveFixtures.length === 1 ? "match" : "matches"}
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="p-5">
        {fixtureState.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        ) : liveFixtures.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <span className="text-4xl">📡</span>
            <p className="text-sm text-slate-500">
              {search
                ? "No live matches found for your search."
                : "No live matches right now."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-blue-500 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {liveFixtures.map((fixture) => {
              const state = getMatchState(fixture.match_id)
              return (
                <LiveMatchCard
                  key={fixture.match_id}
                  fixture={fixture}
                  selectedTeam={state.selectedTeam}
                  isLogging={state.isLogging}
                  onHomeClick={() => handleTeamClick(fixture.match_id, "home")}
                  onAwayClick={() => handleTeamClick(fixture.match_id, "away")}
                  onLogScore={() => handleLogScore(fixture.match_id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}