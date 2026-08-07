"use client";

import { useEffect } from "react";

type PptxSlide = {
  background?: { color: string };
  addText: (text: string, options: Record<string, unknown>) => void;
};

type PptxDocument = {
  layout: string;
  author: string;
  company: string;
  subject: string;
  title: string;
  lang: string;
  addSlide: () => PptxSlide;
  writeFile: (options: { fileName: string; compression?: boolean }) => Promise<string>;
};

type PptxConstructor = new () => PptxDocument;

declare global {
  interface Window {
    PptxGenJS?: PptxConstructor;
  }
}

const SCRIPT_URLS = [
  "https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js",
  "https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js",
];

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;
const READING_BACKGROUND = "FFF6D6";
const READING_PANEL = "FFFBEA";
const READING_PANEL_ALT = "FFF0B8";
let loader: Promise<PptxConstructor> | null = null;

const activityPalettes: Record<string, { accent: string; soft: string }> = {
  "quick-quiz": { accent: "C8102E", soft: "FCE8EC" },
  "one-worders": { accent: "C8102E", soft: "FCE8EC" },
  "retrieval-grid": { accent: "C8102E", soft: "FCE8EC" },
  "thinking-linking": { accent: "6D4AFF", soft: "EEEAFE" },
  "concept-map": { accent: "6D4AFF", soft: "EEEAFE" },
  "question-chain": { accent: "6D4AFF", soft: "EEEAFE" },
  "challenge-grid": { accent: "D97706", soft: "FFF4D6" },
  "retrieval-roulette": { accent: "D97706", soft: "FFF4D6" },
  "connect-four": { accent: "D97706", soft: "FFF4D6" },
  "quiz-quiz-trade": { accent: "087F8C", soft: "E4F6F6" },
  "back-to-back": { accent: "087F8C", soft: "E4F6F6" },
  "walkabout-bingo": { accent: "087F8C", soft: "E4F6F6" },
  "retrieval-relay": { accent: "087F8C", soft: "E4F6F6" },
  "cops-robbers": { accent: "087F8C", soft: "E4F6F6" },
  "picture-prompts": { accent: "2563EB", soft: "EAF2FF" },
  "match-up": { accent: "2563EB", soft: "EAF2FF" },
  "cloze-recall": { accent: "2563EB", soft: "EAF2FF" },
  "flashcard-sprint": { accent: "2563EB", soft: "EAF2FF" },
  "brain-dump": { accent: "334155", soft: "EEF2F6" },
  "list-it": { accent: "334155", soft: "EEF2F6" },
  "two-things": { accent: "334155", soft: "EEF2F6" },
  "retrieval-placemat": { accent: "334155", soft: "EEF2F6" },
  "retrieval-clock": { accent: "334155", soft: "EEF2F6" },
  "answer-first": { accent: "C8102E", soft: "FCE8EC" },
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => {
      script.remove();
      reject(new Error(`Could not load PowerPoint support from ${src}`));
    }, { once: true });
    document.head.appendChild(script);
  });
}

