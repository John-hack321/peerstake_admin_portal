'use client'

import AllMatchesTab from "./tabs/allMatchesTab"
import { LiveTab, LoggingTab, AddNewMatchTab, ComingSoonTab } from "./tabs/placeHolderTabs"


interface ContentRouterProps {
  tabId: string
  subTabId: string
}

export default function ContentRouter({ tabId, subTabId }: ContentRouterProps) {
  // ── Fixtures ──────────────────────────────────────────────────────────────
  if (tabId === "fixtures") {
    if (subTabId === "all-matches") return <AllMatchesTab />
    if (subTabId === "live") return <LiveTab />
    if (subTabId === "logging") return <LoggingTab />
    if (subTabId === "add-new") return <AddNewMatchTab />
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  if (tabId === "users") {
    return <ComingSoonTab label={`Users → ${subTabId}`} />
  }

  // ── Leagues ───────────────────────────────────────────────────────────────
  if (tabId === "leagues") {
    return <ComingSoonTab label={`Leagues → ${subTabId}`} />
  }

  // ── Sponsors ──────────────────────────────────────────────────────────────
  if (tabId === "sponsors") {
    return <ComingSoonTab label={`Sponsors → ${subTabId}`} />
  }

  // ── Stakers ───────────────────────────────────────────────────────────────
  if (tabId === "stakers") {
    return <ComingSoonTab label={`Stakers → ${subTabId}`} />
  }

  // ── Analytics ─────────────────────────────────────────────────────────────
  if (tabId === "analytics") {
    return <ComingSoonTab label={`Analytics → ${subTabId}`} />
  }

  return <ComingSoonTab label={`${tabId} → ${subTabId}`} />
}