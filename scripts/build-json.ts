/**
 * Regenerate data/supplier-questionnaire.json from src/fields/*.ts.
 *
 * The TypeScript field files are the source of truth. This script writes
 * the JSON artefact that ships to non-TS consumers.
 *
 * Run after editing any src/fields/*.ts:
 *   bun run build:json
 *
 * CI runs this script and fails if the JSON in the working tree doesn't
 * match the generated output (drift detection).
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { supplierQuestionnaire } from "../src/data";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "data", "supplier-questionnaire.json");

const out = JSON.stringify(supplierQuestionnaire, null, 2) + "\n";
writeFileSync(outPath, out);

console.log(
  `OK: wrote ${outPath} (${supplierQuestionnaire.fields.length} fields, v${supplierQuestionnaire.version})`,
);
