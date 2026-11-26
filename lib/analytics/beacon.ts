"use client";
// Wysyłka zdarzenia agregowanego (sendBeacon). Wolno przekazać wyłącznie ref ze skończonej listy (lib/analytics/events.ts).
import type { ClientEventType } from "./events";

export function sendEvent(type: ClientEventType, ref: string): void {
  try {
    navigator.sendBeacon?.("/api/event", new Blob([JSON.stringify({ type, ref })], { type: "application/json" }));
  } catch { /* pomiar nie może psuć działania narzędzia */ }
}
