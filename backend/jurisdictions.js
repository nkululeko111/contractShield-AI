/**
 * African jurisdictions for contract analysis prompts.
 * IDs are ISO 3166-1 alpha-2 where applicable; AFRICA is a general continental lens.
 */
const DEFAULT_JURISDICTION = "ZA";

const JURISDICTIONS = [
  {
    id: "AFRICA",
    name: "Africa (general)",
    shortName: "Continental overview",
    legalFocus:
      "Apply a general African employment and commercial law lens: reference widely used principles (good faith, reasonable notice, proportionate restrictions) and OHADA where relevant for OHADA member states; cite local statutes only when tied to the selected country context.",
  },
  {
    id: "ZA",
    name: "South Africa",
    shortName: "South Africa",
    legalFocus:
      "South African law: Basic Conditions of Employment Act (BCEA), Labour Relations Act (LRA), Consumer Protection Act (CPA) where applicable, National Credit Act (NCA) for credit, POPIA for privacy, Rental Housing Act for leases. Use SA court and CCMA practice where relevant.",
  },
  {
    id: "NG",
    name: "Nigeria",
    shortName: "Nigeria",
    legalFocus:
      "Nigerian law: Labour Act, Nigerian Constitution (fair labour practices), Contract Law, FCCPC consumer protection where relevant, and applicable state laws.",
  },
  {
    id: "KE",
    name: "Kenya",
    shortName: "Kenya",
    legalFocus:
      "Kenyan law: Employment Act 2007, Constitution of Kenya 2010 (labour rights), Consumer Protection Act where relevant, and Data Protection Act for privacy clauses.",
  },
  {
    id: "GH",
    name: "Ghana",
    shortName: "Ghana",
    legalFocus:
      "Ghanaian law: Labour Act, 2003 (Act 651), Constitution, and applicable commercial and consumer regulations.",
  },
  {
    id: "EG",
    name: "Egypt",
    shortName: "Egypt",
    legalFocus:
      "Egyptian law: Labour Law No. 12 of 2003 and amendments, Civil Code, and relevant commercial regulations.",
  },
  {
    id: "MA",
    name: "Morocco",
    shortName: "Morocco",
    legalFocus:
      "Moroccan law: Labour Code (Code du travail), Dahir and civil/commercial frameworks relevant to contracts.",
  },
  {
    id: "TN",
    name: "Tunisia",
    shortName: "Tunisia",
    legalFocus:
      "Tunisian law: Labour Code and civil/commercial contract rules applicable to employment and services.",
  },
  {
    id: "SN",
    name: "Senegal",
    shortName: "Senegal",
    legalFocus:
      "Senegalese law: Labour Code, OHADA general principles for commercial matters where applicable, and local employment protections.",
  },
  {
    id: "CI",
    name: "Côte d'Ivoire",
    shortName: "Côte d'Ivoire",
    legalFocus:
      "Ivorian law: Labour Code, OHADA where applicable for commercial contracts, and local enforcement context.",
  },
  {
    id: "RW",
    name: "Rwanda",
    shortName: "Rwanda",
    legalFocus:
      "Rwandan law: Labour Law, civil law framework, and data protection where relevant.",
  },
  {
    id: "TZ",
    name: "Tanzania",
    shortName: "Tanzania",
    legalFocus:
      "Tanzanian law: Employment and Labour Relations Act, Constitution, and commercial contract principles.",
  },
  {
    id: "UG",
    name: "Uganda",
    shortName: "Uganda",
    legalFocus:
      "Ugandan law: Employment Act, Constitution, and relevant commercial and consumer frameworks.",
  },
  {
    id: "ZM",
    name: "Zambia",
    shortName: "Zambia",
    legalFocus:
      "Zambian law: Employment Code Act, Constitution, and commercial contract norms.",
  },
  {
    id: "ZW",
    name: "Zimbabwe",
    shortName: "Zimbabwe",
    legalFocus:
      "Zimbabwean law: Labour Act, Constitution, and applicable commercial regulations.",
  },
  {
    id: "BW",
    name: "Botswana",
    shortName: "Botswana",
    legalFocus:
      "Botswana law: Employment Act, Constitution, and commercial contract practice.",
  },
  {
    id: "MU",
    name: "Mauritius",
    shortName: "Mauritius",
    legalFocus:
      "Mauritian law: Employment Rights Act, Contract Act, and data protection where relevant.",
  },
  {
    id: "NA",
    name: "Namibia",
    shortName: "Namibia",
    legalFocus:
      "Namibian law: Labour Act, Constitution, and commercial contract context.",
  },
];

function getJurisdictionById(id) {
  if (!id || typeof id !== "string") return JURISDICTIONS.find((j) => j.id === DEFAULT_JURISDICTION);
  const found = JURISDICTIONS.find((j) => j.id === id.toUpperCase());
  return found || JURISDICTIONS.find((j) => j.id === DEFAULT_JURISDICTION);
}

function listForApi() {
  return JURISDICTIONS.map(({ id, name, shortName }) => ({ id, name, shortName }));
}

module.exports = {
  DEFAULT_JURISDICTION,
  JURISDICTIONS,
  getJurisdictionById,
  listForApi,
};
