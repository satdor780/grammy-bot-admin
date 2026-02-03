import { create } from "zustand";

export type DebugEntryType = "error" | "response";

export interface DebugEntry {
  id: string;
  type: DebugEntryType;
  label?: string;
  message: string;
  data?: unknown;
  timestamp: number;
}

type DebugState = {
  entries: DebugEntry[];
  maxEntries: number;
  addError: (message: string, data?: unknown, label?: string) => void;
  addResponse: (message: string, data?: unknown, label?: string) => void;
  clear: () => void;
};

let idCounter = 0;
function nextId() {
  return `debug-${Date.now()}-${++idCounter}`;
}

export const useDebugStore = create<DebugState>((set) => ({
  entries: [],
  maxEntries: 50,

  addError: (message, data, label) =>
    set((state) => ({
      entries: [
        {
          id: nextId(),
          type: "error" as const,
          label,
          message,
          data,
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, state.maxEntries),
    })),

  addResponse: (message, data, label) =>
    set((state) => ({
      entries: [
        {
          id: nextId(),
          type: "response" as const,
          label,
          message,
          data,
          timestamp: Date.now(),
        },
        ...state.entries,
      ].slice(0, state.maxEntries),
    })),

  clear: () => set({ entries: [] }),
}));
