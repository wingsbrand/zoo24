"use client";

import { useState, useSyncExternalStore } from "react";
import { LocateFixed } from "lucide-react";
import type { CitySlug } from "@/lib/types";
import { FAR_FROM_PILOT_KM, nearestCity } from "@/lib/directory/geo";
import { buttonClasses } from "@/components/ui/button";

const noopSubscribe = () => () => {};

/**
 * „Użyj mojej lokalizacji” — ulepszenie progresywne (bez JS przycisk się nie pojawia).
 * Współrzędne są przeliczane wyłącznie w przeglądarce na najbliższe miasto pilotażu; nic nie trafia na serwer.
 */
export function GeolocateButton({ inputId, cityNames }: { inputId: string; cityNames: Record<CitySlug, string> }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [msg, setMsg] = useState<{ error: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  if (!hydrated) return null;

  const fail = (text: string) => {
    setBusy(false);
    setMsg({ error: true, text });
  };

  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      fail("Twoja przeglądarka nie udostępnia lokalizacji. Wpisz miasto ręcznie.");
      return;
    }
    setBusy(true);
    setMsg({ error: false, text: "Ustalam lokalizację…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const r = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (!r) return fail("Nie udało się odczytać lokalizacji. Wpisz miasto ręcznie.");
        const name = cityNames[r.city];
        const input = document.getElementById(inputId);
        if (input instanceof HTMLInputElement) input.value = name;
        setBusy(false);
        setMsg({
          error: false,
          text: r.distanceKm > FAR_FROM_PILOT_KM
            ? `Najbliższe miasto, w którym działamy, to ${name} (ok. ${r.distanceKm} km). Na razie działamy w 10 największych miastach.`
            : `Wpisano miasto: ${name}. Wybierz rodzaj usługi i kliknij „Szukaj”.`,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) fail("Nie udzielono zgody na lokalizację. Wpisz miasto ręcznie.");
        else if (err.code === err.TIMEOUT) fail("Ustalanie lokalizacji trwało zbyt długo. Wpisz miasto ręcznie.");
        else fail("Nie udało się ustalić lokalizacji. Wpisz miasto ręcznie.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button type="button" onClick={locate} disabled={busy} aria-describedby={`${inputId}-geo-note`} className={buttonClasses("ghost", "md", "-ml-2")}>
        <LocateFixed aria-hidden size={18} />
        {busy ? "Ustalam…" : "Użyj mojej lokalizacji"}
      </button>
      <span id={`${inputId}-geo-note`} className="sr-only">Lokalizacja zostaje w Twojej przeglądarce i nie jest wysyłana do ZOO24.</span>
      <p role="status" aria-live="polite" className={msg?.error ? "text-sm font-medium text-danger" : "text-sm text-ink-muted"}>
        {msg?.text}
      </p>
    </div>
  );
}
