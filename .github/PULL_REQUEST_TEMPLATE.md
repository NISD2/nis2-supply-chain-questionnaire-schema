## What this changes

<!-- One paragraph. What and why, not how. -->

## Type of change

- [ ] Wording / typo fix (patch)
- [ ] Citation correction (patch)
- [ ] BSI Baustein addition or correction (patch)
- [ ] New field (minor)
- [ ] Schema change (major)
- [ ] Tooling / CI / docs

## Checklist

- [ ] Edited the TS source in `src/fields/`, not the JSON
- [ ] Ran `bun run build:json` to regenerate `data/supplier-questionnaire.json`
- [ ] Ran `bun run generate:bsi-mapping` if `bsiBausteine` changed
- [ ] `bun test` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run check:json-in-sync` passes
- [ ] Bumped `VERSION` in `src/data.ts` and `package.json` if shipping
- [ ] Updated `CHANGELOG.md`
- [ ] If you used an LLM to draft content, disclosed in the description

## Primary-source citation

<!-- Required for any change to legalBasis or bsiBausteine. -->
<!-- Provide a stable URL to the regulation, BSI document, or ENISA publication. -->
