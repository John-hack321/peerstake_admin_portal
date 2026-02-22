'use client'

import { useEffect, useState } from "react"

// redux imports and setup
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateMatchStatusToLive } from "@/app/appState/slices/matchData"

import { Fixture } from "@/app/schemas/match_schemas"
import { updateAllFixturesData } from "@/app/appState/slices/matchData"
import { get_all_fixtures_from_backend, makeMatchLiveAndReadyForLogging } from "@/app/api/fixtures"
import { formatMatchDate, truncateTeamName } from "@/app/config/uitlity_functions"
import { ReceiptPoundSterlingIcon } from "lucide-react"
import { GeneralPostResponseModel } from "@/app/schemas/general"



// ─── Match Card ───────────────────────────────────────────────────────────────

interface MatchCardProps {
    fixture: Fixture
    onStartLoggingClick: () => void
}

function MatchCard({ fixture, onStartLoggingClick }: MatchCardProps) {
  const hasScore: boolean =
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
                {formatMatchDate(fixture.match_date)}
            </span>
        </div>

        <div className="flex flex-row justify-between">
            {/* Teams + Score */}
            <div className="flex  justify-between gap-2 w-2/3">
                <div className="flex-1 text-right">
                    <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
                    {truncateTeamName(fixture.home_team)}
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
                    {truncateTeamName(fixture.away_team)}
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                    Away
                    </p>
                </div>
            </div>

            {/* loggin action button */}
            <button 
            onClick={()=> {onStartLoggingClick()}}
            className="text-xs flex rounded-full bg-main-page-bg-color hover:bg-[#dbeafe] hover:text-[#2563eb]  px-3 py-1 text-black text-center items-center justify-center">
                Start logging?
            </button>

        </div>

      {/* Live indicator */}
        {fixture.is_match_live && (
            <div className="flex items-center gap-1.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600 text-xs font-medium">LIVE</span>
        </div>
        )}
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

export default function AllMatchesSubTab() {
    const dispatch = useDispatch<AppDispatch>()
    const fixtureState = useSelector((state: RootState) => state.allFixturesData)

    const [search, setSearch] = useState("")
    const [loading, setLoading]= useState<boolean>(false)

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
        // do a post api call for making match live and ready for logging
        try {
            setLoading(true)

            const responseData: GeneralPostResponseModel | null = await makeMatchLiveAndReadyForLogging(matchId)
            if (responseData && responseData.status_code === "500") {
                // find a way of telling the user that there was an error and they should try again later on
            }
            if (responseData && responseData.status_code === "200") {
                // this is where we now put the logging tab to be the main tab
                dispatch(updateMatchStatusToLive(matchId))
                setLoading(false)
            }
            if (responseData && responseData.status_code === "404") {
                console.log("the match was not foudn in the database")
                // find a way of telling the admin that the uesr was not found
            }

        }catch (error) {
            console.error(`an error occured while trying to log match of id : ${matchId} `, error)
            setLoading(false)
        }finally {
            // functionality for switching tabs to show the logging tab , 
            // this only fires when the api is successful
            setLoading(false)
        }

    }

    return (
    <div className="flex flex-col h-full w-full">

        {/* Toolbar */}
        <div
        className="flex items-center gap-3 px-5 py-3 border-b border-[#e2e8f0] bg-main-page-bg-color"
        // style={{ borderColor: "", background: "#ffffff" }}
        >
        {/* Search */}
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs bg-white"
            // style={{ background: "#f7f9fc", border: "1px solid #e2e8f0" }}
        >
            <span className="text-sm" style={{ color: "#94a3b8" }}>🔍</span>
            <input
            type="text"
            placeholder="Search team or league…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm placeholder:text-black focus:outline-none w-full"
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
                    onStartLoggingClick={()=> {handleStartLoggingButtonClick(fixture.match_id)}}
                />
            ))}
            </div>
        )}
        </div>

    </div>
    )
}