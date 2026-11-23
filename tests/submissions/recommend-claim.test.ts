import { beforeEach, describe, expect, it } from "vitest";
import { tempStore } from "../helpers";
import {
  KIND_LABELS,
  animalField,
  createRateLimiter,
  createSubmission,
  findSubmission,
  processFormSubmission,
  publicStatus,
  validateAddBusiness,
  validateRecommendPlace,
} from "@/lib/submissions";
import { buildSeedState } from "@/lib/demo/seed";
import { GROUPS } from "@/lib/taxonomy/animals";

const validRecommend = {
  placeName: "  Salon   Polecany ",
  city: "krakow",
  category: "groomer",
  [animalField("psy")]: "on",
  [animalField("kroliki")]: "on",
  website: "salon-polecany.pl",
  source: "Korzystam z ich usług od roku.",
  email: "Polecajacy@Example.com",
};

const validBusiness = {
  companyName: "Salon Testowy",
  category: "groomer",
  city: "warszawa",
  email: "kontakt@salon-testowy.pl",
  role: "owner",
  acceptTerms: "on",
  acceptPrivacy: "on",
};

describe("walidacja: recommend_place (Poleć miejsce)", () => {
  it("akceptuje poprawne dane, normalizuje pola i zapisuje grupy zwierząt z taksonomii", () => {
    const r = validateRecommendPlace(validRecommend);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.placeName).toBe("Salon Polecany");
    expect(r.data.animals).toBe("psy,kroliki");
    expect(r.data.website).toBe("https://salon-polecany.pl/");
    expect(r.data.email).toBe("polecajacy@example.com");
    expect(r.data.relation).toBe("recommender");
  });

  it("wymaga nazwy, miasta, rodzaju usługi, ≥1 grupy zwierząt i źródła; www i e-mail opcjonalne", () => {
    const r = validateRecommendPlace({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    for (const f of ["placeName", "city", "category", "animals", "source"]) expect(r.errors[f]).toBeTruthy();
    expect(r.errors.website).toBeUndefined();
    expect(r.errors.email).toBeUndefined();
  });

  it("„inna” usługa i „inne” miasto wymagają doprecyzowania (bez adresu)", () => {
    const cat = validateRecommendPlace({ ...validRecommend, category: "inna" });
    expect(!cat.ok && cat.errors.categoryOther).toBeTruthy();
    const okCat = validateRecommendPlace({ ...validRecommend, category: "inna", categoryOther: "pet sitter" });
    expect(okCat.ok && okCat.data.categoryOther).toBe("pet sitter");
    const addr = validateRecommendPlace({ ...validRecommend, city: "inne", cityOther: "ul. Prosta 5/12" });
    expect(!addr.ok && addr.errors.cityOther).toBeTruthy();
    expect(validateRecommendPlace({ ...validRecommend, category: "weterynarz" }).ok).toBe(false);
  });

  it("odrzuca grupy zwierząt spoza taksonomii; obsługuje wszystkie 10 grup", () => {
    expect(validateRecommendPlace({ ...validRecommend, animals: "psy,smoki" }).ok).toBe(false);
    const all = validateRecommendPlace({ ...validRecommend, animals: GROUPS.map((g) => g.slug).join(",") });
    expect(all.ok && all.data.animals.split(",")).toHaveLength(10);
  });

  it("polecający nie może ustawić roli, profilu docelowego ani trybu przejęcia", () => {
    const r = validateRecommendPlace({
      ...validRecommend,
      role: "owner",
      firma: "jakis-profil",
      profil: "jakis-profil",
      targetBusinessId: "biz-123",
      mode: "update",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    for (const k of ["role", "firma", "profil", "targetBusinessId", "mode"]) expect(k in r.data).toBe(false);
  });

  it("etykieta w moderacji: „Polecenie miejsca”; widok publiczny bez e-maila", () => {
    expect(KIND_LABELS.recommend_place).toBe("Polecenie miejsca");
    const s = buildSeedState();
    s.submissions = [];
    const sub = createSubmission(s, "recommend_place", validRecommend);
    expect(sub.kind).toBe("recommend_place");
    expect(sub.payload.email).toBe("polecajacy@example.com"); // tylko w kolejce moderacji
    const pub = publicStatus(sub);
    expect(pub.kindLabel).toBe("Polecenie miejsca");
    expect(JSON.stringify(pub)).not.toContain("polecajacy@example.com");
    expect(JSON.stringify(s.audit.at(-1))).not.toContain("polecajacy@example.com");
  });
});

describe("processFormSubmission: recommend_place i przejęcie profilu", () => {
  let store: ReturnType<typeof tempStore>;
  beforeEach(() => {
    store = tempStore();
  });

  it("zapisuje polecenie jako recommend_place (pending)", async () => {
    const r = await processFormSubmission("recommend_place", validRecommend, { store, fingerprint: "r", limiter: createRateLimiter() });
    expect(r.status).toBe("success");
    if (r.status !== "success") return;
    expect(r.kind).toBe("recommend_place");
    const sub = findSubmission(store.read(), r.code)!;
    expect(sub.kind).toBe("recommend_place");
    expect(sub.status).toBe("pending");
  });

  it("honeypot: udany wynik bez zapisu", async () => {
    const r = await processFormSubmission("recommend_place", { ...validRecommend, website_hp: "x" }, { store, fingerprint: "r", limiter: createRateLimiter() });
    expect(r.status).toBe("success");
    expect(store.read().submissions).toHaveLength(0);
  });

  it("limit zgłoszeń dotyczy też poleceń", async () => {
    const limiter = createRateLimiter({ limit: 1 });
    expect((await processFormSubmission("recommend_place", validRecommend, { store, fingerprint: "r", limiter })).status).toBe("success");
    const blocked = await processFormSubmission("recommend_place", validRecommend, { store, fingerprint: "r", limiter });
    expect(blocked.status === "error" && blocked.message).toMatch(/zbyt wiele/i);
    expect(store.read().submissions).toHaveLength(1);
  });

  it("przejęcie przez ?profil=<slug> zapisuje id profilu docelowego (wyznaczone na serwerze)", async () => {
    const biz = store.read().businesses.find((b) => b.status === "published")!;
    const r = await processFormSubmission(
      "add_business",
      { ...validBusiness, profil: biz.slug, targetBusinessId: "podrobione-id" },
      { store, fingerprint: "c", limiter: createRateLimiter() },
    );
    expect(r.status).toBe("success");
    if (r.status !== "success") return;
    const sub = findSubmission(store.read(), r.code)!;
    expect(sub.payload.targetBusinessId).toBe(biz.id);
    expect(sub.payload.firma).toBe(biz.slug);
    expect(sub.payload.mode).toBe("update");
  });

  it("przejęcie nieopublikowanego/nieistniejącego profilu = błąd pola, bez zapisu", async () => {
    const r = await processFormSubmission("add_business", { ...validBusiness, profil: "brak-profilu-zzz" }, { store, fingerprint: "c", limiter: createRateLimiter() });
    expect(r.status === "error" && r.errors.firma).toBeTruthy();
    expect(store.read().submissions).toHaveLength(0);
  });

  it("nowa firma bez profilu nie ma id celu, nawet jeśli klient je podeśle", () => {
    const r = validateAddBusiness({ ...validBusiness, targetBusinessId: "biz-1" }, { businessIdBySlug: () => "biz-1" });
    expect(r.ok && r.data.mode).toBe("new");
    expect(r.ok && "targetBusinessId" in r.data).toBe(false);
  });
});
