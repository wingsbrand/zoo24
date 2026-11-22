// Dane operatora serwisu (usługodawca w rozumieniu ustawy o świadczeniu usług drogą elektroniczną, administrator danych).
// Źródło: właściciel w czacie Claude Code 2026-11-22: „WINGS RETAIL SP. Z O.O., ŻÓŁTKI KOLONIA 38A, 16-070 CHOROSZCZ.
// NIP 5423261087, EMAIL: OFFICE@ZOO24.PL, WEJŚCIE W ŻYCIE: 23.11.2026” (zastępuje wcześniej podany NIP 9662134997).
// Pola null = do uzupełnienia przez właściciela (blokuje lub ostrzega w `npm run preflight:live`).

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
  legalName: "WINGS RETAIL sp. z o.o.",
  shortName: "WINGS RETAIL",
  nip: "5423261087",
  // Decyzja właściciela 2026-11-22: „OBEJDZIE SIĘ BEZ PODAWANIA KRS I KAPITAŁU” — pole celowo puste
  // (poinformowano o art. 206 KSH; ryzyko przyjęte przez właściciela).
  krs: null,
  registeredAddress: "Żółtki Kolonia 38A, 16-070 Choroszcz",
  contactEmail: "office@zoo24.pl",
};

export const LEGAL_EFFECTIVE_DATE: string | null = "2026-11-23"; // data wejścia w życie regulaminu i polityki

export function missingOperatorFields(o: OperatorData = OPERATOR): string[] {
  const missing: string[] = [];
  if (!o.legalName) missing.push("legalName (pełna nazwa z formą prawną)");
  if (!o.registeredAddress) missing.push("registeredAddress (adres siedziby)");
  if (!o.contactEmail) missing.push("contactEmail (e-mail kontaktowy usługodawcy)");
  if (!o.nip) missing.push("nip");
  if (!LEGAL_EFFECTIVE_DATE) missing.push("LEGAL_EFFECTIVE_DATE");
  return missing;
}
