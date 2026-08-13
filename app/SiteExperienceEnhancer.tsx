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

function restoreConnectFourAnswersWhenExportFinishes(button: HTMLButtonElement, toggle: HTMLButtonElement) {
  let sawDisabled = false;
  const startedAt = Date.now();
  const timer = window.setInterval(() => {
    if (button.disabled) sawDisabled = true;
    const timedOut = Date.now() - startedAt > 20000;
    if ((sawDisabled && !button.disabled) || timedOut) {
      window.clearInterval(timer);
      if (toggle.textContent?.includes("Hide answers")) toggle.click();
    }
  }, 120);
}

export default function SiteExperienceEnhancer() {
  useEffect(() => {
    let disposed = false;

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

    const handleExportCapture = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("button")
        : null;
      if (!target) return;

      if (target.dataset.powerpointDownload === "true") {
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
        return;
      }

      const isWordDownload = target.classList.contains("word-button");
      const isPdfDownload = target.classList.contains("download-button");
      const connectFourSheet = document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
      if (!connectFourSheet || (!isWordDownload && !isPdfDownload)) return;

      if (target.dataset.connectFourAnswerReplay === "true") {
        delete target.dataset.connectFourAnswerReplay;
        return;
      }

      const toggle = connectFourSheet.querySelector<HTMLButtonElement>(".answer-toggle");
      if (!toggle || toggle.textContent?.includes("Hide answers")) return;

      event.preventDefault();
      event.stopPropagation();
      toggle.click();
      target.dataset.connectFourAnswerReplay = "true";

      window.setTimeout(() => {
        target.click();
        restoreConnectFourAnswersWhenExportFinishes(target, toggle);
      }, 0);
    };

    installScienceArtwork();
    document.addEventListener("click", handleExportCapture, true);

    const observer = new MutationObserver(() => installScienceArtwork());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("click", handleExportCapture, true);
      document.querySelectorAll("[data-science-hero-art], [data-science-doodles]").forEach((element) => element.remove());
    };
  }, []);

  return null;
}
