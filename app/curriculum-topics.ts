import { topicsPart0, visualsPart0 } from "./curriculum-data/part-0";
import { topicsPart1, visualsPart1 } from "./curriculum-data/part-1";
import { topicsPart2, visualsPart2 } from "./curriculum-data/part-2";
import { topicsPart3, visualsPart3 } from "./curriculum-data/part-3";
import { topicsPart4, visualsPart4 } from "./curriculum-data/part-4";
import { topicsPart5, visualsPart5 } from "./curriculum-data/part-5";
import { topicsPart6, visualsPart6 } from "./curriculum-data/part-6";
import { topicsPart7, visualsPart7 } from "./curriculum-data/part-7";
import { topicsPart8, visualsPart8 } from "./curriculum-data/part-8";
import { topicsPart9, visualsPart9 } from "./curriculum-data/part-9";
import { topicsPart10, visualsPart10 } from "./curriculum-data/part-10";
import { topicsPart11, visualsPart11 } from "./curriculum-data/part-11";
import { topicsPart12, visualsPart12 } from "./curriculum-data/part-12";
import { topicsPart13, visualsPart13 } from "./curriculum-data/part-13";
import { topicsPart14, visualsPart14 } from "./curriculum-data/part-14";

export type CurriculumQuestion = {
  q: string;
  a: string;
  difficulty: "foundation" | "core" | "stretch";
  kind: "short" | "explain";
};

export type CurriculumTopic = {
  id: string;
  year: 7 | 8 | 9;
  name: string;
  strand: "Biology" | "Chemistry" | "Physics";
  keywords: string[];
  questions: CurriculumQuestion[];
};

export type CurriculumVisual = {
  symbol: string;
  answer: string;
};

const rawCurriculumTopics: CurriculumTopic[] = [
  ...topicsPart0,
  ...topicsPart1,
  ...topicsPart2,
  ...topicsPart3,
  ...topicsPart4,
  ...topicsPart5,
  ...topicsPart6,
  ...topicsPart7,
  ...topicsPart8,
  ...topicsPart9,
  ...topicsPart10,
  ...topicsPart11,
  ...topicsPart12,
  ...topicsPart13,
  ...topicsPart14,
] as CurriculumTopic[];

const keywordRefinements: Record<string, Record<string, string>> = {
  "y7-material-properties": {
    material: "material type", property: "material property", conductor: "electrical conductor",
    insulator: "electrical insulator", deformation: "material deformation", suitability: "material suitability",
    evidence: "test evidence",
  },
  "y7-particle-model": {
    solid: "solid state", liquid: "liquid state", gas: "gas state", particle: "particle model",
    arrangement: "particle arrangement", spacing: "particle spacing", motion: "particle motion",
    attraction: "particle attraction",
  },
  "y7-thermal-energy": {
    transfer: "thermal energy transfer", conduction: "thermal conduction", radiation: "thermal radiation",
    infrared: "infrared radiation", conductor: "thermal conductor", insulator: "thermal insulator",
    density: "fluid density", expand: "thermal expansion", contract: "thermal contraction",
    equilibrium: "thermal equilibrium", warmer: "warmer region", cooler: "cooler region",
  },
  "y7-diffusion": {
    particle: "particle model", concentration: "particle concentration", oxygen: "oxygen diffusion",
    "carbon dioxide": "carbon-dioxide diffusion", equilibrium: "diffusion equilibrium",
    model: "diffusion model", evidence: "diffusion evidence",
  },
  "y7-cellular-respiration": {
    water: "respiration water product", cell: "cell respiration", movement: "muscle movement",
    growth: "cell growth", repair: "tissue repair", plant: "plant respiration", breathing: "ventilation",
  },
  "y7-deformation-friction": {
    force: "applied force", push: "pushing force", pull: "pulling force", elastic: "elastic deformation",
    permanent: "permanent deformation",
  },
  "y7-rocks-minerals": {
    property: "mineral property",
  },
  "y8-mixtures": {
    component: "mixture component", homogeneous: "homogeneous mixture", heterogeneous: "heterogeneous mixture",
    dissolve: "dissolving", dilute: "dilute solution",
  },
  "y8-solubility": {
    saturated: "saturated solution", unsaturated: "unsaturated solution", temperature: "solution temperature",
  },
  "y8-reproduction": {
    variation: "genetic variation",
  },
  "y8-static-electricity": {
    charged: "charged object", neutral: "neutral object", attract: "electrostatic attraction",
    repel: "electrostatic repulsion", current: "electric current", voltage: "potential difference",
    resistance: "electrical resistance",
  },
  "y8-chemical-changes": {
    property: "substance property", indicator: "reaction indicator", gas: "gas formation",
    reversible: "reversible change", irreversible: "irreversible change", evidence: "reaction evidence",
    variable: "experimental variable", reliability: "result reliability", conclusion: "evidence-based conclusion",
  },
  "y8-genetic-material": {
    trait: "inherited trait", variation: "genetic variation", offspring: "offspring inheritance",
    parent: "parent organism", environment: "environmental influence",
  },
  "y8-pressure": {
    force: "applied force", area: "contact area", sharp: "sharp edge", blunt: "blunt edge",
    evidence: "pressure evidence",
  },
  "y8-adaptation-evolution": {
    variation: "genetic variation", population: "breeding population", DNA: "DNA variation",
    environment: "selection environment", survival: "differential survival", generation: "successive generation",
    frequency: "allele frequency", evidence: "evolution evidence",
  },
  "y9-elements-compounds": {
    symbol: "element symbol", bond: "chemical bond", formula: "chemical formula",
    subscript: "formula subscript", coefficient: "equation coefficient", lattice: "giant lattice",
    conservation: "conservation of atoms", separation: "mixture separation",
  },
  "y9-periodic-table": {
    element: "chemical element", symbol: "element symbol", group: "periodic group", period: "periodic period",
    prediction: "property prediction", trend: "periodic trend",
  },
  "y9-traits": {
    trait: "organism trait", inherited: "inherited factor", variation: "phenotypic variation",
    evidence: "trait evidence",
  },
  "y9-reactions": {
    evidence: "reaction evidence",
  },
  "y9-forces": {
    force: "applied force", magnitude: "force magnitude", direction: "force direction",
    balanced: "balanced forces", unbalanced: "unbalanced forces", mass: "inertial mass",
    newton: "force unit newton",
  },
  "y9-pressure-fluids": {
    fluid: "fluid medium", model: "pressure model", float: "floating object", sink: "sinking object",
    liquid: "liquid pressure", gas: "gas pressure",
  },
  "y9-transport-plants": {
    root: "plant root", stem: "plant stem", leaf: "plant leaf", source: "source tissue", sink: "sink tissue",
  },
  "y9-spheres-earth": {
    interaction: "sphere interaction", nitrogen: "atmospheric nitrogen", oxygen: "atmospheric oxygen",
  },
  "y9-ecosystems": {
    individual: "individual organism", distribution: "species distribution", abundance: "population abundance",
    stability: "ecosystem stability", disturbance: "ecological disturbance", restoration: "ecosystem restoration",
  },
};

