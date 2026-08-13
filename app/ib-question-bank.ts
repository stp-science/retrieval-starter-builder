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

function lowerFirst(sentence: string) {
  return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}

function stripEndPunctuation(sentence: string) {
  return sentence.trim().replace(/[?.!…]+$/, "");
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
  "ib-physics-tools-vectors": ["magnitude", "direction", "vector addition", "vector resolution", "horizontal component", "vertical component"],
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

function possessive(term: string) {
  return /s$/i.test(term) ? `${term}'` : `${term}'s`;
}

function withNamedSubject(term: string, significance: string) {
  const statement = stripEndPunctuation(significance);
  if (/^its\b/i.test(statement)) return statement.replace(/^its\b/i, possessive(term));
  if (/^it\b/i.test(statement)) return statement.replace(/^it\b/i, term);
  return statement;
}

/**
 * Builds only questions with a clear, finite retrieval target. The phrasing is
 * modelled on the short command-term style used in IB science papers: state,
 * identify, describe and explain. If a significance statement cannot be turned
 * into a precise question safely, it is omitted rather than replaced by a vague
 * "importance" or "why it matters" prompt.
 */
function specificKnowledgeQuestion(term: string, significance: string, topic: IbTopicSpec): string | null {
  const statement = stripEndPunctuation(significance);
  const named = withNamedSubject(term, significance);

  // Frequently generated physics relationships that benefit from especially
  // concise wording.
  if (/^it records both how far and in which direction an object has moved$/i.test(statement)) {
    return "State the two pieces of information given by displacement.";
  }
  if (/^its sign and direction are needed when describing motion in one or more dimensions$/i.test(statement)) {
    return "State what the sign and direction of velocity tell you about an object's motion.";
  }
  if (/^total momentum is conserved in an isolated system and is central to collision analysis$/i.test(statement)) {
    return "State the condition required for total momentum to be conserved during a collision or interaction.";
  }
  if (/^polarization is possible only for transverse waves$/i.test(statement)) {
    return "State which type of wave can be polarized.";
  }
  if (/^it is fixed by the source and remains unchanged at a boundary$/i.test(statement)) {
    return "State what determines wave frequency and what happens to frequency when a wave crosses a boundary.";
  }
  if (/^changes in kinetic energy equal the net work done on an object$/i.test(statement)) {
    return "State the relationship between the change in kinetic energy and the net work done on an object.";
  }
  if (/^it distinguishes devices that transfer the same energy in different times$/i.test(statement)) {
    return "Two devices transfer the same amount of energy in different times. State the quantity used to compare how quickly they transfer energy.";
  }
  if (/^it produces an acceleration opposite to displacement$/i.test(statement)) {
    return "State the direction of acceleration relative to displacement in simple harmonic motion.";
  }
  if (/^zero resultant force then means acceleration becomes zero even though the object continues moving$/i.test(statement)) {
    return "At terminal speed, state the resultant force and the acceleration.";
  }
  if (/^it connects period and frequency to the sinusoidal equations of motion$/i.test(statement)) {
    return "State the relationships between angular frequency, frequency and period in simple harmonic motion.";
  }
  if (/^the period depends on mass and spring constant but not amplitude$/i.test(statement)) {
    return "State the factors that determine the period of a mass-spring oscillator.";
  }
  if (/^the period depends on pendulum length and gravitational field strength$/i.test(statement)) {
    return "State the factors that determine the period of a simple pendulum.";
  }

  // Explicit cause/reason relationships map naturally to the IB command term
  // "explain".
  const because = named.match(/^(.+?) because (.+)$/i);
  if (because) return `Explain why ${lowerFirst(because[1])}.`;

  const followsFrom = named.match(/^(.+?) (?:follows|follow) from (.+)$/i);
  if (followsFrom) return `Explain why ${lowerFirst(followsFrom[1])}.`;

  // Conditions and conservation statements have a single clear target.
  const conserved = named.match(/^(.+?) (?:is|are) conserved (?:when|if|in) (.+)$/i);
  if (conserved) return `State the condition under which ${lowerFirst(conserved[1])} is conserved.`;

  const condition = named.match(/^(.+?) (?:occurs|occur|happens|happen|becomes|become) when (.+)$/i);
  if (condition) return `State the condition in which ${lowerFirst(condition[1])} occurs.`;

  const depends = named.match(/^(.+?) (?:depends|depend) on (.+)$/i);
  if (depends) return `State the factors that ${lowerFirst(depends[1])} depends on.`;

  const proportional = named.match(/^(.+?) (?:is|are) (directly |inversely )?proportional to (.+)$/i);
  if (proportional) return `State how ${lowerFirst(proportional[1])} is related to ${proportional[3]}.`;

  // Questions where the answer is the object of a clear scientific verb.
  const canBeUsed = named.match(/^(.+?) can be used to (.+)$/i);
  if (canBeUsed) return `State what ${lowerFirst(canBeUsed[1])} can be used to determine or do.`;

  const canVerb = named.match(/^(.+?) can (.+)$/i);
  if (canVerb) return `State what ${lowerFirst(canVerb[1])} can do.`;

  const verbRelation = named.match(
    /^(.+?) (allows?|enables?|causes?|determines?|controls?|affects?|influences?|supports?|provides?|maintains?|prevents?|drives?|explains?|links?|connects?|converts?|quantifies?|identifies?|measures?|predicts?|regulates?|coordinates?|creates?|produces?|generates?|reduces?|increases?|raises?|lowers?|sets?|reveals?|transfers?|accounts for|results in) (.+)$/i,
  );
  if (verbRelation) {
    return `State what ${lowerFirst(verbRelation[1])} ${verbRelation[2].toLowerCase()}.`;
  }

  // A stated contrast is best retrieved with "describe" rather than an open
  // explanation prompt.
  const contrast = named.match(/^(.+?) while (.+)$/i);
  if (contrast) return `Describe the two contrasting features of ${term} stated in ${topic.name}.`;

  const differs = named.match(/^(.+?) (?:differs|differ) from (.+)$/i);
  if (differs) return `State how ${lowerFirst(differs[1])} differs from ${differs[2]}.`;

  // If no precise transformation is available, do not manufacture an open
  // question. The concept is still retrieved through its definition and term
  // identification questions below.
  return null;
}

function buildQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap((concept: IbConcept) => {
    const [term, definition, significance] = concept;
    const knowledgeQuestion = specificKnowledgeQuestion(term, significance, topic);

    const questions: IbQuestion[] = [
      {
        q: `Define ${term}.`,
        a: capitalise(definition),
        difficulty: "foundation",
        kind: "explain",
      },
      {
        q: `Identify the ${topic.subject.toLowerCase()} term described here: ${definition}.`,
        a: term,
        difficulty: "core",
        kind: "short",
      },
      {
        q: `State the ${topic.subject.toLowerCase()} term that means: ${definition}.`,
        a: term,
        difficulty: "core",
        kind: "short",
      },
    ];

    if (knowledgeQuestion) {
      questions.splice(1, 0, {
        q: knowledgeQuestion,
        a: capitalise(significance),
        difficulty: "stretch",
        kind: /^Explain|^Describe/i.test(knowledgeQuestion) ? "explain" : "short",
      });
    }

    return questions;
  });
}

