'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateAllUsersData, setUserDataLoadingState } from "@/app/appState/slices/usersData"
import { fetchAllUsersData } from "@/app/api/users"
import { UserData } from "@/app/schemas/userSchemas"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stake {
  stake_id: number
  match: string
  amount: number
  odds: number1,200

  status: "pending" | "won" | "lost" | "live"
}

interface DrawerState {
  userId: number
  mode: "all" | "live"
}

// TODO: replace with real API call
async function fetchStakesForUser(userId: number, live: boolean): Promise<Stake[]> {
  await new Promise((r) => setTimeout(r, 600))
  return [
    { stake_id: 1, match: "Arsenal vs Chelsea",       amount: 500,  odds: 2.3,  status: live ? "live" : "pending" },
    { stake_id: 2, match: "Man City vs Liverpool",    amount: 1200, odds: 1.85, status: live ? "live" : "won"     },
    { stake_id: 3, match: "Real Madrid vs Barcelona", amount: 300,  odds: 3.1,  status: "lost"                    },
  ].filter((s) => (live ? s.status === "live" : true))
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS: Record<Stake["status"], { bg: string; color: string; label: string }> = {
  pending: { bg: "#fef9c3", color: "#92400e", label: "Pending" },
  won:     { bg: "#dcfce7", color: "#166534", label: "Won ✓"   },
  lost:    { bg: "#fee2e2", color: "#991b1b", label: "Lost ✕"  },
  live:    { bg: "#dbeafe", color: "#1e40af", label: "● Live"  },
}

function StatusBadge({ status }: { status: Stake["status"] }) {
  const s = STATUS[status]
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
      {s.label}
    </span>
  )
}

// ─── Stakes panel ─────────────────────────────────────────────────────────────

