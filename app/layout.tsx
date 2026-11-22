import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { IS_PRODUCTION, SITE_URL, adminEnabled } from "@/lib/site";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

// Fonty self-hostowane przez next/font (bez zapytań do Google w przeglądarce), pełne polskie znaki (latin-ext).
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ZOO24 — usługi i praktyczna wiedza dla opiekunów zwierząt", template: "%s | ZOO24" },
  description: "Znajdź groomera lub hotel dla zwierząt w swoim mieście i przeczytaj praktyczne poradniki. Sprawdzone dane firm, bez ocen i ukrytych reklam.",
  // Poza produkcją nigdy nie indeksować (N2). W produkcji decyduje każda strona.
  robots: IS_PRODUCTION ? undefined : { index: false, follow: false },
  openGraph: { siteName: "ZOO24", locale: "pl_PL", type: "website" },
  // Weryfikacja własności (publiczne kody, nie sekrety): Google Search Console i Ahrefs Webmaster Tools.
  verification: {
    google: process.env.ZOO24_GSC_VERIFICATION || undefined,
    other: process.env.ZOO24_AHREFS_VERIFICATION ? { "ahrefs-site-verification": process.env.ZOO24_AHREFS_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#0e4f5c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${inter.variable} ${bricolage.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:shadow-[var(--shadow-raised)]">
          Przejdź do treści
        </a>
        {!IS_PRODUCTION && (
          <div role="note" className="bg-demo-soft px-4 py-1.5 text-center text-xs font-medium text-demo">
            Prototyp lokalny — dane firm oznaczone DEMO są fikcyjne. Nic nie jest publikowane w internecie.
          </div>
        )}
        <SiteHeader showAdmin={adminEnabled()} />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
