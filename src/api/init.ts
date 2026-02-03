import type { InitResponse } from "./types.ts";

export async function init(initData: string): Promise<InitResponse> {
  const res = await fetch("http://localhost:3000/api/init", {
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