function StakesPanel({
  userId, username, mode, onClose,
}: { userId: number; username: string; mode: "all" | "live"; onClose: () => void }) {
  const [stakes, setStakes] = useState<Stake[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true); setStakes([])
    fetchStakesForUser(userId, mode === "live").then((d) => {
      if (alive) { setStakes(d); setLoading(false) }
    })
    return () => { alive = false }
  }, [userId, mode])

  return (
    <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", animation: "slideDown 0.15s ease-out" }}>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Panel sub-header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 24px", borderBottom: "1px solid #e2e8f0", background: mode === "live" ? "#eff6ff" : "#f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {mode === "live" && (
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", display: "inline-block", animation: "blink 1.2s infinite" }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
            {mode === "live" ? "Live stakes" : "All stakes"} — <span style={{ color: "#1e293b" }}>{username}</span>
          </span>
          {!loading && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: "#e2e8f0", color: "#64748b" }}>
              {stakes.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
        >
          ✕ close
        </button>
      </div>

      {/* Stakes content */}
      {loading ? (
        <div>
          <div style={{ display: "flex", padding: "9px 24px", borderBottom: "1px solid #e2e8f0", gap: 16 }}>
            {[50, 260, 120, 55, 80].map((w, i) => (
              <div key={i} style={{ width: w, height: 10, borderRadius: 4, background: "#e2e8f0", flexShrink: 0 }} />
            ))}
          </div>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 24px", borderBottom: "1px solid #e2e8f0", gap: 16 }}>
              {[50, 260, 120, 55, 80].map((w, j) => (
                <div key={j} style={{ width: w, height: 11, borderRadius: 4, background: "#f1f5f9", flexShrink: 0 }} />
              ))}
            </div>
          ))}
        </div>
      ) : stakes.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          {mode === "live" ? "📡" : "📋"} No {mode === "live" ? "live " : ""}stakes found.
        </div>
      ) : (
        <div>
          {/* Stakes column headers */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 24px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ width: 54, ...sh }}>  #ID</span>
            <span style={{ flex: 1, ...sh }}>Match</span>
            <span style={{ width: 140, textAlign: "right", ...sh }}>Amount (KES)</span>
            <span style={{ width: 70,  textAlign: "right", ...sh }}>Odds</span>
            <span style={{ width: 100, textAlign: "right", ...sh }}>Status</span>
          </div>
          {/* Stake strips */}
          {stakes.map((s) => (
            <div
              key={s.stake_id}
              style={{ display: "flex", alignItems: "center", padding: "12px 24px", borderBottom: "1px solid #e2e8f0", background: "white", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              <span style={{ width: 54, fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>#{s.stake_id}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1e293b", paddingRight: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.match}</span>
              <span style={{ width: 140, textAlign: "right", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{s.amount.toLocaleString()}</span>
              <span style={{ width: 70,  textAlign: "right", fontSize: 12, color: "#64748b" }}>{s.odds}x</span>
              <div style={{ width: 100, display: "flex", justifyContent: "flex-end" }}>
                <StatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// shared header style
const sh: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", flexShrink: 0 }

// ─── User row ─────────────────────────────────────────────────────────────────

function UserRow({ user, activeDrawer, onStakesClick, onDeleteClick }: {
  user: UserData
  activeDrawer: DrawerState | null
  onStakesClick: (id: number, mode: "all" | "live") => void
  onDeleteClick: (id: number) => void
}) {
  const isOpen     = activeDrawer?.userId === user.id
  const allActive  = isOpen && activeDrawer?.mode === "all"
  const liveActive = isOpen && activeDrawer?.mode === "live"

  return (
    <>
      <div
      className=""
        style={{
          display: "flex", alignItems: "center",
          padding: "0 24px", height: 58,
          borderBottom: "1px solid #e2e8f0",
          background: isOpen ? "#f0f7ff" : "white",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "#f8fafc" }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = isOpen ? "#f0f7ff" : "white" }}
      >
        {/* Avatar */}
        <div 
        className="w-[36px] h-[36px] min-w-[36px] bg-[#dbeafe] text-[#1d4ed8] flex "
        style={{ width: 36, height: 36, minWidth: 36, borderRadius: "50%", background: "#dbeafe", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
          {user.username[0].toUpperCase()}
        </div>

        {/* Username + ID */}
        <div style={{ flex: 1, minWidth: 0, paddingLeft: 12, paddingRight: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.username}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>#{user.id}</div>
        </div>

        {/* Phone */}
        <div style={{ width: 155, minWidth: 155, fontSize: 12, color: "#64748b", paddingRight: 20, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}>
          {user.phone_number}
        </div>

        {/* Balance */}
        <div style={{ width: 150, minWidth: 150, textAlign: "right", paddingRight: 28, fontSize: 13, fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
          KES {user.account_balance.toLocaleString()}
        </div>

        {/* All stakes */}
        <div style={{ width: 88, minWidth: 88, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <button
            onClick={() => onStakesClick(user.id, "all")}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 13px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
              border: allActive ? "1.5px solid #93c5fd" : "1.5px solid #e2e8f0",
              background: allActive ? "#dbeafe" : "#f8fafc",
              color: allActive ? "#1d4ed8" : "#475569",
              fontSize: 12, fontWeight: 700,
            }}
          >
            {user.no_of_stakes}
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.55 }}>all</span>
          </button>
        </div>

        {/* Live stakes */}
        <div style={{ width: 88, minWidth: 88, display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <button
            onClick={() => onStakesClick(user.id, "live")}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 13px", borderRadius: 20, cursor: "pointer", transition: "all 0.15s",
              border: liveActive ? "1.5px solid #93c5fd" : "1.5px solid #e2e8f0",
              background: liveActive ? "#dbeafe" : "#f8fafc",
              color: liveActive ? "#1d4ed8" : "#475569",
              fontSize: 12, fontWeight: 700,
            }}
          >
            {user.no_of_pending_stakes > 0 && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block", animation: "blink 1.2s infinite" }} />
            )}
            {user.no_of_pending_stakes}
            <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.55 }}>live</span>
          </button>
        </div>

        {/* Delete */}
        <div style={{ width: 72, minWidth: 72, display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button
            onClick={() => onDeleteClick(user.id)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 8, border: "none", background: "none", color: "#fca5a5", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "#fff1f2"; b.style.color = "#ef4444" }}
            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "none"; b.style.color = "#fca5a5" }}
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M5 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M9 3l-.5 9H5.5L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stakes panel — drops in directly below this row */}
      {isOpen && (
        <StakesPanel
          userId={user.id}
          username={user.username}
          mode={activeDrawer!.mode}
          onClose={() => onStakesClick(user.id, activeDrawer!.mode)}
        />
      )}
    </>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 24px", height: 58, borderBottom: "1px solid #e2e8f0", gap: 0 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", flexShrink: 0 }} />
      <div style={{ flex: 1, paddingLeft: 12, paddingRight: 20 }}>
        <div style={{ width: 120, height: 13, borderRadius: 4, background: "#f1f5f9", marginBottom: 6 }} />
        <div style={{ width: 44,  height: 9,  borderRadius: 4, background: "#f1f5f9" }} />
      </div>
      <div style={{ width: 155, height: 11, borderRadius: 4, background: "#f1f5f9", marginRight: 20, flexShrink: 0 }} />
      <div style={{ width: 110, height: 12, borderRadius: 4, background: "#f1f5f9", marginRight: 28, marginLeft: "auto", flexShrink: 0 }} />
      <div style={{ width: 60, height: 28, borderRadius: 20, background: "#f1f5f9", marginRight: 28, flexShrink: 0 }} />
      <div style={{ width: 60, height: 28, borderRadius: 20, background: "#f1f5f9", marginRight: 12, flexShrink: 0 }} />
      <div style={{ width: 58, height: 28, borderRadius: 8,  background: "#f1f5f9", flexShrink: 0 }} />
    </div>
  )
}

// ─── Table header row style ───────────────────────────────────────────────────

const TH: React.CSSProperties = { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", flexShrink: 0 }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AllUsersSubTab() {
  const allUsersData = useSelector((state: RootState) => state.allUsersData)
  const dispatch = useDispatch<AppDispatch>()
  const [search, setSearch] = useState("")
  const [activeDrawer, setActiveDrawer] = useState<DrawerState | null>(null)

  useEffect(() => {
    const load = async () => {
      dispatch(setUserDataLoadingState())
      const data = await fetchAllUsersData()
      if (data) dispatch(updateAllUsersData(data))
    }
    load()
  }, [dispatch])

  const toggle = (userId: number, mode: "all" | "live") =>
    setActiveDrawer(p => p?.userId === userId && p?.mode === mode ? null : { userId, mode })

  const filtered = (allUsersData.data || []).filter(u => {
    const q = search.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.phone_number.toLowerCase().includes(q)
  })

  return (
    <div style={{ width: "100%" }}>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", flex: 1, maxWidth: 300 }}>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>🔍</span>
          <input
            type="text"
            placeholder="Search by username or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", background: "none", fontSize: 13, color: "#1e293b", width: "100%" }}
          />
        </div>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          <b style={{ color: "#0f172a" }}>{filtered.length}</b> users
        </span>
        <button
          onClick={async () => { const d = await fetchAllUsersData(); if (d) dispatch(updateAllUsersData(d)) }}
          style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", fontSize: 12, color: "#475569", cursor: "pointer", fontWeight: 500 }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ margin: "16px 20px", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "white" }}>

        {/* Column headers */}
        <div style={{ display: "flex", alignItems: "center", padding: "0 24px", height: 40, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ width: 36, flexShrink: 0 }} />
          <span style={{ flex: 1, paddingLeft: 12, paddingRight: 20, ...TH }}>User</span>
          <span style={{ width: 155, paddingRight: 20, ...TH }}>Phone</span>
          <span style={{ width: 150, textAlign: "right", paddingRight: 28, ...TH }}>Balance</span>
          <span style={{ width: 88, textAlign: "center", ...TH }}>Stakes</span>
          <span style={{ width: 88, textAlign: "center", ...TH }}>Live</span>
          <span style={{ width: 72, textAlign: "right", ...TH }}>Action</span>
        </div>

        {/* User strips */}
        {allUsersData.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ padding: "64px 0", textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <div style={{ fontSize: 14 }}>{search ? "No users match your search." : "No users found."}</div>
            {search && (
              <button onClick={() => setSearch("")} style={{ marginTop: 8, fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          filtered.map(user => (
            <UserRow
              key={user.id}
              user={user}
              activeDrawer={activeDrawer}
              onStakesClick={toggle}
              onDeleteClick={(id) => console.log("delete", id)}
            />
          ))
        )}
      </div>
    </div>
  )
}