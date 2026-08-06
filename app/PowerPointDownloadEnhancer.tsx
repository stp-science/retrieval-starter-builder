"use client";

import { useEffect } from "react";

type PowerPointSlide = {
  background?: { color: string };
  addText: (text: string, options: Record<string, unknown>) => void;
};

type PowerPointDocument = {
  layout: string;
  author: string;
  company: string;
  subject: string;
  title: string;
  lang: string;
  addSlide: () => PowerPointSlide;
  writeFile: (options: { fileName: string; compression?: boolean }) => Promise<string>;
};

type PowerPointConstructor = new () => PowerPointDocument;

declare global {
  interface Window {
    PptxGenJS?: PowerPointConstructor;
  }
}

const PPTX_SCRIPT_URLS = [
  "https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js",
  "https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js",
];

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;
const SLIDE_MARGIN = 0.22;
const EXCLUDED_SELECTOR = ".swap-help, .swap-button, .answer-toggle, button, input, select";

let powerPointLoader: Promise<PowerPointConstructor> | null = null;

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

async function loadPowerPointLibrary() {
  if (window.PptxGenJS) return window.PptxGenJS;
  if (powerPointLoader) return powerPointLoader;

  powerPointLoader = (async () => {
    let lastError: unknown;
    for (const src of PPTX_SCRIPT_URLS) {
      try {
        await loadScript(src);
        if (window.PptxGenJS) return window.PptxGenJS;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("PowerPoint support could not be loaded.");
  })();

  try {
    return await powerPointLoader;
  } catch (error) {
    powerPointLoader = null;
    throw error;
  }
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Retrieval-Starter";
}

function parsePixels(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCssColor(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "transparent") return null;

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        color: hex.split("").map((character) => character + character).join("").toUpperCase(),
        alpha: 1,
      };
    }
    if (hex.length >= 6) return { color: hex.slice(0, 6).toUpperCase(), alpha: 1 };
  }

  const match = trimmed.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some((part) => !Number.isFinite(part))) return null;
  const alpha = parts.length > 3 && Number.isFinite(parts[3]) ? parts[3] : 1;
  const color = parts.slice(0, 3)
    .map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return { color, alpha };
}

function directText(element: HTMLElement) {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function isExcluded(element: HTMLElement) {
  return element.matches(EXCLUDED_SELECTOR) || Boolean(element.closest(EXCLUDED_SELECTOR));
}

function isVisible(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none"
    && style.visibility !== "hidden"
    && Number.parseFloat(style.opacity || "1") > 0.01
    && rect.width > 1
    && rect.height > 1;
}

function fontFace(style: CSSStyleDeclaration) {
  const first = style.fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "");
  return first || "Aptos";
}

function textAlignment(value: string) {
  if (value === "center") return "center";
  if (value === "right" || value === "end") return "right";
  if (value === "justify") return "justify";
  return "left";
}

function elementBox(
  element: HTMLElement,
  sheetRect: DOMRect,
  scale: number,
  originX: number,
  originY: number,
) {
  const rect = element.getBoundingClientRect();
  return {
    x: originX + (rect.left - sheetRect.left) * scale,
    y: originY + (rect.top - sheetRect.top) * scale,
    w: Math.max(0.02, rect.width * scale),
    h: Math.max(0.02, rect.height * scale),
  };
}

function addEditableBoxes(
  slide: PowerPointSlide,
  sheet: HTMLElement,
  sheetRect: DOMRect,
  scale: number,
  originX: number,
  originY: number,
) {
  const elements = [sheet, ...Array.from(sheet.querySelectorAll<HTMLElement>("*"))]
    .filter((element) => !isExcluded(element) && isVisible(element));

  for (const element of elements) {
    const style = window.getComputedStyle(element);
    const background = parseCssColor(style.backgroundColor);
    const borders = [
      { width: parsePixels(style.borderTopWidth), style: style.borderTopStyle, color: parseCssColor(style.borderTopColor) },
      { width: parsePixels(style.borderRightWidth), style: style.borderRightStyle, color: parseCssColor(style.borderRightColor) },
      { width: parsePixels(style.borderBottomWidth), style: style.borderBottomStyle, color: parseCssColor(style.borderBottomColor) },
      { width: parsePixels(style.borderLeftWidth), style: style.borderLeftStyle, color: parseCssColor(style.borderLeftColor) },
    ].filter((border) => border.width > 0 && border.style !== "none" && border.color && border.color.alpha > 0.02);

    const hasFill = Boolean(background && background.alpha > 0.02);
    const hasBorder = borders.length > 0;
    if (!hasFill && !hasBorder) continue;

    const box = elementBox(element, sheetRect, scale, originX, originY);
    const strongestBorder = borders.sort((left, right) => right.width - left.width)[0];
    const options: Record<string, unknown> = {
      ...box,
      margin: 0,
      isTextBox: true,
    };

    if (hasFill && background) options.fill = { color: background.color, transparency: Math.round((1 - background.alpha) * 100) };
    if (strongestBorder?.color) {
      options.line = {
        color: strongestBorder.color.color,
        transparency: Math.round((1 - strongestBorder.color.alpha) * 100),
        width: Math.max(0.4, strongestBorder.width * scale * 72),
      };
    } else {
      options.line = { color: "FFFFFF", transparency: 100, width: 0 };
    }

    slide.addText("", options);
  }
}

