"use client";
// Jednorazowe zdarzenie agregowane po wyrenderowaniu strony (np. wyszukiwanie bez wyników). ref — tylko ze skończonej listy.
import { useEffect } from "react";
import { sendEvent } from "@/lib/analytics/beacon";
import type { ClientEventType } from "@/lib/analytics/events";

export function EventBeacon({ type, eventRef }: { type: ClientEventType; eventRef: string }) {
  useEffect(() => { sendEvent(type, eventRef); }, [type, eventRef]);
  return null;
}
