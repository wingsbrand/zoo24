// Obrazy Open Graph 1200×630 (next/og). Bez zdjęć i bez pobierania czegokolwiek z sieci w runtime:
// font Geist-Regular.ttf jest wczytywany lokalnie z pakietu next (node_modules/next/dist/compiled/@vercel/og).
// Jeśli pliku brak — ImageResponse używa domyślnego fontu wbudowanego w next/og (również Geist).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import type { Article } from "@/lib/types";
import { topicForArticle, type TopicColors } from "@/lib/content/topics";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";
const FONT = "Geist";
const BRAND: TopicColors = { bg: "#0e4f5c", fg: "#faf7f2", motif: "#ef8a6c" };

let fontPromise: Promise<Buffer | null> | null = null;
function loadFont(): Promise<Buffer | null> {
  fontPromise ??= readFile(join(process.cwd(), "node_modules", "next", "dist", "compiled", "@vercel", "og", "Geist-Regular.ttf")).catch(() => null);
  return fontPromise;
}

async function render(node: ReactElement): Promise<ImageResponse> {
  const font = await loadFont();
  return new ImageResponse(node, {
    ...OG_SIZE,
    fonts: font ? [{ name: FONT, data: font, weight: 400, style: "normal" }] : undefined,
  });
}

function Paw({ color, size, opacity, rotate }: { color: string; size: number; opacity: number; rotate: number }) {
  return (
    <div style={{ display: "flex", transform: `rotate(${rotate}deg)`, opacity }}>
    <svg width={size} height={size} viewBox="0 0 100 100">
      <g fill={color}>
        <ellipse cx="20" cy="38" rx="9" ry="12" transform="rotate(-24 20 38)" />
        <ellipse cx="39" cy="20" rx="9" ry="12.5" transform="rotate(-8 39 20)" />
        <ellipse cx="61" cy="20" rx="9" ry="12.5" transform="rotate(8 61 20)" />
        <ellipse cx="80" cy="38" rx="9" ry="12" transform="rotate(24 80 38)" />
        <path d="M50 94 C31 81 19 70 22 56 C24.5 46 38 42 50 53 C62 42 75.5 46 78 56 C81 70 69 81 50 94 Z" />
      </g>
    </svg>
    </div>
  );
}

function Frame({ colors, kicker, title, footer, badge }: { colors: TopicColors; kicker: string; title: string; footer: string; badge?: string | null }) {
  const titleSize = title.length > 80 ? 50 : title.length > 50 ? 60 : 72;
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: colors.bg, color: colors.fg, fontFamily: FONT }}>
      <div style={{ position: "absolute", right: -90, bottom: -120, display: "flex" }}>
        <Paw color={colors.motif} size={560} opacity={0.3} rotate={14} />
      </div>
      <div style={{ position: "absolute", right: 300, top: 50, display: "flex" }}>
        <Paw color={colors.motif} size={110} opacity={0.22} rotate={-18} />
      </div>
      {/* bezpieczne pole: 96 px poziomo (8%), 56 px pionowo (≈ 9%) */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "56px 96px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 40, letterSpacing: -1 }}>ZOO24</div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>{kicker}</div>
          {badge ? (
            <div style={{ display: "flex", fontSize: 22, padding: "4px 14px", borderRadius: 999, backgroundColor: "#ffe9b0", color: "#7a4a00" }}>{badge}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", maxWidth: 700, fontSize: titleSize, lineHeight: 1.1, letterSpacing: -1.5 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 26, opacity: 0.85 }}>{footer}</div>
      </div>
    </div>
  );
}

/** Ogólna grafika marki (także dla nieopublikowanych artykułów — nie ujawniamy tytułów szkiców). */
export function brandOgImage(): Promise<ImageResponse> {
  return render(
    <Frame colors={BRAND} kicker="· usługi i poradniki" title="Usługi i praktyczna wiedza dla opiekunów zwierząt" footer="Groomerzy · hotele dla zwierząt · poradniki" />,
  );
}

/** Grafika artykułu: tytuł, temat, logo-tekst ZOO24. `null` => grafika marki. */
export function articleOgImage(a: Article | null): Promise<ImageResponse> {
  if (!a) return brandOgImage();
  const topic = topicForArticle(a);
  return render(<Frame colors={topic.colors} kicker={`· Poradnik · ${topic.name}`} title={a.title} footer={a.authorDisplay} badge={a.demo ? "DEMO" : null} />);
}
