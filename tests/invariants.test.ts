import { describe, expect, test } from "bun:test";
import { supplierQuestionnaire, groupBySection, visibleFields } from "../src/data";
import { SECTION, FIELD_TYPE } from "../src/schema";

describe("schema parses", () => {
  test("loads with no errors", () => {
    expect(supplierQuestionnaire.fields.length).toBeGreaterThan(0);
    expect(supplierQuestionnaire.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("field IDs", () => {
  test("are unique", () => {
    const ids = supplierQuestionnaire.fields.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("are camelCase", () => {
    for (const field of supplierQuestionnaire.fields) {
      expect(field.id).toMatch(/^[a-z][a-zA-Z0-9]*$/);
    }
  });
});

describe("section enum", () => {
  test("every field section is a known SECTION value", () => {
    const valid = new Set<string>(Object.values(SECTION));
    for (const field of supplierQuestionnaire.fields) {
      expect(valid.has(field.section)).toBe(true);
    }
  });
});

describe("field type enum", () => {
  test("every field type is a known FIELD_TYPE value", () => {
    const valid = new Set<string>(Object.values(FIELD_TYPE));
    for (const field of supplierQuestionnaire.fields) {
      expect(valid.has(field.type)).toBe(true);
    }
  });

  test("enum-typed fields have non-empty options", () => {
    for (const field of supplierQuestionnaire.fields) {
      if (field.type === FIELD_TYPE.ENUM) {
        expect(field.options).toBeDefined();
        expect(field.options?.length ?? 0).toBeGreaterThan(0);
      } else {
        expect(field.options).toBeUndefined();
      }
    }
  });
});

describe("visibleWhen references", () => {
  test("every visibleWhen.field resolves to an existing field", () => {
    const ids = new Set(supplierQuestionnaire.fields.map((f) => f.id));
    for (const field of supplierQuestionnaire.fields) {
      if (field.visibleWhen) {
        expect(ids.has(field.visibleWhen.field)).toBe(true);
      }
    }
  });
});

describe("BSI Bausteine", () => {
  test("every Baustein ID matches the canonical pattern", () => {
    const pattern = /^[A-Z]+\.[0-9A-Z][0-9A-Z.]*$/;
    for (const field of supplierQuestionnaire.fields) {
      for (const baustein of field.bsiBausteine ?? []) {
        expect(baustein).toMatch(pattern);
      }
    }
  });

  test("supplier-specific Bausteine (BES.*, DLS.*, ASST.*, DEV.6) appear at least once", () => {
    const all = supplierQuestionnaire.fields.flatMap((f) => f.bsiBausteine ?? []);
    const prefixes = new Set(all.map((b) => b.split(".")[0]));
    for (const required of ["BES", "DLS", "ASST", "DEV"]) {
      expect(prefixes.has(required)).toBe(true);
    }
  });
});

describe("legalBasis", () => {
  test("every field cites a primary source", () => {
    const knownPrefixes = ["NIS2", "CIR", "ENISA", "BSI", "GDPR", "CRA"];
    for (const field of supplierQuestionnaire.fields) {
      const matched = knownPrefixes.some((p) => field.legalBasis.startsWith(p));
      expect(matched).toBe(true);
    }
  });
});

describe("localised strings", () => {
  test("every label and description has en + de", () => {
    for (const field of supplierQuestionnaire.fields) {
      expect(field.label.en.trim().length).toBeGreaterThan(0);
      expect(field.label.de.trim().length).toBeGreaterThan(0);
      expect(field.description.en.trim().length).toBeGreaterThan(0);
      expect(field.description.de.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("groupBySection", () => {
  test("returns a map keyed by section with every field placed once", () => {
    const grouped = groupBySection(supplierQuestionnaire);
    let total = 0;
    for (const fields of grouped.values()) {
      total += fields.length;
    }
    expect(total).toBe(supplierQuestionnaire.fields.length);
  });
});

describe("visibleFields", () => {
  test("returns fields with no visibleWhen plus those whose condition holds", () => {
    const response = { isSaas: true, isOnPrem: false };
    const visible = visibleFields(supplierQuestionnaire, response);
    const visibleIds = new Set(visible.map((f) => f.id));

    expect(visibleIds.has("legalName")).toBe(true);
    for (const field of supplierQuestionnaire.fields) {
      if (field.visibleWhen?.field === "isOnPrem" && field.visibleWhen.equals === true) {
        expect(visibleIds.has(field.id)).toBe(false);
      }
    }
  });
});
