export const vagueStandaloneKeywords = new Set([
  "amount",
  "atomic",
  "balance",
  "change",
  "changes",
  "chemical",
  "component",
  "components",
  "conditions",
  "constant",
  "contains",
  "creates",
  "describes",
  "different",
  "direction",
  "effect",
  "evidence",
  "factor",
  "function",
  "genetic",
  "heritable",
  "important",
  "kinetic",
  "level",
  "material",
  "model",
  "molar",
  "molecular",
  "natural",
  "needed",
  "nuclear",
  "object",
  "objects",
  "physical",
  "physiological",
  "point",
  "position",
  "potential",
  "primary",
  "principle",
  "process",
  "processes",
  "property",
  "provides",
  "rate",
  "relationship",
  "specific",
  "standard",
  "state",
  "structural",
  "structure",
  "substance",
  "surface",
  "system",
  "thing",
  "things",
  "used",
]);

type KeywordTopic = {
  id: string;
  keywords: string[];
};

export function assertSpecificKeywordSets(topics: KeywordTopic[]) {
  for (const topic of topics) {
    const normalised = topic.keywords.map((keyword) => keyword.trim().toLowerCase());
    if (normalised.some((keyword) => vagueStandaloneKeywords.has(keyword))) {
      const vague = normalised.filter((keyword) => vagueStandaloneKeywords.has(keyword));
      throw new Error(`${topic.id} contains vague standalone keywords: ${vague.join(", ")}.`);
    }
    if (new Set(normalised).size !== normalised.length) {
      throw new Error(`${topic.id} contains duplicate keywords.`);
    }
    if (normalised.length < 16) {
      throw new Error(`${topic.id} needs at least 16 topic-specific keywords.`);
    }
  }
}
