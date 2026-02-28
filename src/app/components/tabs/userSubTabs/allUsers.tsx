'use client'

import { useState } from "react"

export default function AllUsersSubTab () {

    // for the search functionality
    const [search, setSearch] = useState<string>("")
    

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e2e8f0] bg-main-page-bg-color">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-xs bg-white border border-[#e2e8f0]">
                <span className="text-sm text-slate-400">🔍</span>
                <input
                    type="text"
                    placeholder="Search team or league…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent text-sm placeholder:text-slate-400 focus:outline-none w-full text-slate-700"
                />
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 font-medium">
                    users
                </span>
                </div>
            </div>
        </div>
    )
}