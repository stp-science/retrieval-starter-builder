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

type ConnectFourExportData = {
  title: string;
  course: string;
  topics: string;
  instructions: string;
  questions: string[];
  answers: string[];
};

function cleanText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function safeFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Connect-Four";
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function readConnectFourExportData(): ConnectFourExportData | null {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
  if (!sheet) return null;

  const questions = Array.from(sheet.querySelectorAll<HTMLElement>(".connect-four-grid > div > p"))
    .map((element) => cleanText(element.textContent))
    .filter(Boolean)
    .slice(0, 16);
  const answers = Array.from(sheet.querySelectorAll<HTMLElement>(".export-answer-bank [data-export-answer]"))
    .map((element) => cleanText(element.dataset.exportAnswer))
    .filter(Boolean)
    .slice(0, 16);

  if (!questions.length || !answers.length) return null;

  return {
    title: cleanText(sheet.querySelector("h2")?.textContent) || "Connect Four",
    course: cleanText(sheet.querySelector(".sheet-kicker span:last-child")?.textContent) || "Science",
    topics: Array.from(sheet.querySelectorAll<HTMLElement>(".topic-chips span"))
      .map((element) => cleanText(element.textContent))
      .filter(Boolean)
      .join(" • "),
    instructions: cleanText(sheet.querySelector(".instructions")?.textContent)
      || "Take turns choosing a square. Give an accurate answer to claim it; the first player or team to connect four squares wins.",
    questions,
    answers,
  };
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

function installConnectFourStyles() {
  if (document.querySelector("style[data-connect-four-enhancer]")) return;
  const style = document.createElement("style");
  style.dataset.connectFourEnhancer = "true";
  style.textContent = `
    .activity-connect-four > .answer-toggle { display: none !important; }
    .activity-connect-four .connect-four-grid > div > em:not(.connect-four-inline-answer) { display: none !important; }
    .connect-four-reveal-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
      padding: 6px 10px;
      border: 1px solid #d97706;
      border-radius: 999px;
      background: #fff9e8;
      color: #8a4a00;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }
    .connect-four-reveal-button:hover { background: #fff0b8; }
    .connect-four-inline-answer {
      display: block;
      margin-top: 8px;
      padding-top: 7px;
      border-top: 1px dashed #d8c98a;
      color: #365f72;
      font-style: normal;
      font-weight: 700;
    }
    .connect-four-inline-answer[hidden] { display: none !important; }
    .pdf-export .connect-four-reveal-button,
    .pdf-export .connect-four-inline-answer { display: none !important; }
  `;
  document.head.appendChild(style);
}

function restorePresentationAnswerControl() {
  document.querySelectorAll<HTMLElement>("[data-connect-four-global-answer]").forEach((element) => {
    element.style.removeProperty("display");
    delete element.dataset.connectFourGlobalAnswer;
  });
  document.querySelectorAll<HTMLElement>("[data-connect-four-presentation-copy]").forEach((element) => {
    const original = element.dataset.connectFourPresentationCopy;
    if (original !== undefined) element.textContent = original;
    delete element.dataset.connectFourPresentationCopy;
  });
}

function installConnectFourRevealControls() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
  if (!sheet) {
    restorePresentationAnswerControl();
    return;
  }

  const answers = Array.from(sheet.querySelectorAll<HTMLElement>(".export-answer-bank [data-export-answer]"))
    .map((element) => cleanText(element.dataset.exportAnswer));
  const cards = Array.from(sheet.querySelectorAll<HTMLElement>(".connect-four-grid > div"));

  cards.forEach((card, index) => {
    const answer = answers[index];
    if (!answer) return;

    let answerElement = card.querySelector<HTMLElement>(".connect-four-inline-answer");
    if (!answerElement) {
      answerElement = document.createElement("em");
      answerElement.className = "connect-four-inline-answer";
      answerElement.hidden = true;
      card.appendChild(answerElement);
    }
    answerElement.textContent = answer;

    let button = card.querySelector<HTMLButtonElement>(".connect-four-reveal-button");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "connect-four-reveal-button";
      button.textContent = "Reveal answer";
      button.setAttribute("aria-expanded", "false");
      const prompt = card.querySelector("p");
      if (prompt?.nextSibling) card.insertBefore(button, prompt.nextSibling);
      else card.appendChild(button);
      button.addEventListener("click", () => {
        const currentAnswer = card.querySelector<HTMLElement>(".connect-four-inline-answer");
        if (!currentAnswer) return;
        currentAnswer.hidden = !currentAnswer.hidden;
        button!.textContent = currentAnswer.hidden ? "Reveal answer" : "Hide answer";
        button!.setAttribute("aria-expanded", currentAnswer.hidden ? "false" : "true");
      });
    }
    button.setAttribute("aria-label", `${button.textContent || "Reveal answer"} for square ${index + 1}`);
  });

  const stage = sheet.closest<HTMLElement>(".presentation-stage");
  const controls = stage?.querySelector<HTMLElement>(".presentation-controls");
  if (controls) {
    const answerButton = Array.from(controls.querySelectorAll<HTMLButtonElement>("button"))
      .find((button) => /^(?:show|hide) answers$/i.test(cleanText(button.textContent)));
    if (answerButton) {
      answerButton.dataset.connectFourGlobalAnswer = "true";
      answerButton.style.display = "none";
    }
    const guidance = controls.querySelector<HTMLElement>("span");
    if (guidance && guidance.dataset.connectFourPresentationCopy === undefined) {
      guidance.dataset.connectFourPresentationCopy = guidance.textContent ?? "";
      guidance.textContent = "Reveal the answer only after a player has committed to their response.";
    }
  }
}

