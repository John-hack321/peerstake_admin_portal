'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/appState/store';
import {
    AllLeaguesApiResponse,
    League,
    setLeaguesLoadingState,
    updateAllLeaguesData,
    updateCurrentLeague,
} from '@/app/appState/slices/leaguesData';
import { setActiveSubTab } from '@/app/appState/slices/tabsData';
import { getLeaguesList } from '@/app/api/leagues';
import { ApiError } from '@/app/api/api_utils';
 
// ─── Toast ────────────────────────────────────────────────────────────────────
 
interface Toast { id: number; message: string; type: 'success' | 'error' }
 
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
            {toasts.map(t => (
                <div
                    key={t.id}
                    onClick={() => onDismiss(t.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium cursor-pointer
                        ${t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                >
                    <span>{t.type === 'success' ? '✓' : '✕'}</span>
                    <span>{t.message}</span>
                </div>
            ))}
        </div>
    );
}
 
// ─── Skeleton Row ─────────────────────────────────────────────────────────────
 
function SkeletonRow() {
    return (
        <div className="flex items-center px-6 py-4 border-b border-slate-100 animate-pulse gap-4">
            {/* logo placeholder */}
            <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
            {/* name + id */}
            <div className="flex-[2] min-w-0 flex flex-col gap-1.5">
                <div className="h-3.5 w-32 rounded bg-slate-100" />
                <div className="h-2.5 w-16 rounded bg-slate-100" />
            </div>
            {/* localized name */}
            <div className="flex-[2] min-w-0 h-3 w-28 rounded bg-slate-100" />
            {/* badge */}
            <div className="flex-[1] min-w-0">
                <div className="h-6 w-20 rounded-full bg-slate-100" />
            </div>
            {/* actions */}
            <div className="flex gap-2 shrink-0">
                <div className="h-8 w-28 rounded-lg bg-slate-100" />
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
            </div>
        </div>
    );
}
 
// ─── League Logo / Avatar ─────────────────────────────────────────────────────
 
function LeagueLogo({ name, logoUrl }: { name: string; logoUrl?: string }) {
    const [imgErr, setImgErr] = useState(false);
 
    if (logoUrl && !imgErr) {
        return (
            <img
                src={logoUrl}
                alt={name}
                onError={() => setImgErr(true)}
                className="w-10 h-10 rounded-full object-contain border border-slate-100 bg-white p-0.5 shrink-0"
            />
        );
    }
 
    // Fallback avatar
    return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shrink-0 shadow-sm">
            {name.slice(0, 2).toUpperCase()}
        </div>
    );
}
 
// ─── League Row ───────────────────────────────────────────────────────────────
 
interface LeagueRowProps {
    league: League;
    onManageClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
}
 
