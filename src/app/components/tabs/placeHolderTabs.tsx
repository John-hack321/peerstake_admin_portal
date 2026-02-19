'use client'

// ─── Live Tab ─────────────────────────────────────────────────────────────────

export function LiveTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-4xl">📡</span>
      <p className="text-white font-semibold text-sm">Live Matches</p>
      <p className="text-[#9CA1A9] text-xs">
        Live match tracking will appear here.
      </p>
    </div>
  )
}

// ─── Logging Tab ─────────────────────────────────────────────────────────────

export function LoggingTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-4xl">📋</span>
      <p className="text-white font-semibold text-sm">Match Logging</p>
      <p className="text-[#9CA1A9] text-xs">
        Log match events — goals, cards, substitutions.
      </p>
    </div>
  )
}

// ─── Add New Tab ──────────────────────────────────────────────────────────────

export function AddNewMatchTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-4xl">➕</span>
      <p className="text-white font-semibold text-sm">Add New Match</p>
      <p className="text-[#9CA1A9] text-xs">
        Create a new fixture in the system.
      </p>
    </div>
  )
}

// ─── Generic Placeholder ──────────────────────────────────────────────────────

export function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="text-4xl">🔧</span>
      <p className="text-white font-semibold text-sm">{label}</p>
      <p className="text-[#9CA1A9] text-xs">Coming soon.</p>
    </div>
  )
}