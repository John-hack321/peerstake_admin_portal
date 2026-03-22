'use client'
import AllMatchesSubTab from "./fixtureSubTabs/allMatchesTab"
import LiveMatchLogging from "./fixtureSubTabs/liveMatchLogging"
import AllUsersSubTab from "./userSubTabs/allUsers"
import AllLeaguesTab from "./leagueSubTabs/allLeaguesTab"
import LeagueManagement from "./leagueSubTabs/leagueManagementTab"

interface ContentRouterProps {
    tabId: string
    subTabId: string
}

// we will keep on adding more tabs and sub tabs as we keep on building
export default function TabContentRouter ({
    tabId,
    subTabId}: ContentRouterProps) {
        if (tabId === "fixtures") {
            if (subTabId === "all-matches") return <AllMatchesSubTab/>
            if (subTabId === "live") return <LiveMatchLogging/>
        }
        if (tabId === "users") {
            if (subTabId === "all-users") return <AllUsersSubTab/>
        }
        if (tabId === "leagues") {
            if (subTabId === "all-leagues") return <AllLeaguesTab/>
            if (subTabId === "league-management") return <LeagueManagement/>
        }
    }