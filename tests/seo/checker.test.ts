import { describe, expect, it } from "vitest";
import { DEMO_LEGACY_URLS } from "@/lib/demo/seed";
import { runSeoChecks } from "@/lib/seo/checker";
import { buildPageRegistry, createRegistry } from "@/lib/seo/page-registry";
import { SITE, demoState, row, testRegistry } from "./fixtures";

describe("runSeoChecks (MOCK, bez HTTP)", () => {
  const state = demoState();
  const reg = buildPageRegistry(state);

  it("oznacza raport jako mock", () => {
    expect(runSeoChecks(state, reg, DEMO_LEGACY_URLS, { env: "local", siteUrl: SITE }).isMock).toBe(true);
  });

  it("seed w local: brak STAGING_INDEXABLE i DEMO_INDEXABLE; wykrywa REDIRECT_TO_HOME dla karmy", () => {
    const { issues } = runSeoChecks(state, reg, DEMO_LEGACY_URLS, { env: "local", siteUrl: SITE });
    expect(issues.filter((i) => i.issue === "STAGING_INDEXABLE")).toEqual([]);
    expect(issues.filter((i) => i.issue === "DEMO_INDEXABLE")).toEqual([]);
    expect(issues.filter((i) => i.issue === "SITEMAP_CONTAINS_NONINDEXABLE")).toEqual([]);
    const home = issues.filter((i) => i.issue === "REDIRECT_TO_HOME");
    expect(home.map((i) => i.path)).toEqual(["/demo-legacy/produkt/karma-xyz-12kg"]);
    expect(home[0]!.severity).toBe("critical");
  });

  it("wykrywa DEMO_INDEXABLE dla błędnie oznaczonej strony", () => {
    const bad = createRegistry([{ path: "/firma/demo-zle", status: 200, indexable: true, demo: true, draft: false, kind: "business" }]);
    const { issues } = runSeoChecks(state, bad, [], { env: "production", siteUrl: SITE });
    expect(issues.some((i) => i.issue === "DEMO_INDEXABLE" && i.path === "/firma/demo-zle")).toBe(true);
  });

  it("wykrywa CHAIN, LOOP, TARGET_NOT_200", () => {
    const tr = testRegistry();
    const rows = [
      row({ oldPath: "/a", targetPath: "/b" }),
      row({ oldPath: "/b", targetPath: "/poradniki/demo-artykul-a" }),
      row({ oldPath: "/l1", targetPath: "/l2" }),
      row({ oldPath: "/l2", targetPath: "/l1" }),
      row({ oldPath: "/z", targetPath: "/poradniki/brak" }),
    ];
    const { issues } = runSeoChecks(state, tr, rows, { env: "production", siteUrl: SITE });
    const has = (path: string, issue: string) => issues.some((i) => i.path === path && i.issue === issue);
    expect(has("/a", "CHAIN")).toBe(true);
    expect(has("/l1", "LOOP")).toBe(true);
    expect(has("/l2", "LOOP")).toBe(true);
    expect(has("/z", "TARGET_NOT_200")).toBe(true);
  });

  it("SITEMAP_CONTAINS_NONINDEXABLE i CANONICAL_NOT_200 gdy strona jest jednocześnie źródłem redirectu", () => {
    const tr = testRegistry();
    const rows = [row({ oldPath: "/poradniki/demo-artykul-b", targetPath: "/poradniki/demo-artykul-c" })];
    const { issues } = runSeoChecks(state, tr, rows, { env: "production", siteUrl: SITE });
    expect(issues.some((i) => i.issue === "SITEMAP_CONTAINS_NONINDEXABLE" && i.path === "/poradniki/demo-artykul-b")).toBe(true);
    expect(issues.some((i) => i.issue === "CANONICAL_NOT_200" && i.path === "/poradniki/demo-artykul-b")).toBe(true);
  });

  it("SOFT_404: pusty listing (200) i stary URL z 200 przy decyzji 404/410", () => {
    const empty = demoState({ businesses: [] });
    const rows = [row({ oldPath: "/demo-legacy/old", segment: "E", proposedAction: "gone_410", targetPath: null, currentHttpStatus: 200 })];
    const { issues } = runSeoChecks(empty, buildPageRegistry(empty), rows, { env: "local", siteUrl: SITE });
    const soft = issues.filter((i) => i.issue === "SOFT_404");
    expect(soft.some((i) => i.path === "/uslugi/groomer/warszawa" && i.severity === "info")).toBe(true);
    expect(soft.some((i) => i.path === "/demo-legacy/old")).toBe(true);
  });
});