function addEditableText(
  slide: PowerPointSlide,
  sheet: HTMLElement,
  sheetRect: DOMRect,
  scale: number,
  originX: number,
  originY: number,
) {
  const elements = [sheet, ...Array.from(sheet.querySelectorAll<HTMLElement>("*"))]
    .filter((element) => !isExcluded(element) && isVisible(element));

  for (const element of elements) {
    const text = directText(element);
    if (!text) continue;

    const style = window.getComputedStyle(element);
    const textColor = parseCssColor(style.color)?.color ?? "171B22";
    const box = elementBox(element, sheetRect, scale, originX, originY);
    const weight = Number.parseInt(style.fontWeight, 10);
    const originalFontSize = parsePixels(style.fontSize);
    const calculatedFontSize = originalFontSize * scale * 72;
    const tag = element.tagName.toLowerCase();
    const isParagraph = ["p", "li", "em", "small"].includes(tag);

    slide.addText(text, {
      ...box,
      fontFace: fontFace(style),
      fontSize: Math.max(5.5, Math.min(32, calculatedFontSize)),
      color: textColor,
      bold: Number.isFinite(weight) ? weight >= 600 : style.fontWeight === "bold",
      italic: style.fontStyle === "italic" || tag === "em",
      underline: style.textDecorationLine.includes("underline"),
      align: textAlignment(style.textAlign),
      valign: isParagraph ? "top" : "mid",
      margin: Math.max(0.01, Math.min(0.08, parsePixels(style.paddingLeft) * scale)),
      breakLine: false,
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
  const PptxGenJS = await loadPowerPointLibrary();
  const sheetRect = sheet.getBoundingClientRect();

  const availableWidth = SLIDE_WIDTH - SLIDE_MARGIN * 2;
  const availableHeight = SLIDE_HEIGHT - SLIDE_MARGIN * 2;
  const scale = Math.min(availableWidth / sheetRect.width, availableHeight / sheetRect.height);
  const renderedWidth = sheetRect.width * scale;
  const renderedHeight = sheetRect.height * scale;
  const originX = (SLIDE_WIDTH - renderedWidth) / 2;
  const originY = (SLIDE_HEIGHT - renderedHeight) / 2;

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

  addEditableBoxes(slide, sheet, sheetRect, scale, originX, originY);
  addEditableText(slide, sheet, sheetRect, scale, originX, originY);

  await presentation.writeFile({
    fileName: `Year-${safeFilePart(year)}-${safeFilePart(activity)}-Editable.pptx`,
    compression: true,
  });
}

export default function PowerPointDownloadEnhancer() {
  useEffect(() => {
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
      const actions = document.querySelector<HTMLElement>(".preview-actions");
      if (!actions) return;
      const existing = actions.querySelector<HTMLButtonElement>("[data-powerpoint-download]");
      if (existing) {
        existing.textContent = "Download editable PowerPoint";
        return;
      }

      const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>("button"));
      const wordButton = buttons.find((button) => button.textContent?.includes("Word"));
      const pdfButton = buttons.find((button) => button.textContent?.includes("PDF"));
      if (wordButton) {
        wordButton.textContent = wordButton.textContent?.replace("Download Word", "Download editable Word") ?? "Download editable Word";
        wordButton.setAttribute("aria-label", "Download the generated starter as an editable Word document");
      }

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.powerpointDownload = "true";
      button.className = wordButton?.className || "word-button";
      button.textContent = "Download editable PowerPoint";
      button.setAttribute("aria-label", "Download the generated starter as a fully editable PowerPoint slide");
      button.addEventListener("click", handleClick);

      if (pdfButton) actions.insertBefore(button, pdfButton);
      else actions.appendChild(button);
    };

    installButton();
    const observer = new MutationObserver(installButton);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.querySelectorAll<HTMLButtonElement>("[data-powerpoint-download]").forEach((button) => {
        button.removeEventListener("click", handleClick);
        button.remove();
      });
    };
  }, []);

  return null;
}
