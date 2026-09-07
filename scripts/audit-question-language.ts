import { curriculumTopics } from "../app/curriculum-topics";
import { ibTopics } from "../app/ib-question-bank";
import { extraQuestions } from "../app/question-bank";
import { scientificSkillsTopics } from "../app/scientific-skills-question-bank";
import { year10Topics } from "../app/year10-question-bank";
import { year11Topics } from "../app/year11-question-bank";
import { seniorTopics } from "../app/year12-question-bank";
import { year13Topics } from "../app/year13-question-bank";
import { expandedOneWordQuestions, expandedQuestions } from "../app/year-group-expansion";
import { clarifyQuestion, isBareYesNoQuestion } from "../app/question-clarity";

type AuditQuestion = {
  q: string;
  a: string;
  difficulty: "foundation" | "core" | "stretch";
  kind: "short" | "explain";
};

type AuditTopic = {
  id: string;
  year: number | "IB";
  name: string;
  questions: AuditQuestion[];
  oneWordQuestions?: AuditQuestion[];
};

function uniqueQuestionWording(questions: AuditQuestion[]) {
  const seen = new Set<string>();
  return questions.filter((question) => {
    const key = question.q.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const yearGroupTopics = [
  ...curriculumTopics.map((topic) => ({
    ...topic,
    questions: [...topic.questions, ...(extraQuestions[topic.id] ?? [])],
  })),
  ...year10Topics,
  ...year11Topics,
  ...seniorTopics,
  ...year13Topics,
  ...scientificSkillsTopics,
] as AuditTopic[];

const topics: AuditTopic[] = [
  ...yearGroupTopics.map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording([
      ...topic.questions,
      ...(typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
        ? []
        : (expandedQuestions[topic.id] ?? [])),
    ].filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording([
          ...topic.oneWordQuestions,
          ...(typeof topic.year === "number" && topic.year >= 7 && topic.year <= 9
            ? []
            : (expandedOneWordQuestions[topic.id] ?? [])),
        ].filter((question) => !isBareYesNoQuestion(question)).map(clarifyQuestion))
      : [],
  })),
  ...(ibTopics as AuditTopic[]).map((topic) => ({
    ...topic,
    questions: uniqueQuestionWording(topic.questions.map(clarifyQuestion)),
    oneWordQuestions: topic.oneWordQuestions?.length
      ? uniqueQuestionWording(topic.oneWordQuestions.map(clarifyQuestion))
      : [],
  })),
];

const entries = topics.flatMap((topic) => [
  ...topic.questions.map((question) => ({ topic, question, bank: "main" })),
  ...(topic.oneWordQuestions ?? []).map((question) => ({ topic, question, bank: "one-word" })),
]);

const awkwardPatterns: Array<[RegExp, string]> = [
  [/without bulk movement of matter/i, "replace 'bulk movement of matter' with direct wording"],
  [/What thermal transfer occurs through/i, "name the thermal-transfer method directly"],
  [/A student is revising/i, "remove the artificial revision scenario"],
  [/What should they remember/i, "state the exact response required"],
  [/Explain the scientific role/i, "use a simpler, direct command"],
  [/helps explain/i, "use a direct explanation command"],
  [/important when studying/i, "state the scientific task directly"],
  [/Use .* to explain a key idea in/i, "state the idea students must explain"],
  [/Describe the connection between .* and (?:Atoms|Forces|Genetics|Acids|Electricity|Human Body|Earth Science)/i, "remove generic topic-link wording"],
  [/Which key term matches this description/i, "use a direct naming command"],
  [/Name the concept described as/i, "use a direct subject-specific naming command"],
  [/^(?:What|Which).+\bcalculated using\b/i, "make the equation symbol being recalled explicit"],
  [/^Define meant by\b/i, "ask what the term means in natural language"],
  [/Explain one important scientific idea about/i, "ask for a specific definition and fact"],
  [/^Which (?:charge|motion) state\b/i, "describe the physical situation before asking for the answer"],
  [/^Which (?:[a-z-]+\s+){0,3}category\b/i, "ask what type it is"],
  [/^Which connection\b/i, "ask which type of circuit or connection"],
  [/^What graph feature\b/i, "ask which part of the graph students should use"],
  [/requires matter through which/i, "ask directly whether the wave needs a medium"],
  [/^Name the (?:Biology|Chemistry|Physics) term described here\b/i, "ask directly for the subject term"],
  [/^Which (?:Biology|Chemistry|Physics) term means\b/i, "ask directly for the subject term"],
  [/^What scientific skill is described as\b/i, "ask directly what the definition is called"],
  [/^Which scientific skill is important because\b/i, "ask directly for the scientific term"],
  [/^What is the (?:Biology|Chemistry|Physics) term for\b/i, "ask directly what the definition is called"],
  [/^What (?:Biology|Chemistry|Physics) term means\b/i, "ask directly what the definition is called"],
  [/\b(?:in this topic|in the guide|named in the guide|guide's)\b/i, "remove hidden lesson or guide context"],
  [/^Define .+\b(?:used for|made from|occur|happen|contain|needed|found|measured|shown)\b/i, "use a complete natural question instead of a malformed definition"],
  [/^Answer yes or no\b/i, "replace low-thinking yes-no wording"],
];

const commandWords = "Define|State|Name|Identify|Describe|Explain|Compare|Calculate|Determine|Suggest|Justify|Evaluate|Outline|Write|Give|Classify|Predict|Select|Label|Draw|Sketch|Order|List|Complete|Use|Choose|Plot|Measure";
const directCommand = new RegExp(`^(?:${commandWords})\\b`, "i");
const contextualCommand = new RegExp(`^(?:At|In|For|When|During|Using|From|With|After|Before)\\b[^.!?]{0,160},\\s*(?:${commandWords})\\b`, "i");
const scenarioCommand = new RegExp(`^[^?]{3,180}[.!]\\s+(?:${commandWords})\\b`, "i");

const yesNoOpening = /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i;
const formulaAnswer = /[A-Za-zΔτΦωα][A-Za-z0-9_{}₀-₉()]*\s*=|=\s*[A-Za-z0-9ΔτΦωα]|→|⇌/;
const vagueFormulaPrompt = /^(?:What is|How is|How are)\b/i;
const explicitFormulaCommand = /\b(?:define|equation|relationship|related|calculate|calculated|found|link|mean|state|write|express)\b/i;

const vagueNoun = /^(?:State|Name|Identify|Describe|Explain|Write|Give|List)\s+(?:what\s+)?(?:the\s+|a\s+|an\s+)?(formula|equation|symbol|graph|diagram|value|number|direction|colour|products?|reactants?|role|function|process|method|structure|part|stage|step|trend|relationship|result|feature|factor|unit|rows?|columns?)\b/i;
const qualifier = /\b(?:of|for|when|in|from|between|that|which|where|using|on|with|to|during|after|before|under|at|by)\b/i;
const malformedSingularWhat = /\bwhat (?:a|an|the) (?:formula|arrowhead|graph|symbol|equation|indicator|force|object|cell|particle|solution|reaction|element|atom|gene|allele|chromosome|enzyme|wave|current|voltage|resistance|temperature|pressure|mass|weight|speed|velocity|acceleration) (?:tell|show|mean|represent|indicate|affect|change|act|react|move|flow|increase|decrease|depend|carry|allow|provide|cause|produce|form|require|need)\b/i;
const unsupportedGraphReference = /\b(?:the|this) graph\b/i;
const graphQualifier = /\bgraph (?:of|showing|for|where|that|with)\b|\b(?:distance[-– ]time|velocity[-– ]time|speed[-– ]time|force[-– ]extension|solubility|cooling|heating|energy[- ]profile|bar|line|scatter|histogram) graph\b/i;
const unsupportedDiagramReference = /\b(?:the|this) diagram\b/i;
const diagramQualifier = /\b(?:particle|force|circuit|ray|energy[- ]level|energy[- ]profile|cell|wave|free[- ]body|Punnett|Venn) diagram\b|\bdiagram (?:of|showing|for|where|that|with)\b/i;
const hiddenReference = /\b(?:shown above|shown below|given above|given below|the previous question|the question above|the question below)\b/i;
const vaguePronounCommand = /^(?:State|Name|Identify|Describe|Explain)\s+(?:what|why|how)?\s*(?:it|they|this|these|those)\b/i;

const violations: string[] = [];

for (const { topic, question, bank } of entries) {
  const location = `${topic.id} (${bank})`;
  const prompt = question.q.trim();
  const answer = question.a.trim();

  if (!prompt || !answer) violations.push(`${location}: blank question or answer`);
  if (!/[?.…]$/.test(prompt)) violations.push(`${location}: missing end punctuation: ${prompt}`);

  const wordLimit = topic.year === "IB" || Number(topic.year) >= 11 ? 45 : 32;
  if (prompt.split(/\s+/).length > wordLimit) {
    violations.push(`${location}: question exceeds ${wordLimit} words: ${prompt}`);
  }

  for (const [pattern, advice] of awkwardPatterns) {
    if (pattern.test(prompt)) violations.push(`${location}: ${advice}: ${prompt}`);
  }

  if (!directCommand.test(prompt) && !contextualCommand.test(prompt) && !scenarioCommand.test(prompt)) {
    violations.push(`${location}: use an explicit command word so the question works independently: ${prompt}`);
  }

  const generic = prompt.match(vagueNoun);
  if (generic && !qualifier.test(prompt) && !/[=→⇌]/.test(prompt)) {
    violations.push(`${location}: add the missing scientific context for '${generic[1]}': ${prompt}`);
  }

  if (malformedSingularWhat.test(prompt)) {
    violations.push(`${location}: subject-verb grammar is malformed after command-word conversion: ${prompt}`);
  }

  if (unsupportedGraphReference.test(prompt) && !graphQualifier.test(prompt)) {
    violations.push(`${location}: name the type or content of the graph because no separate graph is shown: ${prompt}`);
  }

  if (unsupportedDiagramReference.test(prompt) && !diagramQualifier.test(prompt)) {
    violations.push(`${location}: name the type or content of the diagram because no separate diagram is shown: ${prompt}`);
  }

  if (hiddenReference.test(prompt)) {
    violations.push(`${location}: remove the hidden reference to material that is not displayed with the question: ${prompt}`);
  }

  if (vaguePronounCommand.test(prompt)) {
    violations.push(`${location}: replace the pronoun with the scientific object or process being asked about: ${prompt}`);
  }

  if (bank === "one-word" && yesNoOpening.test(prompt) && /^(?:yes|no)\b/i.test(answer)) {
    violations.push(`${location}: One Worders cannot use a yes/no prompt: ${prompt}`);
  }

  if (
    formulaAnswer.test(answer)
    && vagueFormulaPrompt.test(prompt)
    && !explicitFormulaCommand.test(prompt)
  ) {
    violations.push(`${location}: make it explicit that an equation is required: ${prompt}`);
  }

  if (/^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i.test(prompt) && /^(?:yes|no)\b/i.test(answer)) {
    violations.push(`${location}: state whether a yes-no response and explanation are required: ${prompt}`);
  }

  if (
    question.kind === "explain"
    && answer.split(/\s+/).length > 14
    && /^(?:What|Which)\b/i.test(prompt)
    && !/^What (?:is|are|does|should)\b/i.test(prompt)
    && !/\b(?:explain|describe|compare|justify|evaluate|calculate|state|give|name|identify)\b/i.test(prompt)
  ) {
    violations.push(`${location}: use an explicit explain, describe or state command: ${prompt}`);
  }
}

if (topics.length < 168 || entries.length < 9_000) {
  violations.push(`audit coverage unexpectedly fell to ${entries.length} prompts across ${topics.length} topics`);
}

if (violations.length) {
  throw new Error(`Question-language audit failed with ${violations.length} issue(s) across the fully rendered bank:\n${violations.join("\n")}`);
}

console.log(`Question-language audit passed: ${entries.length.toLocaleString("en-NZ")} rendered prompts across ${topics.length} topics all use explicit commands, standalone context and the grammar checks.`);
