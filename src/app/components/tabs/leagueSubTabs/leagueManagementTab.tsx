'use client'
import { League } from "@/app/appState/slices/leaguesData"

// redux data setup
import { RootState, AppDispatch } from "@/app/appState/store"
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { resetCurrentLeagueToNull } from "@/app/appState/slices/leaguesData";
import { setActiveSubTab } from "@/app/appState/slices/tabsData";

interface AddedMatch {
    homeTeam: string;
    awayTeam: string;
    date: string;
}

interface AddedMatchesList {
    count: number;
    data: AddedMatch[];
}

export default function LeagueManagement () {

    const leagueData= useSelector((state: RootState)=> state.allLeaguesData)
    const currentLeagueData: League | undefined = leagueData.data.find(league => league.id === leagueData.currentLeague);
    const dispatch= useDispatch<AppDispatch>()

    const addedMatchesData: AddedMatchesList = {
        count: 0,
        data: [],
    }

    const [homeTeam, setHomeTeam]= useState("")
    const [awayTeam, setAwayTeam]= useState("")
    const [date, setDate]= useState("")

    const handleAddMatchButtonClick = (match: AddedMatch)=> {
        addedMatchesData.count++;
        addedMatchesData.data.push(match)
        setHomeTeam('')
        setAwayTeam("")
        setDate("")
    }

    const hanldeExitButtonClick= () => {
        dispatch(resetCurrentLeagueToNull())
        // we then set the active tab to the leagues tab
        dispatch(setActiveSubTab({tabId: "leagues", subTabId: "all-leagues"}))
    }


    return (
        <div>
            {/* header region */}
            <div>
                <div>
                    <img src="" alt="" /> {/* logo image url get it from currentLeagueData.data.logoUrl*/}
                    <h3>{currentLeagueData?.localized_name}</h3>
                </div>
                <button
                onClick={()=> {hanldeExitButtonClick()}}
                className="">x</button> {/* when this one is clicked we should go back to the leagues page  */}
            </div>
            {/* quick actoins tab */}
            <div>
                <span>{/* we will add number of matches present in the league here  */}matches </span>
                <button className="border rounded-full px-3 py-2">add matches</button>
            </div>

            <div className="w-full rounded-lg">
                <div>
                    <h2>{addedMatchesData.count} added</h2> {/* show the number of matches added so far */}
                </div>

                <div className="flex flex-row gap-10">
                    <div>
                        <span className="text-black">home</span>
                        <input type="text"
                        placeholder="enter the home team"
                        className="rounded-full w-[20px]"/>
                    </div>
                    <div>
                        <span className="text-black">away</span>
                        <input type="text"
                        placeholder="enter the away team"
                        className="" />
                    </div>
                </div>

                <div>
                    <div>
                        <span>select the date</span>
                        <input type="text" /> { /* I would realy like it if there was a pakcage for selecting date so that the dates can be seelcted acurately right ? */}
                    </div>
                    <button 
                    onClick={()=> {()=> {handleAddMatchButtonClick({homeTeam, awayTeam, date})}}}
                    className="text-green-700 rounded-full border-green-700 border px-3 py-2 bg-green-400">submit match</button>
                </div>
            </div>
        </div>
    )
}