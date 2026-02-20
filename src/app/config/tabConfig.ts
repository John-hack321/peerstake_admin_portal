// ─── Tab & SubTab Config ──────────────────────────────────────────────────────
// Single source of truth for all navigation tabs.
// Add a new tab here and it automatically appears in the sidebar.



export interface SubTabConfig {
    id: string
    label: string
  }
  
  export interface TabConfig {
    id: string
    label: string
    icon: string
    defaultSubTabId: string
    subTabs: SubTabConfig[]
  }
  
  export const TAB_CONFIG: TabConfig[] = [
    {
        id: "users",
        label: "Users",
        icon: "👤",
        defaultSubTabId: "all-users",
        subTabs: [
        { id: "all-users", label: "All Users" },
        { id: "active", label: "Active" },
        { id: "suspended", label: "Suspended" },
        { id: "add-new", label: "Add New" },
        ],
    },
    {
        id: "fixtures",
        label: "Matches",
        icon: "⚽",
        defaultSubTabId: "all-matches",
        subTabs: [
        { id: "all-matches", label: "All Matches" },
        { id: "live", label: "Live" },
        { id: "logging", label: "Logging" },
        { id: "add-new", label: "Add New" },
      ],
    },
    {
        id: "leagues",
        label: "Leagues",
        icon: "🏆",
        defaultSubTabId: "all-leagues",
        subTabs: [
        { id: "all-leagues", label: "All Leagues" },
        { id: "add-new", label: "Add New" },
      ],
    },
    {
        id: "sponsors",
        label: "Sponsors",
        icon: "💰",
        defaultSubTabId: "all-sponsors",
        subTabs: [
        { id: "all-sponsors", label: "All Sponsors" },
        { id: "add-new", label: "Add New" },
      ],
    },
    {
        id: "stakers",
        label: "Stakers",
        icon: "📊",
        defaultSubTabId: "all-stakers",
        subTabs: [
        { id: "all-stakers", label: "All Stakers" },
        { id: "add-new", label: "Add New" },
      ],
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: "📈",
        defaultSubTabId: "overview",
        subTabs: [
        { id: "overview", label: "Overview" },
        { id: "revenue", label: "Revenue" },
        { id: "activity", label: "Activity" },
      ],
    },
  ]
  

  /**
   * 
   * @param tabId 
   * @returns 
   * 
   * searches for a tab from the tab config array and returns the tab details
   * 
   */
  export const getTabConfig = (tabId: string): TabConfig | undefined =>
    TAB_CONFIG.find((t) => t.id === tabId)