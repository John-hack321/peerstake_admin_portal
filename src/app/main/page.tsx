'use client'
// redux imports and setup
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { RootState } from "../appState/store"
import { AppDispatch } from "../appState/store"
import { closeTab, openTab, switchToTab, setActiveSubTab } from "../appState/slices/tabsData"

import FixtureTab from "../components/tabs/fixtures"
import SideTabButton from "../components/buttons/sideTabTutton"
import { TAB_CONFIG, getTabConfig } from "../config/tabConfig"
import TabContentRouter from "../components/tabs/tabsContentRouter"

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
        ? " bg-sidetab-hover-click-color bg-left-[2px]" 
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


interface ChromeTabBarProps {
  tabId: string
  activeSubTabId: string
  onSelectSubTab: (subTabId: string) => void
}

function ChromeTabBar({ tabId, activeSubTabId, onSelectSubTab }: ChromeTabBarProps) {
  const tabConfig = getTabConfig(tabId)
  if (!tabConfig) return null

  return (
    <div
      className="flex items-end px-5 pt-2 gap-1 bg-white"
      // style={{ background: "#f7f9fc" }}
    >
      {tabConfig.subTabs.map((st) => {
        const isActive = st.id === activeSubTabId
        return (
          <button
            key={st.id}
            onClick={() => onSelectSubTab(st.id)}
            className={`relative px-5 py-2 text-xs font-medium transition-all select-none whitespace-nowrap
              ${isActive
                ? "bg-main-page-bg-color border border-b-0 border-[#e2e8f0] text-slate-800 z-10 mb-[-1px]"
                : "text-slate-500 hover:text-slate-700"
              }`
            }
          >
            {st.label}
          </button>
        )
      })}
    </div>
  )
}


interface OpenTabsStripProps {
  openTabIds: string[]
  currentTabId: string | null
  onSwitch: (tabId: string) => void
  onClose: (tabId: string) => void
}

function OpenTabsStrip({ openTabIds, currentTabId, onSwitch, onClose }: OpenTabsStripProps) {
  if (openTabIds.length === 0) return null

  return (
    <div
      className="flex items-center gap-1 px-4 py-2  overflow-x-auto bg-white rouded-full mx-4 border-[#e2e8f0]"
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

    const currentTabConfig= currentTabId ? getTabConfig(currentTabId) : null
    const currentTab= openTabs.find((t)=> t.tabId == currentTabId)

    /** tab handler function will go here  */
    const handleCloseTab = (tabId: string) => {
      dispatch(closeTab({ tabId }))
    }
  
    const handleSubTabSelect = (subTabId: string) => {
      if (!currentTabId) return
      dispatch(setActiveSubTab({ tabId: currentTabId, subTabId }))
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
              className="flex items-center justify-between px-6 py-3  shrink-0"
              style={{
                background: "#ffffff",
                // borderColor: "#e2e8f0",
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
                    Heres whats happening today.
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


            <OpenTabsStrip
              openTabIds={openTabs.map((t) => t.tabId)}
              currentTabId={currentTabId}
              onSwitch={handleSwitchTab}
              onClose={handleCloseTab} 
            /> 

            {/* the main content will now live here */}
            { currentTab && currentTabConfig ? (
              <div className="">
                {/* Section header */}
                <div
                  className="px-6 pt-4 pb-0 shrink-0 bg-white"
                  // style={{ background: "#f7f9fc", borderBottom: "1px solid #e2e8f0" }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">{currentTabConfig.icon}</span>
                    <h2 className="font-semibold text-sm" style={{ color: "#1a202c" }}>
                      {currentTabConfig.label}
                    </h2>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "#64748b" }}>
                    Manage and configure all {currentTabConfig.label.toLowerCase()} data
                  </p>
                  {/* Chrome sub-tab bar */}
                  <ChromeTabBar
                    tabId={currentTab.tabId}
                    activeSubTabId={currentTab.activeSubTabId}
                    onSelectSubTab={handleSubTabSelect}
                  />

                  {/* the dynamic tab contents will now be rendered from here */}
                  <div className="flex-1 overflow-hidden bg-main-page-bg-color">
                    <TabContentRouter
                      tabId={currentTab.tabId}
                      subTabId={currentTab.activeSubTabId}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                still rendering nothing for now
              </div>
            )}

          </div> {/* right side bar foot */}

        </div>
    )
}