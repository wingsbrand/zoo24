"use client";
// Ostatnia linia obrony (błąd w root layout). Minimalna: własny <html>, style inline, bez zależności od layoutu.
import "./globals.css";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pl">
      <head>
        <title>Coś poszło nie tak | ZOO24</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf7f2", color: "#1f2933" }}>
        <main role="alert" style={{ maxWidth: "36rem", margin: "0 auto", padding: "4rem 1rem", lineHeight: 1.6 }}>
          <p style={{ fontWeight: 700, color: "#0e4f5c", margin: 0 }}>ZOO24</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 1rem" }}>Coś poszło nie tak</h1>
          <p>Serwis chwilowo nie działa poprawnie. Spróbuj ponownie za chwilę.</p>
          {error.digest && (
            <p style={{ fontSize: "0.9rem" }}>
              Kod błędu: <code style={{ wordBreak: "break-all" }}>{error.digest}</code>
            </p>
          )}
          <p style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" onClick={() => reset()} style={{ minHeight: 44, padding: "0 1.25rem", border: 0, borderRadius: 12, background: "#0e4f5c", color: "#fff", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>
              Spróbuj ponownie
            </button>
            {/* Zwykły link (pełne przeładowanie) — router może być niedostępny po błędzie layoutu. */}
            <a href="/" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 1.25rem", borderRadius: 12, border: "1px solid #0e4f5c", color: "#0e4f5c", fontWeight: 600, textDecoration: "none" }}>
              Strona główna
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
