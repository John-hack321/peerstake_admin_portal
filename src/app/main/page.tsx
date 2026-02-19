'use client'

import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../appState/store"

import { closeTab, openTab, setActiveSubTab, switchToTab } from "../appState/slices/tabslice"


import { TAB_CONFIG, getTabConfig } from "../config/tabsConfig"
import ContentRouter from "../components/contentRouter"

// ─── Chrome Tab Bar ───────────────────────────────────────────────────────────

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
      className="flex items-end px-5 pt-2 gap-0 border-b"
      style={{ borderColor: "#1D283A", background: "#0F1729" }}
    >
      {tabConfig.subTabs.map((st) => {
        const isActive = st.id === activeSubTabId
        return (
          <button
            key={st.id}
            onClick={() => onSelectSubTab(st.id)}
            className="relative px-5 py-2 text-xs font-medium transition-all select-none whitespace-nowrap"
            style={{
              color: isActive ? "#ffffff" : "#9CA1A9",
              background: isActive ? "#1a2633" : "transparent",
              border: isActive
                ? "1px solid #1D283A"
                : "1px solid transparent",
              borderBottom: isActive ? "1px solid #1a2633" : "1px solid transparent",
              borderRadius: "8px 8px 0 0",
              marginBottom: isActive ? "-1px" : "0",
              zIndex: isActive ? 10 : 1,
            }}
          >
            {/* Left ear */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: -8,
                  width: 8,
                  height: 8,
                  background: "#1a2633",
                  borderBottomRightRadius: 8,
                  boxShadow: "2px 2px 0 2px #0F1729",
                  pointerEvents: "none",
                }}
              />
            )}
            {st.label}
            {/* Right ear */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -8,
                  width: 8,
                  height: 8,
                  background: "#1a2633",
                  borderBottomLeftRadius: 8,
                  boxShadow: "-2px 2px 0 2px #0F1729",
                  pointerEvents: "none",
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Sidebar Tab Item ─────────────────────────────────────────────────────────

interface SideTabItemProps {
  tabId: string
  isActive: boolean
  onClick: () => void
}

function SideTabItem({ tabId, isActive, onClick }: SideTabItemProps) {
  const config = getTabConfig(tabId)
  if (!config) return null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left"
      style={{
        color: isActive ? "#ffffff" : "#9CA1A9",
        background: isActive ? "#1D283A" : "transparent",
        borderLeft: isActive ? "2px solid #FED800" : "2px solid transparent",
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  )
}

// ─── Open Tabs Strip (above content, shows open tabs with X) ─────────────────

interface OpenTabsStripProps {
  openTabIds: string[]
  currentTabId: string | null
  onSwitch: (tabId: string) => void
  onClose: (tabId: string) => void
}

function OpenTabsStrip({
  openTabIds,
  currentTabId,
  onSwitch,
  onClose,
}: OpenTabsStripProps) {
  if (openTabIds.length === 0) return null

  return (
    <div
      className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto"
      style={{
        background: "#0a111c",
        borderColor: "#1D283A",
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
              background: isActive ? "#1D283A" : "transparent",
              color: isActive ? "#ffffff" : "#9CA1A9",
              border: isActive ? "1px solid #2A3A4A" : "1px solid transparent",
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
              className="ml-1 hover:text-white transition-colors leading-none opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MainPage() {
  const dispatch = useDispatch<AppDispatch>()
  const adminData = useSelector((state: RootState) => state.adminData)
  const { openTabs, currentTabId } = useSelector(
    (state: RootState) => state.tabs
  )

  const currentTab = openTabs.find((t) => t.tabId === currentTabId)
  const currentTabConfig = currentTabId ? getTabConfig(currentTabId) : null

  const handleSideTabClick = (tabId: string) => {
    const config = getTabConfig(tabId)
    if (!config) return
    dispatch(openTab({ tabId, defaultSubTabId: config.defaultSubTabId }))
  }

  const handleSubTabSelect = (subTabId: string) => {
    if (!currentTabId) return
    dispatch(setActiveSubTab({ tabId: currentTabId, subTabId }))
  }

  const handleCloseTab = (tabId: string) => {
    dispatch(closeTab({ tabId }))
  }

  const handleSwitchTab = (tabId: string) => {
    dispatch(switchToTab({ tabId }))
  }

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: "#0a111c" }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: "220px",
          background: "#0F1729",
          borderRight: "1px solid #1D283A",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#1D283A" }}
        >
          <div>
            <span className="font-bold text-lg" style={{ color: "#FED800" }}>
              .peer
            </span>
            <span className="font-bold text-lg text-[#d1d5dc]">stake</span>
          </div>
          <p className="text-[#9CA1A9] text-xs mt-0.5">Admin Portal</p>
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
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "#1D283A" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#FED800", color: "#0F1729" }}
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

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b shrink-0"
          style={{
            background: "#0F1729",
            borderColor: "#1D283A",
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="text-white text-sm font-semibold">
                Welcome back,{" "}
                <span style={{ color: "#FED800" }}>
                  {adminData.admin_username || "Admin"}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "#4ade80" }}
            />
            <span className="text-[#9CA1A9]">System online</span>
          </div>
        </div>

        {/* Open tabs strip */}
        <OpenTabsStrip
          openTabIds={openTabs.map((t) => t.tabId)}
          currentTabId={currentTabId}
          onSwitch={handleSwitchTab}
          onClose={handleCloseTab}
        />

        {/* Content area */}
        {currentTab && currentTabConfig ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Section header */}
            <div
              className="px-6 pt-4 pb-0 shrink-0"
              style={{ background: "#0F1729" }}
            >
              <h2 className="text-white font-semibold text-sm mb-0.5">
                {currentTabConfig.icon} {currentTabConfig.label}
              </h2>
              <p className="text-[#9CA1A9] text-xs mb-3">
                Manage and configure all{" "}
                {currentTabConfig.label.toLowerCase()} data
              </p>
            </div>

            {/* Chrome sub-tab bar — constant for all tabs */}
            <ChromeTabBar
              tabId={currentTab.tabId}
              activeSubTabId={currentTab.activeSubTabId}
              onSelectSubTab={handleSubTabSelect}
            />

            {/* Dynamic content — changes per tab+subtab */}
            <div
              className="flex-1 overflow-hidden"
              style={{ background: "#1a2633" }}
            >
              <ContentRouter
                tabId={currentTab.tabId}
                subTabId={currentTab.activeSubTabId}
              />
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="text-5xl">⚽</div>
            <p className="text-white font-semibold text-base">
              PeerStake Admin Portal
            </p>
            <p className="text-[#9CA1A9] text-sm text-center max-w-xs">
              Select a section from the sidebar to get started.
            </p>
            <div className="flex gap-2 mt-2">
              {TAB_CONFIG.slice(0, 3).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSideTabClick(tab.id)}
                  className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                  style={{
                    background: "#1D283A",
                    color: "#9CA1A9",
                    border: "1px solid #2A3A4A",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}