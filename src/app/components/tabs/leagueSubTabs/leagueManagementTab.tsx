'use client'
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/appState/store';
import { League, resetCurrentLeagueToNull } from '@/app/appState/slices/leaguesData';
import { setActiveSubTab } from '@/app/appState/slices/tabsData';
import { addFixturesToLeague, MatchPayload } from '@/app/api/leagues';
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
 
// ─── League Logo / Avatar ─────────────────────────────────────────────────────
 
function LeagueLogo({ name, logoUrl, size = 'md' }: { name: string; logoUrl?: string; size?: 'sm' | 'md' | 'lg' }) {
    const [imgErr, setImgErr] = useState(false);
    const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' };
    const cls = sizeMap[size];
 
    if (logoUrl && !imgErr) {
        return (
            <img
                src={logoUrl}
                alt={name}
                onError={() => setImgErr(true)}
                className={`${size === 'lg' ? 'w-16 h-16' : size === 'md' ? 'w-12 h-12' : 'w-8 h-8'} rounded-full object-contain border border-slate-100 bg-white p-1 shrink-0 shadow-sm`}
            />
        );
    }
 
    return (
        <div className={`${cls} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shrink-0 shadow-sm`}>
            {name.slice(0, 2).toUpperCase()}
        </div>
    );
}
 
// ─── Match Form ───────────────────────────────────────────────────────────────
 
interface MatchDraft {
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    matchTime: string;
}
 
const emptyDraft = (): MatchDraft => ({
    homeTeam: '',
    awayTeam: '',
    matchDate: '',
    matchTime: '15:00',
});
 
interface PendingMatch {
    id: string; // client-side uuid for list key
    homeTeam: string;
    awayTeam: string;
    matchDate: string; // ISO
    displayDate: string;
}
 
// ─── Pending Match Row ────────────────────────────────────────────────────────
 
