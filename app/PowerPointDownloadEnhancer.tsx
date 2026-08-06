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
const STYLE_ID = "retrieval-export-and-text-improvements";
let loader: Promise<PptxConstructor> | null = null;

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
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).map((element) => cleanText(element.textContent));
}

function activityId(sheet: HTMLElement) {
  const className = Array.from(sheet.classList).find((name) => name.startsWith("activity-"));
  return className?.replace("activity-", "") ?? "";
}

function extractTitleAndPrompts() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet");
  if (!sheet) throw new Error("Generate an activity before downloading it.");

  const title = cleanText(sheet.querySelector("h2")?.textContent) || "Retrieval Activity";
  const activity = activityId(sheet);
  let prompts: string[] = [];

  switch (activity) {
    case "thinking-linking":
      prompts = texts(sheet, ".linking-grid > div").map((value) => value.replace(/^\d+\s*/, ""));
      break;
    case "concept-map": {
      const centre = cleanText(sheet.querySelector(".concept-core strong")?.textContent);
      prompts = texts(sheet, ".concept-terms span").map((word) => `Connect ${word} to ${centre || "the central concept"}.`);
      break;
    }
    case "back-to-back":
      prompts = texts(sheet, ".keyword-card strong").map((word) => `Describe the term: ${word}`);
      break;
    case "picture-prompts":
      prompts = texts(sheet, ".picture-prompt strong").map((symbol, index) => `Picture ${index + 1}: ${symbol}`);
      break;
    case "brain-dump":
      prompts = texts(sheet, ".brain-grid h3").map((topic) => `Write everything you can remember about ${topic}.`);
      break;
    case "cops-robbers":
      prompts = texts(sheet, ".robbers-grid h3").map((topic) => `Recall as much knowledge as possible about ${topic}.`);
      break;
    case "retrieval-relay":
      prompts = texts(sheet, ".relay-grid h3").map((topic) => `Take turns recalling facts about ${topic}.`);
      break;
    case "list-it":
      prompts = Array.from(sheet.querySelectorAll<HTMLElement>(".list-grid section")).flatMap((section) => {
        const topic = cleanText(section.querySelector("h3")?.textContent);
        return texts(section, "li").map((item) => `${topic}: ${item}`);
      });
      break;
    case "two-things":
      prompts = texts(sheet, ".two-things-grid h3").map((topic) => `Write two accurate things you remember about ${topic}.`);
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
    prompts = texts(sheet, "p").filter((value) => {
      const lower = value.toLowerCase();
      return value.length > 2
        && !lower.includes("want a different prompt")
        && !lower.includes("from memory first")
        && value !== cleanText(sheet.querySelector(".instructions")?.textContent);
    });
  }

  return { sheet, title, prompts: unique(prompts) };
}

function promptLayout(count: number) {
  const columns = count <= 6 ? 1 : count <= 12 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(count / columns));
  const gapX = 0.18;
  const gapY = 0.14;
  const left = 0.42;
  const top = 1.16;
  const usableWidth = SLIDE_WIDTH - left * 2;
  const usableHeight = SLIDE_HEIGHT - top - 0.3;
  return {
    columns,
    rows,
    left,
    top,
    gapX,
    gapY,
    boxWidth: (usableWidth - gapX * (columns - 1)) / columns,
    boxHeight: (usableHeight - gapY * (rows - 1)) / rows,
  };
}

async function downloadPowerPoint() {
  const { title, prompts } = extractTitleAndPrompts();
  const PptxGenJS = await loadPptx();
  const presentation = new PptxGenJS();
  presentation.layout = "LAYOUT_WIDE";
  presentation.author = "Retrieval Starter Builder";
  presentation.company = "St Peter's School";
  presentation.subject = "Junior Science retrieval practice";
  presentation.title = title;
  presentation.lang = "en-NZ";

  const slide = presentation.addSlide();
  slide.background = { color: "FFFDF9" };
  slide.addText(title, {
    x: 0.42,
    y: 0.24,
    w: 12.48,
    h: 0.66,
    fontFace: "Georgia",
    fontSize: 28,
    bold: false,
    color: "171B22",
    margin: 0,
    fit: "shrink",
    valign: "mid",
    line: { color: "FFFFFF", transparency: 100, width: 0 },
    fill: { color: "FFFFFF", transparency: 100 },
  });
  slide.addText("", {
    x: 0.42,
    y: 0.96,
    w: 12.48,
    h: 0.04,
    margin: 0,
    line: { color: "CF082B", width: 2.4 },
    fill: { color: "CF082B" },
  });

  const layout = promptLayout(prompts.length);
  const fontSize = prompts.length <= 6 ? 21 : prompts.length <= 10 ? 18 : prompts.length <= 16 ? 15 : 12.5;

  prompts.forEach((prompt, index) => {
    const column = index % layout.columns;
    const row = Math.floor(index / layout.columns);
    const x = layout.left + column * (layout.boxWidth + layout.gapX);
    const y = layout.top + row * (layout.boxHeight + layout.gapY);
    slide.addText(`${index + 1}.  ${prompt}`, {
      x,
      y,
      w: layout.boxWidth,
      h: layout.boxHeight,
      fontFace: "Aptos",
      fontSize,
      color: "171B22",
      bold: false,
      margin: 0.14,
      breakLine: false,
      fit: "shrink",
      valign: "mid",
      line: { color: "D8D0C9", width: 1 },
      fill: { color: index % 2 === 0 ? "FFFDF9" : "F7F3EF" },
      radius: 0.08,
    });
  });

  await presentation.writeFile({
    fileName: `${safeFilePart(title)}-Editable.pptx`,
    compression: true,
  });
}

