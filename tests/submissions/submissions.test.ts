import { beforeEach, describe, expect, it } from "vitest";
import { buildSeedState } from "@/lib/demo/seed";
import { tempStore } from "../helpers";
import {
  CODE_ALPHABET,
  SubmissionError,
  createRateLimiter,
  createSubmission,
  findSubmission,
  fingerprint,
  formDataToRecord,
  generateSubmissionCode,
  moderateSubmission,
  normalizeCode,
  normalizeHttpsUrl,
  normalizePolishPhone,
  processFormSubmission,
  publicStatus,
  validateAddBusiness,
  validateContact,
  validateReportError,
} from "@/lib/submissions";
import type { AppState } from "@/lib/types";

const validBusiness = {
  companyName: "  Salon   Testowy  ",
  category: "groomer",
  city: "warszawa",
  website: "salon-testowy.pl",
  phone: "22 123 45 67",
  email: "Kontakt@Salon-Testowy.pl",
  role: "owner",
  services: "strzyżenie, kąpiel",
  acceptTerms: "on",
  acceptPrivacy: "on",
};

const validContact = { topic: "pytanie", message: "Dzień dobry, mam pytanie o serwis.", email: "osoba@example.com" };

function freshState(): AppState {
  const s = buildSeedState();
  s.submissions = [];
  return s;
}

describe("walidacja: add_business", () => {
  it("akceptuje poprawne dane i normalizuje pola", () => {
    const r = validateAddBusiness(validBusiness);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.companyName).toBe("Salon Testowy");
    expect(r.data.website).toBe("https://salon-testowy.pl/");
    expect(r.data.phone).toBe("+48 221 234 567");
    expect(r.data.email).toBe("kontakt@salon-testowy.pl");
    expect(r.data.mode).toBe("new");
  });

  it("zwraca polskie błędy przy wymaganych polach", () => {
    const r = validateAddBusiness({});
    expect(r.ok).toBe(false);
    if (r.ok) return;
    for (const f of ["companyName", "category", "city", "email", "role", "acceptTerms", "acceptPrivacy"]) expect(r.errors[f]).toBeTruthy();
    expect(r.errors.companyName).toMatch(/nazwę firmy/);
    expect(r.errors.website).toBeUndefined(); // opcjonalne
    expect(r.errors.phone).toBeUndefined();
  });

  it("limity długości nazwy 2–120", () => {
    expect(validateAddBusiness({ ...validBusiness, companyName: "A" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, companyName: "A".repeat(121) }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, companyName: "AB" }).ok).toBe(true);
  });

  it("kategoria i miasto tylko z list; „inne” wymaga nazwy miejscowości bez adresu", () => {
    expect(validateAddBusiness({ ...validBusiness, category: "weterynarz" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, city: "krakow" }).ok).toBe(true); // Kraków jest na liście miast
    expect(validateAddBusiness({ ...validBusiness, city: "zielona-gora" }).ok).toBe(false);
    const missing = validateAddBusiness({ ...validBusiness, city: "inne" });
    expect(!missing.ok && missing.errors.cityOther).toBeTruthy();
    const address = validateAddBusiness({ ...validBusiness, city: "inne", cityOther: "ul. Prosta 5/12" });
    expect(!address.ok && address.errors.cityOther).toBeTruthy();
    const ok = validateAddBusiness({ ...validBusiness, city: "inne", cityOther: "Zielona Góra" });
    expect(ok.ok && ok.data.cityOther).toBe("Zielona Góra");
  });

  it("www: tylko https; telefon: format PL", () => {
    expect("error" in normalizeHttpsUrl("http://firma.pl")).toBe(true);
    expect("error" in normalizeHttpsUrl("javascript:alert(1)")).toBe(true);
    expect("error" in normalizeHttpsUrl("https://localhost")).toBe(true);
    expect(normalizeHttpsUrl("https://firma.pl/oferta")).toEqual({ url: "https://firma.pl/oferta" });
    expect(normalizePolishPhone("+48 600-100-200")).toBe("+48 600 100 200");
    expect(normalizePolishPhone("0048600100200")).toBe("+48 600 100 200");
    expect(normalizePolishPhone("12345")).toBeNull();
    expect(normalizePolishPhone("060010020")).toBeNull();
    expect(validateAddBusiness({ ...validBusiness, phone: "abc" }).ok).toBe(false);
  });

  it("odrzuca klucze z prototypu obiektu (toString, constructor)", () => {
    expect(validateAddBusiness({ ...validBusiness, category: "toString" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, city: "constructor" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, role: "hasOwnProperty" }).ok).toBe(false);
    expect(validateContact({ ...validContact, topic: "toString" }).ok).toBe(false);
  });

  it("rola tylko właściciel/pracownik; zgody wymagane", () => {
    expect(validateAddBusiness({ ...validBusiness, role: "agencja" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, acceptTerms: "" }).ok).toBe(false);
    expect(validateAddBusiness({ ...validBusiness, acceptPrivacy: undefined }).ok).toBe(false);
  });

  it("tryb aktualizacji: `firma` musi istnieć, jeśli podano kontekst", () => {
    const r = validateAddBusiness({ ...validBusiness, firma: "nie-ma-takiej-1" }, { businessExists: () => false });
    expect(!r.ok && r.errors.firma).toBeTruthy();
    const ok = validateAddBusiness({ ...validBusiness, firma: "salon-x-1" }, { businessExists: () => true });
    expect(ok.ok && ok.data.mode).toBe("update");
    expect(validateAddBusiness({ ...validBusiness, firma: "../etc" }).ok).toBe(false);
  });
});

