import type { SocialPost } from "../../types";
import { IntegrationDisabledError, MetaApiError, liveFlag } from "../errors";

export interface PublishRequest {
  post: SocialPost;
  idempotencyKey: string;
}

export interface MetaAdapter {
  readonly kind: "mock" | "real";
  publish(req: PublishRequest): Promise<{ externalPostId: string }>;
  /** Rekoncyliacja po timeout: czy post z tym kluczem już istnieje po stronie platformy? */
  findByIdempotencyKey(key: string): Promise<string | null>;
}

type Failure = { code: string; cls: "retryable" | "permanent" | "auth" | "timeout"; landed?: boolean };

/**
 * MOCK adapter Meta (Mode 0). Nie wykonuje żadnych połączeń sieciowych.
 * Pozwala wstrzyknąć błędy (retry, timeout, wygasły token, brak uprawnień) do testów.
 */
export class MockMetaAdapter implements MetaAdapter {
  readonly kind = "mock" as const;
  readonly calls: PublishRequest[] = [];
  private published = new Map<string, string>();
  private failures: Failure[] = [];
  private seq = 0;

  /** Token testowy — celowo wkładany do komunikatów błędów, aby testować redakcję logów. */
  /**
   * @param dedupe false (domyślnie) = realistycznie: Graph API NIE ma idempotency key, ponowne wywołanie tworzy duplikat.
   * Ochrona przed duplikatami musi więc być po stronie publishera (lock + rekoncyliacja przed retry).
   */
  constructor(private fakeToken = "EAAFAKEMOCKTOKEN0000000000", private dedupe = false) {}

  /** Liczba postów faktycznie utworzonych po stronie "platformy" (z duplikatami). */
  createdTotal = 0;

  failNext(...f: Failure[]): this {
    this.failures.push(...f);
    return this;
  }

  get publishedCount(): number {
    return this.published.size;
  }

  async publish(req: PublishRequest): Promise<{ externalPostId: string }> {
    this.calls.push(req);
    await new Promise((r) => setTimeout(r, 1));
    const existing = this.published.get(req.idempotencyKey);
    if (existing && this.dedupe) return { externalPostId: existing };
    const f = this.failures.shift();
    if (f) {
      if (f.landed) { this.published.set(req.idempotencyKey, `mock_${++this.seq}`); this.createdTotal++; }
      const msg =
        f.cls === "auth"
          ? `OAuthException: token expired access_token=${this.fakeToken}`
          : `Mock ${f.code} (Bearer ${this.fakeToken})`;
      throw new MetaApiError(f.code, f.cls, msg);
    }
    const id = `mock_${req.post.platform}_${++this.seq}`;
    this.published.set(req.idempotencyKey, id);
    this.createdTotal++;
    return { externalPostId: id };
  }

  async findByIdempotencyKey(key: string): Promise<string | null> {
    return this.published.get(key) ?? null;
  }
}

/**
 * Prawdziwy adapter — w F1 ZAWSZE wyłączony. Implementacja Graph API dopiero po:
 * zgodzie właściciela, App Review, weryfikacji aktualnych uprawnień w dokumentacji Meta i sekretach w menedżerze.
 */
export class RealMetaAdapter implements MetaAdapter {
  readonly kind = "real" as const;
  constructor() {
    if (!liveFlag("META")) throw new IntegrationDisabledError("Meta");
  }
  async publish(): Promise<{ externalPostId: string }> {
    throw new IntegrationDisabledError("Meta (publish nie jest zaimplementowany w F1)");
  }
  async findByIdempotencyKey(): Promise<string | null> {
    throw new IntegrationDisabledError("Meta");
  }
}

export function getMetaAdapter(socialMode: 0 | 1): MetaAdapter {
  if (socialMode === 1) return new RealMetaAdapter(); // rzuci IntegrationDisabledError bez flagi
  return new MockMetaAdapter();
}
