// Source of truth for the supplier questionnaire fields in this section.
// Edit this file (not data/supplier-questionnaire.json) and run
// `bun run build:json` to regenerate the published JSON artefact.

import type { SupplierField } from "../schema";

export const proServicesFields: SupplierField[] = [
  {
    id: "proServicesBackgroundCheckScope",
    section: "pro_services",
    type: "string",
    label: { en: "Background check scope", de: "Umfang der Zuverlässigkeitsprüfung" },
    description: {
      en: "BSI IT-Grundschutz ORP.2.A14 — staff vetting for sensitive roles.",
      de: "BSI IT-Grundschutz ORP.2.A14 — Personalprüfung für sensible Rollen.",
    },
    legalBasis: "BSI IT-Grundschutz ORP.2.A14",
    bsiBausteine: ["BES.4.A7"],
    required: true,
    visibleWhen: { field: "isProfessionalServices", equals: true },
  },
  {
    id: "proServicesNdaInPlace",
    section: "pro_services",
    type: "boolean",
    label: { en: "NDA in place with all consultants", de: "NDA mit allen Beratern abgeschlossen" },
    description: {
      en: "BSI IT-Grundschutz ORP.2.A2 — confidentiality agreements with all consultants.",
      de: "BSI IT-Grundschutz ORP.2.A2 — Vertraulichkeitsvereinbarungen mit allen Beratern.",
    },
    legalBasis: "BSI IT-Grundschutz ORP.2.A2",
    bsiBausteine: ["BES.5.A12"],
    required: true,
    visibleWhen: { field: "isProfessionalServices", equals: true },
  },
  {
    id: "proServicesCustomerPremisesPolicy",
    section: "pro_services",
    type: "boolean",
    label: { en: "Documented customer-premises behaviour policy", de: "Dokumentierte Verhaltensrichtlinie auf Kundenstandort" },
    description: {
      en: "BSI IT-Grundschutz ORP.3.A4 — security awareness on customer premises.",
      de: "BSI IT-Grundschutz ORP.3.A4 — Sicherheitssensibilisierung auf Kundenstandort.",
    },
    legalBasis: "BSI IT-Grundschutz ORP.3.A4",
    bsiBausteine: ["BES.5.A7"],
    required: true,
    visibleWhen: { field: "isProfessionalServices", equals: true },
  },
];
