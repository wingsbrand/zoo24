// Dozwolone zdarzenia agregowane z przeglądarki (/api/event). Bez treści użytkownika, bez fraz wyszukiwania.
// ref to wyłącznie wartość ze skończonej listy albo slug istniejącego zasobu — nigdy tekst wpisany przez osobę.
import type { AppState, DirectoryEvent } from "../types";

export type ClientEventType = "article_to_directory" | "directory_search" | "tool_result" | "tool_export" | "search_no_results";

export const CLIENT_EVENT_TYPES: readonly ClientEventType[] = ["article_to_directory", "directory_search", "tool_result", "tool_export", "search_no_results"];

export const TOOL_RESULT_REFS = ["kalkulator-akwarium"] as const;
export const TOOL_EXPORT_REFS = ["lista-dla-opiekuna-druk", "lista-dla-opiekuna-plik"] as const;
const NO_RESULT_CATEGORIES = ["any", "groomer", "hotel-dla-zwierzat"] as const;

export const EVENT_REF_SHAPE = /^[a-z0-9/_-]{1,120}$/;

/** true = ref poprawny dla typu; false = odrzuć (422). Nie zapisuje niczego. */
export function isKnownEventRef(type: ClientEventType, ref: string, state: Pick<AppState, "articles">): boolean {
  switch (type) {
    case "article_to_directory": return state.articles.some((a) => a.slug === ref && a.status === "published");
    case "directory_search": return /^(groomer|hotel-dla-zwierzat)\/(warszawa|krakow|lodz|wroclaw|poznan|gdansk|szczecin|bydgoszcz|lublin|bialystok)$/.test(ref);
    case "tool_result": return (TOOL_RESULT_REFS as readonly string[]).includes(ref);
    case "tool_export": return (TOOL_EXPORT_REFS as readonly string[]).includes(ref);
    case "search_no_results": return (NO_RESULT_CATEGORIES as readonly string[]).includes(ref);
  }
}

export function isClientEventType(v: string): v is ClientEventType {
  return (CLIENT_EVENT_TYPES as readonly string[]).includes(v);
}

export function bumpEvent(events: DirectoryEvent[], day: string, type: ClientEventType, ref: string, demo: boolean): void {
  const ev = events.find((e) => e.day === day && e.type === type && e.ref === ref && e.demo === demo);
  if (ev) ev.count += 1;
  else events.push({ day, type, ref, count: 1, demo });
}
