import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface OpenTab {
    tabId: string
    activeSubTabId: string
}

export interface TabsState {
    openTabs: OpenTab[]
    currentTabId: string | null
}

const initialState: TabsState = {
    openTabs: [],
    currentTabId: null,
}

// I have a feeling that using a list for storing our tab data is a bad idea but for now we will just have to use for the lack of a better way right ? 
// also I blieve the data that will be being stored there isnt hta big so it wont be an issue right ? 

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