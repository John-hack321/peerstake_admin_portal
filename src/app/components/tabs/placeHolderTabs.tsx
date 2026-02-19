'use client'

// ─── Live Tab ─────────────────────────────────────────────────────────────────

export function LiveTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#dbeafe" }}
      >
        📡
      </div>
      <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
        Live Matches
      </p>
      <p className="text-xs" style={{ color: "#64748b" }}>
        Live match tracking will appear here.
      </p>
    </div>
  )
}

// ─── Logging Tab ─────────────────────────────────────────────────────────────

export function LoggingTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#dbeafe" }}
      >
        📋
      </div>
      <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
        Match Logging
      </p>
      <p className="text-xs" style={{ color: "#64748b" }}>
        Log match events — goals, cards, substitutions.
      </p>
    </div>
  )
}

// ─── Add New Tab ──────────────────────────────────────────────────────────────

export function AddNewMatchTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#dbeafe" }}
      >
        ➕
      </div>
      <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
        Add New Match
      </p>
      <p className="text-xs" style={{ color: "#64748b" }}>
        Create a new fixture in the system.
      </p>
    </div>
  )
}

// ─── Generic Placeholder ──────────────────────────────────────────────────────

export function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#dbeafe" }}
      >
        🔧
      </div>
      <p className="font-semibold text-sm" style={{ color: "#1a202c" }}>
        {label}
      </p>
      <p className="text-xs" style={{ color: "#64748b" }}>
        Coming soon.
      </p>
    </div>
  )
}