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
const MARGIN = 0.22;
const EXCLUDED = ".swap-help, .swap-button, .answer-toggle, button, input, select";
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

function number(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function colour(value: string) {
  const match = value.trim().match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return null;
  const alpha = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1;
  const hex = parts.slice(0, 3)
    .map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return { hex, alpha };
}

function directText(element: HTMLElement) {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function visible(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none"
    && style.visibility !== "hidden"
    && number(style.opacity || "1") > 0.01
    && rect.width > 1
    && rect.height > 1;
}

function excluded(element: HTMLElement) {
  return element.matches(EXCLUDED) || Boolean(element.closest(EXCLUDED));
}

function boxFor(element: HTMLElement, sheetRect: DOMRect, scale: number, originX: number, originY: number) {
  const rect = element.getBoundingClientRect();
  return {
    x: originX + (rect.left - sheetRect.left) * scale,
    y: originY + (rect.top - sheetRect.top) * scale,
    w: Math.max(0.02, rect.width * scale),
    h: Math.max(0.02, rect.height * scale),
  };
}

function addEditableContent(
  slide: PptxSlide,
  sheet: HTMLElement,
  sheetRect: DOMRect,
  scale: number,
  originX: number,
  originY: number,
) {
  const elements = [sheet, ...Array.from(sheet.querySelectorAll<HTMLElement>("*"))]
    .filter((element) => !excluded(element) && visible(element));

  for (const element of elements) {
    const style = window.getComputedStyle(element);
    const box = boxFor(element, sheetRect, scale, originX, originY);
    const background = colour(style.backgroundColor);
    const borderWidth = Math.max(
      number(style.borderTopWidth),
      number(style.borderRightWidth),
      number(style.borderBottomWidth),
      number(style.borderLeftWidth),
    );
    const border = colour(style.borderColor || style.borderTopColor);

    if ((background && background.alpha > 0.02) || (border && borderWidth > 0)) {
      slide.addText("", {
        ...box,
        margin: 0,
        isTextBox: true,
        fill: background
          ? { color: background.hex, transparency: Math.round((1 - background.alpha) * 100) }
          : { color: "FFFFFF", transparency: 100 },
        line: border && borderWidth > 0
          ? { color: border.hex, width: Math.max(0.4, borderWidth * scale * 72) }
          : { color: "FFFFFF", transparency: 100, width: 0 },
      });
    }

    const text = directText(element);
    if (!text) continue;

    const textColour = colour(style.color)?.hex ?? "171B22";
    const weight = Number.parseInt(style.fontWeight, 10);
    const fontSize = Math.max(5.5, Math.min(32, number(style.fontSize) * scale * 72));
    const fontFace = style.fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") || "Aptos";
    const tag = element.tagName.toLowerCase();

    slide.addText(text, {
      ...box,
      fontFace,
      fontSize,
      color: textColour,
      bold: Number.isFinite(weight) ? weight >= 600 : style.fontWeight === "bold",
      italic: style.fontStyle === "italic" || tag === "em",
      underline: style.textDecorationLine.includes("underline"),
      align: style.textAlign === "center" ? "center" : style.textAlign === "right" ? "right" : "left",
      valign: ["p", "li", "small", "em"].includes(tag) ? "top" : "mid",
      margin: Math.max(0.01, Math.min(0.08, number(style.paddingLeft) * scale)),
      fit: "shrink",
      paraSpaceAfterPt: 0,
      isTextBox: true,
      line: { color: "FFFFFF", transparency: 100, width: 0 },
      fill: { color: "FFFFFF", transparency: 100 },
    });
  }
}

async function downloadPowerPoint() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet");
  if (!sheet) throw new Error("Generate a starter before downloading it.");

  await document.fonts.ready;
  const PptxGenJS = await loadPptx();
  const sheetRect = sheet.getBoundingClientRect();
  const scale = Math.min(
    (SLIDE_WIDTH - MARGIN * 2) / sheetRect.width,
    (SLIDE_HEIGHT - MARGIN * 2) / sheetRect.height,
  );
  const originX = (SLIDE_WIDTH - sheetRect.width * scale) / 2;
  const originY = (SLIDE_HEIGHT - sheetRect.height * scale) / 2;

  const year = sheet.querySelector(".sheet-kicker span:last-child")?.textContent?.match(/Year\s+(\d+)/i)?.[1] ?? "Science";
  const activity = sheet.querySelector("h2")?.textContent?.trim() || "Retrieval Starter";
  const title = `Year ${year} ${activity}`;

  const presentation = new PptxGenJS();
  presentation.layout = "LAYOUT_WIDE";
  presentation.author = "Retrieval Starter Builder";
  presentation.company = "St Peter's School";
  presentation.subject = "Junior Science retrieval practice";
  presentation.title = title;
  presentation.lang = "en-NZ";

  const slide = presentation.addSlide();
  slide.background = { color: "FFFDF9" };
  addEditableContent(slide, sheet, sheetRect, scale, originX, originY);

  await presentation.writeFile({
    fileName: `Year-${safeFilePart(year)}-${safeFilePart(activity)}-Editable.pptx`,
    compression: true,
  });
}

export default function PowerPointDownloadEnhancer() {
  useEffect(() => {
    let disposed = false;

    const handleClick = async (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = "Preparing editable PowerPoint…";
      try {
        await downloadPowerPoint();
        button.textContent = "Download editable PowerPoint";
      } catch (error) {
        console.error("PowerPoint download failed", error);
        button.textContent = "Try editable PowerPoint again";
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
      button.textContent = "Download editable PowerPoint";
      button.setAttribute("aria-label", "Download the generated starter as an editable PowerPoint slide");
      button.addEventListener("click", handleClick);

      if (pdfButton) actions.insertBefore(button, pdfButton);
      else actions.appendChild(button);
    };

    installButton();
    const interval = window.setInterval(installButton, 750);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.querySelectorAll<HTMLButtonElement>("[data-powerpoint-download]").forEach((button) => {
        button.removeEventListener("click", handleClick);
        button.remove();
      });
    };
  }, []);

  return null;
}
