import { describe, expect, test } from "bun:test";
import { supplierQuestionnaire, groupBySection, visibleFields } from "../src/data";
import { FIELD_TYPE, supplierQuestionnaireSchema } from "../src/schema";

// These tests guard invariants that the Zod schema cannot express:
// uniqueness, cross-references, conditional shape, semantic content,
// and helper-function behaviour. Anything Zod already enforces (regex,
// enum membership, min-length on locales) is intentionally not covered
// here — the parse in src/data.ts would fail first.

describe("data loads", () => {
  test("schema parses and the questionnaire is non-empty", () => {
    expect(supplierQuestionnaire.fields.length).toBeGreaterThan(0);
    expect(supplierQuestionnaire.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe("uniqueness", () => {
  test("field IDs are unique", () => {
    const ids = supplierQuestionnaire.fields.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("conditional shape", () => {
  test("enum-typed fields have non-empty options; non-enum fields have none", () => {
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

describe("cross-references", () => {
  test("every visibleWhen.field resolves to an existing field", () => {
    const ids = new Set(supplierQuestionnaire.fields.map((f) => f.id));
    for (const field of supplierQuestionnaire.fields) {
      if (field.visibleWhen) {
        expect(ids.has(field.visibleWhen.field)).toBe(true);
      }
    }
  });

  test("every visibleWhen.equals value matches the referenced field's type", () => {
    const fieldsById = new Map(supplierQuestionnaire.fields.map((f) => [f.id, f]));
    for (const field of supplierQuestionnaire.fields) {
      if (!field.visibleWhen) continue;
      const target = fieldsById.get(field.visibleWhen.field);
      if (!target) throw new Error("unreachable — guarded by previous test");
      const equals = field.visibleWhen.equals;
      switch (target.type) {
        case FIELD_TYPE.BOOLEAN:
          expect(typeof equals).toBe("boolean");
          break;
        case FIELD_TYPE.INTEGER:
          expect(typeof equals).toBe("number");
          break;
        case FIELD_TYPE.ENUM: {
          expect(typeof equals).toBe("string");
          const allowed = new Set((target.options ?? []).map((o) => o.value));
          expect(allowed.has(equals as string)).toBe(true);
          break;
        }
        default:
          expect(typeof equals).toBe("string");
      }
    }
  });
});

describe("BSI alignment", () => {
  test("supplier-specific Baustein families (BES, DLS, ASST, DEV) all appear at least once", () => {
    const all = supplierQuestionnaire.fields.flatMap((f) => f.bsiBausteine ?? []);
    const prefixes = new Set(all.map((b) => b.split(".")[0]));
    for (const required of ["BES", "DLS", "ASST", "DEV"]) {
      expect(prefixes.has(required)).toBe(true);
    }
  });

  test("Baustein regex rejects malformed IDs (regression)", () => {
    // The earlier /^[A-Z]+\.[0-9A-Z][0-9A-Z.]*$/ accepted trailing dots
    // like "BES.A1." Anchor-the-tail requires every dot to be followed by
    // another segment.
    const fieldShape = supplierQuestionnaire.fields[0];
    if (!fieldShape) throw new Error("no fields to derive shape from");
    const garbage = ["BES.A1.", "BES..A1", ".BES.A1", "BES", "bes.a1"];
    for (const id of garbage) {
      const result = supplierQuestionnaireSchema.safeParse({
        version: supplierQuestionnaire.version,
        lastUpdated: supplierQuestionnaire.lastUpdated,
        fields: [{ ...fieldShape, bsiBausteine: [id] }],
      });
      expect(result.success).toBe(false);
    }
  });
});

describe("helpers", () => {
  test("groupBySection places every field in exactly one section bucket", () => {
    const grouped = groupBySection(supplierQuestionnaire);
    let total = 0;
    for (const fields of grouped.values()) {
      total += fields.length;
    }
    expect(total).toBe(supplierQuestionnaire.fields.length);
  });

  test("visibleFields hides fields whose condition does not hold", () => {
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
