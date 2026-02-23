'use client'
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../appState/store"
import { closeTab, openTab, switchToTab, setActiveSubTab } from "../appState/slices/tabsData"
import { TAB_CONFIG, getTabConfig } from "../config/tabConfig"
import TabContentRouter from "../components/tabs/tabsContentRouter"
import { useEffect, useRef, useState } from "react"


// ─── Hook: hide on scroll-down, show on scroll-up ────────────────────────────

function useScrollDirection(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      const currentY = el.scrollTop
      const diff = currentY - lastY.current
      if (diff > 4)       setVisible(false)  // scrolling down → hide
      else if (diff < -4) setVisible(true)   // scrolling up   → show
      lastY.current = currentY
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [scrollRef])

  return visible
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function SideTabItem({ tabId, isActive, onClick }: {
  tabId: string; isActive?: boolean; onClick?: () => void
}) {
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

function ChromeTabBar({ tabId, activeSubTabId, onSelectSubTab }: {
  tabId: string; activeSubTabId: string; onSelectSubTab: (id: string) => void
}) {
  const tabConfig = getTabConfig(tabId)
  if (!tabConfig) return null
  return (
    <div className="flex items-end px-5 pt-2 gap-1 bg-white border-b border-[#e2e8f0]">
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
              }`}
          >
            {st.label}
          </button>
        )
      })}
    </div>
  )
}

function OpenTabsStrip({ openTabIds, currentTabId, onSwitch, onClose }: {
  openTabIds: string[]; currentTabId: string | null
  onSwitch: (id: string) => void; onClose: (id: string) => void
}) {
  if (openTabIds.length === 0) return null
  return (
    <div
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto bg-white border-b border-[#e2e8f0]"
      style={{ scrollbarWidth: "none" }}
    >
      {openTabIds.map((tabId) => {
        const config = getTabConfig(tabId)
        const isActive = tabId === currentTabId
        return (
          <div
            key={tabId}
            onClick={() => onSwitch(tabId)}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all shrink-0"
            style={{
              background: isActive ? "#dbeafe" : "transparent",
              color: isActive ? "#2563eb" : "#64748b",
              border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
            }}
          >
            <span>{config?.icon}</span>
            <span>{config?.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tabId) }}
              className="ml-1 leading-none opacity-60 hover:opacity-100"
            >✕</button>
          </div>
        )
      })}
    </div>
  )
}


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MainPage() {
  const dispatch = useDispatch<AppDispatch>()
  const adminData = useSelector((state: RootState) => state.adminData)
  const { openTabs, currentTabId } = useSelector((state: RootState) => state.tabs)

  const currentTabConfig = currentTabId ? getTabConfig(currentTabId) : null
  const currentTab = openTabs.find((t) => t.tabId === currentTabId)

  const scrollRef = useRef<HTMLDivElement>(null)
  const topVisible = useScrollDirection(scrollRef)

  const handleCloseTab    = (tabId: string) => dispatch(closeTab({ tabId }))
  const handleSwitchTab   = (tabId: string) => dispatch(switchToTab({ tabId }))
  const handleSideTabClick = (tabId: string) => {
    const config = getTabConfig(tabId)
    if (!config) return
    dispatch(openTab({ tabId, defaultSubTabId: config.defaultSubTabId }))
  }
  const handleSubTabSelect = (subTabId: string) => {
    if (!currentTabId) return
    dispatch(setActiveSubTab({ tabId: currentTabId, subTabId }))
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-main-page-bg-color">

      {/* ── Sidebar: never moves ── */}
      <aside className="flex flex-col shrink-0 w-56 h-screen bg-menuside-bar-background-color">
        <div className="px-5 py-4 border-b" style={{ borderColor: "#1D283A" }}>
          <div>
            <span className="font-bold text-lg" style={{ color: "#3b82f6" }}>.peer</span>
            <span className="font-bold text-lg text-side-panel-text-color">stake</span>
          </div>
          <p className="text-side-panel-text-color text-xs mt-0.5">Admin Portal</p>
        </div>

        <div className="px-3 py-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer"
            style={{ background: "#1D283A", color: "#9CA1A9", border: "1px solid #2A3A4A" }}
          >
            <span>🔍</span><span>Search…</span>
          </div>
        </div>

        <p className="text-[#9CA1A9] text-xs px-5 pb-2 uppercase tracking-widest">Navigation</p>

        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto pb-4">
          {TAB_CONFIG.map((tab) => (
            <SideTabItem
              key={tab.id} tabId={tab.id}
              isActive={currentTabId === tab.id}
              onClick={() => handleSideTabClick(tab.id)}
            />
          ))}
        </nav>

        <div className="px-4 py-3 border-t" style={{ borderColor: "#1D283A" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#2563eb", color: "#ffffff" }}>
              {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{adminData.admin_username || "Admin"}</p>
              <p className="text-[#9CA1A9] text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right column ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/*
          ┌─────────────────────────────────────────────────────┐
          │  LAYER 1 — Collapsible top (slides away entirely)   │
          │                                                     │
          │  Uses `overflow: hidden` + `max-height` transition  │
          │  so it physically collapses to 0px height,          │
          │  taking up zero layout space when hidden.           │
          │  Content below naturally fills the freed space.     │
          └─────────────────────────────────────────────────────┘
        */}
        <div
          className="overflow-hidden shrink-0"
          style={{
            maxHeight: topVisible ? "200px" : "0px",
            transition: "max-height 250ms ease-in-out",
            willChange: "max-height",
          }}
        >
          {/* Welcome bar */}
          <div
            className="flex items-center justify-between px-6 py-3"
            style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1a202c" }}>
                Welcome back,{" "}
                <span style={{ color: "#2563eb" }}>{adminData.admin_username || "Admin"}</span>
              </p>
              <p className="text-xs text-[#64748b]">Here&apos;s what&apos;s happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100"
                style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
              >🔔</button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#2563eb] text-white">
                {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
                All systems online
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

          {/* Section title */}
          {currentTab && currentTabConfig && (
            <div className="px-6 pt-3 pb-2 bg-white">
              <div className="flex items-center gap-2 mb-0.5">
                <span>{currentTabConfig.icon}</span>
                <h2 className="font-semibold text-sm" style={{ color: "#1a202c" }}>
                  {currentTabConfig.label}
                </h2>
              </div>
              <p className="text-xs text-[#64748b]">
                Manage and configure all {currentTabConfig.label.toLowerCase()} data
              </p>
            </div>
          )}
        </div>

        {/*
          ┌─────────────────────────────────────────────────────┐
          │  LAYER 2 — Chrome tab bar (ALWAYS visible)          │
          │                                                     │
          │  Sits outside the collapsible div entirely.         │
          │  Never moves, never hides. This is the permanent    │
          │  anchor the user always sees at the top.            │
          └─────────────────────────────────────────────────────┘
        */}
        {currentTab && currentTabConfig && (
          <div className="shrink-0 bg-white shadow-sm">
            <ChromeTabBar
              tabId={currentTab.tabId}
              activeSubTabId={currentTab.activeSubTabId}
              onSelectSubTab={handleSubTabSelect}
            />
          </div>
        )}

        {/*
          ┌─────────────────────────────────────────────────────┐
          │  LAYER 3 — Scrollable content                       │
          │                                                     │
          │  flex-1 means it always fills whatever height       │
          │  is left after layers 1 + 2. When layer 1           │
          │  collapses, this div grows to fill the space.       │
          └─────────────────────────────────────────────────────┘
        */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-main-page-bg-color">
          {currentTab && currentTabConfig ? (
            <TabContentRouter
              tabId={currentTab.tabId}
              subTabId={currentTab.activeSubTabId}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-slate-400 text-sm">
              Select a section from the sidebar to get started.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}