describe("walidacja: report_error i contact", () => {
  it("report_error wymaga strony lub firmy i opisu 10–2000", () => {
    const none = validateReportError({ description: "Nieaktualny numer telefonu" });
    expect(!none.ok && none.errors.pageUrl).toBeTruthy();
    expect(validateReportError({ pageUrl: "/uslugi/groomer", description: "krótko" }).ok).toBe(false);
    expect(validateReportError({ pageUrl: "/uslugi/groomer", description: "x".repeat(2001) }).ok).toBe(false);
    expect(validateReportError({ pageUrl: "//evil.example", description: "Nieaktualny numer telefonu" }).ok).toBe(false);
    expect(validateReportError({ pageUrl: "https://zoo24.pl/firma/a-1", description: "Nieaktualny numer telefonu" }).ok).toBe(true);
    expect(validateReportError({ firma: "salon-a-1", description: "Nieaktualny numer telefonu", email: "" }).ok).toBe(true);
    const badMail = validateReportError({ firma: "salon-a-1", description: "Nieaktualny numer telefonu", email: "zły" });
    expect(!badMail.ok && badMail.errors.email).toBeTruthy();
  });

  it("contact: temat z listy, wiadomość, e-mail wymagany", () => {
    expect(validateContact(validContact).ok).toBe(true);
    const r = validateContact({ topic: "spam", message: "", email: "" });
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["email", "message", "topic"]);
  });
});

describe("kod zgłoszenia", () => {
  it("format ZG- + 6 znaków bez 0/O/1/I", () => {
    expect(CODE_ALPHABET).not.toMatch(/[0O1I]/);
    for (let i = 0; i < 200; i++) expect(generateSubmissionCode()).toMatch(/^ZG-[2-9A-HJ-NP-Z]{6}$/);
  });
  it("normalizacja wpisanego kodu", () => {
    expect(normalizeCode(" zg-7k3p9q ")).toBe("ZG-7K3P9Q");
    expect(normalizeCode("7k3p9q")).toBe("ZG-7K3P9Q");
    expect(normalizeCode("ZG 7K3 P9Q")).toBe("ZG-7K3P9Q");
    expect(normalizeCode("ZG-0O1I00")).toBeNull();
    expect(normalizeCode("")).toBeNull();
  });
});

describe("createSubmission / findSubmission / moderateSubmission / publicStatus", () => {
  it("tworzy pending, znajduje bez względu na wielkość liter, audyt bez PII", () => {
    const s = freshState();
    const sub = createSubmission(s, "add_business", validBusiness);
    expect(sub.status).toBe("pending");
    expect(findSubmission(s, sub.code.toLowerCase())?.code).toBe(sub.code);
    expect(findSubmission(s, "ZG-ZZZZZZ")).toBeNull();
    const audit = JSON.stringify(s.audit.filter((a) => a.entity === "submission"));
    expect(audit).not.toMatch(/salon-testowy\.pl|@|221 234/i);
  });

  it("odrzuca nieprawidłowe dane i unika kolizji kodów", () => {
    const s = freshState();
    expect(() => createSubmission(s, "contact", { topic: "pytanie" })).toThrow(SubmissionError);
    let n = 0;
    const seq = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
    const rand = () => seq[n++ % seq.length];
    const a = createSubmission(s, "contact", validContact, { rand });
    const b = createSubmission(s, "contact", validContact, { rand });
    expect(a.code).toBe("ZG-222222");
    expect(b.code).toBe("ZG-333333");
  });

  it("moderacja: tylko pending, odrzucenie wymaga powodu, powód redagowany", () => {
    const s = freshState();
    const sub = createSubmission(s, "add_business", validBusiness);
    expect(() => moderateSubmission(s, sub.code, "rejected", "mod")).toThrow(/powód/i);
    expect(() => moderateSubmission(s, "ZG-ZZZZZZ", "approved", "mod")).toThrow(SubmissionError);
    const done = moderateSubmission(s, sub.code, "rejected", "mod", "Brak potwierdzenia — napisz z kontakt@salon.pl lub 600 100 200");
    expect(done.status).toBe("rejected");
    expect(done.processedAt).not.toBeNull();
    expect(done.reason).not.toMatch(/kontakt@salon\.pl|600 100 200/);
    expect(() => moderateSubmission(s, sub.code, "approved", "mod")).toThrow(/rozpatrzone/);
    const entry = s.audit.at(-1)!;
    expect(entry.action).toBe("submission_rejected");
    expect(JSON.stringify(entry)).not.toMatch(/@|600 100 200/);
  });

  it("publicStatus nie zawiera danych osobowych ani payloadu", () => {
    const s = freshState();
    const sub = createSubmission(s, "add_business", validBusiness);
    const ps = publicStatus(sub);
    expect(Object.keys(ps).sort()).toEqual(["code", "createdAt", "kind", "kindLabel", "processedAt", "reason", "status", "statusLabel"]);
    expect(JSON.stringify(ps)).not.toMatch(/@|salon|\+48|strzyżenie/i);
    moderateSubmission(s, sub.code, "approved", "mod");
    expect(publicStatus(sub).statusLabel).toBe("Zaakceptowane");
  });
});

