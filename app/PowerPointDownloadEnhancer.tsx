"use client";

import { useEffect } from "react";

type PowerPointSlide = {
  background?: { color: string };
  addImage: (options: { data: string; x: number; y: number; w: number; h: number }) => void;
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

async function downloadPowerPoint() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet");
  if (!sheet) throw new Error("Generate a starter before downloading it.");

  await document.fonts.ready;
  const [{ default: html2canvas }, PptxGenJS] = await Promise.all([
    import("html2canvas"),
    loadPowerPointLibrary(),
  ]);

  const canvas = await html2canvas(sheet, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fffdf9",
    logging: false,
    windowWidth: 1200,
    onclone: (clonedDocument: Document) => {
      const clonedSheet = clonedDocument.querySelector<HTMLElement>(".starter-sheet");
      if (clonedSheet) {
        clonedSheet.style.margin = "0";
        clonedSheet.style.boxShadow = "none";
        clonedSheet.style.width = "794px";
        clonedSheet.style.maxWidth = "794px";
      }
      clonedDocument.querySelectorAll(".swap-help, .swap-button, .answer-toggle").forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
    },
  });

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

  const slideWidth = 13.333;
  const slideHeight = 7.5;
  const margin = 0.25;
  const availableWidth = slideWidth - margin * 2;
  const availableHeight = slideHeight - margin * 2;
  const imageRatio = canvas.width / canvas.height;
  const availableRatio = availableWidth / availableHeight;
  const width = imageRatio > availableRatio ? availableWidth : availableHeight * imageRatio;
  const height = imageRatio > availableRatio ? availableWidth / imageRatio : availableHeight;

  slide.addImage({
    data: canvas.toDataURL("image/png"),
    x: (slideWidth - width) / 2,
    y: (slideHeight - height) / 2,
    w: width,
    h: height,
  });

  await presentation.writeFile({
    fileName: `Year-${safeFilePart(year)}-${safeFilePart(activity)}.pptx`,
    compression: true,
  });
}

export default function PowerPointDownloadEnhancer() {
  useEffect(() => {
    const handleClick = async (event: Event) => {
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
      const actions = document.querySelector<HTMLElement>(".preview-actions");
      if (!actions) return;
      if (actions.querySelector("[data-powerpoint-download]")) return;

      const buttons = Array.from(actions.querySelectorAll<HTMLButtonElement>("button"));
      const wordButton = buttons.find((button) => button.textContent?.includes("Word"));
      const pdfButton = buttons.find((button) => button.textContent?.includes("PDF"));
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.powerpointDownload = "true";
      button.className = wordButton?.className || "word-button";
      button.textContent = "Download PowerPoint";
      button.setAttribute("aria-label", "Download the generated starter as a PowerPoint slide");
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
