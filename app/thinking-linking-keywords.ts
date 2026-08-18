export type LinkableKeywordTopic = {
  id: string;
  year?: string | number;
  course?: string;
  keywords: string[];
};

type KeywordPair = readonly [string, string];

function shuffledWith<T>(items: readonly T[], random: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueKeywords(keywords: readonly string[]) {
  const seen = new Set<string>();
  return keywords.map((keyword) => keyword.trim()).filter((keyword) => {
    const key = keyword.toLowerCase();
    if (!keyword || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function connectionPairs(keywords: readonly string[]): KeywordPair[] {
  const words = uniqueKeywords(keywords);
  const pairs: KeywordPair[] = [];

  for (let index = 0; index + 1 < words.length; index += 2) {
    pairs.push([words[index], words[index + 1]]);
  }

  // Give a final unpaired keyword a route into the grid without changing the
  // deliberately grouped order of the topic's keyword bank.
  if (words.length % 2 === 1 && words.length > 1) {
    pairs.push([words[words.length - 2], words[words.length - 1]]);
  }

  return pairs;
}

export function buildThinkingLinkingKeywords(
  selectedTopics: readonly LinkableKeywordTopic[],
  size = 16,
  random: () => number = Math.random,
) {
  if (!selectedTopics.length || size < 2) return [];
  const evenSize = size - (size % 2);
  const requiredPairs = evenSize / 2;
  const topicPools = shuffledWith(selectedTopics, random).map((topic) => ({
    topic,
    pairs: shuffledWith(connectionPairs(topic.keywords), random),
  }));
  const selectedPairs: KeywordPair[] = [];
  const used = new Set<string>();

  while (selectedPairs.length < requiredPairs) {
    let addedThisRound = false;

    for (const pool of topicPools) {
      if (selectedPairs.length >= requiredPairs) break;
      const pairIndex = pool.pairs.findIndex(([left, right]) =>
        !used.has(left.toLowerCase()) && !used.has(right.toLowerCase())
      );
      if (pairIndex < 0) continue;

      const [pair] = pool.pairs.splice(pairIndex, 1);
      selectedPairs.push(pair);
      used.add(pair[0].toLowerCase());
      used.add(pair[1].toLowerCase());
      addedThisRound = true;
    }

    if (!addedThisRound) break;
  }

  if (selectedPairs.length === requiredPairs) {
    return selectedPairs.flatMap(([left, right]) => [left, right]);
  }

  // Keyword overlap across several topics can occasionally block the
  // round-robin selection. A single topic still provides a fully connected,
  // duplicate-free grid rather than leaving an isolated term.
  for (const pool of topicPools) {
    const fallbackPairs = shuffledWith(connectionPairs(pool.topic.keywords), random);
    const fallback = fallbackPairs.slice(0, requiredPairs);
    const words = fallback.flatMap(([left, right]) => [left, right]);
    if (fallback.length === requiredPairs && new Set(words.map((word) => word.toLowerCase())).size === evenSize) {
      return words;
    }
  }

  return [];
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function assertThinkingLinkingCoverage(topics: readonly LinkableKeywordTopic[]) {
  const groups = new Map<string, LinkableKeywordTopic[]>();

  for (const topic of topics) {
    const groupKey = `${topic.year ?? "unknown"}:${topic.course ?? "general"}`;
    groups.set(groupKey, [...(groups.get(groupKey) ?? []), topic]);
  }

  const selections = [
    ...topics.map((topic) => ({ label: topic.id, topics: [topic] })),
    ...[...groups.entries()].map(([label, groupedTopics]) => ({ label, topics: groupedTopics })),
  ];

  for (const selection of selections) {
    for (const seed of [7, 31, 97]) {
      const words = buildThinkingLinkingKeywords(selection.topics, 16, seededRandom(seed));
      if (words.length !== 16) {
        throw new Error(`Thinking & Linking could not build a 16-word connected grid for ${selection.label}.`);
      }
      if (new Set(words.map((word) => word.toLowerCase())).size !== 16) {
        throw new Error(`Thinking & Linking produced duplicate words for ${selection.label}.`);
      }
      for (let index = 0; index < words.length; index += 2) {
        if (!words[index] || !words[index + 1]) {
          throw new Error(`Thinking & Linking produced an isolated word for ${selection.label}.`);
        }
      }
    }
  }
}
