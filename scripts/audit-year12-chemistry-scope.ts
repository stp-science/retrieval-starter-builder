import { seniorTopics } from "../app/year12-question-bank";

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

  const bankText = [
    ...topic.keywords,
    ...topic.questions.flatMap((question) => [question.q, question.a]),
  ].join("\n");

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

console.log("Year 12 Chemistry scope audit passed: 120 questions across AS 91164, AS 91165 and AS 91166.");
