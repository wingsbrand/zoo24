// Dispatcher publikacji: bez sekretu nic nie robi (503), zły sekret = 401.
import { afterEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/ops/publish/route";

const req = (auth?: string) => new Request("http://localhost/api/ops/publish", { headers: auth ? { authorization: auth } : {} });

describe("GET /api/ops/publish", () => {
  afterEach(() => { delete process.env.CRON_SECRET; });
  it("brak CRON_SECRET => 503 NOT_CONFIGURED", async () => {
    expect((await GET(req("Bearer x"))).status).toBe(503);
  });
  it("zły lub brakujący nagłówek => 401", async () => {
    process.env.CRON_SECRET = "s".repeat(40);
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("Bearer " + "t".repeat(40)))).status).toBe(401);
  });
});
