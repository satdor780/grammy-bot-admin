import type { InitResponse } from "./types.ts";

const API_BASE = import.meta.env.VITE_SERVER_URI!;

export async function init(initData: string): Promise<InitResponse> {
  const res = await fetch(`${API_BASE}/api/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      initData: initData,
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json.error === "string" ? json.error : "Init failed";
    throw new Error(msg);
  }

  return json;
}
