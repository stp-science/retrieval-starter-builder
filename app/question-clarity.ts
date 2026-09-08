import { commandWordPrompts } from "./command-word-prompts";
import { standaloneRefinements } from "./standalone-refinements";

type QuestionLike = {
  q: string;
  a: string;
  kind: "short" | "explain";
};

export type QuestionTopicContext = {
  id: string;
  name: string;
  strand?: string;
};

const yesNoOpening = /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i;
const commandOpening = /^(?:Define|State|Name|Identify|Describe|Explain|Compare|Calculate|Determine|Suggest|Justify|Evaluate|Outline|Write|Give|Classify|Predict|Select|Label|Draw|Sketch|Order|List|Complete|Distinguish|Convert|Analyse|Design|Estimate|Derive|Link|Put|Use|Correct|Express)\b/i;
const contextualCommandOpening = /^(?:At|In|For|When|During|Using|From|With)\b[^.!?]{0,120},\s*(?:define|state|name|identify|describe|explain|compare|calculate|determine|suggest|justify|evaluate|outline|write|give|classify|predict|select|label|draw|sketch|order|list|complete|distinguish|convert|analyse|design|estimate|derive|link|put|use|correct|express)\b/i;
const linkingVerb = /^(?:is|are|was|were|contains?|controls?|describes?|allows?|provides?|measures?|has|have|uses?|causes?|produces?|forms?|shows?|tells?|means?|represents?|indicates?|links?|moves?|transports?|absorbs?|releases?|stores?|carries?|prevents?|detects?|responds?|occurs?|happens?|affects?|influences?|changes?|increases?|decreases?|requires?|needs?|gives?|determines?|defines?|identifies?|explains?|predicts?|depends?|works?|reaches?|becomes?|stays?|remains?|reacts?|travels?|flows?|falls?|rises?|equals?|acts?|must|can|will|would|should)$/i;

export function isBareYesNoQuestion(question: QuestionLike) {
  return yesNoOpening.test(question.q.trim()) && /^(?:yes|no)[.!]?$/i.test(question.a.trim());
}

function finish(value: string, mark = ".") {
  return `${value.trim().replace(/[?.!…]+$/, "")}${mark}`;
}

function lowerFirst(value: string) {
  return value ? `${value[0].toLowerCase()}${value.slice(1)}` : value;
}

function answerNeedsExplanation(answer: string) {
  return answer.trim().split(/\s+/).length > 4 || /[.;:]\s/.test(answer);
}

function applyReviewedWording<T extends QuestionLike>(question: T): T {
  const refinement = standaloneRefinements[question.q];
  if (refinement) return { ...question, ...refinement };
  const prompt = commandWordPrompts[question.q];
  return prompt ? { ...question, q: prompt } : question;
}

function thirdPersonSingular(verb: string) {
  if (/^have$/i.test(verb)) return "has";
  if (/[^aeiou]y$/i.test(verb)) return `${verb.slice(0, -1)}ies`;
  if (/(?:s|sh|ch|x|z|o)$/i.test(verb)) return `${verb}es`;
  return `${verb}s`;
}

function declarativeFromAuxiliary(auxiliary: string, rest: string) {
  const words = rest.trim().split(/\s+/);
  if (!words.length) return rest.trim();

  if (/^(?:do|does|did)$/i.test(auxiliary)) {
    const verbIndex = words.findIndex((word) => linkingVerb.test(word));
    if (verbIndex > 0) {
      const subject = words.slice(0, verbIndex).join(" ");
      const verb = words[verbIndex];
      const tail = words.slice(verbIndex + 1).join(" ");
      if (/^do$/i.test(auxiliary)) return `${subject} ${verb}${tail ? ` ${tail}` : ""}`;
      if (/^does$/i.test(auxiliary)) return `${subject} ${thirdPersonSingular(verb)}${tail ? ` ${tail}` : ""}`;
      return `${subject} did ${verb}${tail ? ` ${tail}` : ""}`;
    }
  }

  let subjectEnd = /^(?:the|a|an|this|that|these|those|its|their|his|her|our|your)$/i.test(words[0]) && words.length > 1 ? 2 : 1;
  while (words[subjectEnd] === "of" && words.length > subjectEnd + 1) subjectEnd += 2;
  const subject = words.slice(0, subjectEnd).join(" ");
  const tail = words.slice(subjectEnd).join(" ");
  return `${subject} ${auxiliary.toLowerCase()}${tail ? ` ${tail}` : ""}`;
}