async function loadPptx() {
  if (window.PptxGenJS) return window.PptxGenJS;
  if (loader) return loader;

  loader = (async () => {
    let lastError: unknown;
    for (const src of SCRIPT_URLS) {
      try {
        await loadScript(src);
        if (window.PptxGenJS) return window.PptxGenJS;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("PowerPoint support could not be loaded.");
  })();

  try {
    return await loader;
  } catch (error) {
    loader = null;
    throw error;
  }
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Retrieval-Starter";
}

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function unique(values: string[]) {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

function texts(root: ParentNode, selector: string) {
  return Array.from(root.querySelectorAll<HTMLElement>(selector))
    .map((element) => cleanText(element.textContent))
    .filter(Boolean);
}

function getActivityId(sheet: HTMLElement) {
  const className = Array.from(sheet.classList).find((name) => name.startsWith("activity-"));
  return className?.replace("activity-", "") ?? "quick-quiz";
}

function extractTeachingContent() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet");
  if (!sheet) throw new Error("Generate an activity before downloading it.");

  const title = cleanText(sheet.querySelector("h2")?.textContent) || "Retrieval Activity";
  const instructions = cleanText(sheet.querySelector(".instructions")?.textContent)
    || "Complete the activity from memory. Check and improve your answers when instructed.";
  const activity = getActivityId(sheet);
  const yearLabel = cleanText(sheet.querySelector(".sheet-kicker span:last-child")?.textContent) || "Junior Science";
  const topicLine = texts(sheet, ".topic-chips span").join(" • ");
  let prompts: string[] = [];

  switch (activity) {
    case "thinking-linking":
      prompts = texts(sheet, ".linking-grid > div").map((value) => value.replace(/^\d+\s*/, ""));
      break;
    case "concept-map": {
      const centre = cleanText(sheet.querySelector(".concept-core strong")?.textContent);
      prompts = texts(sheet, ".concept-terms span").map((word) => `${word} ↔ ${centre || "central concept"}`);
      break;
    }
    case "back-to-back":
      prompts = texts(sheet, ".keyword-card strong").map((word) => `Describe: ${word}`);
      break;
    case "picture-prompts":
      prompts = texts(sheet, ".picture-prompt strong").map((symbol, index) => `Picture ${index + 1}: ${symbol}`);
      break;
    case "brain-dump":
      prompts = texts(sheet, ".brain-grid h3").map((topic) => `${topic}: recall key terms, ideas, examples and connections.`);
      break;
    case "cops-robbers":
      prompts = texts(sheet, ".robbers-grid h3").map((topic) => `${topic}: my knowledge / stolen knowledge`);
      break;
    case "retrieval-relay":
      prompts = texts(sheet, ".relay-grid h3").map((topic) => `${topic}: build the answer one turn at a time.`);
      break;
    case "list-it":
      prompts = Array.from(sheet.querySelectorAll<HTMLElement>(".list-grid section")).flatMap((section) => {
        const topic = cleanText(section.querySelector("h3")?.textContent);
        return texts(section, "li").map((item) => `${topic}: ${item}`);
      });
      break;
    case "two-things":
      prompts = texts(sheet, ".two-things-grid h3").map((topic) => `${topic}: write two accurate things you remember.`);
      break;
    case "retrieval-clock":
      prompts = texts(sheet, ".clock-card p");
      break;
    case "question-chain":
      prompts = texts(sheet, ".chain-card p");
      break;
    case "match-up":
      prompts = texts(sheet, ".match-item p");
      break;
    case "cloze-recall":
      prompts = texts(sheet, ".cloze-grid p");
      break;
    case "flashcard-sprint":
      prompts = texts(sheet, ".flashcard section:first-child p");
      break;
    case "answer-first":
      prompts = texts(sheet, ".answer-first-list li strong").map((answer) => `Write a question whose answer is: ${answer}`);
      break;
    default:
      prompts = texts(
        sheet,
        ".question-list li span, .retrieval-grid p, .challenge-grid p, .trade-card strong, .bingo-grid p, .roulette-grid p, .placemat-grid > div p, .connect-four-grid p",
      );
      break;
  }

  if (!prompts.length) {
    prompts = texts(sheet, "p").filter((value) => value.length > 2 && value !== instructions);
  }

  return { title, instructions, prompts: unique(prompts), activity, yearLabel, topicLine };
}

function promptLayout(count: number) {
  const columns = count <= 6 ? 2 : count <= 12 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(count / columns));
  const gapX = 0.14;
  const gapY = 0.12;
  const left = 0.42;
  const top = 2.05;
  const usableWidth = SLIDE_WIDTH - left * 2;
  const usableHeight = SLIDE_HEIGHT - top - 0.28;
  return {
    columns,
    left,
    top,
    gapX,
    gapY,
    boxWidth: (usableWidth - gapX * (columns - 1)) / columns,
    boxHeight: (usableHeight - gapY * (rows - 1)) / rows,
  };
}

async function downloadPowerPoint() {
  const { title, instructions, prompts, activity, yearLabel, topicLine } = extractTeachingContent();
  const palette = activityPalettes[activity] ?? activityPalettes["quick-quiz"];
  const PptxGenJS = await loadPptx();
  const presentation = new PptxGenJS();
  presentation.layout = "LAYOUT_WIDE";
  presentation.author = "Retrieval Starter Builder";
  presentation.company = "St Peter's School";
  presentation.subject = "Junior Science retrieval practice";
  presentation.title = title;
  presentation.lang = "en-NZ";

  const slide = presentation.addSlide();
  slide.background = { color: READING_BACKGROUND };

  slide.addText("ST PETER'S  •  DO NOW", {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.34,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: "FFFFFF",
    margin: 0.08,
    fill: { color: palette.accent },
    line: { color: palette.accent, width: 0 },
    valign: "mid",
  });

  slide.addText(title, {
    x: 0.42,
    y: 0.48,
    w: 8.8,
    h: 0.55,
    fontFace: "Georgia",
    fontSize: 27,
    bold: true,
    color: "172033",
    margin: 0,
    fit: "shrink",
    valign: "mid",
    line: { color: READING_BACKGROUND, transparency: 100, width: 0 },
    fill: { color: READING_BACKGROUND, transparency: 100 },
  });

  slide.addText(yearLabel, {
    x: 9.55,
    y: 0.5,
    w: 3.35,
    h: 0.42,
    fontFace: "Aptos",
    fontSize: 12,
    bold: true,
    color: palette.accent,
    align: "right",
    margin: 0,
    fit: "shrink",
  });

  if (topicLine) {
    slide.addText(topicLine, {
      x: 0.42,
      y: 1.08,
      w: 12.48,
      h: 0.3,
      fontFace: "Aptos",
      fontSize: 10.5,
      bold: true,
      color: "536174",
      margin: 0,
      fit: "shrink",
    });
  }

  slide.addText(instructions, {
    x: 0.42,
    y: 1.43,
    w: 12.48,
    h: 0.46,
    fontFace: "Aptos",
    fontSize: 12.5,
    bold: true,
    color: "263244",
    margin: 0.1,
    fit: "shrink",
    valign: "mid",
    line: { color: palette.accent, width: 1.3 },
    fill: { color: READING_PANEL_ALT },
  });

  const layout = promptLayout(prompts.length);
  const fontSize = prompts.length <= 6 ? 18 : prompts.length <= 10 ? 15.5 : prompts.length <= 16 ? 13 : 11.5;

  prompts.forEach((prompt, index) => {
    const column = index % layout.columns;
    const row = Math.floor(index / layout.columns);
    const x = layout.left + column * (layout.boxWidth + layout.gapX);
    const y = layout.top + row * (layout.boxHeight + layout.gapY);

    slide.addText(`${index + 1}`, {
      x: x + 0.08,
      y: y + 0.08,
      w: 0.34,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 10.5,
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "mid",
      margin: 0,
      fill: { color: palette.accent },
      line: { color: palette.accent, width: 0 },
    });

    slide.addText(prompt, {
      x,
      y,
      w: layout.boxWidth,
      h: layout.boxHeight,
      fontFace: "Aptos",
      fontSize,
      bold: false,
      color: "172033",
      margin: { left: 0.14, right: 0.12, top: 0.42, bottom: 0.12 },
      fit: "shrink",
      valign: "mid",
      line: { color: index % 2 === 0 ? palette.accent : "D8C98A", width: index % 2 === 0 ? 1.1 : 0.8 },
      fill: { color: index % 2 === 0 ? READING_PANEL_ALT : READING_PANEL },
    });
  });

  await presentation.writeFile({
    fileName: `${safeFilePart(title)}-Teaching-Slide.pptx`,
    compression: true,
  });
}

export default function PowerPointDownloadEnhancer() {
  useEffect(() => {
    let disposed = false;

    const handlePowerPointClick = async (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = "Preparing PowerPoint…";
      try {
        await downloadPowerPoint();
        button.textContent = "Download PowerPoint";
      } catch (error) {
        console.error("PowerPoint download failed", error);
        button.textContent = "Try PowerPoint again";
      } finally {
        button.disabled = false;
      }
    };

    const installButton = () => {
      if (disposed) return;
      const actions = document.querySelector<HTMLElement>(".preview-actions");
      if (!actions || actions.querySelector("[data-powerpoint-download]")) return;

      const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>("button"));
      const wordButton = buttons.find((button) => button.textContent?.includes("Word"));
      const pdfButton = buttons.find((button) => button.textContent?.includes("PDF"));
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.powerpointDownload = "true";
      button.className = wordButton?.className || "word-button";
      button.textContent = "Download PowerPoint";
      button.setAttribute("aria-label", "Download an editable classroom PowerPoint slide for this activity");
      button.addEventListener("click", handlePowerPointClick);
      if (pdfButton) actions.insertBefore(button, pdfButton);
      else actions.appendChild(button);
    };

    installButton();
    const interval = window.setInterval(installButton, 750);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.querySelectorAll<HTMLButtonElement>("[data-powerpoint-download]").forEach((button) => {
        button.removeEventListener("click", handlePowerPointClick);
        button.remove();
      });
    };
  }, []);

  return null;
}