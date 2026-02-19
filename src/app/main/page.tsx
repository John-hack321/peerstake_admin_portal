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
      className="flex items-end px-5 pt-2 gap-1 border-b"
      style={{ borderColor: "#e2e8f0", background: "#f7f9fc" }}
    >
      {tabConfig.subTabs.map((st) => {
        const isActive = st.id === activeSubTabId
        return (
          <button
            key={st.id}
            onClick={() => onSelectSubTab(st.id)}
            className="relative px-5 py-2 text-xs font-medium transition-all select-none whitespace-nowrap"
            style={{
              color: isActive ? "#2563eb" : "#64748b",
              background: isActive ? "#ffffff" : "transparent",
              border: isActive ? "1px solid #e2e8f0" : "1px solid transparent",
              borderBottom: isActive ? "1px solid #ffffff" : "1px solid transparent",
              borderRadius: "8px 8px 0 0",
              marginBottom: isActive ? "-1px" : "0",
              zIndex: isActive ? 10 : 1,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: -8,
                  width: 8,
                  height: 8,
                  background: "#ffffff",
                  borderBottomRightRadius: 8,
                  boxShadow: "2px 2px 0 2px #f7f9fc",
                  pointerEvents: "none",
                }}
              />
            )}
            {st.label}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  right: -8,
                  width: 8,
                  height: 8,
                  background: "#ffffff",
                  borderBottomLeftRadius: 8,
                  boxShadow: "-2px 2px 0 2px #f7f9fc",
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
        borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  )
}

// ─── Open Tabs Strip ─────────────────────────────────────────────────────────

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
      className="flex items-center gap-1 px-4 py-2 border-b overflow-x-auto"
      style={{
        background: "#f0f4f8",
        borderColor: "#e2e8f0",
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: string
  color: string
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ background: color + "15" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "#64748b" }}>
          {label}
        </p>
        <p className="text-xl font-bold" style={{ color: "#1a202c" }}>
          {value}
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function MainPage() {
  const dispatch = useDispatch<AppDispatch>()
  const adminData = useSelector((state: RootState) => state.adminData)
  const { openTabs, currentTabId } = useSelector((state: RootState) => state.tabs)

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
    <div className="flex min-h-screen w-full" style={{ background: "#f0f4f8" }}>
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
        <div className="px-5 py-4 border-b" style={{ borderColor: "#1D283A" }}>
          <div>
            <span className="font-bold text-lg" style={{ color: "#3b82f6" }}>
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

      {/* ── Right Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
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
              <p className="text-xs" style={{ color: "#64748b" }}>
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#2563eb", color: "#ffffff" }}
            >
              {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#4ade80" }}
              />
              Online
            </div>
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
              style={{ background: "#f7f9fc", borderBottom: "1px solid #e2e8f0" }}
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
            </div>

            {/* Dynamic content */}
            <div className="flex-1 overflow-hidden" style={{ background: "#f0f4f8" }}>
              <ContentRouter
                tabId={currentTab.tabId}
                subTabId={currentTab.activeSubTabId}
              />
            </div>
          </div>
        ) : (
          /* Empty state / Dashboard */
          <div className="flex-1 p-6 overflow-auto">
            {/* Stat cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Earnings" value="$30,200" icon="💰" color="#2563eb" />
              <StatCard label="Page Views" value="290+" icon="👁" color="#8b5cf6" />
              <StatCard label="Tasks Completed" value="145" icon="✅" color="#10b981" />
              <StatCard label="Downloads" value="500" icon="⬇️" color="#f59e0b" />
            </div>

            {/* Welcome card */}
            <div
              className="rounded-xl p-8 flex flex-col items-center justify-center gap-4 mb-6"
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div className="text-5xl">⚽</div>
              <p className="font-semibold text-base" style={{ color: "#1a202c" }}>
                PeerStake Admin Portal
              </p>
              <p className="text-sm text-center max-w-xs" style={{ color: "#64748b" }}>
                Select a section from the sidebar to get started.
              </p>
              <div className="flex gap-2 mt-2">
                {TAB_CONFIG.slice(0, 3).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleSideTabClick(tab.id)}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-90"
                    style={{
                      background: "#dbeafe",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}