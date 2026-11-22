// Dane operatora serwisu (usługodawca w rozumieniu ustawy o świadczeniu usług drogą elektroniczną, administrator danych).
// Źródło: właściciel w czacie Claude Code 2026-11-22 („właścicielem jest nasza spółka WINGS RETAIL : NIP 9662134997”).
// Pola null = do uzupełnienia przez właściciela przed startem produkcji (blokuje `npm run preflight:live`).

export interface OperatorData {
  /** Pełna nazwa z formą prawną, np. „WINGS RETAIL sp. z o.o.” — do potwierdzenia. */
  legalName: string | null;
  shortName: string;
  nip: string | null;
  krs: string | null;
  /** Adres siedziby spółki (dane rejestrowe operatora, nie adres klienta). */
  registeredAddress: string | null;
  /** Adres e-mail do kontaktu z usługodawcą (wymóg PKE) — może być skrzynka redakcji. */
  contactEmail: string | null;
}

export const OPERATOR: OperatorData = {
  legalName: null,
  shortName: "WINGS RETAIL",
  nip: "9662134997",
  krs: null,
  registeredAddress: null,
  contactEmail: null,
};

export const LEGAL_EFFECTIVE_DATE: string | null = null; // np. "2026-11-23" — data wejścia w życie regulaminu i polityki

export function missingOperatorFields(o: OperatorData = OPERATOR): string[] {
  const missing: string[] = [];
  if (!o.legalName) missing.push("legalName (pełna nazwa z formą prawną)");
  if (!o.registeredAddress) missing.push("registeredAddress (adres siedziby)");
  if (!o.contactEmail) missing.push("contactEmail (e-mail kontaktowy usługodawcy)");
  if (!o.nip) missing.push("nip");
  if (!LEGAL_EFFECTIVE_DATE) missing.push("LEGAL_EFFECTIVE_DATE");
  return missing;
}