function buildOneWordQuestions(topic: IbTopicSpec): IbQuestion[] {
  return topic.concepts.flatMap(([term, definition]) => [
    {
      q: `Identify the ${topic.subject.toLowerCase()} term described here: ${definition}.`,
      a: term,
      difficulty: "core" as const,
      kind: "short" as const,
    },
    {
      q: `State the ${topic.subject.toLowerCase()} term that means: ${definition}.`,
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

const vagueIbQuestionPatterns = [
  /explain the importance of/i,
  /why it matters/i,
  /is important in .+ because/i,
  /complete this explanation/i,
  /one specific effect, relationship or use/i,
  /one specific relationship involving/i,
];

const vagueIbQuestions = ibTopics.flatMap((topic) =>
  [...topic.questions, ...topic.oneWordQuestions]
    .filter((question) => vagueIbQuestionPatterns.some((pattern) => pattern.test(question.q)))
    .map((question) => `${topic.id}: ${question.q}`),
);
if (vagueIbQuestions.length) {
  throw new Error(`IB questions contain vague classroom wording: ${vagueIbQuestions.join(" | ")}`);
}

for (const topic of ibTopics) {
  if (topic.questions.length < 18) {
    throw new Error(`${topic.id} needs at least 18 clear retrieval questions; found ${topic.questions.length}.`);
  }
  const seen = new Set<string>();
  for (const question of topic.questions) {
    const normalized = question.q.trim().toLowerCase();
    if (seen.has(normalized)) throw new Error(`${topic.id} contains duplicate IB question wording: ${question.q}`);
    seen.add(normalized);
  }
}

const incompleteKeywordTopics = ibTopics.filter((topic) => topic.keywords.length !== 16);
if (incompleteKeywordTopics.length) {
  throw new Error(
    `IB topics require 16 subject-specific keywords: ${incompleteKeywordTopics.map((topic) => `${topic.id} (${topic.keywords.length})`).join(", ")}.`,
  );
}