async function downloadConnectFourPdf(data: ConnectFourExportData) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

  const renderPage = (answersPage: boolean) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const accent = [217, 119, 6] as const;
    const navy = [23, 32, 51] as const;
    const muted = [83, 97, 116] as const;
    const pale = [255, 246, 214] as const;
    const paleAlt = [255, 251, 234] as const;
    const paleStrong = [255, 240, 184] as const;

    pdf.setFillColor(...pale);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(...accent);
    pdf.rect(0, 0, pageWidth, 9, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(answersPage ? "ST PETER'S  •  CHECK AND IMPROVE" : "ST PETER'S  •  DO NOW", 10, 6.2);

    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text(answersPage ? `${data.title} — Answers` : data.title, 10, 21);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...accent);
    pdf.text(data.course, pageWidth - 10, 20.5, { align: "right" });

    if (data.topics) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...muted);
      pdf.text(data.topics, 10, 28);
    }

    pdf.setFillColor(...paleStrong);
    pdf.setDrawColor(...accent);
    pdf.roundedRect(10, 32, pageWidth - 20, 13, 1.2, 1.2, "FD");
    pdf.setTextColor(...navy);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    const instruction = answersPage
      ? "Use this answer page to check a square only after the player has committed to an answer."
      : data.instructions;
    const instructionLines = pdf.splitTextToSize(instruction, pageWidth - 28) as string[];
    pdf.text(instructionLines.slice(0, 2), 14, 39.5);

    const columns = 4;
    const rows = 4;
    const gap = 2.2;
    const left = 10;
    const gridTop = 50;
    const bottom = 9;
    const cellWidth = (pageWidth - 20 - gap * (columns - 1)) / columns;
    const cellHeight = (pageHeight - gridTop - bottom - gap * (rows - 1)) / rows;
    const source = answersPage ? data.answers : data.questions;

    source.slice(0, 16).forEach((text, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = left + column * (cellWidth + gap);
      const y = gridTop + row * (cellHeight + gap);

      pdf.setFillColor(...(index % 2 === 0 ? paleStrong : paleAlt));
      pdf.setDrawColor(index % 2 === 0 ? accent[0] : 216, index % 2 === 0 ? accent[1] : 201, index % 2 === 0 ? accent[2] : 138);
      pdf.roundedRect(x, y, cellWidth, cellHeight, 1.2, 1.2, "FD");

      pdf.setFillColor(...accent);
      pdf.circle(x + 6.2, y + 6.3, 4, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.2);
      pdf.text(String(index + 1), x + 6.2, y + 7.1, { align: "center" });

      const maxWidth = cellWidth - 8;
      let fontSize = answersPage ? 9.2 : 9.4;
      let lines: string[] = [];
      do {
        pdf.setFontSize(fontSize);
        lines = pdf.splitTextToSize(text, maxWidth) as string[];
        if (lines.length <= 5) break;
        fontSize -= 0.45;
      } while (fontSize > 7.1);

      pdf.setTextColor(...navy);
      pdf.setFont("helvetica", answersPage ? "bold" : "normal");
      pdf.setFontSize(fontSize);
      pdf.text(lines.slice(0, 6), x + 4, y + 13.5, { lineHeightFactor: 1.15 });
    });

    pdf.setTextColor(...muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.8);
    pdf.text(
      answersPage ? "CHECK EACH CLAIMED SQUARE  •  CORRECT  •  IMPROVE" : "ANSWER FIRST  •  REVEAL TO CHECK  •  CLAIM THE SQUARE",
      pageWidth / 2,
      pageHeight - 3.6,
      { align: "center" },
    );
  };

  renderPage(false);
  pdf.addPage("a4", "landscape");
  renderPage(true);
  downloadBlob(pdf.output("blob"), `${safeFilePart(data.course)}-${safeFilePart(data.title)}.pdf`);
}

