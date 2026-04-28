// Source of truth for the supplier questionnaire fields in this section.
// Edit this file (not data/supplier-questionnaire.json) and run
// `bun run build:json` to regenerate the published JSON artefact.

import type { SupplierField } from "../schema";

export const managedServicesFields: SupplierField[] = [
  {
    id: "managedPrivilegedAccessMgmt",
    section: "managed_services",
    type: "boolean",
    label: { en: "Privileged access management (PAM) in place", de: "Privileged Access Management (PAM) im Einsatz" },
    description: {
      en: "BSI IT-Grundschutz ORP.4.A26 — PAM for administrative remote access.",
      de: "BSI IT-Grundschutz ORP.4.A26 — PAM für administrativen Fernzugriff.",
    },
    legalBasis: "BSI IT-Grundschutz ORP.4.A26",
    bsiBausteine: ["BES.5.A7"],
    required: true,
    visibleWhen: { field: "isManagedService", equals: true },
  },
  {
    id: "managedSessionRecording",
    section: "managed_services",
    type: "boolean",
    label: { en: "Admin sessions are recorded", de: "Admin-Sitzungen werden aufgezeichnet" },
    description: {
      en: "BSI IT-Grundschutz OPS.1.2.5.A11 — recorded remote maintenance sessions.",
      de: "BSI IT-Grundschutz OPS.1.2.5.A11 — aufgezeichnete Fernwartungssitzungen.",
    },
    legalBasis: "BSI IT-Grundschutz OPS.1.2.5.A11",
    bsiBausteine: ["BES.5.A4"],
    required: true,
    visibleWhen: { field: "isManagedService", equals: true },
  },
  {
    id: "managedOnCall24x7",
    section: "managed_services",
    type: "boolean",
    label: { en: "24/7 on-call coverage", de: "24/7-Bereitschaft" },
    description: {
      en: "BSI IT-Grundschutz DER.2.1 — incident detection and response coverage.",
      de: "BSI IT-Grundschutz DER.2.1 — Erkennungs- und Reaktionsabdeckung für Vorfälle.",
    },
    legalBasis: "BSI IT-Grundschutz DER.2.1",
    bsiBausteine: ["BES.5.A2"],
    required: true,
    visibleWhen: { field: "isManagedService", equals: true },
  },
];
