'use client'
// redux imports and setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../appState/store"
import { AppDispatch } from "../appState/store"
import { closeTab, openTab, switchToTab } from "../appState/slices/tabsData"

import FixtureTab from "../components/tabs/fixtures"
import SideTabButton from "../components/buttons/sideTabTutton"
import { TAB_CONFIG, getTabConfig } from "../config/tabConfig"

import { useState } from "react"
import { current } from "@reduxjs/toolkit"

interface SideTabItemProps {
  tabId: string
  isActive?: boolean
  onClick?: () => void
}

function SideTabItem({ tabId, isActive, onClick }: SideTabItemProps) {
  const config = getTabConfig(tabId)
  if (!config) return null

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left
        ${isActive 
        ? "bg-transparent bg-sidetab-hover-click-color bg-left-[2px]" 
        : ""}
      `}
      style={{
        color: isActive ? "#ffffff" : "#9CA1A9",
        background: isActive ? "#1D283A" : "transparent",
        borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  )
}


interface OpenTabsStripProps {
  openTabIds: string[]
  currentTabId: string | null
  onSwitch?: (tabId: string) => void
  onClose?: (tabId: string) => void
}

function OpenTabsStrip({ openTabIds, currentTabId, onSwitch, onClose }: OpenTabsStripProps) {
  if (openTabIds.length === 0) return null

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto bg-main-page-bg-color border-[#e2e8f0]"
      style={{
        scrollbarWidth: "none",
      }}
    >
      {openTabIds.map((tabId) => {
        const config = getTabConfig(tabId)
        const isActive = tabId === currentTabId
        return (
          <div
            key={tabId}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all shrink-0"
            style={{
              background: isActive ? "#dbeafe" : "transparent",
              color: isActive ? "#2563eb" : "#64748b",
              border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
            }}
            onClick={() => onSwitch(tabId)}
          >
            <span>{config?.icon}</span>
            <span>{config?.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose(tabId)
              }}
              className="ml-1 transition-colors leading-none opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function MainPage () {

    const dispatch= useDispatch<AppDispatch>()
    const adminData= useSelector((state: RootState)=> state.adminData)
    const {openTabs, currentTabId}= useSelector((state: RootState)=> state.tabs)

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

    /** tab handler function will go here  */
    const handleCloseTab = (tabId: string) => {
      dispatch(closeTab({ tabId }))
    }
  
    const handleSwitchTab = (tabId: string) => {
      dispatch(switchToTab({ tabId }))
    }

    const handleSideTabClick = (tabId: string) => {
      const config = getTabConfig(tabId)
      if (!config) return
      dispatch(openTab({ tabId, defaultSubTabId: config.defaultSubTabId }))
    }

    return (
        <div className="min-h-screen w-full  bg-main-page-bg-color flex ">
          <aside
          className="flex flex-col shrink-0 bg-menuside-bar-background-color max-w-[350px] ">
            {/* Logo */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "#1D283A" }}>
              <div>
                <span className="font-bold text-lg" style={{ color: "#3b82f6" }}>
                  .peer
                </span>
                <span className="font-bold text-lg text-side-panel-text-color">stake</span>
              </div>
              <p className="text-side-panel-text-color text-xs mt-0.5">Admin Portal</p>
            </div>

             {/* Search */}
            <div className="px-3 py-3">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                style={{
                  background: "#1D283A",
                  color: "#9CA1A9",
                  border: "1px solid #2A3A4A",
                }}
              >
                <span>🔍</span>
                <span>Search…</span>
              </div>
            </div>

            {/* Nav label */}
            <p className="text-[#9CA1A9] text-xs px-5 pb-2 uppercase tracking-widest">
              Navigation
            </p>

            {/* Tabs */}
            <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto pb-4">
              {TAB_CONFIG.map((tab) => (
                <SideTabItem
                  key={tab.id}
                  tabId={tab.id}
                  isActive={currentTabId === tab.id}
                  onClick={() => handleSideTabClick(tab.id)}
                />
              ))}
            </nav>

            {/* Admin info */}
            <div className="px-4 py-3 border-t" style={{ borderColor: "#1D283A" }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "#2563eb", color: "#ffffff" }}
                >
                  {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-xs font-medium truncate">
                    {adminData.admin_username || "Admin"}
                  </p>
                  <p className="text-[#9CA1A9] text-xs">Administrator</p>
                </div>
              </div>
            </div>

          </aside>
          {/* the right panel */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* top most bar for admin account show and normal info */}
            <div
              className="flex items-center justify-between px-6 py-3 border-b shrink-0"
              style={{
                background: "#ffffff",
                borderColor: "#e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1a202c" }}>
                    Welcome back,{" "}
                    <span style={{ color: "#2563eb" }}>
                      {adminData.admin_username || "Admin"}
                    </span>
                  </p>
                  <p className="text-xs text-[#64748b]" >
                    Here's what's happening today.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Notification bell */}
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                  style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                >
                  🔔
                </button>
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#2563eb] text-[#ffffff]"
                >
                  {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#4ade80" }}
                  />
                  All systems are online
                </div>
              </div>
            </div>

            {/* the open tabs strip */}
            {/* Open tabs strip */}
            <OpenTabsStrip
              openTabIds={openTabs.map((t) => t.tabId)}
              currentTabId={currentTabId}
              onSwitch={handleSwitchTab}
              onClose={handleCloseTab} 
            />

          </div> {/* right side bar foot */}

        </div>
    )
}