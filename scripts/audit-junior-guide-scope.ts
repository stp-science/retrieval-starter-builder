import { curriculumTopics } from "../app/curriculum-topics";
import { juniorGuideSupplementQuestions } from "../app/junior-guide-supplements";

const expectedTopicIds = new Set([
  "y7-material-properties",
  "y7-particle-model",
  "y7-cells",
  "y7-thermal-energy",
  "y7-diffusion",
  "y7-cellular-respiration",
  "y7-deformation-friction",
  "y7-photosynthesis",
  "y7-ecosystem-interactions",
  "y7-rocks-minerals",
  "y8-mixtures",
  "y8-solubility",
  "y8-reproduction",
  "y8-static-electricity",
  "y8-chemical-changes",
  "y8-genetic-material",
  "y8-digestive-system",
  "y8-gas-exchange",
  "y8-pressure",
  "y8-adaptation-evolution",
  "y8-stars-planets",
  "y9-elements-compounds",
  "y9-periodic-table",
  "y9-traits",
  "y9-reactions",
  "y9-forces",
  "y9-pressure-fluids",
  "y9-transport-humans",
  "y9-transport-plants",
  "y9-spheres-earth",
  "y9-ecosystems",
]);

const disallowedContent: Record<string, RegExp[]> = {
  "y7-material-properties": [
    /\btransparent|translucent|opaque|absorbent|waterproof\b/i,
    /\bdensity|magnetic|corrosion|malleab/i,
  ],
  "y7-particle-model": [
    /\bdiffusion|concentration gradient|perfume|food colou?r\b/i,
    /\bgas pressure|collid(?:e|ing) with the walls\b/i,
  ],
  "y7-cells": [
    /\bbiconcave|haemoglobin|sperm cell|nerve cell\b/i,
    /\bmuscle fibres|single lines?\b/i,
  ],
  "y7-deformation-friction": [
    /\bnet force|constant velocity|lubrication|bearings\b/i,
  ],
  "y7-cellular-respiration": [
    /\bunicellular\b/i,
  ],
  "y7-thermal-energy": [
    /\baverage kinetic energy|mobile electrons?|emergency blanket\b/i,
    /\bloft insulation|double glazing|curtains?|wool jumper\b/i,
  ],
  "y8-mixtures": [
    /\bdistillation|distillate|chromatograph/i,
    /\bmagnetism|magnetic separation\b/i,
  ],
  "y8-solubility": [
    /\bsupersaturat|nucleation|seed crystal\b/i,
  ],
  "y8-reproduction": [
    /\bacrosome|nutrient-rich cytoplasm|\bFSH\b|\bLH\b/i,
  ],
  "y8-genetic-material": [
    /\bselection can act|natural selection\b/i,
  ],
  "y8-chemical-changes": [
    /\bword equation|balanced equation|activation energy|catalyst\b/i,
    /\bcombustion|conservation of atoms\b/i,
  ],
  "y9-periodic-table": [
    /\bprotons?|neutrons?|electrons?|electron shells?\b/i,
  ],
  "y9-traits": [
    /\balleles?|dominant|recessive|homozygous|heterozygous\b/i,
    /\bPunnett|genotype\b/i,
  ],
  "y9-reactions": [
    /\bcatalysts?|activation energy|collision theory\b/i,
    /\breaction rate|rate of reaction|successful collisions?\b/i,
  ],
  "y9-forces": [
    /\bgravitational field strength|weight = mass|the Moon\b/i,
    /\bdrag|streamlining|terminal velocity\b/i,
  ],
  "y9-pressure-fluids": [
    /\bp\s*=\s*f|force acting per unit area|newton per square metre/i,
    /\bsnowshoes?|hydraulic|barometer|100,?000\s*Pa\b/i,
    /\baverage density|displace(?:d|ment)?\b/i,
  ],
};

const juniorTopics = curriculumTopics.filter(
  (topic) => topic.year >= 7 && topic.year <= 9,
);

const actualTopicIds = new Set(juniorTopics.map((topic) => topic.id));
if (
  actualTopicIds.size !== expectedTopicIds.size ||
  [...expectedTopicIds].some((topicId) => !actualTopicIds.has(topicId))
) {
  throw new Error(
    `Expected the 31 guide-backed Years 7-9 topics; found ${[
      ...actualTopicIds,
    ].join(", ")}.`,
  );
}

for (const topic of juniorTopics) {
  const supplement = juniorGuideSupplementQuestions[topic.id] ?? [];
  const finalQuestions = [...topic.questions, ...supplement];
  const uniqueWording = new Set(
    finalQuestions.map((question) => question.q.trim().toLowerCase()),
  );

  if (topic.questions.length === 8 && supplement.length !== 32) {
    throw new Error(
      `${topic.id} needs 32 guide-aligned supplement questions; found ${supplement.length}.`,
    );
  }

  if (topic.questions.length === 40 && supplement.length !== 0) {
    throw new Error(
      `${topic.id} already has 40 guide questions and must not use a supplement.`,
    );
  }

  if (finalQuestions.length !== 40 || uniqueWording.size !== 40) {
    throw new Error(
      `${topic.id} must have 40 unique guide-aligned questions; found ${finalQuestions.length} rows and ${uniqueWording.size} unique prompts.`,
    );
  }

  for (const question of finalQuestions) {
    const searchable = `${question.q} ${question.a}`;
    for (const pattern of disallowedContent[topic.id] ?? []) {
      if (pattern.test(searchable)) {
        throw new Error(
          `${topic.id} contains out-of-guide content matching ${pattern}: ${question.q}`,
        );
      }
    }
  }
}

const unexpectedSupplements = Object.keys(juniorGuideSupplementQuestions).filter(
  (topicId) => !actualTopicIds.has(topicId),
);
if (unexpectedSupplements.length > 0) {
  throw new Error(
    `Junior guide supplements include inactive topics: ${unexpectedSupplements.join(", ")}.`,
  );
}

console.log(
  `Junior guide scope audit passed: ${juniorTopics.length} topics and ${
    juniorTopics.length * 40
  } questions checked.`,
);