async function downloadConnectFourWord(data: ConnectFourExportData) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    HeightRule,
    PageBreak,
    PageOrientation,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableLayoutType,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");

  const border = { style: BorderStyle.SINGLE, size: 5, color: "D8C98A" };
  const tableBorders = {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border,
  };
  const para = (text: string, options: { bold?: boolean; color?: string; size?: number; center?: boolean; after?: number } = {}) => new Paragraph({
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { after: options.after ?? 50 },
    children: [new TextRun({ text, bold: options.bold, color: options.color, size: options.size ?? 18 })],
  });
  const cell = (children: InstanceType<typeof Paragraph>[], fill: string) => new TableCell({
    children,
    shading: { fill, color: "auto", type: ShadingType.CLEAR },
    margins: { top: 90, bottom: 90, left: 100, right: 100 },
  });
  const grid = (items: string[], answersPage: boolean) => {
    const rows: InstanceType<typeof TableRow>[] = [];
    for (let row = 0; row < 4; row += 1) {
      rows.push(new TableRow({
        cantSplit: true,
        height: { value: 1800, rule: HeightRule.ATLEAST },
        children: Array.from({ length: 4 }, (_, column) => {
          const index = row * 4 + column;
          const text = items[index] ?? "";
          return cell([
            para(String(index + 1), { bold: true, color: "D97706", size: 15, after: 30 }),
            para(text, { bold: answersPage, color: "172033", size: answersPage ? 17 : 18, after: 0 }),
          ], index % 2 === 0 ? "FFF0B8" : "FFFBEA");
        }),
      }));
    }
    return new Table({
      rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: tableBorders,
    });
  };
  const header = (answersPage: boolean) => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({
        text: answersPage ? "ST PETER'S • CHECK AND IMPROVE" : "ST PETER'S • DO NOW",
        bold: true,
        color: "D97706",
        size: 18,
      })],
    }),
    para(answersPage ? `${data.title} — Answers` : data.title, { bold: true, center: true, color: "172033", size: 34, after: 60 }),
    para(`${data.course}${data.topics ? `  •  ${data.topics}` : ""}`, { bold: true, center: true, color: "536174", size: 16, after: 90 }),
    new Table({
      rows: [new TableRow({
        children: [cell([
          para(
            answersPage
              ? "Use this page to check a square only after the player has committed to an answer."
              : data.instructions,
            { bold: true, color: "263244", size: 17, after: 0 },
          ),
        ], "FFF0B8")],
      })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: tableBorders,
    }),
    para("", { after: 40 }),
  ];

  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    ...header(false),
    grid(data.questions.slice(0, 16), false),
    para("ANSWER FIRST  •  REVEAL TO CHECK  •  CLAIM THE SQUARE", { bold: true, center: true, color: "536174", size: 14, after: 0 }),
    new Paragraph({ children: [new PageBreak()] }),
    ...header(true),
    grid(data.answers.slice(0, 16), true),
    para("CHECK EACH CLAIMED SQUARE  •  CORRECT  •  IMPROVE", { bold: true, center: true, color: "536174", size: 14, after: 0 }),
  ];

  const document = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 360, right: 360, bottom: 360, left: 360 },
        },
      },
      children,
    }],
  });
  const blob = await Packer.toBlob(document);
  downloadBlob(blob, `${safeFilePart(data.course)}-${safeFilePart(data.title)}.docx`);
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

    const refreshEnhancements = () => {
      installScienceArtwork();
      installConnectFourRevealControls();
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
      if (!isWordDownload && !isPdfDownload) return;

      const data = readConnectFourExportData();
      if (!data) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (target.dataset.connectFourExportBusy === "true") return;

      target.dataset.connectFourExportBusy = "true";
      target.disabled = true;
      target.textContent = isWordDownload ? "Preparing Word…" : "Preparing PDF…";

      const exportTask = isWordDownload ? downloadConnectFourWord(data) : downloadConnectFourPdf(data);
      void exportTask
        .catch((error) => {
          console.error(`Connect Four ${isWordDownload ? "Word" : "PDF"} export failed`, error);
          target.textContent = isWordDownload ? "Try Word again" : "Try download again";
        })
        .finally(() => {
          delete target.dataset.connectFourExportBusy;
          target.disabled = false;
          if (!target.textContent?.startsWith("Try")) {
            target.textContent = isWordDownload ? "Download Word" : "Download PDF";
          }
        });
    };

    installConnectFourStyles();
    refreshEnhancements();
    document.addEventListener("click", handleExportCapture, true);

    const observer = new MutationObserver(() => refreshEnhancements());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("click", handleExportCapture, true);
      restorePresentationAnswerControl();
      document.querySelector("style[data-connect-four-enhancer]")?.remove();
      document.querySelectorAll("[data-science-hero-art], [data-science-doodles]").forEach((element) => element.remove());
    };
  }, []);

  return null;
}
