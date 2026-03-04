'use client'
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../appState/store"
import { closeTab, openTab, switchToTab, setActiveSubTab } from "../appState/slices/tabsData"
import { TAB_CONFIG, getTabConfig } from "../config/tabConfig"
import TabContentRouter from "../components/tabs/tabsContentRouter"
import { useEffect, useRef, useState } from "react"


// ─── Hide on scroll down, show on scroll up ───────────────────────────────────

function useScrollDirection(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onScroll = () => {
      const currentY = el.scrollTop
      const diff = currentY - lastY.current
      if (diff > 4)       setVisible(false)
      else if (diff < -4) setVisible(true)
      lastY.current = currentY
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [scrollRef])

  return visible
}


// ─── Sidebar Tab Item ─────────────────────────────────────────────────────────

function SideTabItem({ tabId, isActive, isExpanded, onClick, onSubTabClick, activeSubTabId }: {
  tabId: string
  isActive?: boolean
  isExpanded?: boolean
  onClick?: () => void
  onSubTabClick?: (subTabId: string) => void
  activeSubTabId?: string
}) {
  const config = getTabConfig(tabId)
  if (!config) return null

  return (
    <div>
      {/* Main tab row */}
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all text-left group
          border-l-2
          ${isActive
            ? "text-white border-blue-500 " + (!isExpanded ? "bg-sidetab-hover-click-color" : "bg-transparent")
            : "text-side-panel-text-color border-transparent hover:text-white hover:bg-sidetab-hover-click-color"
          }`}
      >
        <span className="text-base leading-none shrink-0">{config.icon}</span>
        <span className="flex-1">{config.label}</span>

        {/* Chevron */}
        <svg
          className={`shrink-0 transition-transform duration-200 w-3 h-3
            ${isExpanded ? "rotate-180" : "rotate-0"}
            ${isActive ? "text-slate-400" : "text-gray-600"}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Subtabs — slide open */}
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: isExpanded ? `${config.subTabs.length * 40}px` : "0px" }}
      >
        {config.subTabs.map((st) => {
          const isSubActive = st.id === activeSubTabId && isActive
          return (
            <button
              key={st.id}
              onClick={() => onSubTabClick?.(st.id)}
              className={`w-full flex items-center gap-2 pl-10 pr-4 py-2 text-xs font-medium transition-all text-left border-l-2
                ${isSubActive
                  ? "text-blue-400 bg-[#0F1E35] border-blue-500"
                  : "text-gray-500 border-transparent hover:text-slate-300 hover:bg-sidetab-hover-click-color"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isSubActive ? "bg-blue-500" : "bg-gray-700"}`}
              />
              <span>{st.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


// ─── Chrome-style sub-tab bar ─────────────────────────────────────────────────

function ChromeTabBar({ tabId, activeSubTabId, onSelectSubTab }: {
  tabId: string; activeSubTabId: string; onSelectSubTab: (id: string) => void
}) {
  const tabConfig = getTabConfig(tabId)
  if (!tabConfig) return null

  return (
    <div className="flex items-end px-5 pt-2 gap-1 bg-white border-b border-slate-200">
      {tabConfig.subTabs.map((st) => {
        const isActive = st.id === activeSubTabId
        return (
          <button
            key={st.id}
            onClick={() => onSelectSubTab(st.id)}
            className={`relative px-5 py-2 text-xs font-medium transition-all select-none whitespace-nowrap
              ${isActive
                ? "bg-main-page-bg-color border border-b-0 border-slate-200 text-slate-800 z-10 -mb-px"
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


// ─── Open tabs strip ──────────────────────────────────────────────────────────

function OpenTabsStrip({ openTabIds, currentTabId, onSwitch, onClose }: {
  openTabIds: string[]; currentTabId: string | null
  onSwitch: (id: string) => void; onClose: (id: string) => void
}) {
  if (openTabIds.length === 0) return null

  return (
    <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto bg-white border-b border-slate-200 [scrollbar-width:none]">
      {openTabIds.map((tabId) => {
        const config = getTabConfig(tabId)
        const isActive = tabId === currentTabId
        return (
          <div
            key={tabId}
            onClick={() => onSwitch(tabId)}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all shrink-0 border
              ${isActive
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-transparent text-slate-500 border-transparent hover:bg-slate-100"
              }`}
          >
            <span>{config?.icon}</span>
            <span>{config?.label}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tabId) }}
              className="ml-1 leading-none opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
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

  const [expandedTabId, setExpandedTabId] = useState<string | null>(currentTabId)

  const currentTabConfig = currentTabId ? getTabConfig(currentTabId) : null
  const currentTab = openTabs.find((t) => t.tabId === currentTabId)

  const scrollRef = useRef<HTMLDivElement>(null)
  const topVisible = useScrollDirection(scrollRef)

  useEffect(() => {
    if (currentTabId) setExpandedTabId(currentTabId)
  }, [currentTabId])

  const handleCloseTab    = (tabId: string) => dispatch(closeTab({ tabId }))
  const handleSwitchTab   = (tabId: string) => dispatch(switchToTab({ tabId }))

  const handleSideTabClick = (tabId: string) => {
    const config = getTabConfig(tabId)
    if (!config) return

    if (expandedTabId === tabId) {
      setExpandedTabId(null)
    } else {
      setExpandedTabId(tabId)
      dispatch(openTab({ tabId, defaultSubTabId: config.defaultSubTabId }))
    }
  }

  const handleSideSubTabClick = (tabId: string, subTabId: string) => {
    const config = getTabConfig(tabId)
    if (!config) return
    dispatch(openTab({ tabId, defaultSubTabId: subTabId }))
    dispatch(setActiveSubTab({ tabId, subTabId }))
  }

  const handleSubTabSelect = (subTabId: string) => {
    if (!currentTabId) return
    dispatch(setActiveSubTab({ tabId: currentTabId, subTabId }))
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-main-page-bg-color">

      {/* ── Sidebar ── */}
      <aside className="flex flex-col shrink-0 w-56 h-screen bg-menuside-bar-background-color">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-sidetab-hover-click-color">
          <div>
            <span className="font-bold text-lg text-blue-500">.peer</span>
            <span className="font-bold text-lg text-side-panel-text-color">stake</span>
          </div>
          <p className="text-side-panel-text-color text-xs mt-0.5">Admin Portal</p>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer bg-sidetab-hover-click-color text-side-panel-text-color border border-[#2A3A4A]">
            <span>🔍</span>
            <span>Search…</span>
          </div>
        </div>

        <p className="text-side-panel-text-color text-xs px-5 pb-2 uppercase tracking-widest">Navigation</p>

        {/* Nav items */}
        <nav className="flex flex-col gap-0 flex-1 overflow-y-auto pb-4 [scrollbar-width:none]">
          {TAB_CONFIG.map((tab) => {
            const openTab = openTabs.find((t) => t.tabId === tab.id)
            return (
              <SideTabItem
                key={tab.id}
                tabId={tab.id}
                isActive={currentTabId === tab.id}
                isExpanded={expandedTabId === tab.id}
                activeSubTabId={openTab?.activeSubTabId}
                onClick={() => handleSideTabClick(tab.id)}
                onSubTabClick={(subTabId) => handleSideSubTabClick(tab.id, subTabId)}
              />
            )
          })}
        </nav>

        {/* Admin info */}
        <div className="px-4 py-3 border-t border-sidetab-hover-click-color">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-600 text-white">
              {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{adminData.admin_username || "Admin"}</p>
              <p className="text-side-panel-text-color text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Right column ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Collapsible top bar */}
        <div
          className="overflow-hidden shrink-0 transition-[max-height] duration-[250ms] ease-in-out will-change-[max-height]"
          style={{ maxHeight: topVisible ? "200px" : "0px" }}
        >
          {/* Welcome bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Welcome back,{" "}
                <span className="text-blue-600">{adminData.admin_username || "Admin"}</span>
              </p>
              <p className="text-xs text-slate-500">Here&apos;s what&apos;s happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 border border-slate-200 text-slate-500">
                🔔
              </button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
                {adminData.admin_username?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-green-400" />
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
                <h2 className="font-semibold text-sm text-slate-900">{currentTabConfig.label}</h2>
              </div>
              <p className="text-xs text-slate-500">
                Manage and configure all {currentTabConfig.label.toLowerCase()} data
              </p>
            </div>
          )}
        </div>

        {/* Chrome tab bar — always visible */}
        {currentTab && currentTabConfig && (
          <div className="shrink-0 bg-white shadow-sm">
            <ChromeTabBar
              tabId={currentTab.tabId}
              activeSubTabId={currentTab.activeSubTabId}
              onSelectSubTab={handleSubTabSelect}
            />
          </div>
        )}

        {/* Scrollable content */}
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