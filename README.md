# NIS2 Supplier Questionnaire

[![License: MIT + CC BY 4.0](https://img.shields.io/badge/license-MIT%20%2B%20CC%20BY%204.0-blue.svg)](./LICENSE)

**The questions a NIS2-regulated customer needs to ask their suppliers — as a typed Zod schema.** 56 fields across 6 sections, each anchored to a specific source (NIS2 Art. 21(2), CIR 2024/2690, ENISA TIG, BSI IT-Grundschutz, GDPR Art. 28). Every field is also tagged to the relevant Bausteine of the [BSI NIS-2 Lieferketten-Checkliste v1.0 (5 June 2025)](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/NIS-2/nis-2-lieferkette_grundschutz-checkliste.pdf).

Maintained by [Kardashev Catalyst UG](https://nisd2.eu) — operator of [nisd2.eu](https://nisd2.eu) — and the same questionnaire that powers the supplier portal at nisd2.eu.

Source of truth lives in [`src/fields/<section>.ts`](./src/fields/) — typed, with full TypeScript autocomplete on enums, citations, and Baustein IDs. The bundled JSON at [`data/supplier-questionnaire.json`](./data/supplier-questionnaire.json) is generated from these files for non-TS consumers.

---

## Why this exists

NIS2 Art. 21(2)(d) requires every regulated entity to assess its suppliers' cybersecurity practices. CIR 2024/2690 §5.1.2–§5.1.4 spells out what that assessment must include. ENISA TIG adds operational obligations on top.

In practice, every Mittelstand procurement team is currently:
- Inventing their own supplier questionnaire from scratch
- Sending suppliers 5 different questionnaires from 5 different customers
- Each one re-asking the same NIS2/CIR/ENISA-anchored questions in slightly different words

A single shared, openly maintained, legally-anchored questionnaire is more valuable than 1,000 vendor forks. So we're publishing ours.

---

## Why a schema, not just a JSON file

A JSON-only release is a dead artefact: nobody can validate it without re-deriving the rules, and forks drift silently. The TypeScript field files + Zod schema are alive:

- **TypeScript consumers** import the data directly and get full type safety, autocomplete on enums, and inline IDE hints.
- **Non-TS consumers** read the bundled `data/supplier-questionnaire.json` directly, or generate JSON Schema via [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema) and use it from Python, Go, Rust, Excel, anywhere.
- **Drizzle / Prisma / Kysely consumers** use `examples/drizzle-storage-reference.ts` for a suggested response-storage layer keyed to our field IDs.
- **Forks stay honest** — the JSON is regenerated from TS via `bun run build:json`; CI fails if it drifts.

### Source layout

```
src/
  schema.ts          Zod schema (the type definitions)
  fields/
    profile.ts                 17 fields
    security-practices.ts      24 fields
    saas-technical.ts           5 fields
    on-prem-technical.ts        4 fields
    pro-services.ts             3 fields
    managed-services.ts         3 fields
    index.ts                   combines them into allFields
  data.ts            wraps allFields in version + lastUpdated, validates
data/
  supplier-questionnaire.json  GENERATED — do not edit by hand
scripts/
  build-json.ts      regenerates the JSON from src/fields/*.ts
  generate-bsi-mapping.py     regenerates the BSI inverse mapping
```

### Editing fields

1. Edit the relevant `src/fields/<section>.ts` file (TypeScript, autocomplete works).
2. Run `bun run build:json` to regenerate `data/supplier-questionnaire.json`.
3. Run `bun run generate:bsi-mapping` if you changed `bsiBausteine` arrays.
4. Run `bun run validate` and `bun run typecheck` to confirm everything is consistent.

CI runs `bun run check:json-in-sync` and fails if the bundled JSON doesn't match what the TS would generate.

---

## Install

```bash
npm install @nisd2/nis2-supplier-questionnaire
# or
bun add @nisd2/nis2-supplier-questionnaire
```

Or pin to a specific commit / tag without npm:

```bash
npm install github:NISD2/nis2-supplier-questionnaire#v1.2.0
```

---

## Usage

### Render a multi-page form

```ts
import {
  supplierQuestionnaire,
  groupBySection,
  visibleFields,
} from "@nisd2/nis2-supplier-questionnaire";

const sections = groupBySection(supplierQuestionnaire);
// → Map { "profile" => [...], "security_practices" => [...], ... }

// Given the supplier's answers so far, what should we show next?
const response = { isSaas: true, isOnPrem: false };
const visible = visibleFields(supplierQuestionnaire, response);
// → only fields whose visibleWhen is satisfied (e.g. saas* fields shown, onPrem* hidden)
```

### Validate a supplier's response

```ts
import { supplierResponseSchema } from "@nisd2/nis2-supplier-questionnaire";

const response = JSON.parse(rawSubmission);
const validated = supplierResponseSchema.parse(response);
// throws on shape errors. Per-field type validation is up to your application:
// look up `field.type` in the questionnaire and validate accordingly.
```

### Generate JSON Schema for non-TS consumers

```ts
import { zodToJsonSchema } from "zod-to-json-schema";
import { supplierQuestionnaireSchema } from "@nisd2/nis2-supplier-questionnaire";

const jsonSchema = zodToJsonSchema(supplierQuestionnaireSchema, "SupplierQuestionnaire");
fs.writeFileSync("./schema.json", JSON.stringify(jsonSchema, null, 2));
```

---

## Sections

| Section                | Fields | Anchored to |
|------------------------|-------:|-------------|
| `profile`              | 17 | CIR §5.2(a), ENISA TIG §5.1.4(d), §5.2(b) |
| `security_practices`   | 24 | NIS2 Art. 21(2), CIR §5.1.x, ENISA TIG §5.1.4 TIPS |
| `saas_technical`       | 5  | BSI IT-Grundschutz OPS.2.2, ORP.4, DER.4 |
| `on_prem_technical`    | 4  | CRA, BSI IT-Grundschutz CON.8, CON.10 |
| `pro_services`         | 3  | BSI IT-Grundschutz ORP.2, ORP.3 |
| `managed_services`     | 3  | BSI IT-Grundschutz ORP.4, OPS.1.2.5, DER.2.1 |

`saas_technical`, `on_prem_technical`, `pro_services`, and `managed_services` are gated by the corresponding service-type flag in the profile section (`isSaas`, `isOnPrem`, `isProfessionalServices`, `isManagedService`). Use `visibleFields()` to render only the relevant ones.

---

## BSI NIS-2 Lieferketten-Checkliste alignment

Every field carries an optional `bsiBausteine` array tagging the [BSI NIS-2 Lieferketten-Checkliste v1.0 (5 June 2025)](https://www.bsi.bund.de/SharedDocs/Downloads/DE/BSI/NIS-2/nis-2-lieferkette_grundschutz-checkliste.pdf) Bausteine the supplier's answer helps satisfy. 56 fields cover 46 unique Bausteine across BES.* (Beschaffungsmanagement), DLS.* (Dienstleistersteuerung), ASST.* (Asset-Schnittstellen), and DEV.6 (SBOM).

Customers in Germany can use this to point an auditor at a specific BSI Baustein ID for every supplier-side answer they hold. The mapping is one-to-many: a single field may satisfy several Bausteine, and a single Baustein may be satisfied by several fields. Inverse view (Baustein → field IDs) is in [`data/bsi-lieferketten-mapping.md`](./data/bsi-lieferketten-mapping.md).

This is alignment, not certification. BSI does not endorse this repository. The Bausteine cited are pinned to v1.0 of the Lieferketten-Checkliste and will be updated when BSI revises the document.

```ts
import { supplierQuestionnaire } from "@nisd2/nis2-supplier-questionnaire";

// Every field that helps satisfy BES.4.A5 (supplier ISMS):
const fields = supplierQuestionnaire.fields.filter(
  (f) => f.bsiBausteine?.includes("BES.4.A5"),
);
```

---

## Field shape

```ts
{
  id:            "mfaEnforcedInternal"       // stable camelCase key
  section:       "security_practices"
  type:          "boolean"                   // string | text | email | phone | url | country | boolean | enum | integer
  label:         { en, de }
  description:   { en, de }                  // why this field exists, with legal context
  legalBasis:    "NIS2 Art. 21(2)(j)"        // canonical primary citation
  bsiBausteine?: ["BES.4.A4.1"]              // optional — BSI Lieferketten-Checkliste IDs satisfied
  required:      true
  visibleWhen:   { field: "isSaas", equals: true }  // optional — gates section visibility
  options?:      [{ value, label: { en, de } }]     // type=enum only
}
```

The full Zod schema is in [`src/schema.ts`](./src/schema.ts).

---

## What this is NOT

- **Not legal advice.** Structured guidance based on our reading of NIS2, CIR 2024/2690, ENISA TIG, and BSI IT-Grundschutz. Consult qualified counsel.
- **Not a certification scheme.** Answering "yes" to every question does not make a supplier compliant — it makes them claim compliance. Verification is the customer's responsibility.
- **Not exhaustive.** Sector-specific obligations (KRITIS, energy, telecommunications, healthcare) may add fields. Pull requests welcome.

---

## Contributing

PRs welcome. We are particularly interested in:

- **Corrections to `legalBasis`** — if you read a directive article differently, open a PR with a primary-source citation. Press articles alone are not sufficient.
- **Additional translations** — French, Italian, Spanish, etc. Extend `localisedString` to `{ en, de, fr, it, es }` (breaking change, target a `2.0.0` release).
- **Sector extensions** — KRITIS-specific fields, healthcare patient-data fields, energy SCADA fields. Deliver as separate sections that compose with the base 6.
- **Type refinements** — currently most "yes/no/details" fields are split into `boolean` + a separate `text` field gated on the boolean. If you have a cleaner pattern, propose it.

For substantial changes please open an issue first.

---

## Versioning

`supplier-questionnaire.json#version` follows semver:

- **Major** — breaking schema change (field added/removed/renamed, enum values changed, type changes)
- **Minor** — fields or sections added; existing items unchanged
- **Patch** — wording fixes, clarifications, legal-basis corrections

Older versions remain reachable via git tags.

---

## Related

- **Companion repo:** [NISD2/nis2-gap-assessment](https://github.com/NISD2/nis2-gap-assessment) — open NIS2 gap assessment under the same Zod-first model.
- **Live tool:** [nisd2.eu](https://nisd2.eu) — supplier portal, gap assessment, NIS2 timeline, registration portals tracker.
- **Source legislation:**
  - [Directive (EU) 2022/2555 (NIS2)](https://eur-lex.europa.eu/eli/dir/2022/2555/oj)
  - [Commission Implementing Regulation (EU) 2024/2690](https://eur-lex.europa.eu/eli/reg_impl/2024/2690/oj)
  - [ENISA Technical Implementation Guidance](https://www.enisa.europa.eu/publications/nis2-technical-implementation-guidance)
  - [BSI IT-Grundschutz](https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html)

---

## Licence

Dual: **MIT** for code, **CC BY 4.0** for content. See [LICENSE](./LICENSE).

Substantive issues / partnership questions: [contact@nisd2.eu](mailto:contact@nisd2.eu).
