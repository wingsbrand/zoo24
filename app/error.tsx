"use client";
// Granica błędów segmentu. Nie logujemy treści błędu w przeglądarce (mogłaby zawierać dane) — pokazujemy tylko digest.
import { useEffect, useRef } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, Container } from "@/components/ui";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <Container size="prose" className="py-12 sm:py-16">
      <div role="alert" className="space-y-4">
        <TriangleAlert aria-hidden size={36} className="text-warn" />
        <h1 ref={heading} tabIndex={-1} className="text-3xl font-bold focus:outline-none sm:text-4xl">Coś poszło nie tak</h1>
        <p className="text-lg text-ink-muted">Nie udało się wyświetlić tej strony. Spróbuj ponownie — jeśli problem się powtarza, wróć za kilka minut.</p>
        {error.digest && (
          <p className="text-sm text-ink-muted">
            Kod błędu: <code className="break-all rounded bg-canvas px-1.5 py-0.5 font-mono">{error.digest}</code> — podaj go, zgłaszając problem.
          </p>
        )}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button variant="primary" onClick={() => reset()} icon={<RotateCcw aria-hidden size={18} />}>Spróbuj ponownie</Button>
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 font-semibold text-brand hover:border-brand">Strona główna</Link>
        </div>
        <p className="text-sm text-ink-muted">Możesz też <Link href="/zglos-blad" className="text-brand underline">zgłosić błąd</Link>.</p>
      </div>
    </Container>
  );
}