function removeHiddenContext(prompt: string) {
  return prompt
    .replace(/\s+studied in this (?:year \d+ )?topic(?=[?.!]|$)/i, "")
    .replace(/\s+in this (?:year \d+ )?topic(?=[?.!]|$)/i, "")
    .replace(/\s+(?:named|listed|shown|given|used|linked) in the guide(?=[?.!]|$)/i, "")
    .replace(/\s+from the guide(?=[?.!]|$)/i, "")
    .replace(/\s+in the guide(?=[?.!]|$)/i, "")
    .replace(/\bthe guide's\b/gi, "the")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function commandify<T extends QuestionLike>(question: T): T {
  const prompt = removeHiddenContext(question.q.trim().replace(/\s+/g, " "));
  const stem = prompt.replace(/[?.!…]+$/, "");
  if (commandOpening.test(stem) || contextualCommandOpening.test(stem)) {
    return prompt === question.q ? question : { ...question, q: prompt };
  }

  const subjectTermCall = stem.match(/^In (Biology|Chemistry|Physics), what do we call (.+)$/i);
  if (subjectTermCall) return { ...question, q: `Name the ${subjectTermCall[1].toLowerCase()} term for “${subjectTermCall[2]}”.` };

  const termCall = stem.match(/^What do we call (.+)$/i);
  if (termCall) return { ...question, q: `Name the term for “${termCall[1]}”.` };

  const scientificDefinition = stem.match(/^In scientific work, what does (.+) mean$/i);
  if (scientificDefinition) return { ...question, q: `Define ${scientificDefinition[1]} in a scientific investigation.` };

  const scientificTerm = stem.match(/^In science, which term means (.+)$/i);
  if (scientificTerm) return { ...question, q: `Name the scientific term that means ${scientificTerm[1]}.` };

  const scenarioWhich = stem.match(/^(.+?[.!])\s+Which (.+)$/i);
  if (scenarioWhich) return { ...question, q: `${scenarioWhich[1]} Identify which ${lowerFirst(scenarioWhich[2])}.` };

  const scenarioWhat = stem.match(/^(.+?[.!])\s+What (.+)$/i);
  if (scenarioWhat) {
    const tail = scenarioWhat[2];
    const auxiliary = tail.match(/^(does|do|did|can|could|would|should|will)\s+(.+)$/i);
    if (auxiliary) {
      const command = /^(?:does|do|did)$/i.test(auxiliary[1]) ? "Describe" : "State";
      return { ...question, q: `${scenarioWhat[1]} ${command} what ${declarativeFromAuxiliary(auxiliary[1], auxiliary[2])}.` };
    }
    return { ...question, q: `${scenarioWhat[1]} State what ${lowerFirst(tail)}.` };
  }

  const contextRepresent = stem.match(/^(.+?),\s*what does (.+?) represent$/i);
  if (contextRepresent) return { ...question, q: finish(`${contextRepresent[1]}, state what ${contextRepresent[2]} represents`) };

  const contextHappens = stem.match(/^(.+?),\s*what happens (.+)$/i);
  if (contextHappens) return { ...question, q: finish(`${contextHappens[1]}, describe what happens ${lowerFirst(contextHappens[2])}`) };

  const contextWhich = stem.match(/^(.+?),\s*which (.+)$/i);
  if (contextWhich) return { ...question, q: finish(`${contextWhich[1]}, identify which ${lowerFirst(contextWhich[2])}`) };

  const contextChoice = stem.match(/^(.+?),\s*(is|are|was|were|can|could|will|would|should|has|have|had|does|do|did) (.+)$/i);
  if (contextChoice) return { ...question, q: finish(`${contextChoice[1]}, state whether ${declarativeFromAuxiliary(contextChoice[2], contextChoice[3])}`) };

  const whyAux = stem.match(/^why (is|are|was|were|can|could|will|would|should|has|have|had|does|do|did) (.+)$/i);
  if (whyAux) return { ...question, q: finish(`Explain why ${declarativeFromAuxiliary(whyAux[1], whyAux[2])}`), kind: "explain" };

  const why = stem.match(/^why (.+)$/i);
  if (why) return { ...question, q: finish(`Explain why ${lowerFirst(why[1])}`), kind: "explain" };

  const howMany = stem.match(/^how (many|much) (.+)$/i);
  if (howMany) return { ...question, q: finish(`State how ${howMany[1].toLowerCase()} ${lowerFirst(howMany[2])}`) };

  const howCompare = stem.match(/^how (?:does|do) (.+?) compare with (.+)$/i);
  if (howCompare) return { ...question, q: finish(`Compare ${lowerFirst(howCompare[1])} with ${howCompare[2]}`) };

  const howAux = stem.match(/^how (does|do|did|is|are|was|were|can|could|would|should|will|has|have|had) (.+)$/i);
  if (howAux) {
    const command = question.kind === "explain" || answerNeedsExplanation(question.a) ? "Explain" : "Describe";
    return { ...question, q: finish(`${command} how ${declarativeFromAuxiliary(howAux[1], howAux[2])}`), kind: command === "Explain" ? "explain" : question.kind };
  }

  const where = stem.match(/^where (.+)$/i);
  if (where) return { ...question, q: finish(`State where ${lowerFirst(where[1])}`) };

  const when = stem.match(/^when (.+)$/i);
  if (when) return { ...question, q: finish(`State when ${lowerFirst(when[1])}`) };

  const whatDoesMean = stem.match(/^what does (.+) mean$/i);
  if (whatDoesMean) return { ...question, q: finish(`Define ${lowerFirst(whatDoesMean[1])}`) };

  const whatStandFor = stem.match(/^what does (.+) stand for$/i);
  if (whatStandFor) return { ...question, q: finish(`State what ${whatStandFor[1]} stands for`) };

  const whatHappens = stem.match(/^what happens (.+)$/i);
  if (whatHappens) return { ...question, q: finish(`Describe what happens ${lowerFirst(whatHappens[1])}`) };

  const evidenceWould = stem.match(/^what evidence (would .+)$/i);
  if (evidenceWould) return { ...question, q: finish(`State the evidence that ${lowerFirst(evidenceWould[1])}`) };

  const criteriaOrObservations = stem.match(/^what (criteria|observations?) (define|indicate|show|support|demonstrate) (.+)$/i);
  if (criteriaOrObservations) {
    return { ...question, q: finish(`State the ${criteriaOrObservations[1].toLowerCase()} that ${criteriaOrObservations[2].toLowerCase()} ${lowerFirst(criteriaOrObservations[3])}`) };
  }

  const whatUsedFor = stem.match(/^what is (.+?) used for(?: (.+))?$/i);
  if (whatUsedFor) return { ...question, q: finish(`State what ${lowerFirst(whatUsedFor[1])} is used for${whatUsedFor[2] ? ` ${whatUsedFor[2]}` : ""}`) };

  const whatPluralUsedFor = stem.match(/^what are (.+?) used for(?: (.+))?$/i);
  if (whatPluralUsedFor) return { ...question, q: finish(`State what ${lowerFirst(whatPluralUsedFor[1])} are used for${whatPluralUsedFor[2] ? ` ${whatPluralUsedFor[2]}` : ""}`) };

  const whatChanges = stem.match(/^what changes (.+)$/i);
  if (whatChanges) return { ...question, q: finish(`Describe the changes ${lowerFirst(whatChanges[1])}`), kind: question.kind === "explain" ? "explain" : question.kind };

  const whatMakes = stem.match(/^what makes (.+)$/i);
  if (whatMakes) return { ...question, q: finish(`Explain what makes ${lowerFirst(whatMakes[1])}`), kind: "explain" };

  const whatMovesAnd = stem.match(/^what moves and what does not move (.+)$/i);
  if (whatMovesAnd) return { ...question, q: finish(`Describe what moves and what does not move ${lowerFirst(whatMovesAnd[1])}`), kind: "explain" };

  const whatProvides = stem.match(/^what provides (.+)$/i);
  if (whatProvides) return { ...question, q: finish(`State what provides ${lowerFirst(whatProvides[1])}`) };

  const whatCause = stem.match(/^what causes? (.+)$/i);
  if (whatCause) return { ...question, q: finish(`Explain what causes ${lowerFirst(whatCause[1])}`), kind: "explain" };

  const whatDoes = stem.match(/^what (does|do|did) (.+)$/i);
  if (whatDoes) {
    const command = question.kind === "explain" || answerNeedsExplanation(question.a) ? "Describe" : "State";
    return { ...question, q: finish(`${command} what ${declarativeFromAuxiliary(whatDoes[1], whatDoes[2])}`) };
  }

  const whatModal = stem.match(/^what (can|could|would|should|will) (.+)$/i);
  if (whatModal) return { ...question, q: finish(`State what ${declarativeFromAuxiliary(whatModal[1], whatModal[2])}`) };

  const equationPrompt = stem.match(/^(?:what|which) (equation|formula|relationship) (.+)$/i);
  if (equationPrompt) {
    const detail = lowerFirst(equationPrompt[2]);
    const connector = /^(?:for|of|between|relating)\b/i.test(detail) ? "" : "that ";
    return { ...question, q: finish(`Write the ${equationPrompt[1].toLowerCase()} ${connector}${detail}`) };
  }

  const formulaClue = stem.match(/^(?:what|which) (?:[a-z-]+ )*?(?:quantity|force|energy|speed|rate|total|value) (?:is|can be) calculated using (.+)$/i);
  if (formulaClue) {
    const equation = formulaClue[1].trim();
    const symbol = equation.split("=")[0]?.trim();
    if (symbol) return { ...question, q: `In ${equation}, state what ${symbol} represents.` };
  }

  const called = stem.match(/^what (?:is|are) (.+) called$/i);
  if (called) return { ...question, q: finish(`Name ${lowerFirst(called[1])}`) };

  const meantBy = stem.match(/^what is meant by (.+)$/i);
  if (meantBy) return { ...question, q: finish(`Define ${lowerFirst(meantBy[1])}`) };

  const subjectTerm = stem.match(/^(?:name the|which|what is the) (biology|chemistry|physics) term (?:described here:|that means|for)\s*[“"]?(.+?)[”"]?$/i);
  if (subjectTerm) return { ...question, q: finish(`Name the ${subjectTerm[1]} term for “${lowerFirst(subjectTerm[2])}”`) };

  const scientificSkill = stem.match(/^(?:what|which) scientific skill (?:is described as|means) (.+)$/i);
  if (scientificSkill) return { ...question, q: finish(`Name the scientific skill described as ${lowerFirst(scientificSkill[1])}`) };

  const termDescription = stem.match(/^(?:what|which) (?:term|word) (?:describes|applies to|means) (.+)$/i);
  if (termDescription) return { ...question, q: finish(`Name the term for ${lowerFirst(termDescription[1])}`) };

  const whatType = stem.match(/^what (type|kind|category) of (.+)$/i);
  if (whatType) {
    const words = whatType[2].split(/\s+/);
    const verbIndex = words.findIndex((word) => linkingVerb.test(word));
    if (verbIndex > 0) return { ...question, q: finish(`Identify the ${whatType[1].toLowerCase()} of ${words.slice(0, verbIndex).join(" ")} that ${words.slice(verbIndex).join(" ")}`) };
    return { ...question, q: finish(`Identify what ${whatType[1].toLowerCase()} of ${lowerFirst(whatType[2])}`) };
  }

  const whatNamedThing = stem.match(/^what (quantity|property|component|structure|process|method|instrument|device|material|substance|force|energy|unit|symbol|term|word|graph) (.+)$/i);
  if (whatNamedThing) {
    const words = whatNamedThing[2].split(/\s+/);
    const verbIndex = words.findIndex((word) => linkingVerb.test(word));
    if (verbIndex >= 0) return { ...question, q: finish(`Identify the ${whatNamedThing[1].toLowerCase()} that ${words.slice(verbIndex).join(" ")}`) };
    return { ...question, q: finish(`Identify what ${whatNamedThing[1].toLowerCase()} ${lowerFirst(whatNamedThing[2])}`) };
  }

  const inWhichAux = stem.match(/^in which (.+?) (is|are|was|were|can|could|will|would|should|has|have|had|does|do|did) (.+)$/i);
  if (inWhichAux) return { ...question, q: finish(`Identify the ${lowerFirst(inWhichAux[1])} in which ${declarativeFromAuxiliary(inWhichAux[2], inWhichAux[3])}`) };

  const which = stem.match(/^which (.+)$/i);
  if (which) {
    const words = which[1].split(/\s+/);
    const verbIndex = words.findIndex((word) => linkingVerb.test(word));
    if (verbIndex > 0) return { ...question, q: finish(`Identify the ${words.slice(0, verbIndex).join(" ")} that ${words.slice(verbIndex).join(" ")}`) };
    return { ...question, q: finish(`Identify which ${lowerFirst(which[1])}`) };
  }

  const whatIs = stem.match(/^what is (.+)$/i);
  if (whatIs) {
    const subject = lowerFirst(whatIs[1]);
    if (/^(?:one|an example of|the first|the main|the primary|the overall|true about)\b/i.test(subject)) {
      return { ...question, q: finish(`State ${subject}`) };
    }
    if (/^the (?:si )?(?:unit|value|symbol|formula|test|method|procedure|charge|mass|number|name|direction|colour|pH)\b/i.test(subject)) {
      return { ...question, q: finish(`State ${subject}`) };
    }
    if (/^the (?:difference|relationship|role|purpose|function|cause|effect|result|main purpose)\b/i.test(subject)) {
      return { ...question, q: finish(`Describe ${subject}`), kind: answerNeedsExplanation(question.a) ? "explain" : question.kind };
    }
    if (/^(?:a |an )?[a-z][a-z0-9()'’+\-/ ]{0,70}$/i.test(subject) && (question.kind === "explain" || answerNeedsExplanation(question.a))) {
      return { ...question, q: finish(`Define ${subject}`), kind: "explain" };
    }
    return { ...question, q: finish(`State ${subject}`) };
  }

  const whatAre = stem.match(/^what are (.+)$/i);
  if (whatAre) {
    const subject = lowerFirst(whatAre[1]);
    const list = /^(?:(?:the )?(?:one|two|three|four|five|six|main|key|major|different)\b|the (?:[a-z-]+ )?(?:products|reactants|features|conditions|factors|parts|stages|steps|uses|causes|effects|requirements|limitations|advantages|disadvantages)\b)/i.test(subject);
    if (list) return { ...question, q: finish(`State ${subject}`) };
    if (question.kind === "explain" || answerNeedsExplanation(question.a)) return { ...question, q: finish(`Define ${subject}`), kind: "explain" };
    return { ...question, q: finish(`State ${subject}`) };
  }

  const yesNo = stem.match(/^(is|are|can|could|do|does|did|will|would|should|has|have|had) (.+)$/i);
  if (yesNo) {
    const wording = declarativeFromAuxiliary(yesNo[1], yesNo[2]);
    if (/^(?:yes|no)\b/i.test(question.a.trim())) return { ...question, q: finish(`Explain whether ${wording}`), kind: "explain" };
    return { ...question, q: finish(`State whether ${wording}`) };
  }

  return prompt === question.q ? question : { ...question, q: prompt };
}

function addStandaloneContext<T extends QuestionLike>(question: T, topic: QuestionTopicContext): T {
  let prompt = question.q.trim().replace(/\s+/g, " ");

  if (/^Name the horizontal rows[.!?…]*$/i.test(prompt)) {
    prompt = "Name the horizontal rows of the periodic table.";
  } else if (/^Name the vertical columns[.!?…]*$/i.test(prompt)) {
    prompt = "Name the vertical columns of the periodic table.";
  } else if (/^(?:State|Name) the horizontal rows called[.!?…]*$/i.test(prompt)) {
    prompt = "Name the horizontal rows of the periodic table.";
  } else if (/^(?:State|Name) the vertical columns called[.!?…]*$/i.test(prompt)) {
    prompt = "Name the vertical columns of the periodic table.";
  }

  if (topic.id === "y9-elements-compounds") {
    prompt = prompt
      .replace(/\ba formula\b/gi, "a chemical formula")
      .replace(/\bthe formula\b/gi, "the chemical formula");
  }

  if (/^State what a chemical formula tells you first[.!?…]*$/i.test(prompt)) {
    prompt = "State what a chemical formula tells you about the elements in a substance.";
  }

  return prompt === question.q ? question : { ...question, q: prompt };
}

export function clarifyQuestion<T extends QuestionLike>(question: T): T {
  const exact: Record<string, Partial<QuestionLike>> = {
    "what should be done with an anomalous solubility result?": {
      q: "State what should be done with an anomalous result when calculating a mean.",
      a: "Investigate it and repeat the measurement if possible. Exclude it from the mean only when there is evidence that it is invalid, and state what you did.",
    },
    "which scientist is linked in the guide to early pressure investigations?": {
      q: "Name the scientist after whom the SI pressure unit, the pascal, is named.",
      a: "Blaise Pascal.",
    },
    "is friction an internal or external force on an object?": { q: "Classify friction as an internal or external force on an object.", a: "An external force." },
    "is tension within a stretched rope internal or external to the rope?": { q: "Classify tension as an internal or external force within a stretched rope.", a: "An internal force." },
    "is melting ice a physical or chemical change?": { q: "Classify melting ice as a physical or chemical change.", a: "A physical change because no new substance forms." },
    "what type of respiration is studied in this year 7 topic?": { q: "Name the type of respiration that uses oxygen to release energy from glucose.", a: "Aerobic respiration." },
    "give one use of a halogen from the guide.": { q: "Give one use of a Group 17 element (halogen).", a: "For example, chlorine is used to disinfect water or iodine is used as an antiseptic." },
    "what does a formula tell you first?": { q: "State what a chemical formula tells you about the elements in a substance." },
    "what does structure-property relationship allow?": { q: "Explain how the relationship between microscopic structure and macroscopic properties helps predict a material's uses." },
    "state what structure-property relationship allows.": { q: "Explain how the relationship between microscopic structure and macroscopic properties helps predict a material's uses." },
    "what is needed for current to flow in a simple circuit?": { q: "State the two conditions needed for current to flow in a simple circuit." },
    "what is produced by mitosis?": { q: "State what mitosis produces." },
  };

  const refined = exact[question.q.trim().toLowerCase()];
  const base = refined ? ({ ...question, ...refined } as T) : question;

  if (/^how can neutron number be calculated from nucleon number[?.!…]*$/i.test(base.q.trim())) {
    return { ...base, q: "State how to calculate the number of neutrons from the mass number.", a: "Subtract the atomic number (number of protons) from the mass number." };
  }
  if (/^what permanent change in a DNA base sequence is called[?.!…]*$/i.test(base.q.trim())) return { ...base, q: "Name a permanent change in a DNA base sequence." };
  if (/^what type of force can act without physical contact[?.!…]*$/i.test(base.q.trim())) return { ...base, q: "Name the type of force that can act without physical contact.", a: "non-contact force" };
  if (/^what does (?:a )?structure-property relationship allow[?.!…]*$/i.test(base.q.trim())) return { ...base, q: "Explain how the relationship between microscopic structure and macroscopic properties helps predict a material's uses." };

  return applyReviewedWording(commandify(applyReviewedWording(base)));
}

export function clarifyQuestionForTopic<T extends QuestionLike>(question: T, topic: QuestionTopicContext): T {
  return addStandaloneContext(clarifyQuestion(question), topic);
}
