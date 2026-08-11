import { biologyIbTopicSpecs } from "./ib-biology-data";
import { chemistryIbTopicSpecs } from "./ib-chemistry-data";
import { physicsIbTopicSpecs } from "./ib-physics-data";
import type { IbConcept, IbSubject, IbTopicSpec } from "./ib-question-types";

type Difficulty = "foundation" | "core" | "stretch";
type QuestionKind = "short" | "explain";

export type IbQuestion = {
  q: string;
  a: string;
  difficulty: Difficulty;
  kind: QuestionKind;
};

export type IbTopic = {
  id: string;
  year: "IB";
  name: string;
  course: IbSubject;
  standard: string;
  level: "SL & HL" | "HL only";
  programme: "IB";
  strand: IbSubject;
  keywords: string[];
  questions: IbQuestion[];
  oneWordQuestions: IbQuestion[];
};

export const ibSubjects: IbSubject[] = ["Biology", "Chemistry", "Physics"];

function capitalise(sentence: string) {
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

const keywordStopwords = new Set([
  "about", "absolute", "across", "active", "after", "allow", "allows", "alternative", "amount", "atomic",
  "balance", "because", "becomes", "before", "being", "between", "biological", "building", "called", "caused",
  "causes", "cellular", "change", "changes", "chemical", "circular", "common", "competitive", "component", "components",
  "conditions", "constant", "containing", "control", "creates", "decrease", "depends", "describes",
  "different", "direction", "directional", "during", "ecological", "effect", "electric", "equal", "evidence", "every",
  "explains", "factor", "finish", "first", "formed", "forms", "free", "function", "generally", "genetic",
  "genetically", "gravitational", "greater", "groups", "helps", "heritable", "higher", "homologous", "ideal",
  "important", "includes", "increases", "intermolecular", "involves", "kinetic", "known", "large", "level", "limiting",
  "limits", "living",
  "maintain", "material", "measured", "measures", "model", "moved", "moves", "moving", "needed", "number",
  "magnetic", "messenger", "metabolic", "molar", "molecular", "natural", "negative", "nuclear", "object", "objects",
  "occurs", "over", "pair", "perpendicular", "physical", "physiological", "point", "position", "positioned",
  "positive", "possible", "potential", "primary", "principle",
  "process", "processes", "produces", "property", "provides", "raises", "rapid", "records", "related",
  "rate", "relationship", "relative", "released", "repeating", "require", "requires", "resultant", "selective",
  "reproductive", "second", "several", "shape", "shared", "shows", "small", "specialized", "specific", "specified",
  "spontaneous", "standard", "standing", "start", "state", "stated", "structural", "structure", "substance", "surface",
  "system", "takes", "their", "therefore", "these", "thing", "things", "through", "together", "transfer",
  "transferred", "turning", "types", "under", "unit", "units", "universal", "unknown", "usable", "using",
  "where", "which", "while", "within", "without",
]);

const ibSpecs = [...biologyIbTopicSpecs, ...chemistryIbTopicSpecs, ...physicsIbTopicSpecs];

function keywordTokens(value: string) {
  return value.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [];
}

function uniqueKeywords(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const subjectKeywordVocabulary = new Map<IbSubject, Set<string>>(
  ibSubjects.map((subject) => [
    subject,
    new Set(
      ibSpecs
        .filter((topic) => topic.subject === subject)
        .flatMap((topic) => topic.concepts.flatMap(([term]) => keywordTokens(term))),
    ),
  ]),
);

const ibKeywordExtras: Partial<Record<string, string[]>> = {
  "ib-bio-a11": ["surface tension"],
  "ib-bio-a21": ["early Earth", "membrane vesicle"],
  "ib-bio-a31": ["species evenness", "taxonomic rank", "genetic diversity"],
  "ib-bio-a32": ["common ancestor", "derived character", "phylogenetic tree", "branching pattern", "DNA sequence"],
  "ib-bio-b11": ["glycosidic bond", "ester bond", "hydrolysis", "condensation reaction"],
  "ib-bio-b12": ["polypeptide chain", "amino acid sequence", "protein folding"],
  "ib-bio-b23": ["pluripotent cell", "cell lineage", "specialised cell"],
  "ib-bio-b33": ["sliding filament", "muscle contraction", "neuromuscular junction", "motor neurone", "muscle fibre"],
  "ib-bio-b41": ["ecological pressure"],
  "ib-bio-c11": ["enzyme-substrate complex"],
  "ib-bio-c21": ["endocrine gland", "target cell", "signalling pathway", "receptor binding", "hormonal response"],
  "ib-bio-c22": ["sodium channel", "potassium channel", "nerve impulse"],
  "ib-bio-c31": ["feedback loop"],
  "ib-bio-c32": ["antigen", "phagocyte", "lymphocyte", "immune memory"],
  "ib-bio-c41": ["limiting resource", "population density", "interspecific interaction", "population growth", "resource competition"],
  "ib-bio-d12": ["RNA polymerase", "peptide bond", "amino acid sequence"],
  "ib-bio-d22": ["gene activation"],
  "ib-bio-d31": ["meiosis", "zygote", "reproductive cycle", "reproductive success"],
  "ib-bio-d32": ["Punnett square", "recombination", "crossing over", "inheritance ratio", "homozygous genotype"],
  "ib-bio-d33": ["insulin", "glucagon"],
  "ib-bio-d42": ["ecological disturbance"],
  "ib-chem-s11": ["filtration", "distillation", "chromatography", "particle arrangement", "state of matter", "melting point", "boiling point"],
  "ib-chem-s12": ["proton number", "isotope abundance"],
  "ib-chem-s24": ["material properties", "molecular structure", "macroscopic property", "mechanical property", "atomic arrangement", "material performance"],
  "ib-chem-r13": ["energy density"],
  "ib-chem-r32": ["redox reaction", "half-equation", "electrode potential", "redox couple"],
  "ib-physics-a1": ["vector motion", "graph gradient", "uniform acceleration"],
  "ib-physics-a3": ["work-energy theorem", "efficiency calculation", "energy transfer"],
  "ib-physics-b3": ["molecular motion"],
  "ib-physics-b5": ["circuit junction"],
  "ib-physics-c4": ["fundamental frequency", "driven oscillation", "resonant frequency", "boundary condition"],
  "ib-physics-c3": ["path difference"],
  "ib-physics-e3": ["decay curve", "count rate", "random decay", "nuclear stability"],
};

function topicKeywords(spec: IbTopicSpec) {
  const terms = spec.concepts.map(([term]) => term);
  const termParts = terms.flatMap(keywordTokens).filter((word) => !keywordStopwords.has(word));
  const subjectVocabulary = subjectKeywordVocabulary.get(spec.subject) ?? new Set<string>();
  const supporting = spec.concepts.flatMap(([, definition, significance]) =>
    keywordTokens(`${definition} ${significance}`)
      .filter((word) => subjectVocabulary.has(word) && !keywordStopwords.has(word)),
  );
  return uniqueKeywords([...terms, ...termParts, ...supporting, ...(ibKeywordExtras[spec.id] ?? [])]).slice(0, 16);
}

function buildQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap((concept: IbConcept) => {
    const [term, definition, significance] = concept;
    return [
      {
        q: `Define ${term}.`,
        a: capitalise(definition),
        difficulty: "foundation" as const,
        kind: "explain" as const,
      },
      {
        q: `Explain the importance of ${term} in ${topic.name}.`,
        a: capitalise(significance),
        difficulty: "core" as const,
        kind: "explain" as const,
      },
      {
        q: `Define ${term} and explain why it matters in ${topic.name}.`,
        a: `${capitalise(definition)} ${capitalise(significance)}`,
        difficulty: "core" as const,
        kind: "explain" as const,
      },
      {
        q: `Complete this explanation: ${term} is important in ${topic.name} because...`,
        a: capitalise(significance),
        difficulty: "stretch" as const,
        kind: "explain" as const,
      },
    ];
  });
}

function buildOneWordQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap(([term, definition]) => [
    {
      q: `Name the ${topic.subject} term described here: ${definition}.`,
      a: term,
      difficulty: "core" as const,
      kind: "short" as const,
    },
    {
      q: `Which ${topic.subject} term means “${definition}”?`,
      a: term,
      difficulty: "core" as const,
      kind: "short" as const,
    },
  ]);
}

function makeTopic(spec: IbTopicSpec): IbTopic {
  return {
    id: spec.id,
    year: "IB",
    name: spec.name,
    course: spec.subject,
    standard: spec.code,
    level: spec.level,
    programme: "IB",
    strand: spec.subject,
    keywords: topicKeywords(spec),
    questions: buildQuestions(spec),
    oneWordQuestions: buildOneWordQuestions(spec),
  };
}

export const ibTopics: IbTopic[] = [
  ...ibSpecs,
].map(makeTopic);

const incompleteKeywordTopics = ibTopics.filter((topic) => topic.keywords.length !== 16);
if (incompleteKeywordTopics.length) {
  throw new Error(
    `IB topics require 16 subject-specific keywords: ${incompleteKeywordTopics.map((topic) => `${topic.id} (${topic.keywords.length})`).join(", ")}.`,
  );
}
