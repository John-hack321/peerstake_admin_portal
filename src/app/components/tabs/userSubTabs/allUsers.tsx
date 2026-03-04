'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/app/appState/store"
import { updateAllUsersData, setUserDataLoadingState } from "@/app/appState/slices/usersData"
import { fetchAllUsersData } from "@/app/api/users"
import { UserData } from "@/app/schemas/userSchemas"
import { truncateTeamName } from "@/app/config/uitlity_functions"

// ─── Types ────────────────────────────────────────────────────────────────────

// just bare with the snake case I'm a fullstack dev I alway end up intermixing snake and camel cases
interface UserStakeData {
  stake_id: number; // stake id
  role: "owner" | "guest";
  userId: number;
  invited_user_id: number;
  amount: number;
  invited_user_amount: number;
  match_id: number;
  home: string;
  away: string;
  stakeType: boolean;
  winner: "owner" | "guest"
  inviteCode: string;
  possibleWin: string
  stakeStatus: "progressing" | "pending" | "successful"
}

interface Stake {
  stake_id: number
  match: string
  amount: number
  odds: number
  status: "pending" | "won" | "lost" | "live"
}

interface DrawerState {
  userId: number
  mode: "all" | "live"
}

// TODO: replace with real API call
async function fetchStakesForUser(userId: number, live: boolean) {
  await new Promise((r) => setTimeout(r, 600))
  return [
    { stake_id: 1, match: "Arsenal vs Chelsea",       amount: 500,  odds: 2.3,  status: live ? "live" : "pending" },
    { stake_id: 2, match: "Man City vs Liverpool",    amount: 1200, odds: 1.85, status: live ? "live" : "won"     },
    { stake_id: 3, match: "Real Madrid vs Barcelona", amount: 300,  odds: 3.1,  status: "lost"                    },
  ].filter((s) => (live ? s.status === "live" : true))
}

// ─── Stake Status badge ─────────────────────────────────────────────────────────────

const STAKE_STATUS_STYLES: Record<UserStakeData["stakeStatus"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  successful:     "bg-green-100 text-green-800",
  progressing:    "bg-blue-100 text-blue-800",
}

const STAKE_STATUS_LABELS: Record<UserStakeData["stakeStatus"], string> = {
  pending: "Pending",
  successful: "successful ✓",
  progressing: "● progressing",
}

// lost: "Lost ✕",  lost:    "bg-red-100 text-red-800", : we will use this for the verdict type


