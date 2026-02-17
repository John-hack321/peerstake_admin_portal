'use client'
import { useEffect } from "react"
import { AllFixturesApiResponse } from "../schemas/match_schemas"
import { get_all_fixtures_from_backend } from "../api/fixtures"

// redux setup
import { RootState } from "../appState/store";
import { useSelector } from "react-redux";
import { AppDispatch } from "../appState/store";
import { useDispatch } from "react-redux";
import { updateAllFixturesData } from "../appState/slices/matchData";


export default function FixtureTab () {

    // redux data setup
    const fixtureData= useSelector((state: RootState)=> state.allFixturesData)
    const dispatch= useDispatch<AppDispatch>()

    // on render we need to query the fixture from the backend
    useEffect(()=> {
        const loadFixturesData= async () => {
            // we will define the logic soon

            const fixtureData: AllFixturesApiResponse | null= await get_all_fixtures_from_backend()

            if (fixtureData) {
                dispatch(updateAllFixturesData(fixtureData))
                return fixtureData
            }
        };

        loadFixturesData();
    },[])
    return (
        <div>
            {/* this is the sub-tab selection part */}
            <div className="flex flex-row  gap-6 mt-4">
                <button className="text-black rounded-lg px-3 py-2 hover:bg-gray-300 ">matches</button>
                <button className="text-black rounded-lg px-3 py-2 hover:bg-gray-300 ">Live (+logging)</button>
            </div>

            <div>
                {fixtureData.data.map((fixture) => (
                    <div 
                    className="flex flex-row gap-2 my-2"
                    key={fixture.match_id}>
                        <h2 className="text-black">{fixture.home_team}</h2>
                        <h2 className="text-black">{fixture.away_team}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}