describe("rate limit i odcisk", () => {
  it("5 prób / 10 min, potem blokada; okno przesuwne", () => {
    const rl = createRateLimiter({ limit: 5, windowMs: 600_000 });
    for (let i = 0; i < 5; i++) {
      expect(rl.allowed("k", 1000 + i)).toBe(true);
      rl.record("k", 1000 + i);
    }
    expect(rl.allowed("k", 2000)).toBe(false);
    expect(rl.allowed("inny", 2000)).toBe(true);
    expect(rl.allowed("k", 1000 + 600_001 + 5)).toBe(true);
  });
  it("odcisk jest skrótem, nie zawiera nagłówków", () => {
    const f = fingerprint("Mozilla/5.0 Test", "pl-PL");
    expect(f).toMatch(/^[a-f0-9]{24}$/);
    expect(f).toBe(fingerprint("Mozilla/5.0 Test", "pl-PL"));
    expect(f).not.toBe(fingerprint("Mozilla/5.0 Test", "en-US"));
  });
});

describe("processFormSubmission (server action core)", () => {
  let store: ReturnType<typeof tempStore>;
  beforeEach(() => {
    store = tempStore();
  });

  it("zapisuje poprawne zgłoszenie i zwraca kod", async () => {
    const r = await processFormSubmission("contact", validContact, { store, fingerprint: "a", limiter: createRateLimiter() });
    expect(r.status).toBe("success");
    if (r.status !== "success") return;
    expect(findSubmission(store.read(), r.code)?.kind).toBe("contact");
  });

  it("honeypot: udany wynik bez zapisu", async () => {
    const r = await processFormSubmission("contact", { ...validContact, website_hp: "http://spam" }, { store, fingerprint: "a", limiter: createRateLimiter() });
    expect(r.status).toBe("success");
    expect(store.read().submissions).toHaveLength(0);
  });

  it("błędy walidacji zachowują wartości (bez honeypota) i nie liczą się do limitu", async () => {
    const limiter = createRateLimiter({ limit: 1 });
    const r = await processFormSubmission("contact", { topic: "pytanie", message: "x", email: "a@b.pl", website_hp: "" }, { store, fingerprint: "a", limiter });
    expect(r.status).toBe("error");
    if (r.status !== "error") return;
    expect(r.errors.message).toBeTruthy();
    expect(r.values.email).toBe("a@b.pl");
    expect("website_hp" in r.values).toBe(false);
    expect((await processFormSubmission("contact", validContact, { store, fingerprint: "a", limiter })).status).toBe("success");
    const blocked = await processFormSubmission("contact", validContact, { store, fingerprint: "a", limiter });
    expect(blocked.status === "error" && blocked.message).toMatch(/zbyt wiele/i);
    expect(store.read().submissions).toHaveLength(1);
  });

  it("aktualizacja istniejącego profilu po slugu; nieistniejący slug = błąd pola", async () => {
    const slug = store.read().businesses.find((b) => b.status === "published")!.slug;
    const ok = await processFormSubmission("add_business", { ...validBusiness, firma: slug }, { store, fingerprint: "b", limiter: createRateLimiter() });
    expect(ok.status).toBe("success");
    const bad = await processFormSubmission("add_business", { ...validBusiness, firma: "brak-profilu-zzz" }, { store, fingerprint: "b", limiter: createRateLimiter() });
    expect(bad.status === "error" && bad.errors.firma).toBeTruthy();
  });

  it("formDataToRecord pomija pola wewnętrzne Next i pliki", () => {
    const fd = new FormData();
    fd.set("email", "a@b.pl");
    fd.set("$ACTION_ID_abc", "");
    fd.set("plik", new Blob(["x"]), "x.txt");
    expect(formDataToRecord(fd)).toEqual({ email: "a@b.pl" });
  });
});