function StakeStatusBadge({ stakeStatus }: { stakeStatus: UserStakeData["stakeStatus"] }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STAKE_STATUS_STYLES[stakeStatus]}`}>
      {STAKE_STATUS_LABELS[stakeStatus]}
    </span>
  )
}

function StakeRow ({
  stake_id,
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
}: UserStakeData) {
  return (
    <div
      className="flex items-center px-6 py-3 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors"
    >
      <span className="w-14 shrink-0 font-mono text-[11px] text-slate-400">#{stake_id}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{role === "owner" ? "owner" : 'guest' }</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
        <StakeStatusBadge stakeStatus={stakeStatus} />
      </span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{role === "owner" ? `${invited_user_id}` : `${userId}`}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
        {role === "owner" ? `${amount.toLocaleString()}` : `${invited_user_amount.toLocaleString()}`}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
        {role === "owner" ? `${invited_user_amount.toLocaleString()}` : `${amount.toLocaleString()}`}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{match_id}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{truncateTeamName(home)}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{truncateTeamName(away)}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{stakeType}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{winner}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{inviteCode}</span>
      <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">{possibleWin}</span>
      <div className="w-24 flex justify-end shrink-0">
      </div>
    </div>
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
    setLoading(true)
    setStakes([])
    fetchStakesForUser(userId, mode === "live").then((d) => {
      if (alive) { setStakes(d); setLoading(false) }
    })
    return () => { alive = false }
  }, [userId, mode])

  return (
    <div className="bg-slate-50 border-b border-slate-200 animate-[slideDown_0.15s_ease-out]">
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      {/* Panel sub-header */}
      <div className={`flex items-center justify-between px-6 py-2 border-l border-r border-t border-slate-200 ${mode === "live" ? "bg-blue-50" : "bg-slate-100"}`}>
        <div className="flex items-center gap-2">
          {mode === "live" && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" style={{ animation: "blink 1.2s infinite" }} />
          )}
          <span className="text-xs font-semibold text-slate-500">
            {mode === "live" ? "Live stakes" : "All stakes"} —{" "}
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
        <div> {/* im not sure about this part yet : I dont know why ai added this here */}
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
          {mode === "live" ? "📡" : "📋"} No {mode === "live" ? "live " : ""}stakes found.
        </div>
      ) : (
        <div>
          {/* Column headers */}
          <div className="flex items-center border-b border-r border-l px-6 py-2 bg-slate-100  border-slate-200">
            <span className="w-14 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">#ID</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</span>
            <span className="w-24  text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Status</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner/Guest Id</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner/Guest Amount</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Id</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">HomeTeam</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">AwayTeam</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">StakeType</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verdict</span>
            <span className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Invite code</span>
            <span className="w-36 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Possible win (KES)</span>
          </div>

          {/* Stake rows */}
          {stakes.map((s) => (
            <div
              key={s.stake_id}
              className="flex items-center px-6 py-3 border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="w-14 shrink-0 font-mono text-[11px] text-slate-400">#{s.stake_id}</span>
              <span className="flex-1 text-[13px] font-medium text-slate-800 pr-4 overflow-hidden text-ellipsis whitespace-nowrap">{s.match}</span>
              <span className="w-36 text-right text-[13px] font-semibold text-slate-900 shrink-0">{s.amount.toLocaleString()}</span>
              <span className="w-[70px] text-right text-xs text-slate-500 shrink-0">{s.odds}x</span>
              <div className="w-24 flex justify-end shrink-0">
                <StakeStatusBadge status={s.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
        className={`flex items-center px-6 h-[58px] border-b bg-white my-2 border-slate-200 transition-colors ${isOpen ? "bg-blue-50" : "bg-white hover:bg-slate-50"}`}
      >
        {/* Avatar */}
        <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm shrink-0">
          {user.username[0].toUpperCase()}
        </div>

        {/* Username + ID */}
        <div className="flex-1 min-w-0 pl-3 pr-5">
          <div className="text-sm font-semibold text-slate-900 truncate">{user.username}</div>
          <div className="text-[11px] text-slate-400 font-mono">#{user.id}</div>
        </div>

        {/* Phone */}
        <div className="w-[155px] min-w-[155px] text-xs text-slate-500 pr-5 truncate shrink-0">
          {user.phone_number}
        </div>

        {/* Balance */}
        <div className="w-[150px] min-w-[150px] text-right pr-7 text-[13px] font-bold text-slate-900 shrink-0">
          KES {user.account_balance.toLocaleString()}
        </div>

        {/* All stakes button */}
        <div className="w-[88px] min-w-[88px] flex justify-center shrink-0">
          <button
            onClick={() => onStakesClick(user.id, "all")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer
              ${allActive
                ? "bg-blue-100 border border-blue-300 text-blue-700"
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
              }`}
          >
            {user.no_of_stakes}
            <span className="text-[10px] font-normal opacity-55">all</span>
          </button>
        </div>

        {/* Live stakes button */}
        <div className="w-[88px] min-w-[88px] flex justify-center shrink-0">
          <button
            onClick={() => onStakesClick(user.id, "live")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer
              ${liveActive
                ? "bg-blue-100 border border-blue-300 text-blue-700"
                : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-blue-200 hover:text-blue-600"
              }`}
          >
            {user.no_of_pending_stakes > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" style={{ animation: "blink 1.2s infinite" }} />
            )}
            {user.no_of_pending_stakes}
            <span className="text-[10px] font-normal opacity-55">live</span>
          </button>
        </div>

        {/* Delete button */}
        <div className="w-[72px] min-w-[72px] flex justify-end shrink-0">
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center px-6 h-[58px] border-b border-slate-200 gap-0 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 pl-3 pr-5">
        <div className="w-[120px] h-3 rounded bg-slate-100 mb-1.5" />
        <div className="w-11 h-2.5 rounded bg-slate-100" />
      </div>
      <div className="w-[155px] h-2.5 rounded bg-slate-100 mr-5 shrink-0" />
      <div className="w-[110px] h-3 rounded bg-slate-100 mr-7 ml-auto shrink-0" />
      <div className="w-[60px] h-7 rounded-full bg-slate-100 mr-7 shrink-0" />
      <div className="w-[60px] h-7 rounded-full bg-slate-100 mr-3 shrink-0" />
      <div className="w-[58px] h-7 rounded bg-slate-100 shrink-0" />
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

  const toggle = (userId: number, mode: "all" | "live") =>
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

      {/* ── Table ── */}
      <div className="mx-5 my-4  border-slate-200 rounded-xl overflow-hidden bg-main-page-bg-color">

        {/* Column headers */}
        <div className="flex items-center px-6 h-10 bg-slate-50 border  border-slate-200">
          <div className="w-9 shrink-0" />
          <span className="flex-1 pl-3 pr-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">User</span>
          <span className="w-[155px] pr-5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Phone</span>
          <span className="w-[150px] text-right pr-7 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Balance</span>
          <span className="w-[88px] text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Stakes</span>
          <span className="w-[88px] text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Live</span>
          <span className="w-[72px] text-right text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Action</span>
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