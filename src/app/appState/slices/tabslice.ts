import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpenTab {
  tabId: string
  activeSubTabId: string
}

export interface TabsState {
  openTabs: OpenTab[]
  currentTabId: string | null
}

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState: TabsState = {
  openTabs: [],
  currentTabId: null,
}

// ─── Slice ─────────────────────────────────────────────────────────────────────

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    openTab: (
      state,
      action: PayloadAction<{ tabId: string; defaultSubTabId: string }>
    ) => {
      const { tabId, defaultSubTabId } = action.payload
      const alreadyOpen = state.openTabs.find((t) => t.tabId === tabId)
      if (!alreadyOpen) {
        state.openTabs.push({ tabId, activeSubTabId: defaultSubTabId })
      }
      state.currentTabId = tabId
    },

    closeTab: (state, action: PayloadAction<{ tabId: string }>) => {
      const { tabId } = action.payload
      const index = state.openTabs.findIndex((t) => t.tabId === tabId)
      state.openTabs = state.openTabs.filter((t) => t.tabId !== tabId)
      if (state.currentTabId === tabId) {
        const next =
          state.openTabs[index - 1] ?? state.openTabs[index] ?? null
        state.currentTabId = next?.tabId ?? null
      }
    },

    setActiveSubTab: (
      state,
      action: PayloadAction<{ tabId: string; subTabId: string }>
    ) => {
      const { tabId, subTabId } = action.payload
      const tab = state.openTabs.find((t) => t.tabId === tabId)
      if (tab) {
        tab.activeSubTabId = subTabId
      }
    },

    switchToTab: (state, action: PayloadAction<{ tabId: string }>) => {
      state.currentTabId = action.payload.tabId
    },
  },
})

export default tabsSlice.reducer
export const { openTab, closeTab, setActiveSubTab, switchToTab } =
  tabsSlice.actions