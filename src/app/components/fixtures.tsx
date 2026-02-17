'use client'
import { useEffect } from "react"

export default function FixtureTab () {

    // on render we need to query the fixture from the backend
    useEffect(()=> {
        const loadFixturesData= async () => {
            // we will define the logic soon
        }
    },[])
    return (
        <div>
            {/* this is the sub-tab selection part */}
            <div>
                <button>matches</button>
                <button>Live (+logging)</button>
            </div>
        </div>
    )
}
