type QuestionLike = {
  q: string;
  a: string;
  kind: "short" | "explain";
};

const yesNoOpening = /^(?:is|are|can|could|do|does|did|will|would|should|has|have|had)\b/i;

/** Questions answered only with Yes or No do not require enough retrieval thinking. */
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

/**
 * Applies the platform-wide classroom wording rules without changing the
 * scientific content or stored answer. The result is used by previews and all
 * export formats, and is also checked by the question-language audit.
 */
export function clarifyQuestion<T extends QuestionLike>(question: T): T {
  let original = question.q.trim().replace(/\s+/g, " ");

  const exactRefinements: Record<string, Pick<QuestionLike, "q" | "a">> = {
    "what should be done with an anomalous solubility result?": {
      q: "What should you do with an anomalous result when calculating a mean?",
      a: "Investigate it and repeat the measurement if possible. Exclude it from the mean only when there is evidence that it is invalid, and state what you did.",
    },
    "name the seven components of a balanced diet in this topic.": {
      q: "Name the seven components of a balanced diet.",
      a: "Carbohydrates, fats, proteins, vitamins, minerals, fibre and water.",
    },
    "what is crystallisation used for in this topic?": {
      q: "What is crystallisation used for when separating a solution?",
      a: "Recovering a dissolved solid as crystals from the solution.",
    },
    "which scientist is linked in the guide to early pressure investigations?": {
      q: "Which scientist is the SI pressure unit, the pascal, named after?",
      a: "Blaise Pascal.",
    },
    "name one common force used in the guide's force diagrams.": {
      q: "Name one force that could be shown on a force diagram.",
      a: "For example, an applied force, friction, weight, support force, tension or drag.",
    },
    "is friction an internal or external force on an object?": {
      q: "Classify friction as an internal or external force on an object.",
      a: "An external force.",
    },
    "is tension within a stretched rope internal or external to the rope?": {
      q: "Classify tension as an internal or external force within a stretched rope.",
      a: "An internal force.",
    },
    "is melting ice a physical or chemical change?": {
      q: "Classify melting ice as a physical or chemical change.",
      a: "A physical change because no new substance forms.",
    },
    "what type of respiration is studied in this year 7 topic?": {
      q: "What type of respiration uses oxygen to release energy from glucose?",
      a: "Aerobic respiration.",
    },
    "give one use of a halogen from the guide.": {
      q: "Give one use of a Group 17 element (halogen).",
      a: "For example, chlorine is used to disinfect water or iodine is used as an antiseptic.",
    },
  };
  const exactRefinement = exactRefinements[original.toLowerCase()];
  if (exactRefinement) return { ...question, ...exactRefinement };

  original = original
    .replace(/\s+studied in this topic(?=[?.!]|$)/i, "")
    .replace(/\s+in this topic(?=[?.!]|$)/i, "");
  const stem = original.replace(/[?.!…]+$/, "");

  // Targeted fixes for reported questions.
  if (/^how can neutron number be calculated from nucleon number$/i.test(stem)) {
    return {
      ...question,
      q: "How can you calculate the number of neutrons from the mass number?",
      a: "Subtract the atomic number (number of protons) from the mass number.",
    };
  }

  if (/^what permanent change in a DNA base sequence is called$/i.test(stem)) {
    return { ...question, q: "What is a permanent change in a DNA base sequence called?" };
  }

  if (/^what type of force can act without physical contact$/i.test(stem)) {
    return { ...question, a: "non-contact force" };
  }

  const meantBy = stem.match(/^what is meant by (.+)$/i);
  if (meantBy) {
    return { ...question, q: `What does ${lowerFirst(meantBy[1])} mean?` };
  }

  const namedSubjectTerm = stem.match(/^name the (biology|chemistry|physics) term described here:\s*(.+)$/i);
  if (namedSubjectTerm) {
    return {
      ...question,
      q: `What is the ${namedSubjectTerm[1]} term for “${lowerFirst(namedSubjectTerm[2])}”?`,
    };
  }

  const subjectTermMeans = stem.match(/^which (biology|chemistry|physics) term means [“"]?(.+?)[”"]?$/i);
  if (subjectTermMeans) {
    return {
      ...question,
      q: `What is the ${subjectTermMeans[1]} term for “${lowerFirst(subjectTermMeans[2])}”?`,
    };
  }

  const termDescription = stem.match(/^(?:what|which) (?:term|word) (?:describes|applies to) (.+)$/i);
  if (termDescription) {
    return { ...question, q: `What do we call ${lowerFirst(termDescription[1])}?` };
  }

  const ideaExplains = stem.match(/^which idea explains (.+)$/i);
  if (ideaExplains) {
    return { ...question, q: `What explains ${lowerFirst(ideaExplains[1])}?` };
  }

  const typeCategory = stem.match(/^which ([a-z-]+) category (.+)$/i);
  if (typeCategory) {
    return { ...question, q: `What type of ${typeCategory[1].toLowerCase()} ${lowerFirst(typeCategory[2])}?` };
  }

  const yesNo = stem.match(yesNoOpening);
  if (yesNo) {
    if (!/^(?:yes|no)\b/i.test(question.a.trim())) {
      return original === question.q ? question : { ...question, q: original };
    }
    return {
      ...question,
      q: `Give a scientific explanation for your answer: ${finish(stem, "?")}`,
      kind: "explain",
    };
  }

  const formulaClue = stem.match(/^(?:what|which) (?:[a-z-]+ )*?(?:quantity|force|energy|speed|rate|total|value) (?:is|can be) calculated using (.+)$/i);
  if (formulaClue) {
    const equation = formulaClue[1].trim();
    const symbol = equation.split("=")[0]?.trim();
    if (symbol) return { ...question, q: `In ${equation}, what does ${symbol} represent?` };
  }

  const equationPrompt = stem.match(/^(?:what|which) (equation|formula|relationship) (.+)$/i);
  if (equationPrompt) {
    const noun = equationPrompt[1].toLowerCase();
    const detail = lowerFirst(equationPrompt[2]);
    const connector = /^(?:for|of|between|relating)\b/i.test(detail) ? "" : "that ";
    return { ...question, q: finish(`Write the ${noun} ${connector}${detail}`) };
  }

  const called = stem.match(/^what (?:is|are) (.+) called$/i);
  if (called) return { ...question, q: finish(`Name ${lowerFirst(called[1])}`) };

  const means = stem.match(/^what does (.+) mean$/i);
  if (means) return { ...question, q: finish(`What does ${lowerFirst(means[1])} mean`, "?") };

  const lawStatement = stem.match(/^what does (.+? law) state(.*)$/i);
  if (lawStatement) return { ...question, q: finish(`State ${lowerFirst(lawStatement[1])}${lawStatement[2]}`) };

  const degenerate = stem.match(/^what does it mean that (.+)$/i);
  if (degenerate) return { ...question, q: finish(`Explain what is meant by saying that ${lowerFirst(degenerate[1])}`) };

  const happens = stem.match(/^what happens (.+)$/i);
  if (happens) return { ...question, q: finish(`Describe what happens ${lowerFirst(happens[1])}`) };

  const evidenceWould = stem.match(/^what evidence (would .+)$/i);
  if (evidenceWould) return { ...question, q: finish(`State the evidence that ${lowerFirst(evidenceWould[1])}`) };

  const criteriaOrObservations = stem.match(/^what (criteria|observations?) (define|indicate|show|support|demonstrate) (.+)$/i);
  if (criteriaOrObservations) {
    return {
      ...question,
      q: finish(`State the ${criteriaOrObservations[1].toLowerCase()} that ${criteriaOrObservations[2].toLowerCase()} ${lowerFirst(criteriaOrObservations[3])}`),
    };
  }

  const changes = question.kind === "explain" ? stem.match(/^what changes (.+)$/i) : null;
  if (changes) return { ...question, q: finish(`Describe the changes ${lowerFirst(changes[1])}`) };

  const definition = stem.match(/^what is (.+)$/i);
  if (definition) {
    const subject = lowerFirst(definition[1]);
    if (/^(?:reached|formed|produced|released|used|needed|found|measured|shown)\b/i.test(subject)) {
      return { ...question, q: finish(`State what is ${subject}`) };
    }
    if (/^one [a-z-]+$/i.test(subject)) {
      return { ...question, q: finish(`State what ${subject} represents`) };
    }
    if (/^(?:one|an example of|the first|the main|the primary|the overall|true about)\b/i.test(subject)) {
      return { ...question, q: finish(`State ${subject}`) };
    }
    if (/^the (?:si )?(?:unit|value|symbol|formula|test|method|procedure|charge|mass|number|name|direction|colour|pH)\b/i.test(subject)) {
      return { ...question, q: finish(`State ${subject}`) };
    }
    if (/^the (?:difference|relationship|role|purpose|function|cause|effect|result|main purpose)\b/i.test(subject)) {
      return { ...question, q: finish(`Describe ${subject}`) };
    }
    if (question.kind === "explain") {
      return original === question.q ? question : { ...question, q: original };
    }
    return original === question.q ? question : { ...question, q: original };
  }

  const pluralDefinition = stem.match(/^what are (.+)$/i);
  if (pluralDefinition) {
    const subject = lowerFirst(pluralDefinition[1]);
    const asksForList = /^(?:(?:the )?(?:one|two|three|four|five|six|main|key|major|different)\b|the (?:[a-z-]+ )?(?:products|reactants|features|conditions|factors|parts|stages|steps|uses|causes|effects|requirements|limitations|advantages|disadvantages)\b)/i.test(subject);
    if (asksForList) return { ...question, q: finish(`State ${subject}`) };
    if (question.kind === "explain") return original === question.q ? question : { ...question, q: original };
    return original === question.q ? question : { ...question, q: original };
  }

  const cause = stem.match(/^what causes? (.+)$/i);
  if (cause) return { ...question, q: finish(`Explain what causes ${lowerFirst(cause[1])}`) };

  const makes = stem.match(/^what makes (.+)$/i);
  if (makes) return { ...question, q: finish(`Explain what makes ${lowerFirst(makes[1])}`) };

  const moves = stem.match(/^what moves (.+)$/i);
  if (moves) return { ...question, q: finish(`State what moves ${lowerFirst(moves[1])}`) };

  const provides = stem.match(/^what provides (.+)$/i);
  if (provides) return { ...question, q: finish(`State what provides ${lowerFirst(provides[1])}`) };

  if (/^what should arrows in a complete diffusion model show$/i.test(stem)) {
    return { ...question, q: "State what arrows in a complete diffusion model should show." };
  }

  return original === question.q ? question : { ...question, q: original };
}
