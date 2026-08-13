"use client";

import { useEffect } from "react";

const PPTX_SCRIPT_URL = "https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js";
let pptxPreparation: Promise<void> | null = null;

type SlideLike = {
  addText?: (text: string, options: Record<string, unknown>) => unknown;
};

type PptxPrototypeLike = {
  addSlide?: (this: unknown, ...args: unknown[]) => SlideLike;
  __stpNumberBadgeFix?: boolean;
};

type GeneratedPrompt = {
  prompt: string;
  answer: string;
  index: number;
};

function clean(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalise(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9+\-'= ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const genericShortAnswers = new Set([
  "yes", "no", "true", "false", "increase", "increases", "decrease", "decreases",
  "higher", "lower", "more", "less", "same", "constant", "positive", "negative",
  "left", "right", "up", "down", "none", "both", "either",
]);

function termLikeAnswer(answer: string) {
  const value = normalise(answer).replace(/^(?:a|an|the)\s+/, "");
  if (!value || value.length > 55 || genericShortAnswers.has(value)) return null;
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 5) return null;
  if (!/[a-z]/.test(value) || /[=+\d]/.test(value)) return null;
  if (!/^[a-z][a-z '\-]*$/.test(value)) return null;
  return value;
}

function conceptAnchor(prompt: string, answer: string) {
  const stem = normalise(prompt).replace(/[?.!]+$/, "");
  const answerTerm = termLikeAnswer(answer);

  const define = stem.match(/^define (.+)$/);
  if (define) return define[1].replace(/^(?:a|an|the)\s+/, "").trim();

  const meaning = stem.match(/^(?:explain|state) what (.+) means$/)
    ?? stem.match(/^what does (.+) mean$/);
  if (meaning) return meaning[1].replace(/^(?:a|an|the)\s+/, "").trim();

  if (answerTerm && (
    /^(?:identify|state|name) (?:the )?(?:biology|chemistry|physics|science)?\s*term\b/.test(stem)
    || /^(?:what|which)\b/.test(stem)
    || /\bcalled$/.test(stem)
  )) return answerTerm;

  const twoPieces = stem.match(/^state the two pieces of information given by (.+)$/);
  if (twoPieces) return twoPieces[1].trim();

  const signDirection = stem.match(/^state what the .+ of (.+?) (?:tell|tells|show|shows)\b/);
  if (signDirection) return signDirection[1].trim();

  const condition = stem.match(/^state the condition .* for (.+?) to\b/);
  if (condition) return condition[1].trim();

  const determines = stem.match(/^state what determines (.+?)(?: and| when|$)/);
  if (determines) return determines[1].trim();

  const relationship = stem.match(/^state the relationship(?:s)? between (.+?) and\b/);
  if (relationship) return relationship[1].trim();

  const direction = stem.match(/^state the direction of (.+?) relative to\b/);
  if (direction) return direction[1].trim();

  const atCondition = stem.match(/^at (.+?) state\b/);
  if (atCondition) return atCondition[1].trim();

  const factors = stem.match(/^state the factors that (.+?) depends? on\b/);
  if (factors) return factors[1].trim();

  const stateWhat = stem.match(/^state what (.+?) (?:allows?|enables?|explains?|describes?|shows?|predicts?|determines?|measures?|identifies?|provides?|supports?|controls?|connects?|links?|converts?|quantifies?|causes?|affects?|influences?|produces?|results? in)\b/);
  if (stateWhat) return stateWhat[1].trim();

  const explainHow = stem.match(/^explain how (.+?) (?:changes?|affects?|influences?|determines?|controls?|depends?|produces?|causes?|works?|behaves?)\b/);
  if (explainHow) return explainHow[1].trim();

  return answerTerm;
}

const promptNoise = new Set([
  "about", "answer", "biology", "called", "chemistry", "define", "described", "explain",
  "here", "identify", "means", "physics", "question", "science", "state", "term", "that",
  "the", "this", "what", "which", "with",
]);

function promptTerms(prompt: string) {
  return new Set(
    (normalise(prompt).match(/[a-z][a-z'-]{2,}/g) ?? [])
      .filter((word) => !promptNoise.has(word)),
  );
}

function phraseInPrompt(phrase: string, prompt: string) {
  if (!phrase || phrase.length < 4) return false;
  return ` ${normalise(prompt)} `.includes(` ${phrase} `);
}

function promptsAreSimilar(left: GeneratedPrompt, right: GeneratedPrompt) {
  const leftPrompt = normalise(left.prompt);
  const rightPrompt = normalise(right.prompt);
  if (leftPrompt === rightPrompt) return true;

  const leftAnchor = conceptAnchor(left.prompt, left.answer);
  const rightAnchor = conceptAnchor(right.prompt, right.answer);
  if (leftAnchor && rightAnchor && leftAnchor === rightAnchor) return true;

  // If one prompt has a clear concept anchor and the other does not, still
  // reject it when that exact scientific concept is explicitly named in the
  // second prompt. This catches pairs such as "Define displacement" and a
  // second displacement explanation without confusing work with power.
  if (leftAnchor && !rightAnchor && phraseInPrompt(leftAnchor, right.prompt)) return true;
  if (rightAnchor && !leftAnchor && phraseInPrompt(rightAnchor, left.prompt)) return true;

  const leftTerms = promptTerms(left.prompt);
  const rightTerms = promptTerms(right.prompt);
  if (leftTerms.size < 4 || rightTerms.size < 4) return false;
  const overlap = [...leftTerms].filter((term) => rightTerms.has(term)).length;
  return overlap >= 4 && overlap / Math.min(leftTerms.size, rightTerms.size) >= 0.72;
}

function generatedPrompts() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet");
  if (!sheet) return { sheet: null, prompts: [] as GeneratedPrompt[] };
  const answerFirst = sheet.classList.contains("activity-answer-first");
  const items = Array.from(sheet.querySelectorAll<HTMLElement>(".export-answer-bank [data-export-prompt][data-export-answer]"));
  const prompts = items.map((item, index) => {
    const exportPrompt = clean(item.dataset.exportPrompt);
    const exportAnswer = clean(item.dataset.exportAnswer);
    return answerFirst
      ? { prompt: exportAnswer, answer: exportPrompt, index }
      : { prompt: exportPrompt, answer: exportAnswer, index };
  }).filter((item) => item.prompt && item.answer);
  return { sheet, prompts };
}

function duplicatePromptIndex(prompts: GeneratedPrompt[]) {
  for (let right = 1; right < prompts.length; right += 1) {
    for (let left = 0; left < right; left += 1) {
      if (promptsAreSimilar(prompts[left], prompts[right])) return right;
    }
  }
  return null;
}

function visiblePromptForSwap(button: HTMLButtonElement) {
  const card = button.closest<HTMLElement>([
    ".focused-knowledge-prompt",
    ".clock-card",
    ".chain-card",
    ".match-item",
    ".cloze-grid > div",
    ".flashcard",
    ".connect-four-grid > div",
    ".challenge-grid > div",
    ".trade-card",
    ".retrieval-grid > div",
    ".bingo-grid > div",
    ".placemat-grid > div",
    ".roulette-grid > div",
    ".answer-first-list > li",
    ".question-list > li",
  ].join(","));
  if (!card) return "";
  if (card.matches(".focused-knowledge-prompt")) return clean(card.querySelector("h3")?.textContent);
  if (card.matches(".trade-card, .answer-first-list > li")) return clean(card.querySelector("strong")?.textContent);
  if (card.matches(".question-list > li")) {
    const spans = Array.from(card.querySelectorAll<HTMLElement>(":scope > span"));
    return clean(spans.at(-1)?.textContent);
  }
  return clean(card.querySelector("p, .cloze-context")?.textContent);
}

function swapButtonForPrompt(sheet: HTMLElement, prompt: GeneratedPrompt) {
  const buttons = Array.from(sheet.querySelectorAll<HTMLButtonElement>(".question-controls .swap-button"));
  const exact = buttons.find((button) => normalise(visiblePromptForSwap(button)) === normalise(prompt.prompt));
  return exact ?? buttons[prompt.index] ?? null;
}

function patchPowerPointNumberBadges() {
  const constructor = window.PptxGenJS as unknown as { prototype?: PptxPrototypeLike } | undefined;
  const prototype = constructor?.prototype;
  if (!prototype?.addSlide || prototype.__stpNumberBadgeFix) return;

  const originalAddSlide = prototype.addSlide;
  prototype.addSlide = function patchedAddSlide(this: unknown, ...args: unknown[]) {
    const slide = originalAddSlide.apply(this, args);
    const originalAddText = slide.addText?.bind(slide);
    if (!originalAddText) return slide;

    slide.addText = (text: string, options: Record<string, unknown>) => {
      const width = typeof options.w === "number" ? options.w : Number(options.w);
      const height = typeof options.h === "number" ? options.h : Number(options.h);
      const isQuestionNumber = /^\d+$/.test(text.trim())
        && options.shape === "ellipse"
        && Number.isFinite(width)
        && Number.isFinite(height)
        && width <= 0.35
        && height <= 0.35;

      if (isQuestionNumber && typeof options.y === "number") {
        return originalAddText(text, {
          ...options,
          y: Math.max(0.02, options.y - 0.15),
          w: Math.min(width, 0.25),
          h: Math.min(height, 0.25),
          fontSize: 8.5,
        });
      }
      return originalAddText(text, options);
    };

    return slide;
  };
  prototype.__stpNumberBadgeFix = true;
}

function ensurePowerPointNumberFix() {
  if (window.PptxGenJS) {
    patchPowerPointNumberBadges();
    return Promise.resolve();
  }
  if (pptxPreparation) return pptxPreparation;

  pptxPreparation = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PPTX_SCRIPT_URL}"]`);
    const finish = () => {
      patchPowerPointNumberBadges();
      resolve();
    };

    if (existing) {
      if (window.PptxGenJS) finish();
      else {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => resolve(), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = PPTX_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => {
      script.remove();
      resolve();
    }, { once: true });
    document.head.appendChild(script);
  }).finally(() => {
    pptxPreparation = null;
  });
  return pptxPreparation;
}

export default function SiteExperienceEnhancer() {
  useEffect(() => {
    let disposed = false;
    let duplicateCheckFrame = 0;
    let autoDeduping = false;
    let duplicateSwapBudget = 0;

    const installScienceArtwork = () => {
      if (disposed) return;
      const hero = document.querySelector<HTMLElement>(".hero");
      if (hero && !hero.querySelector("[data-science-hero-art]")) {
        const image = document.createElement("img");
        image.src = "./science-hero.svg";
        image.alt = "";
        image.setAttribute("aria-hidden", "true");
        image.className = "science-hero-art";
        image.dataset.scienceHeroArt = "true";
        hero.appendChild(image);
      }

      const emptyPreview = document.querySelector<HTMLElement>(".empty-preview");
      if (emptyPreview && !emptyPreview.querySelector("[data-science-doodles]")) {
        const doodles = document.createElement("img");
        doodles.src = "./science-doodles.svg";
        doodles.alt = "";
        doodles.setAttribute("aria-hidden", "true");
        doodles.className = "science-doodle-strip";
        doodles.dataset.scienceDoodles = "true";
        emptyPreview.insertBefore(doodles, emptyPreview.firstChild);
      }
    };

    const scheduleDuplicateCheck = () => {
      if (disposed || !autoDeduping) return;
      window.cancelAnimationFrame(duplicateCheckFrame);
      duplicateCheckFrame = window.requestAnimationFrame(() => {
        if (disposed || !autoDeduping) return;
        const { sheet, prompts } = generatedPrompts();
        if (!sheet || !prompts.length) return;
        const duplicateIndex = duplicatePromptIndex(prompts);
        if (duplicateIndex === null) {
          autoDeduping = false;
          sheet.dataset.uniqueConceptMix = "true";
          return;
        }
        if (duplicateSwapBudget <= 0) {
          autoDeduping = false;
          console.warn("Retrieval starter duplicate-concept guard reached its swap limit.");
          return;
        }
        const button = swapButtonForPrompt(sheet, prompts[duplicateIndex]);
        if (!button) {
          autoDeduping = false;
          return;
        }
        duplicateSwapBudget -= 1;
        button.dataset.autoDuplicateSwap = "true";
        button.click();
      });
    };

    const handleQuestionMixRequest = (event: MouseEvent) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const generateButton = event.target.closest(".generate-button");
      const questionSwap = event.target.closest(".question-controls .swap-button");
      if (!generateButton && !questionSwap) return;
      autoDeduping = true;
      duplicateSwapBudget = 48;
      document.querySelector<HTMLElement>(".starter-sheet")?.removeAttribute("data-unique-concept-mix");
      scheduleDuplicateCheck();
    };

    const handlePowerPoint = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("button[data-powerpoint-download='true']")
        : null;
      if (!target) return;

      if (target.dataset.pptxNumberFixReplay === "true") {
        delete target.dataset.pptxNumberFixReplay;
        patchPowerPointNumberBadges();
        return;
      }
      if (window.PptxGenJS) {
        patchPowerPointNumberBadges();
        return;
      }
      if (target.dataset.pptxNumberFixPreparing === "true") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      target.dataset.pptxNumberFixPreparing = "true";
      void ensurePowerPointNumberFix().finally(() => {
        delete target.dataset.pptxNumberFixPreparing;
        target.dataset.pptxNumberFixReplay = "true";
        target.click();
      });
    };

    installScienceArtwork();
    document.addEventListener("click", handleQuestionMixRequest, true);
    document.addEventListener("click", handlePowerPoint, true);
    const observer = new MutationObserver(() => {
      installScienceArtwork();
      scheduleDuplicateCheck();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(duplicateCheckFrame);
      observer.disconnect();
      document.removeEventListener("click", handleQuestionMixRequest, true);
      document.removeEventListener("click", handlePowerPoint, true);
      document.querySelectorAll("[data-science-hero-art], [data-science-doodles]").forEach((element) => element.remove());
    };
  }, []);

  return null;
}
