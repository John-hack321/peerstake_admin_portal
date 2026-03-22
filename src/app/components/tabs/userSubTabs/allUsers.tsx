'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateAllUsersData, setUserDataLoadingState } from "@/app/appState/slices/usersData"
import { fetchAllUsersData } from "@/app/api/users"
import { UserData } from "@/app/schemas/userSchemas"
import { truncateTeamName } from "@/app/config/uitlity_functions"
import { adminGetAllUserStakes } from "@/app/api/stakes"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserStakeData {
  stakeId: number;
  role: "owner" | "guest";
  userId: number;
  invited_user_id: number | null;
  amount: number | null;
  invited_user_amount: number | null;
  match_id: number | null;
  home: string;
  away: string;
  stakeType: boolean | null;
  winner: "pending" | "won" | "lost";
  inviteCode: string | null;
  possibleWin: number | null;
  stakeStatus: "all" | "progressing" | "pending" | "successful";
  placement: string | null;
}

interface DrawerState {
  userId: number
  mode: "all" | "progressing" | "pending" | "successful"
}

// ─── Stake Status badge ──────────────────────────────────────────────────────

const STAKE_STATUS_STYLES: Record<UserStakeData["stakeStatus"], string> = {
  all: "",
  pending: "bg-yellow-100 text-yellow-800",
  successful: "bg-green-100 text-green-800",
  progressing: "bg-blue-100 text-blue-800",
}

const STAKE_STATUS_LABELS: Record<UserStakeData["stakeStatus"], string> = {
  all: "",
  pending: "Pending",
  successful: "successful ✓",
  progressing: "● progressing",
}

