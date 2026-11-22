"use client";
// Link z agregowanym pomiarem przejścia (np. poradnik → katalog). Wysyła sendBeacon, nie blokuje nawigacji.
import Link from "next/link";
import type { ComponentProps } from "react";

export function TrackLink({ event, eventRef, onClick, ...rest }: ComponentProps<typeof Link> & { event: "article_to_directory"; eventRef: string }) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        try {
          navigator.sendBeacon?.("/api/event", new Blob([JSON.stringify({ type: event, ref: eventRef })], { type: "application/json" }));
        } catch { /* pomiar nie może psuć nawigacji */ }
        onClick?.(e);
      }}
    />
  );
}
