// Grafika OG marki (domyślna dla stron bez własnej). 1200×630, bez zdjęć, bez zasobów z sieci.
import { brandOgImage } from "@/components/editorial/og";

export const alt = "ZOO24 — usługi i praktyczna wiedza dla opiekunów zwierząt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return brandOgImage();
}
