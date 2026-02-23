'use client'

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateMatchStatusToLive } from "@/app/appState/slices/matchData"
import { Fixture } from "@/app/schemas/match_schemas"
import { updateAllFixturesData } from "@/app/appState/slices/matchData"
import { get_all_fixtures_from_backend, makeMatchLiveAndReadyForLogging } from "@/app/api/fixtures"
import { formatMatchDate, truncateTeamName } from "@/app/config/uitlity_functions"
import { GeneralPostResponseModel } from "@/app/schemas/general"


// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
    fixture: Fixture
    onStartLoggingClick: () => void
}

function MatchCard({ fixture, onStartLoggingClick }: MatchCardProps) {
    const hasScore = fixture.score_string !== null && fixture.score_string !== undefined

    return (
        <div className="group rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-white border border-[#e8edf2]">

            {/* Top accent bar */}
            <div className={`h-1 w-full ${fixture.is_match_live ? "bg-green-400" : "bg-blue-500"}`} />

            <div className="p-4 flex flex-col gap-3 flex-1">

                {/* League + Date */}
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        🏆 {fixture.league_name || "Unknown League"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                        {formatMatchDate(fixture.match_date)}
                    </span>
                </div>

                {/* Teams vs Score */}
                <div className="flex items-center justify-between gap-2 py-1">
                    {/* Home */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-base font-bold text-slate-500 uppercase">
                            {fixture.home_team[0]}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 text-center leading-tight">
                            {truncateTeamName(fixture.home_team, 14)}
                        </p>
                        <span className="text-[10px] text-slate-400">Home</span>
                    </div>

                    {/* Score / VS */}
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
                        {fixture.is_match_live && (
                            <span className="flex items-center gap-1 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] text-green-600 font-semibold">LIVE</span>
                            </span>
                        )}
                    </div>

                    {/* Away */}
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-base font-bold text-slate-500 uppercase">
                            {fixture.away_team[0]}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 text-center leading-tight">
                            {truncateTeamName(fixture.away_team, 14)}
                        </p>
                        <span className="text-[10px] text-slate-400">Away</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">#{fixture.match_id}</span>
                    <button
                        onClick={onStartLoggingClick}
                        disabled={fixture.is_match_live}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all
                            ${fixture.is_match_live
                                ? "bg-green-100 text-green-700 border border-green-200 cursor-default"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
                            }`}
                    >
                        {fixture.is_match_live ? "✓ Live" : "Start Logging →"}
                    </button>
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
                        <div className="w-9 h-9 rounded-full bg-slate-100" />
                        <div className="h-3 w-16 rounded bg-slate-100" />
                    </div>
                    <div className="w-12 h-8 rounded-xl bg-slate-100" />
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-slate-100" />
                        <div className="h-3 w-16 rounded bg-slate-100" />
                    </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                    <div className="h-4 w-10 rounded bg-slate-100" />
                    <div className="h-6 w-24 rounded-full bg-slate-100" />
                </div>
            </div>
        </div>
    )
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function AllMatchesSubTab() {
    const dispatch = useDispatch<AppDispatch>()
    const fixtureState = useSelector((state: RootState) => state.allFixturesData)
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState<boolean>(false)

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

    const handleStartLoggingButtonClick = async (matchId: number) => {
        try {
            setLoading(true)
            const responseData: GeneralPostResponseModel | null = await makeMatchLiveAndReadyForLogging(matchId)
            if (responseData && responseData.status_code === "200") {
                dispatch(updateMatchStatusToLive(matchId))
            }
        } catch (error) {
            console.error(`error making match ${matchId} live:`, error)
        } finally {
            setLoading(false)
        }
    }

    return (
        // ✅ No overflow-y-auto here — the parent page scroll handles everything
        <div className="w-full">

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

                <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
                    <span>
                        <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
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

                <button
                    onClick={async () => {
                        const data = await get_all_fixtures_from_backend()
                        if (data) dispatch(updateAllFixturesData(data))
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white bg-[#f7f9fc] border border-[#e2e8f0] text-slate-500"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* Cards grid — no height cap, just flows naturally */}
            <div className="p-5">
                {fixtureState.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <MatchCardSkeleton key={i} />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <span className="text-4xl">⚽</span>
                        <p className="text-sm text-slate-500">
                            {search ? "No matches found for your search." : "No matches loaded yet."}
                        </p>
                        {search && (
                            <button onClick={() => setSearch("")} className="text-xs text-blue-500 hover:underline">
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
                                onStartLoggingClick={() => handleStartLoggingButtonClick(fixture.match_id)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}