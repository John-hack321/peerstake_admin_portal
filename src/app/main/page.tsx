'use client'

import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../appState/store"
import { AppDispatch } from "../appState/store"

export default function MainPage () {

    const dispatch= useDispatch<AppDispatch>()
    const adminData= useSelector((state: RootState)=> state.adminData)

    return (
        <div className="min-h-screen w-full bg-white flex flex-row">
            {/* this will be the side bar meny or something*/}
            <div className="max-w-1/10 bg-blue-700 min-h-screen">
                <div className="w-full text-center flex justify-start pl-2 py-2 border-b border-b-gray-300">
                    <h1 className="text-white text-2xl font-bold">peerstake</h1>
                </div>
                {/* the links for the different parts of the sytem will leave here now */}
                <div className="flex gap-2 flex-col justify-start">
                    {/* for now they might be few but they will grow in number as we keep on adding more to the sytem */}
                    <button className="text-center px-3 py-2 flex justify-start hover:bg-blue-200 bg-blue-700 hover:text-black text-custom-white-text-color">fixtures</button>
                    <button className="text-center px-3 py-2 flex justify-start hover:bg-blue-200 bg-blue-700 hover:text-black text-custom-white-text-color">users</button>
                </div>

                {/* just some info on whos logged in and stuff */}
                <div className="flex justify-start">
                    <h2 className="text-custom-white-text-color font-bold">{adminData.admin_username}</h2>
                </div>
            </div>

            {/* main content error : will dispaly anything that has been selected on the other meny */}
            <div className=" px-3 w-full py-3 flex flex-col">
                <div className="flex flex-row justfy-start gap-20 border-b border-b-black w-full">
                    <h2 className="text-black text-xl ">welcome back {adminData.admin_username}</h2>
                    <h2 className="text-black">system is <span className="text-green-400">online</span></h2>
                </div>

                {/** the rendering of the different tabs will happend around here => this part will be scrollable */}
                <div>
                    
                </div>

            </div>
        </div>
    )
}