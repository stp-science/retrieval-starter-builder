import { seniorTopics } from "../app/year12-question-bank";
import { expandedOneWordQuestions, expandedQuestions } from "../app/year-group-expansion";

const chemistryTopics = seniorTopics.filter((topic) => topic.course === "Chemistry");

const expectedStandards = new Map([
  ["y12-chem-bonding-energy", "AS 91164"],
  ["y12-chem-organic", "AS 91165"],
  ["y12-chem-reactivity", "AS 91166"],
]);

const bannedByTopic: Record<string, RegExp[]> = {
  "y12-chem-bonding-energy": [
    /hydrogen bond|dipole-dipole|london force/i,
    /hess(?:'s)? law|entropy|gibbs|born-haber|lattice enthalpy/i,
    /brittle|brittleness/i,
  ],
  "y12-chem-organic": [
    /homologous series|reaction mechanism|carbocation/i,
    /aldehyde|ketone|ester|amide|nitrile/i,
    /hydrogen bond|dipole-dipole|london force/i,
  ],
  "y12-chem-reactivity": [
    /\bK[asp]\b|pKa|buffer|titration|solubility product/i,
    /reaction order|rate constant|maxwell-boltzmann|pure solids? and pure liquids?/i,
    /oxidation number|redox|spectator ion/i,
  ],
};

const requiredByTopic: Record<string, RegExp[]> = {
  "y12-chem-bonding-energy": [
    /ionic bond/i,
    /covalent bond/i,
    /metallic bond/i,
    /Lewis structure/i,
    /molecular shape/i,
    /polar/i,
    /solubility/i,
    /melting an endothermic|condensation an exothermic/i,
    /ΔrH/i,
    /bond enthalp/i,
  ],
  "y12-chem-organic": [
    /alkane/i,
    /alkene/i,
    /alkyne/i,
    /haloalkane/i,
    /primary amine/i,
    /carboxylic acid/i,
    /geometric isomer/i,
    /addition polymerisation/i,
    /substitution/i,
    /eliminat/i,
  ],
  "y12-chem-reactivity": [
    /collision/i,
    /activation energy/i,
    /catalyst/i,
    /dynamic equilibrium/i,
    /pressure/i,
    /Kc/i,
    /proton donor/i,
    /strong acid/i,
    /weak base/i,
    /reacts faster with a strong acid/i,
    /Kw/i,
  ],
};

const violations: string[] = [];

if (chemistryTopics.length !== expectedStandards.size) {
  violations.push(`Expected ${expectedStandards.size} Level 2 Chemistry topics; found ${chemistryTopics.length}.`);
}

for (const topic of chemistryTopics) {
  const expectedStandard = expectedStandards.get(topic.id);
  if (!expectedStandard) {
    violations.push(`Unexpected Level 2 Chemistry topic: ${topic.id}.`);
    continue;
  }

  if (topic.standard !== expectedStandard) {
    violations.push(`${topic.id} should use ${expectedStandard}; found ${topic.standard}.`);
  }

  if (topic.questions.length !== 40) {
    violations.push(`${topic.id} should contain 40 questions; found ${topic.questions.length}.`);
  }

  const extensions = expandedQuestions[topic.id] ?? [];
  const oneWordExtensions = expandedOneWordQuestions[topic.id] ?? [];

  if (extensions.length !== 18) {
    violations.push(`${topic.id} should contain 18 expansion questions; found ${extensions.length}.`);
  }

  if (oneWordExtensions.length !== 12) {
    violations.push(`${topic.id} should contain 12 One Worders questions; found ${oneWordExtensions.length}.`);
  }

  const bankText = [
    ...topic.keywords,
    ...topic.questions.flatMap((question) => [question.q, question.a]),
    ...extensions.flatMap((question) => [question.q, question.a]),
    ...oneWordExtensions.flatMap((question) => [question.q, question.a]),
  ].join("\n");

  const studentFacingQuestions = [...topic.questions, ...extensions, ...oneWordExtensions];
  for (const question of studentFacingQuestions) {
    const prompt = question.q.trim();
    const isQuestion = prompt.endsWith("?");
    const isDirectInstruction = /^(?:Name|State|Describe|Explain|Give|Calculate|Write|Predict|Use)\b/i.test(prompt) && prompt.endsWith(".");
    const isCalculationSetup = /^(?:For\b|A reaction\b|Bonds broken\b)/i.test(prompt) && prompt.endsWith(".");
    if (!isQuestion && !isDirectInstruction && !isCalculationSetup) {
      violations.push(`${topic.id} contains a prompt that is not a direct retrieval question or instruction: ${question.q}`);
    }
    if (prompt.length > 190) {
      violations.push(`${topic.id} contains an overlong student prompt (${prompt.length} characters): ${question.q}`);
    }
  }

  for (const pattern of bannedByTopic[topic.id] ?? []) {
    if (pattern.test(bankText)) {
      violations.push(`${topic.id} contains out-of-scope wording matched by ${pattern}.`);
    }
  }

  for (const pattern of requiredByTopic[topic.id] ?? []) {
    if (!pattern.test(bankText)) {
      violations.push(`${topic.id} is missing required scope represented by ${pattern}.`);
    }
  }
}

if (violations.length) {
  throw new Error(`Year 12 Chemistry scope audit failed:\n${violations.join("\n")}`);
}

console.log("Year 12 Chemistry scope audit passed: 174 starter questions plus 36 One Worders variants across AS 91164, AS 91165 and AS 91166.");