async function downloadWord() {
  const { title, prompts } = extractTitleAndPrompts();
  const { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [new TextRun({ text: title, bold: true, color: "171B22", size: 34 })],
    }),
    ...prompts.map((prompt, index) => new Paragraph({
      spacing: { after: 180, line: 320 },
      children: [
        new TextRun({ text: `${index + 1}. `, bold: true, color: "CF082B", size: 25 }),
        new TextRun({ text: prompt, color: "171B22", size: 25 }),
      ],
    })),
  ];

  const document = new Document({
    sections: [{
      properties: { page: { margin: { top: 620, right: 720, bottom: 620, left: 720 } } },
      children,
    }],
  });
  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFilePart(title)}-Editable.docx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function installTextSizeStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .starter-sheet :is(
      .question-list li,
      .retrieval-grid p,
      .challenge-grid p,
      .trade-card strong,
      .bingo-grid p,
      .roulette-grid p,
      .placemat-grid > div p,
      .clock-card p,
      .chain-card p,
      .match-item p,
      .cloze-grid p,
      .flashcard p,
      .connect-four-grid p,
      .list-grid li
    ) {
      font-size: 16px !important;
      line-height: 1.48 !important;
    }
    .starter-sheet .keyword-card strong { font-size: 20px !important; }
    .starter-sheet .picture-prompt strong { font-size: 46px !important; }
  `;
  document.head.appendChild(style);
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
        button.textContent = "Download editable PowerPoint";
      } catch (error) {
        console.error("PowerPoint download failed", error);
        button.textContent = "Try PowerPoint again";
      } finally {
        button.disabled = false;
      }
    };

    const handleWordClick = async (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const button = event.currentTarget as HTMLButtonElement;
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = "Preparing Word…";
      try {
        await downloadWord();
        button.textContent = "Download editable Word";
      } catch (error) {
        console.error("Word download failed", error);
        button.textContent = "Try Word again";
      } finally {
        button.disabled = false;
      }
    };

    const installButtons = () => {
      if (disposed) return;
      const actions = document.querySelector<HTMLElement>(".preview-actions");
      if (!actions) return;

      const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>("button"));
      const wordButton = buttons.find((button) => button.textContent?.includes("Word"));
      const pdfButton = buttons.find((button) => button.textContent?.includes("PDF"));

      if (wordButton && !wordButton.dataset.cleanWordDownload) {
        wordButton.dataset.cleanWordDownload = "true";
        wordButton.textContent = "Download editable Word";
        wordButton.addEventListener("click", handleWordClick, true);
      }

      if (!actions.querySelector("[data-powerpoint-download]")) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.powerpointDownload = "true";
        button.className = wordButton?.className || "word-button";
        button.textContent = "Download editable PowerPoint";
        button.setAttribute("aria-label", "Download the activity title and questions as an editable PowerPoint slide");
        button.addEventListener("click", handlePowerPointClick);
        if (pdfButton) actions.insertBefore(button, pdfButton);
        else actions.appendChild(button);
      }
    };

    installTextSizeStyles();
    installButtons();
    const interval = window.setInterval(installButtons, 750);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.getElementById(STYLE_ID)?.remove();
      document.querySelectorAll<HTMLButtonElement>("[data-clean-word-download]").forEach((button) => {
        button.removeEventListener("click", handleWordClick, true);
        delete button.dataset.cleanWordDownload;
      });
      document.querySelectorAll<HTMLButtonElement>("[data-powerpoint-download]").forEach((button) => {
        button.removeEventListener("click", handlePowerPointClick);
        button.remove();
      });
    };
  }, []);

  return null;
}
