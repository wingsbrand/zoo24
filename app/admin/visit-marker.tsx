"use client";
import { useEffect } from "react";
import { markVisited } from "./actions";

/** Po wyświetleniu przeglądu zapisuje znacznik wizyty (cookie lokalne), by następnym razem pokazać „co się zmieniło”. */
export function VisitMarker() {
  useEffect(() => {
    const t = setTimeout(() => { void markVisited(); }, 4000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
