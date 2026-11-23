import { describe, expect, it } from "vitest";
import { emptyAnimal, emptySheet, isSheetEmpty, parseStoredSheet, sheetToText, textFileName, canAddAnimal } from "@/lib/tools/caretaker";

describe("lista dla opiekuna — model", () => {
  it("nowa lista jest pusta i ma jedno zwierzę", () => {
    const s = emptySheet("x");
    expect(s.animals).toHaveLength(1);
    expect(s.animals[0].id).toBe("x");
    expect(isSheetEmpty(s)).toBe(true);
  });

  it("same spacje nie liczą się jako treść", () => {
    const s = emptySheet();
    s.animals[0].name = "   ";
    expect(isSheetEmpty(s)).toBe(true);
    s.vetContact = "Przychodnia, tel. wpisany przez właściciela";
    expect(isSheetEmpty(s)).toBe(false);
  });

  it("limit 10 zwierząt", () => {
    const s = emptySheet();
    s.animals = Array.from({ length: 10 }, () => emptyAnimal());
    expect(canAddAnimal(s)).toBe(false);
  });
});

describe("parseStoredSheet", () => {
  it("odrzuca puste, uszkodzone i obce dane", () => {
    expect(parseStoredSheet(null)).toBeNull();
    expect(parseStoredSheet("{nie json")).toBeNull();
    expect(parseStoredSheet("[]")).toBeNull();
    expect(parseStoredSheet(JSON.stringify({ foo: 1 }))).toBeNull();
  });

  it("odtwarza zapisane dane i ignoruje pola nietekstowe", () => {
    const raw = JSON.stringify({ animals: [{ id: "a1", name: "Burek", age: 5, feeding: "rano" }], vetContact: "Lecznica", emergency: { x: 1 } });
    const s = parseStoredSheet(raw)!;
    expect(s.animals[0]).toMatchObject({ id: "a1", name: "Burek", age: "", feeding: "rano", species: "" });
    expect(s.vetContact).toBe("Lecznica");
    expect(s.emergency).toBe("");
  });

  it("pustą tablicę zwierząt zastępuje jednym pustym wpisem", () => {
    const s = parseStoredSheet(JSON.stringify({ animals: [] }))!;
    expect(s.animals).toHaveLength(1);
  });
});

describe("eksport tekstowy", () => {
  it("zawiera wypełnione pola, pomija puste i dodaje zastrzeżenie o lekach", () => {
    const s = emptySheet();
    s.animals[0] = { ...s.animals[0], name: "Mruczek", species: "kot", feeding: "karma mokra\nrano i wieczorem", medication: "" };
    s.ownerContact = "Anna";
    const txt = sheetToText(s, new Date(2026, 10, 22));
    expect(txt).toContain("=== MRUCZEK ===");
    expect(txt).toContain("Gatunek: kot");
    expect(txt).toContain("Karmienie (co, ile, kiedy):\n  karma mokra\n  rano i wieczorem");
    expect(txt).toContain("Kontakt do właściciela: Anna");
    expect(txt).not.toContain("Leki:");
    expect(txt).not.toContain("UWAGI AWARYJNE");
    expect(txt).toMatch(/zgodnie z zaleceniami lekarza weterynarii/);
  });

  it("nienazwane zwierzęta dostają numer", () => {
    const s = emptySheet();
    s.animals.push(emptyAnimal());
    const txt = sheetToText(s);
    expect(txt).toContain("=== ZWIERZĘ 1 ===");
    expect(txt).toContain("=== ZWIERZĘ 2 ===");
  });

  it("nazwa pliku bez polskich znaków", () => {
    const s = emptySheet();
    expect(textFileName(s)).toBe("lista-dla-opiekuna.txt");
    s.animals[0].name = "Łatka Żółta";
    s.animals.push({ ...emptyAnimal(), name: "Ćma" });
    expect(textFileName(s)).toBe("lista-dla-opiekuna-latka-zolta-cma.txt");
  });
});
