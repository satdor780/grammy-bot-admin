import { useState } from "react";
import { useDebugStore } from "../../../store/debugStore";
import { cn } from "../../../lib";
import { Button } from "../../shadcn/ui/button";

function formatData(data: unknown): string {
  if (data === undefined || data === null) return "";
  try {
    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function DebugPanel() {
  const [collapsed, setCollapsed] = useState(true);
  const entries = useDebugStore((s) => s.entries);
  const clear = useDebugStore((s) => s.clear);

  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 z-9999 flex flex-col rounded-tl-lg border border-border bg-card shadow-lg",
        "max-h-[min(50vh,400px)] w-[min(100vw,360px)]",
        "font-mono text-xs",
      )}
    >
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center justify-between gap-2 border-b border-border bg-muted/50 px-3 py-2 text-left font-sans font-medium text-foreground hover:bg-muted"
      >
        <span>Debug {entries.length > 0 && `(${entries.length})`}</span>
        <span className="text-muted-foreground" aria-hidden>
          {collapsed ? "▲" : "▼"}
        </span>
      </button>

      {!collapsed && (
        <>
          <div className="flex shrink-0 justify-end gap-1 border-b border-border p-1">
            <Button type="button" variant="ghost" size="xs" onClick={clear}>
              Clear
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {entries.length === 0 ? (
              <p className="text-muted-foreground">No entries yet.</p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      "rounded-md border p-2",
                      entry.type === "error"
                        ? "border-destructive/50 bg-destructive/10 text-destructive dark:bg-destructive/20"
                        : "border-border bg-muted/30",
                    )}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="uppercase">{entry.type}</span>
                      {entry.label && (
                        <span className="font-medium text-foreground">
                          {entry.label}
                        </span>
                      )}
                      <span>{formatTime(entry.timestamp)}</span>
                    </div>
                    <p className="mt-1 wrap-break-word text-foreground">
                      {entry.message}
                    </p>
                    {entry.data !== undefined && entry.data !== null && (
                      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap wrap-break-word rounded bg-background/80 p-2 text-[10px]">
                        {formatData(entry.data)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