function StakeStatusBadge({ stakeStatus }: { stakeStatus: UserStakeData["stakeStatus"] }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STAKE_STATUS_STYLES[stakeStatus]}`}>
      {STAKE_STATUS_LABELS[stakeStatus]}
    </span>
  )
}

// ─── Stake Row ────────────────────────────────────────────────────────────────

function StakeRow({
  stakeId,
  role,
  userId,
  invited_user_id,
  amount,
  invited_user_amount,
  match_id,
  home,
  away,
  stakeType,
  winner,
  inviteCode,
  possibleWin,
  stakeStatus,
  placement,
}: UserStakeData) {
  return (
    <div className="flex items-center px-6 py-3 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      {/* #ID */}
      <span className="w-14 shrink-0 font-mono text-[11px] text-slate-400">#{stakeId}</span>
      {/* Role */}
      <span className="w-16 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        {role === "owner" ? "owner" : "guest"}
      </span>
      {/* Status */}
      <span className="w-28 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        <StakeStatusBadge stakeStatus={stakeStatus} />
      </span>
      {/* Owner/Guest Id */}
      <span className="w-24 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        {role === "owner" ? `${invited_user_id ?? "null"}` : `${userId}`}
      </span>
      {/* Amount (my amount) */}
      <span className="w-24 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        {role === "owner"
          ? amount === null ? "null" : amount.toLocaleString()
          : invited_user_amount === null ? "null" : invited_user_amount.toLocaleString()}
      </span>
      {/* Opponent amount */}
      <span className="w-28 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        {role === "owner"
          ? invited_user_amount === null ? "null" : invited_user_amount.toLocaleString()
          : amount === null ? "null" : amount.toLocaleString()}
      </span>
      {/* Match Id */}
      <span className="w-20 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{match_id}</span>
      {/* Placement */}
      <span className="w-20 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{placement}</span>
      {/* Home */}
      <span className="w-24 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{truncateTeamName(home)}</span>
      {/* Away */}
      <span className="w-24 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{truncateTeamName(away)}</span>
      {/* StakeType */}
      <span className="w-20 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">
        {stakeType === null ? "null" : stakeType ? "true" : "false"}
      </span>
      {/* Verdict */}
      <span className="w-20 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{winner}</span>
      {/* Invite code */}
      <span className="w-28 shrink-0 text-[10px] font-bold tracking-wider text-slate-800">{inviteCode ?? "—"}</span>
      {/* Possible win */}
      <span className="w-28 shrink-0 text-right text-[10px] font-bold tracking-wider text-slate-800">
        {possibleWin === null ? "null" : possibleWin.toLocaleString()}
      </span>
    </div>
  )
}

// ─── Stakes Panel ─────────────────────────────────────────────────────────────

function StakesPanel({
  userId, username, mode, onClose,
}: {
  userId: number
  username: string
  mode: "all" | "progressing" | "pending" | "successful"
  onClose: () => void
}) {
  const [stakesData, setStakesData] = useState<UserStakeData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserStakesData = async (user_id: number) => {
      setLoading(true)
      const data = await adminGetAllUserStakes(user_id)
      setStakesData(data.stakeData)
      setLoading(false)
      console.log('the stakes have been successfully sourced from the backend')
    }
    loadUserStakesData(userId)
  }, [userId])

  // ── fix: added return keyword so filtering actually works ──
  const stakes: UserStakeData[] = mode === "all"
    ? stakesData
    : stakesData.filter((f) => f.stakeStatus.toLowerCase() === mode)

  return (
    <div className="bg-slate-50 border-b border-slate-200 animate-[slideDown_0.15s_ease-out]">
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Panel sub-header */}
      <div className={`flex items-center justify-between px-6 py-2 border-l border-r border-t border-slate-200 ${mode === "progressing" ? "bg-blue-50" : "bg-slate-100"}`}>
        <div className="flex items-center gap-2">
          {mode === "progressing" && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" style={{ animation: "blink 1.2s infinite" }} />
          )}
          <span className="text-xs font-semibold text-slate-500">
            {mode === "progressing" ? "Progressing stakes" : mode === "all" ? "All stakes" : mode === "pending" ? "Pending stakes" : "Successful stakes"} —{" "}
            <span className="text-slate-800">{username}</span>
          </span>
          {!loading && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
              {stakes.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[11px] text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer px-2 py-1 rounded"
        >
          ✕ close
        </button>
      </div>

      {/* Stakes content */}
      {loading ? (
        <div>
          <div className="flex px-6 py-2 border-b border-slate-200 gap-4">
            {[50, 260, 120, 55, 80].map((w, i) => (
              <div key={i} style={{ width: w }} className="h-2.5 rounded bg-slate-200 shrink-0" />
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center px-6 py-3 border-b border-slate-200 gap-4">
              {[50, 260, 120, 55, 80].map((w, j) => (
                <div key={j} style={{ width: w }} className="h-3 rounded bg-slate-100 shrink-0" />
              ))}
            </div>
          ))}
        </div>
      ) : stakes.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          {mode === "progressing" ? "📡" : "📋"} No {mode === "all" ? "" : mode} stakes found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Column headers — widths mirror StakeRow exactly */}
          <div className="flex items-center border-b border-r border-l px-6 py-2 bg-slate-100 border-slate-200 min-w-max">
            <span className="w-14 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">#ID</span>
            <span className="w-16 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</span>
            <span className="w-28 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
            <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner/Guest Id</span>
            <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</span>
            <span className="w-28 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Opp. Amount</span>
            <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Id</span>
            <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Placement</span>
            <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Home</span>
            <span className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Away</span>
            <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">StakeType</span>
            <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verdict</span>
            <span className="w-28 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Invite Code</span>
            <span className="w-28 shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Possible Win (KES)</span>
          </div>

          {/* Stake rows */}
          <div className="min-w-max">
            {stakes.map((s) => (
              <StakeRow key={s.stakeId} {...s} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ user, activeDrawer, onStakesClick, onDeleteClick }: {
  user: UserData
  activeDrawer: DrawerState | null
  onStakesClick: (id: number, mode: "all" | "progressing" | "pending" | "successful") => void
  onDeleteClick: (id: number) => void
}) {
  const isOpen          = activeDrawer?.userId === user.id
  const allActive       = isOpen && activeDrawer?.mode === "all"
  const progressingActive = isOpen && activeDrawer?.mode === "progressing"
  const pendingActive   = isOpen && activeDrawer?.mode === "pending"
  const successActive   = isOpen && activeDrawer?.mode === "successful"

  const filterBtn = (
    label: string,
    mode: "all" | "progressing" | "pending" | "successful",
    isActive: boolean,
    count?: number,
    blink?: boolean,
  ) => (
    <button
      onClick={() => onStakesClick(user.id, mode)}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap
        ${isActive
          ? "bg-blue-100 border border-blue-300 text-blue-700 shadow-sm"
          : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
        }`}
    >
      {blink && count !== undefined && count > 0 && (
        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0" style={{ animation: "blink 1.2s infinite" }} />
      )}
      {count !== undefined && (
        <span className="font-bold text-[13px]">{count}</span>
      )}
      <span className="text-[11px] font-medium opacity-70">{label}</span>
    </button>
  )

  return (
    <>
      <div className={`flex items-center px-6 h-[62px] border-b border-slate-200 transition-colors ${isOpen ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}>
        {/* Avatar */}
        <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm shrink-0">
          {user.username[0].toUpperCase()}
        </div>

        {/* Username + ID — flex-[2] */}
        <div className="flex-[2] min-w-0 pl-3 pr-4">
          <div className="text-sm font-semibold text-slate-900 truncate">{user.username}</div>
          <div className="text-[11px] text-slate-400 font-mono">#{user.id}</div>
        </div>

        {/* Phone — flex-[1] */}
        <div className="flex-[1] min-w-0 text-xs text-slate-500 pr-4 truncate">
          {user.phone_number}
        </div>

        {/* Balance — flex-[1] */}
        <div className="flex-[1] min-w-0 text-right pr-6 text-[13px] font-bold text-slate-900">
          KES {user.account_balance.toLocaleString()}
        </div>

        {/* 4 filter buttons — flex-[3] */}
        <div className="flex-[3] min-w-0 flex items-center gap-2">
          {filterBtn("all",         "all",         allActive,         user.no_of_stakes)}
          {filterBtn("progressing", "progressing", progressingActive, user.no_of_pending_stakes, true)}
          {filterBtn("pending",     "pending",     pendingActive)}
          {filterBtn("successful",  "successful",  successActive)}
        </div>

        {/* Delete — w-[80px] fixed */}
        <div className="w-[80px] shrink-0 flex justify-end">
          <button
            onClick={() => onDeleteClick(user.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M5 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M9 3l-.5 9H5.5L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stakes panel inline below this row */}
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

// skeleton for skeleton loading

function SkeletonRow() {
  return (
    <div className="flex items-center px-6 h-[62px] border-b border-slate-200 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-[2] min-w-0 pl-3 pr-4">
        <div className="w-[120px] h-3 rounded bg-slate-100 mb-1.5" />
        <div className="w-11 h-2.5 rounded bg-slate-100" />
      </div>
      <div className="flex-[1] min-w-0 h-2.5 rounded bg-slate-100 pr-4" />
      <div className="flex-[1] min-w-0 h-3 rounded bg-slate-100 pr-6" />
      <div className="flex-[3] min-w-0 flex gap-2">
        {[1,2,3,4].map(i => <div key={i} className="w-[90px] h-7 rounded-full bg-slate-100 shrink-0" />)}
      </div>
      <div className="w-[80px] h-7 rounded bg-slate-100 shrink-0" />
    </div>
  )
}

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

  const toggle = (userId: number, mode: "all" | "progressing" | "pending" | "successful") =>
    setActiveDrawer(p => p?.userId === userId && p?.mode === mode ? null : { userId, mode })

  const filtered = (allUsersData.data || []).filter(u => {
    const q = search.toLowerCase()
    return u.username.toLowerCase().includes(q) || u.phone_number.toLowerCase().includes(q)
  })

  return (
    <div className="w-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 flex-1 max-w-xs">
          <span className="text-sm text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search by username or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 w-full"
          />
        </div>

        <span className="ml-auto text-xs text-slate-500">
          <b className="text-slate-900">{filtered.length}</b> users
        </span>

        <button
          onClick={async () => { const d = await fetchAllUsersData(); if (d) dispatch(updateAllUsersData(d)) }}
          className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer font-medium transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      <div className="mx-2 my-4 border-slate-200 rounded-xl overflow-hidden bg-main-page-bg-color">

        {/* Column headers */}
        <div className="flex items-center px-6 h-10 bg-slate-50 border mb-2 border-slate-200">
          <div className="w-9 shrink-0" />
          <span className="flex-2 min-w-0 pl-3 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">User</span>
          <span className="flex-1 min-w-0 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</span>
          <span className="flex-1 min-w-0 text-right pr-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance</span>
          <span className="flex-3 min-w-0 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Stakes Filter</span>
          <span className="w-[80px] shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Action</span>
        </div>

        {/* User strips */}
        {allUsersData.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <div className="text-4xl mb-3">👤</div>
            <div className="text-sm">{search ? "No users match your search." : "No users found."}</div>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-blue-500 hover:underline bg-transparent border-none cursor-pointer"
              >
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