const questionRefinements: Record<
  string,
  Record<string, Pick<CurriculumQuestion, "q" | "a">>
> = {
  "y7-deformation-friction": {
    "Why might a heavier object not always deform a surface more?": {
      q: "Why might a heavier object not always deform a surface more?",
      a: "Deformation also depends on the material and how the force is applied.",
    },
    "Why is 'a force is needed to keep an object moving' not always correct?": {
      q: "Why is 'a force is needed to keep an object moving' not always correct?",
      a: "Opposing forces can have a balanced resultant effect while an object continues to move.",
    },
    "How can friction be reduced between moving machine parts?": {
      q: "Why is more friction not always helpful?",
      a: "Extra friction can make movement harder and produce more heating.",
    },
  },
  "y7-cellular-respiration": {
    "Does respiration occur in unicellular organisms?": {
      q: "Which scientist is named in the guide for early work linking plants and air?",
      a: "Joseph Priestley",
    },
    "Why is respiration essential for a unicellular organism?": {
      q: "Why can healing increase a cell's demand for respiration?",
      a: "Repair processes need chemical energy released by respiration.",
    },
  },
  "y8-genetic-material": {
    "Why is variation important in a population?": {
      q: "Why are inheritance patterns not perfectly predictable?",
      a: "Offspring inherit unique combinations of genetic material, so traits show variation and chance patterns.",
    },
  },
  "y9-periodic-table": {
    "What does atomic number represent?": {
      q: "What is one piece of information shown in an element's periodic-table box?",
      a: "Its element symbol or atomic number",
    },
    "Why do elements in the same group show similar chemical properties?": {
      q: "How does Group 17 reactivity change down the group?",
      a: "It decreases.",
    },
  },
};

export const curriculumTopics: CurriculumTopic[] = rawCurriculumTopics.map((topic) => ({
  ...topic,
  keywords: topic.keywords.map((keyword) => keywordRefinements[topic.id]?.[keyword] ?? keyword),
  questions: topic.questions.map((question) => ({
    ...question,
    ...(questionRefinements[topic.id]?.[question.q] ?? {}),
  })),
}));

export const curriculumVisuals: Record<string, CurriculumVisual[]> = Object.assign(
  {},
  visualsPart0,
  visualsPart1,
  visualsPart2,
  visualsPart3,
  visualsPart4,
  visualsPart5,
  visualsPart6,
  visualsPart7,
  visualsPart8,
  visualsPart9,
  visualsPart10,
  visualsPart11,
  visualsPart12,
  visualsPart13,
  visualsPart14,
);
