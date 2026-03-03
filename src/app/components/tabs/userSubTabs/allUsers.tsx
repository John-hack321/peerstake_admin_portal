'use client'
import { useEffect, useState } from "react"

// redux data setup
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateAllUsersData, setUserDataLoadingState } from "@/app/appState/slices/usersData"
import { fetchAllUsersData } from "@/app/api/users"

interface UserCardProps {
    username: string;
    phoneNumber: string;
    accountBalance: number;
    noOfStakes: number;
    noOfLiveStakes: number;
}

function UserCard ({
    username,
    phoneNumber,
    accountBalance,
    noOfStakes,
    noOfLiveStakes,
} : UserCardProps) {
    return (
        <div className="bg-white px-3 py-2 flex flex-row gap-3 mb-2 rounded-lg">
            <h2 >{username}</h2>
            <h2>{phoneNumber}</h2>
            <h2>{accountBalance}</h2>
            <button>{noOfStakes}</button> {/* maybe can use links instead of buttons we will decide later on  */}
            <button>{noOfLiveStakes}</button> {/* the same applies here too */}
            <button
            className="text-red-900 border-red-900 px-3 py-2 bg-red-400 rounded-lg"> delete</button> {/** for deleting a user we will define functionality later on*/}
        </div>
    )
}


export default function AllUsersSubTab () {

    // redux data setup
    const allUsersData = useSelector((state: RootState)=> state.allUsersData )
    const dispatch= useDispatch<AppDispatch>()

    useEffect(()=> {
        const loadUserData= async () => {
            dispatch(setUserDataLoadingState()) // set loading state to true

            // do the api call
            // initial loading of the data
            const data= await fetchAllUsersData()
            if (data) {
                console.log('the use effect for fetching all users data has been fired and data returned')
                dispatch(updateAllUsersData(data))
                console.log(`the redux store has been updated accordingly`, allUsersData.data)
            }
        }

        loadUserData()
    }, [dispatch])

    // for the search functionality
    const [search, setSearch] = useState<string>("")

    const usersData = (allUsersData.data || []).filter((f) => {
        console.log('the data on teh redux store is: this is in the filter function ', allUsersData.data)
        const q = search.toLowerCase() // we user q from the search state to allow us to search for users
        return (
            f.username.toLowerCase().includes(q) ||
            f.username.toLowerCase().includes(q)
        )
    })
    

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e2e8f0] bg-main-page-bg-color">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs bg-white border border-[#e2e8f0]">
                <span className="text-sm text-slate-400">🔍</span>
                <input
                    type="text"
                    placeholder="Search Users"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm placeholder:text-slate-400 focus:outline-none w-full text-slate-700"
                />
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 font-medium">
                    users
                </span>
                </div>
            </div>

            <div className="p-5">
                {/* handle different  states including loading states and stuff*/}
                {allUsersData.isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"> {/* optimize this to be for the userdata cards */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <UserCardSkeleton key={i} />
                        ))}
                    </div>
                ) : usersData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <span className="text-4xl">📡</span>
                        <p className="text-sm text-slate-500">
                            {search
                            ? "No users match your search."
                            : "No user found in the system right now."}
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
                    <div className="">
                        {usersData.map((user)=> {
                            return (
                                <UserCard key={user.id}
                                    username={user.username}
                                    phoneNumber={user.phone_number}
                                    accountBalance={user.account_balance}
                                    noOfStakes={user.no_of_stakes}
                                    noOfLiveStakes={user.no_of_pending_stakes}
                                />
                            )
                        })}
                    </div>
                ) }
            </div>
        </div>
    )
}

// not that important just helper functions
function UserCardSkeleton () {
    return (
        <div>
            we will define the user card skeleton here
        </div>
    )
}