"use client";

import { useEffect, useState } from "react";

/**
 * Simple on‑screen debug console that captures the timing logs we added
 * (`[Auth] …` and `[useProjects] …`). It appends each new line to a scrollable
 * panel at the bottom of the viewport.
 */
export default function DebugLog() {
    const [logs, setLogs] = useState < string[] > ([]);

    useEffect(() => {
        const originalLog = console.log;
        console.log = (...args) => {
            const text = args
                .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
                .join(" ");
            if (text.startsWith("[Auth]") || text.startsWith("[useProjects]")) {
                setLogs((prev) => [...prev, text]);
            }
            originalLog.apply(console, args);
        };
        return () => {
            console.log = originalLog;
        };
    }, []);

    if (logs.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 max-h-48 overflow-y-auto bg-ink/90 text-paper p-2 text-sm font-mono z-50">
            {logs.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
        </div>
    );
}
