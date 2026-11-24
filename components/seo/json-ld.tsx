// Wstawia JSON-LD do początkowego HTML (SSR). Treść pochodzi wyłącznie z lib/seo/structured-data.ts.
import { ldGraph, type JsonLdObject } from "@/lib/seo/structured-data";

export function JsonLd({ nodes }: { nodes: JsonLdObject[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldGraph(...nodes) }} />;
}
