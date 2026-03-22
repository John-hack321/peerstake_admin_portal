'use client'
import { useEffect, useState } from "react";

// redux data setup
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/app/appState/store";
import { AllLeaguesApiResponse, setLeaguesLoadingState } from "@/app/appState/slices/leaguesData";
import { updateCurrentLeague } from "@/app/appState/slices/leaguesData";
import { setActiveSubTab } from "@/app/appState/slices/tabsData";

// other imports
import { getLeaguesList } from "@/app/api/leagues";
import { League, updateAllLeaguesData } from "@/app/appState/slices/leaguesData";
import { useRouter } from "next/navigation";

function SkeletonRow() {
    return (
        <div className="flex items-center px-6 h-[62px] border-b border-slate-200 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-[2] min-w-0 pl-3 pr-4">
            <div className="w-[120px] h-3 rounded bg-slate-100 mb-1.5" />
            <div className="w-11 h-2.5 rounded bg-slate-100" />
            </div>
            <div className="flex-[1] min-w-0 h-2.5 rounded bg-slate-100 pr-4" />
            <div className="flex-[1] min-w-0 h-3 rounded bg-slate-100 pr-6" />
            <div className="flex-[3] min-w-0 flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-[90px] h-7 rounded-full bg-slate-100 shrink-0" />)}
            </div>
            <div className="w-[80px] h-7 rounded bg-slate-100 shrink-0" />
        </div>
        )
    }

interface LeagueRowProps {
    name: string;
    id: number;
    logoUrl?: string;
    matchesAdded: boolean;
    onAddMatchButtonClick: (id: number)=> void;
    onDeleteLeagueButtonClick: ()=> void;
}

function LeagueRow ({name, id, logoUrl, matchesAdded, onAddMatchButtonClick, onDeleteLeagueButtonClick} : LeagueRowProps) {

    const hanldleAddMatchButtonClick = () => { /* define the functionality later */}
    const handleDeleteLeagueButtonClick = () => { /* define the functionality later  */}

    return (
        <div className="flex items-center px-6 py-3 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <img src="" alt="" /> {/* we need a way to add the logo url here , discuss with copilot later on */}

            {/* league name + ID — flex-[2] */}
            <div className="flex-2 min-w-0 pl-3 pr-4">
                <div className="text-sm font-semibold text-slate-900 truncate">{name}</div>
                <div className="text-[11px] text-slate-400 font-mono">#{id}</div>
            </div>

            <span className="text-black">{matchesAdded ? "loaded" : "notLoaded"}</span>
            {/* a button for adding matches to the league */}
            <button
            onClick={()=> {onAddMatchButtonClick(id)}}
            className="px-3 py-2 border rounded-full">add matches</button>

            <button 
            onClick={()=> {handleDeleteLeagueButtonClick()}}
            className="rounded-lg mx-3 py-2 border bg-red-400 border-red-800 text-red-800">delete</button>
        </div>
    )
}


export default function AllLeaguesTab () {

    const router= useRouter()

    // redux data
    const leaguesData= useSelector((state: RootState)=> state.allLeaguesData)
    const dispatch= useDispatch<AppDispatch>()
    
    // load the league data on rendering of the component
    useEffect(()=> {
        const loadLeaguesData = async () => {
            // I think before we fetch any data we first need to check if the redux store has data so that we dont over fetch the backend
            // we will make sure we implement this later on , for now its just about making sure the fetch works

            // set the loading state to true
            dispatch(setLeaguesLoadingState())
            const data: AllLeaguesApiResponse= await getLeaguesList() // no need to pass in the parameters since this is the initial loading of the data
            dispatch(updateAllLeaguesData(data))
            dispatch(setLeaguesLoadingState()) // set laoding sate back to false
            console.log(`the api call has been a success and the data gotten back is : `, data)
        }

        loadLeaguesData()
    },[])

    const [search, setSearch] = useState("")

    const filtered : League[] = (leaguesData.data || []).filter(league => {
        const userSearch= search.toLowerCase()
        // return league.localized_name.toLowerCase().includes(userSearch) NOTE : fix this search error
        return league
    })

    const addMatchesButtonClic = (id: number) => {
        console.log("the add matches button has been clicked")
        // we need to add the match Id to the redux store
        dispatch(updateCurrentLeague({leagueId: id}))
        // then I think we should be pushed to the league management table right
        dispatch(setActiveSubTab({tabId: "leagues", subTabId: "league-management"}))

    }
    
    return (
        <div className="w-full">
            {/* ── Toolbar ──  soon we will have to find a way of making this reusable so that we dont have to type all over agains in all of the files : TODO */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 flex-1 max-w-xs">
                    <span className="text-sm text-slate-400">🔍</span>
                    <input
                    type="text"
                    placeholder="Search by league name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border-none outline-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 w-full"
                    />
                </div>
        
                <span className="ml-auto text-xs text-slate-500">
                    <b className="text-slate-900">{filtered.length}</b> leagues
                </span>
        
                <button
                    onClick={async () => { const d = await getLeaguesList(); if (d) dispatch(updateAllLeaguesData(d)) }}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer font-medium transition-colors"
                >
                    ↻ Refresh
                </button>
            </div>

            {/* the grid / table for showing the matches now */}
            <div className="mx-2 my-4 border-slate-200 rounded-xl overflow-hidden bg-main-page-bg-color">
                {/* column headers */}
                <div className="flex items-center px-6 h-10 bg-slate-50 border mb-2 border-slate-200">
                    <div className="w-9 shrink-0" />
                    <span className="flex-2 min-w-0 pl-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">League</span>
                    <span className="flex-1 min-w-0 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">fixtures added?</span>
                    <span className="w-[80px] shrink-0  text-[10px] font-bold uppercase tracking-wider text-slate-400">actions</span>
                </div>

                {leaguesData.isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ): filtered.length == 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <div className="text-4xl mb-3"></div>
                        <div className="text-sm">{search ? "No leagues found" : "No Leagues found."}</div>
                        {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="mt-2 text-xs text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
                        >
                            Clear search
                        </button>
                            )}
                    </div>
                ) : ( filtered.map(league => (
                    <LeagueRow 
                        key={league.local_id}
                        name={league.localized_name}
                        id={league.local_id}
                        logoUrl={league.logo_url}
                        matchesAdded={league.fixture_added}
                        onAddMatchButtonClick={()=> {addMatchesButtonClic(league.local_id)}}
                        onDeleteLeagueButtonClick={()=> {}}
                    />
                )))
            }

            </div>
        </div>
    )
}