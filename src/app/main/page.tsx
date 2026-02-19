'use client'
// redux imports and setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../appState/store"
import { AppDispatch } from "../appState/store"

import FixtureTab from "../components/tabs/fixtures"
import SideTabButton from "../components/buttons/sideTabTutton"


import { useState } from "react"
import { current } from "@reduxjs/toolkit"

export default function MainPage () {

    const dispatch= useDispatch<AppDispatch>()
    const adminData= useSelector((state: RootState)=> state.adminData)

    const [sideTabClicked, setSideTabClicked]= useState<boolean>(false)
    const [currentTab, setCurrentTab]= useState<string | null>(null)

    interface TabButtonsInterface {
        id: number;
        name: string;
    }

    const TabButtons: TabButtonsInterface[] = [
        {id: 1, name: "users"},
        {id: 2, name: "fixtures"},
        {id: 3, name: "leagues"},
        {id: 4, name: "seasons"},
        {id: 5, name: "stakes"},
    ]

    // click functions
    const handleSideTabButtonClick= (tabName: string | null)=> {
        if (currentTab !== null && currentTab === tabName ) {
            setSideTabClicked(!sideTabClicked)
            setCurrentTab(null)
        }
        else {
            setSideTabClicked(!sideTabClicked)
            setCurrentTab(tabName)
        }
    }

    return (
        <div className="min-h-screen w-full bg-white flex flex-row">
            {/* this will be the side bar meny or something*/}
            <div className="max-w-1/5 bg-[#0F1729] min-h-screen">
                <div className="w-full text-center flex justify-start pl-2 py-4 border-b mx-1 border-b-gray-300">
                    <h1 className="text-white text-xl font-bold">peerstake</h1>
                </div>
                <h2 className="text-sm text-gray-400 ml-2">Navigation</h2>

                {/* the links for the different parts of the sytem will leave here now */}
                <div className="flex gap-2 flex-col justify-start mt-4">
                    {/* for now they might be few but they will grow in number as we keep on adding more to the sytem */}
                    {TabButtons.map((tab)=> (
                        <div key={tab.id}
                        className="w-full mx">
                            <SideTabButton
                            name={tab.name}
                            onClickSideTabButton={()=> {handleSideTabButtonClick(tab.name)}}
                            TabClicked={sideTabClicked}
                            currentTab={currentTab}
                            />
                        </div>
                    ))}
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
                    {/** conditional rendering of tabs will happen here okay */}
                    <FixtureTab/>
                </div>

            </div>
        </div>
    )
}