function LeagueRow({ league, onManageClick, onDeleteClick }: LeagueRowProps) {
    return (
        <div className="flex items-center px-6 py-3.5 border-b border-slate-100 bg-white hover:bg-slate-50 transition-colors group">
 
            {/* Logo */}
            <LeagueLogo name={league.name || league.localized_name} logoUrl={league.logo_url} />
 
            {/* Name + ID — flex-[2] */}
            <div className="flex-[2] min-w-0 pl-4 pr-6">
                <div className="text-sm font-semibold text-slate-900 truncate">
                    {league.name || league.localized_name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">#{league.local_id}</div>
            </div>
 
            {/* Localized name — flex-[2] */}
            <div className="flex-[2] min-w-0 pr-6">
                <span className="text-xs text-slate-500 truncate block">{league.localized_name}</span>
            </div>
 
            {/* Fixtures badge — flex-[1] */}
            <div className="flex-[1] min-w-0 pr-4">
                {league.fixture_added ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Fixtures loaded
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        No fixtures
                    </span>
                )}
            </div>
 
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={() => onManageClick(league.local_id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow"
                >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add Fixtures
                </button>
 
                <button
                    onClick={() => onDeleteClick(league.local_id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3h12M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M9 3l-.5 9H5.5L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    );
}
 
// ─── Stats Bar ────────────────────────────────────────────────────────────────
 
function StatsBar({ leagues }: { leagues: League[] }) {
    const total = leagues.length;
    const withFixtures = leagues.filter(l => l.fixture_added).length;
    const without = total - withFixtures;
 
    const stats = [
        { label: 'Total Leagues', value: total, color: 'text-slate-800' },
        { label: 'With Fixtures', value: withFixtures, color: 'text-green-700' },
        { label: 'Awaiting Fixtures', value: without, color: 'text-amber-600' },
    ];
 
    return (
        <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-200 bg-white">
            {stats.map(s => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
                    <span className="text-xs text-slate-400">{s.label}</span>
                </div>
            ))}
        </div>
    );
}
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
export default function AllLeaguesTab() {
    const dispatch = useDispatch<AppDispatch>();
    const leaguesData = useSelector((state: RootState) => state.allLeaguesData);
 
    const [search, setSearch] = useState('');
    const [filterFixtures, setFilterFixtures] = useState<'all' | 'loaded' | 'missing'>('all');
    const [toasts, setToasts] = useState<Toast[]>([]);
 
    const showToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };
 
    const loadLeagues = async () => {
        dispatch(setLeaguesLoadingState());
        try {
            const data: AllLeaguesApiResponse = await getLeaguesList();
            dispatch(updateAllLeaguesData(data));
        } catch (error) {
            if (error instanceof ApiError) {
                showToast(error.message, 'error');
                if (error.statusCode === 401) {
                    setTimeout(() => { window.location.href = '/login'; }, 2000);
                }
            } else {
                showToast('An unexpected error occurred.', 'error');
            }
        } finally {
            dispatch(setLeaguesLoadingState());
        }
    };
 
    useEffect(() => { loadLeagues(); }, []);
 
    const filtered: League[] = (leaguesData.data || []).filter(league => {
        const q = search.toLowerCase();
        const nameMatch =
            (league.name || '').toLowerCase().includes(q) ||
            (league.localized_name || '').toLowerCase().includes(q);
 
        const fixtureMatch =
            filterFixtures === 'all' ||
            (filterFixtures === 'loaded' && league.fixture_added) ||
            (filterFixtures === 'missing' && !league.fixture_added);
 
        return nameMatch && fixtureMatch;
    });
 
    const handleManage = (id: number) => {
        dispatch(updateCurrentLeague({ leagueId: id }));
        dispatch(setActiveSubTab({ tabId: 'leagues', subTabId: 'league-management' }));
    };
 
    const handleDelete = (id: number) => {
        // TODO: wire up delete API
        showToast(`Delete for league #${id} not yet implemented.`, 'error');
    };
 
    return (
        <div className="w-full">
            <ToastContainer toasts={toasts} onDismiss={id => setToasts(p => p.filter(t => t.id !== id))} />
 
            {/* ── Stats bar ── */}
            {!leaguesData.isLoading && leaguesData.data.length > 0 && (
                <StatsBar leagues={leaguesData.data} />
            )}
 
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 flex-1 min-w-[180px] max-w-xs">
                    <span className="text-sm text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search leagues…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border-none outline-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 w-full"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 text-xs leading-none">✕</button>
                    )}
                </div>
 
                {/* Filter pills */}
                <div className="flex items-center gap-1.5">
                    {(['all', 'loaded', 'missing'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterFixtures(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                                ${filterFixtures === f
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'loaded' ? '✓ With fixtures' : '⚠ Missing fixtures'}
                        </button>
                    ))}
                </div>
 
                {/* Count */}
                <span className="ml-auto text-xs text-slate-500">
                    <b className="text-slate-900">{filtered.length}</b> {filtered.length === 1 ? 'league' : 'leagues'}
                </span>
 
                {/* Refresh */}
                <button
                    onClick={loadLeagues}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                    ↻ Refresh
                </button>
            </div>
 
            {/* ── Table ── */}
            <div className="mx-3 my-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                {/* Column headers */}
                <div className="flex items-center px-6 py-2.5 bg-slate-50 border-b border-slate-200">
                    <div className="w-10 shrink-0" />
                    <span className="flex-[2] min-w-0 pl-4 pr-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">League</span>
                    <span className="flex-[2] min-w-0 pr-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Localized Name</span>
                    <span className="flex-[1] min-w-0 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixtures</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</span>
                </div>
 
                {/* Body */}
                {leaguesData.isLoading ? (
                    Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white text-slate-400">
                        <span className="text-4xl mb-3">🏆</span>
                        <p className="text-sm font-medium">
                            {search || filterFixtures !== 'all' ? 'No leagues match your filters.' : 'No leagues found.'}
                        </p>
                        {(search || filterFixtures !== 'all') && (
                            <button
                                onClick={() => { setSearch(''); setFilterFixtures('all'); }}
                                className="mt-2 text-xs text-blue-500 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    filtered.map(league => (
                        <LeagueRow
                            key={league.local_id}
                            league={league}
                            onManageClick={handleManage}
                            onDeleteClick={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
 