function PendingMatchRow({ match, onRemove }: { match: PendingMatch; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm group">
            {/* Teams */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5 text-center min-w-[80px]">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold">
                        {match.homeTeam[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[80px]">{match.homeTeam}</span>
                    <span className="text-[10px] text-slate-400">Home</span>
                </div>
 
                <div className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tracking-wider">VS</div>
                    <span className="text-[10px] text-slate-400">{match.displayDate}</span>
                </div>
 
                <div className="flex flex-col items-center gap-0.5 text-center min-w-[80px]">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-extrabold">
                        {match.awayTeam[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[80px]">{match.awayTeam}</span>
                    <span className="text-[10px] text-slate-400">Away</span>
                </div>
            </div>
 
            {/* Remove */}
            <button
                onClick={onRemove}
                className="ml-2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                title="Remove match"
            >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <path d="M1 3h12M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M9 3l-.5 9H5.5L5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            </button>
        </div>
    );
}
 
// ─── Input wrapper ─────────────────────────────────────────────────────────────
 
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
export default function LeagueManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const leagueData = useSelector((state: RootState) => state.allLeaguesData);
 
    const currentLeague: League | undefined = leagueData.data.find(
        l => l.local_id === leagueData.currentLeague
    );
 
    const [draft, setDraft] = useState<MatchDraft>(emptyDraft());
    const [errors, setErrors] = useState<Partial<Record<keyof MatchDraft, string>>>({});
    const [pending, setPending] = useState<PendingMatch[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
 
    const showToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now();
        setToasts(p => [...p, { id, message, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };
 
    const handleExit = () => {
        dispatch(resetCurrentLeagueToNull());
        dispatch(setActiveSubTab({ tabId: 'leagues', subTabId: 'all-leagues' }));
    };
 
    const validate = (): boolean => {
        const e: Partial<Record<keyof MatchDraft, string>> = {};
        if (!draft.homeTeam.trim()) e.homeTeam = 'Home team is required';
        if (!draft.awayTeam.trim()) e.awayTeam = 'Away team is required';
        if (draft.homeTeam.trim().toLowerCase() === draft.awayTeam.trim().toLowerCase())
            e.awayTeam = 'Home and away teams must be different';
        if (!draft.matchDate) e.matchDate = 'Match date is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
 
    const handleAddToPending = () => {
        if (!validate()) return;
 
        const isoDateTime = `${draft.matchDate}T${draft.matchTime}:00`;
        const displayDate = new Date(isoDateTime).toLocaleString('en-GB', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
 
        const match: PendingMatch = {
            id: `${Date.now()}-${Math.random()}`,
            homeTeam: draft.homeTeam.trim(),
            awayTeam: draft.awayTeam.trim(),
            matchDate: isoDateTime,
            displayDate,
        };
 
        setPending(p => [...p, match]);
        setDraft(emptyDraft());
        setErrors({});
    };
 
    const handleRemovePending = (id: string) => {
        setPending(p => p.filter(m => m.id !== id));
    };
 
    const handleSubmitAll = async () => {
        if (!currentLeague || pending.length === 0) return;
 
        setIsSubmitting(true);
        try {
            const payload: MatchPayload[] = pending.map(m => ({
                home_team: m.homeTeam,
                away_team: m.awayTeam,
                match_date: m.matchDate,
            }));
 
            const result = await addFixturesToLeague(currentLeague.local_id, payload);
 
            if (result.status_code === '200') {
                showToast(`✓ ${pending.length} fixture${pending.length > 1 ? 's' : ''} added successfully!`, 'success');
                setPending([]);
            } else {
                showToast(result.message || 'Something went wrong.', 'error');
            }
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
            setIsSubmitting(false);
        }
    };
 
    // Guard — no league selected
    if (!currentLeague) {
        return (
            <div className="flex flex-col items-center justify-center h-72 gap-4 text-slate-400">
                <span className="text-5xl">🏆</span>
                <p className="text-sm">No league selected.</p>
                <button
                    onClick={handleExit}
                    className="text-xs text-blue-500 hover:underline"
                >
                    ← Back to leagues
                </button>
            </div>
        );
    }
 
    return (
        <div className="w-full">
            <ToastContainer toasts={toasts} onDismiss={id => setToasts(p => p.filter(t => t.id !== id))} />
 
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <LeagueLogo
                        name={currentLeague.name || currentLeague.localized_name}
                        logoUrl={currentLeague.logo_url}
                        size="md"
                    />
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {currentLeague.name || currentLeague.localized_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-mono">#{currentLeague.local_id}</span>
                            {currentLeague.fixture_added ? (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                    Fixtures loaded
                                </span>
                            ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    No fixtures yet
                                </span>
                            )}
                        </div>
                    </div>
                </div>
 
                <button
                    onClick={handleExit}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M7.5 1.5L3 6l4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Leagues
                </button>
            </div>
 
            {/* ── Main content: two-panel layout ── */}
            <div className="flex gap-5 p-5 min-h-0">
 
                {/* ── LEFT: Add fixture form ── */}
                <div className="w-[380px] shrink-0 flex flex-col gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Form header */}
                        <div className="px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span className="text-base">⚽</span>
                                Add a Fixture
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Fill in the details and queue to the batch below</p>
                        </div>
 
                        {/* Form body */}
                        <div className="p-5 flex flex-col gap-4">
                            <Field label="Home Team" error={errors.homeTeam}>
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${errors.homeTeam ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus-within:border-blue-400'}`}>
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-extrabold shrink-0">H</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. Arsenal FC"
                                        value={draft.homeTeam}
                                        onChange={e => setDraft(d => ({ ...d, homeTeam: e.target.value }))}
                                        className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-none"
                                    />
                                </div>
                            </Field>
 
                            <Field label="Away Team" error={errors.awayTeam}>
                                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors ${errors.awayTeam ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus-within:border-orange-400'}`}>
                                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-extrabold shrink-0">A</span>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chelsea FC"
                                        value={draft.awayTeam}
                                        onChange={e => setDraft(d => ({ ...d, awayTeam: e.target.value }))}
                                        className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent border-none outline-none"
                                    />
                                </div>
                            </Field>
 
                            <div className="flex gap-3">
                                <Field label="Date" error={errors.matchDate}>
                                    <input
                                        type="date"
                                        value={draft.matchDate}
                                        onChange={e => setDraft(d => ({ ...d, matchDate: e.target.value }))}
                                        className={`px-3 py-2.5 rounded-lg border text-sm text-slate-800 outline-none transition-colors
                                            ${errors.matchDate ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white focus:border-blue-400'}`}
                                    />
                                </Field>
 
                                <Field label="Kick-off time">
                                    <input
                                        type="time"
                                        value={draft.matchTime}
                                        onChange={e => setDraft(d => ({ ...d, matchTime: e.target.value }))}
                                        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-400 transition-colors"
                                    />
                                </Field>
                            </div>
 
                            {/* Preview */}
                            {draft.homeTeam && draft.awayTeam && (
                                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                                    <span className="font-semibold">{draft.homeTeam}</span>
                                    <span className="text-slate-400 font-bold">VS</span>
                                    <span className="font-semibold">{draft.awayTeam}</span>
                                </div>
                            )}
 
                            <button
                                onClick={handleAddToPending}
                                className="w-full py-2.5 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Add to Queue
                            </button>
                        </div>
                    </div>
                </div>
 
                {/* ── RIGHT: Pending queue + submit ── */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {/* Queue header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">
                                Fixture Queue
                                {pending.length > 0 && (
                                    <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                        {pending.length}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {pending.length === 0
                                    ? 'Add fixtures on the left to queue them here.'
                                    : `${pending.length} fixture${pending.length > 1 ? 's' : ''} ready to submit.`}
                            </p>
                        </div>
 
                        {pending.length > 0 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPending([])}
                                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                                >
                                    Clear all
                                </button>
                                <button
                                    onClick={handleSubmitAll}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow
                                        ${isSubmitting
                                            ? 'bg-slate-300 text-slate-500 cursor-wait'
                                            : 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                            </svg>
                                            Submitting…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                                <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Submit {pending.length} Fixture{pending.length > 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
 
                    {/* Queue list */}
                    {pending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 gap-3">
                            <span className="text-4xl">📋</span>
                            <p className="text-sm">Your fixture queue is empty.</p>
                            <p className="text-xs">Fill in the form and click <b>Add to Queue</b>.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[520px] pr-1">
                            {pending.map((match, i) => (
                                <div key={match.id} className="flex items-start gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 mt-4 w-5 text-right shrink-0">{i + 1}</span>
                                    <div className="flex-1">
                                        <PendingMatchRow
                                            match={match}
                                            onRemove={() => handleRemovePending(match.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
 
                    {/* Bottom submit bar when list is long */}
                    {pending.length >= 4 && (
                        <div className="pt-2 border-t border-slate-200">
                            <button
                                onClick={handleSubmitAll}
                                disabled={isSubmitting}
                                className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm
                                    ${isSubmitting
                                        ? 'bg-slate-300 text-slate-500 cursor-wait'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isSubmitting ? 'Submitting…' : `Submit all ${pending.length} fixtures to ${currentLeague.name || currentLeague.localized_name}`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}