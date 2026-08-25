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
  Record<string, Partial<Pick<CurriculumQuestion, "q" | "a" | "kind">>>
> = {
  "y7-material-properties": {
    "How is hardness defined in this topic?": {
      q: "What is hardness as a material property?",
      a: "Resistance to scratching or denting.",
    },
  },
  "y7-thermal-energy": {
    "Name one source of thermal energy studied in this topic.": {
      q: "Name one source that can increase an object's thermal energy.",
      a: "For example, the Sun, fire, friction or an electric heater.",
    },
  },
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
      q: "Which scientist used experiments with plants and burning candles to investigate changes in air?",
      a: "Joseph Priestley.",
    },
    "Why is respiration essential for a unicellular organism?": {
      q: "Why can healing increase a cell's demand for respiration?",
      a: "Repair processes need chemical energy released by respiration.",
    },
  },
  "y8-mixtures": {
    "What is crystallisation used for in this topic?": {
      q: "What is crystallisation used for when separating a solution?",
      a: "Recovering a dissolved solid as crystals from the solution.",
    },
  },
  "y8-solubility": {
    "What should be done with an anomalous solubility result?": {
      q: "What should you do with an anomalous result when calculating a mean?",
      a: "Investigate it and repeat the measurement if possible. Exclude it from the mean only when there is evidence that it is invalid, and state what you did.",
    },
  },
  "y8-reproduction": {
    "How many parents are involved in sexual reproduction?": {
      q: "Why does sexual reproduction usually produce genetically varied offspring?",
      a: "Genetic information from two parents is combined during fertilisation.",
    },
    "How many parents are needed for asexual reproduction?": {
      q: "Why are offspring produced by asexual reproduction usually genetically identical to their parent?",
      a: "They are produced from one parent without the fusion of gametes.",
    },
  },
  "y8-static-electricity": {
    "What is the unit of voltage?": {
      q: "What is the unit of potential difference (voltage)?",
      a: "The volt (V).",
    },
  },
  "y8-chemical-changes": {
    "What does irreversible mean?": {
      q: "What is a reversible chemical reaction?",
      a: "A reaction in which the products can react to form the original reactants.",
    },
    "What does reversible mean?": {
      q: "What is a reversible change?",
      a: "A change that can be reversed to recover the original substance or state.",
    },
  },
  "y8-genetic-material": {
    "Why is variation important in a population?": {
      q: "Why are inheritance patterns not perfectly predictable?",
      a: "Offspring inherit unique combinations of genetic material, so traits show variation and chance patterns.",
    },
  },
  "y8-digestive-system": {
    "Name the seven components of a balanced diet in this topic.": {
      q: "Name the seven components of a balanced diet.",
      a: "Carbohydrates, fats, proteins, vitamins, minerals, fibre and water.",
    },
  },
  "y8-stars-planets": {
    "What criteria define a planet in this topic?": {
      q: "State three criteria used to classify an object as a planet.",
      a: "It orbits a star, is roughly spherical and has cleared most debris from its orbital path.",
    },
  },
  "y8-pressure": {
    "If the area doubles and force stays constant, what happens to pressure?": {
      q: "What does the speed of an object tell you?",
      a: "How much distance the object travels in a given time.",
    },
    "If force and area both double, what happens to pressure?": {
      q: "Write the equation used to calculate speed.",
      a: "Speed = distance ÷ time.",
    },
    "What does contact area mean?": {
      q: "What is the standard unit of speed?",
      a: "Metres per second (m/s).",
    },
    "Why is tool shape important?": {
      q: "A runner travels 100 m in 20 s. Calculate the runner's average speed.",
      a: "5 m/s.",
    },
    "How does a rolling pin reduce pressure compared with a thin edge?": {
      q: "A cyclist travels 240 m in 60 s. Calculate the cyclist's average speed.",
      a: "4 m/s.",
    },
    "Why can a hammer head create a dent?": {
      q: "A car travels at 12 m/s for 5 s. Calculate the distance travelled.",
      a: "60 m.",
    },
    "What should be kept the same when comparing two contact areas?": {
      q: "A swimmer travels 50 m at an average speed of 2 m/s. Calculate the time taken.",
      a: "25 s.",
    },
    "Why is a fair comparison needed in a pressure demonstration?": {
      q: "Two students travel the same distance. How can you decide which student moved faster?",
      a: "The student who took less time had the greater average speed.",
    },
    "What is the independent variable when comparing sharp and blunt ends under the same force?": {
      q: "What is average speed?",
      a: "The total distance travelled divided by the total time taken.",
    },
    "What is the dependent variable in a clay-dent pressure test?": {
      q: "Why can average speed hide changes in speed during a journey?",
      a: "It gives one value for the whole journey and does not show when the object sped up, slowed down or stopped.",
      kind: "explain",
    },
    "What evidence would support the claim that smaller area produces greater pressure?": {
      q: "What quantity should be plotted on the horizontal axis of a distance–time graph?",
      a: "Time.",
    },
    "Is pressure relevant only to liquids?": {
      q: "What quantity should be plotted on the vertical axis of a distance–time graph?",
      a: "Distance.",
    },
    "Why might a heavier object not always create more pressure?": {
      q: "What does a steeper line on a distance–time graph show?",
      a: "A greater speed.",
    },
    "What does 'concentrate force' mean?": {
      q: "What does a horizontal line on a distance–time graph show?",
      a: "The object is stationary because its distance is not changing.",
    },
    "What does 'spread force' mean?": {
      q: "How could you measure the average speed of a trolley in a classroom investigation?",
      a: "Measure a known distance and the time taken, then divide the distance by the time.",
    },
    "How does Year 8 solid pressure prepare students for fluid pressure?": {
      q: "Why should a speed investigation be repeated?",
      a: "Repeats help identify unusual results and make the calculated average speed more reliable.",
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
    "How are elements broadly classified in this topic?": {
      q: "What two broad categories can elements be classified into?",
      a: "Metals and non-metals.",
    },
    "Name one Group 1 element studied in this topic.": {
      q: "Name one Group 1 element.",
      a: "Lithium, sodium, potassium, rubidium or caesium.",
    },
    "Name one halogen studied in this topic.": {
      q: "Name one Group 17 element (halogen).",
      a: "Fluorine, chlorine, bromine or iodine.",
    },
  },
  "y9-forces": {
    "Name one common force used in the guide's force diagrams.": {
      q: "Name one force that could be shown on a force diagram.",
      a: "For example, an applied force, friction, weight, support force, tension or drag.",
    },
  },
  "y9-pressure-fluids": {
    "Which scientist is linked in the guide to early pressure investigations?": {
      q: "Which scientist is the SI pressure unit, the pascal, named after?",
      a: "Blaise Pascal.",
    },
  },
};

const inactiveJuniorTopicIds = new Set([
  "y8-genetic-material",
  "y8-gas-exchange",
  "y9-transport-plants",
]);

export const curriculumTopics: CurriculumTopic[] = rawCurriculumTopics
  .filter((topic) => !inactiveJuniorTopicIds.has(topic.id))
  .map((topic) => ({
    ...topic,
    name: topic.id === "y8-pressure" ? "Pressure and Speed" : topic.name,
    keywords: [
      ...topic.keywords.map((keyword) => keywordRefinements[topic.id]?.[keyword] ?? keyword),
      ...(topic.id === "y8-pressure"
        ? ["speed", "distance", "time", "average speed", "distance-time graph"]
        : []),
    ],
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
