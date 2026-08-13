"use client";

import { useEffect } from "react";

type ConnectFourData = {
  title: string;
  course: string;
  topics: string;
  instructions: string;
  questions: string[];
  answers: string[];
};

function clean(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function filePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "Connect-Four";
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getData(): ConnectFourData | null {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
  if (!sheet) return null;

  const questions = Array.from(sheet.querySelectorAll<HTMLElement>(".connect-four-grid > div > p"))
    .map((item) => clean(item.textContent))
    .filter(Boolean)
    .slice(0, 16);
  const answers = Array.from(sheet.querySelectorAll<HTMLElement>(".export-answer-bank [data-export-answer]"))
    .map((item) => clean(item.dataset.exportAnswer))
    .filter(Boolean)
    .slice(0, 16);

  if (!questions.length || answers.length < questions.length) return null;

  return {
    title: clean(sheet.querySelector("h2")?.textContent) || "Connect Four",
    course: clean(sheet.querySelector(".sheet-kicker span:last-child")?.textContent) || "Science",
    topics: Array.from(sheet.querySelectorAll<HTMLElement>(".topic-chips span"))
      .map((item) => clean(item.textContent))
      .filter(Boolean)
      .join(" • "),
    instructions: clean(sheet.querySelector(".instructions")?.textContent)
      || "Take turns choosing a square. Give an accurate answer to claim it; the first player or team to connect four squares wins.",
    questions,
    answers,
  };
}

function installStyles() {
  if (document.querySelector("style[data-connect-four-reveal-style]")) return;
  const style = document.createElement("style");
  style.dataset.connectFourRevealStyle = "true";
  style.textContent = `
    .activity-connect-four > .answer-toggle { display: none !important; }
    .activity-connect-four .connect-four-grid > div > em:not(.connect-four-square-answer) { display: none !important; }
    .connect-four-reveal-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
      padding: 5px 9px;
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
    .connect-four-square-answer {
      display: block;
      margin-top: 7px;
      padding-top: 6px;
      border-top: 1px dashed #d8c98a;
      color: #365f72;
      font-style: normal;
      font-weight: 700;
    }
    .connect-four-square-answer[hidden] { display: none !important; }
    .pdf-export .connect-four-reveal-button,
    .pdf-export .connect-four-square-answer { display: none !important; }
  `;
  document.head.appendChild(style);
}

function installRevealButtons() {
  const sheet = document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
  if (!sheet) return;

  const data = getData();
  if (!data) return;
  const cards = Array.from(sheet.querySelectorAll<HTMLElement>(".connect-four-grid > div"));

  cards.forEach((card, index) => {
    const answer = data.answers[index];
    if (!answer) return;

    let answerBox = card.querySelector<HTMLElement>(".connect-four-square-answer");
    if (!answerBox) {
      answerBox = document.createElement("em");
      answerBox.className = "connect-four-square-answer";
      answerBox.hidden = true;
      card.appendChild(answerBox);
    }
    if (answerBox.textContent !== answer) answerBox.textContent = answer;

    if (!card.querySelector(".connect-four-reveal-button")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "connect-four-reveal-button";
      button.dataset.connectFourReveal = "true";
      button.textContent = "Reveal answer";
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", `Reveal answer for square ${index + 1}`);
      const question = card.querySelector("p");
      if (question?.nextSibling) card.insertBefore(button, question.nextSibling);
      else card.appendChild(button);
    }
  });

  const stage = sheet.closest<HTMLElement>(".presentation-stage");
  const controls = stage?.querySelector<HTMLElement>(".presentation-controls");
  if (!controls) return;
  const globalAnswer = Array.from(controls.querySelectorAll<HTMLButtonElement>("button"))
    .find((button) => /^(show|hide) answers$/i.test(clean(button.textContent)));
  if (globalAnswer) globalAnswer.style.display = "none";
  const hint = controls.querySelector<HTMLElement>("span");
  if (hint && hint.dataset.connectFourHint !== "true") {
    hint.dataset.connectFourHint = "true";
    hint.dataset.originalHint = hint.textContent ?? "";
    hint.textContent = "Reveal only the chosen square after a player has committed to an answer.";
  }
}

function restorePresentationControls() {
  document.querySelectorAll<HTMLElement>(".presentation-controls span[data-connect-four-hint='true']").forEach((hint) => {
    hint.textContent = hint.dataset.originalHint ?? "Use Show answers when pupils are ready to check.";
    delete hint.dataset.connectFourHint;
    delete hint.dataset.originalHint;
  });
  document.querySelectorAll<HTMLButtonElement>(".presentation-controls button").forEach((button) => {
    if (/^(show|hide) answers$/i.test(clean(button.textContent))) button.style.removeProperty("display");
  });
}

async function makePdf(data: ConnectFourData) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });

  const drawPage = (answersPage: boolean) => {
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const source = answersPage ? data.answers : data.questions;

    pdf.setFillColor(255, 246, 214);
    pdf.rect(0, 0, width, height, "F");
    pdf.setFillColor(217, 119, 6);
    pdf.rect(0, 0, width, 9, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(answersPage ? "ST PETER'S  •  ANSWER KEY" : "ST PETER'S  •  DO NOW", 10, 6.2);

    pdf.setTextColor(23, 32, 51);
    pdf.setFontSize(23);
    pdf.text(answersPage ? `${data.title} — Answers` : data.title, 10, 21);
    pdf.setTextColor(217, 119, 6);
    pdf.setFontSize(10);
    pdf.text(data.course, width - 10, 20.5, { align: "right" });

    if (data.topics) {
      pdf.setTextColor(83, 97, 116);
      pdf.setFontSize(9);
      pdf.text(data.topics, 10, 28);
    }

    pdf.setFillColor(255, 240, 184);
    pdf.setDrawColor(217, 119, 6);
    pdf.roundedRect(10, 32, width - 20, 13, 1.2, 1.2, "FD");
    pdf.setTextColor(38, 50, 68);
    pdf.setFontSize(9.2);
    const message = answersPage
      ? "Check the numbered answer only after the player has committed to their response."
      : data.instructions;
    pdf.text((pdf.splitTextToSize(message, width - 28) as string[]).slice(0, 2), 14, 39.5);

    const left = 10;
    const top = 50;
    const gap = 2.2;
    const cellWidth = (width - 20 - gap * 3) / 4;
    const cellHeight = (height - top - 9 - gap * 3) / 4;

    source.slice(0, 16).forEach((text, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = left + col * (cellWidth + gap);
      const y = top + row * (cellHeight + gap);
      if (index % 2 === 0) pdf.setFillColor(255, 240, 184);
      else pdf.setFillColor(255, 251, 234);
      pdf.setDrawColor(index % 2 === 0 ? 217 : 216, index % 2 === 0 ? 119 : 201, index % 2 === 0 ? 6 : 138);
      pdf.roundedRect(x, y, cellWidth, cellHeight, 1.2, 1.2, "FD");

      pdf.setFillColor(217, 119, 6);
      pdf.circle(x + 6.1, y + 6.1, 3.8, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text(String(index + 1), x + 6.1, y + 6.9, { align: "center" });

      pdf.setTextColor(23, 32, 51);
      pdf.setFont("helvetica", answersPage ? "bold" : "normal");
      let size = answersPage ? 9.2 : 9.4;
      let lines = pdf.splitTextToSize(text, cellWidth - 8) as string[];
      while (lines.length > 5 && size > 7.2) {
        size -= 0.4;
        pdf.setFontSize(size);
        lines = pdf.splitTextToSize(text, cellWidth - 8) as string[];
      }
      pdf.setFontSize(size);
      pdf.text(lines.slice(0, 6), x + 4, y + 13.3, { lineHeightFactor: 1.14 });
    });

    pdf.setTextColor(83, 97, 116);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(
      answersPage ? "CHECK EACH SQUARE  •  CORRECT  •  IMPROVE" : "ANSWER FIRST  •  THEN CHECK  •  CLAIM THE SQUARE",
      width / 2,
      height - 3.4,
      { align: "center" },
    );
  };

  drawPage(false);
  pdf.addPage("a4", "landscape");
  drawPage(true);
  saveBlob(pdf.output("blob"), `${filePart(data.course)}-${filePart(data.title)}.pdf`);
}

async function makeWord(data: ConnectFourData) {
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
  const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
  const paragraph = (text: string, bold = false, colour = "172033", size = 18, after = 45, centre = false) => new Paragraph({
    alignment: centre ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { after },
    children: [new TextRun({ text, bold, color: colour, size })],
  });
  const cell = (children: InstanceType<typeof Paragraph>[], fill = "FFFBEA") => new TableCell({
    children,
    shading: { fill, color: "auto", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
  });
  const grid = (items: string[], answersPage: boolean) => {
    const rows: InstanceType<typeof TableRow>[] = [];
    for (let row = 0; row < 4; row += 1) {
      rows.push(new TableRow({
        cantSplit: true,
        height: { value: 1700, rule: HeightRule.ATLEAST },
        children: Array.from({ length: 4 }, (_, col) => {
          const index = row * 4 + col;
          return cell([
            paragraph(String(index + 1), true, "D97706", 15, 25),
            paragraph(items[index] ?? "", answersPage, "172033", answersPage ? 16 : 17, 0),
          ], index % 2 === 0 ? "FFF0B8" : "FFFBEA");
        }),
      }));
    }
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: TableLayoutType.FIXED, borders });
  };
  const header = (answersPage: boolean) => [
    paragraph(answersPage ? "ST PETER'S • ANSWER KEY" : "ST PETER'S • DO NOW", true, "D97706", 18, 45, true),
    paragraph(answersPage ? `${data.title} — Answers` : data.title, true, "172033", 32, 45, true),
    paragraph(`${data.course}${data.topics ? ` • ${data.topics}` : ""}`, true, "536174", 15, 70, true),
    new Table({
      rows: [new TableRow({ children: [cell([
        paragraph(
          answersPage ? "Check the numbered answer only after the player has committed to their response." : data.instructions,
          true,
          "263244",
          16,
          0,
        ),
      ], "FFF0B8")] })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders,
    }),
    paragraph("", false, "172033", 8, 20),
  ];

  const content: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    ...header(false),
    grid(data.questions, false),
    paragraph("ANSWER FIRST • THEN CHECK • CLAIM THE SQUARE", true, "536174", 13, 0, true),
    new Paragraph({ children: [new PageBreak()] }),
    ...header(true),
    grid(data.answers, true),
    paragraph("CHECK EACH SQUARE • CORRECT • IMPROVE", true, "536174", 13, 0, true),
  ];

  const document = new Document({
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.LANDSCAPE },
          margin: { top: 320, right: 320, bottom: 320, left: 320 },
        },
      },
      children: content,
    }],
  });
  saveBlob(await Packer.toBlob(document), `${filePart(data.course)}-${filePart(data.title)}.docx`);
}

export default function ConnectFourEnhancer() {
  useEffect(() => {
    installStyles();

    const refresh = () => {
      if (document.querySelector(".starter-sheet.activity-connect-four")) installRevealButtons();
      else restorePresentationControls();
    };

    const handleClick = (event: MouseEvent) => {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
      if (!button) return;

      if (button.dataset.connectFourReveal === "true") {
        const card = button.closest<HTMLElement>(".connect-four-grid > div");
        const answer = card?.querySelector<HTMLElement>(".connect-four-square-answer");
        if (!answer) return;
        answer.hidden = !answer.hidden;
        button.textContent = answer.hidden ? "Reveal answer" : "Hide answer";
        button.setAttribute("aria-expanded", answer.hidden ? "false" : "true");
        return;
      }

      const isWord = button.classList.contains("word-button");
      const isPdf = button.classList.contains("download-button");
      if (!isWord && !isPdf) return;
      const data = getData();
      if (!data) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (button.dataset.connectFourBusy === "true") return;
      button.dataset.connectFourBusy = "true";
      button.disabled = true;
      button.textContent = isWord ? "Preparing Word…" : "Preparing PDF…";

      const task = isWord ? makeWord(data) : makePdf(data);
      void task.catch((error) => {
        console.error("Connect Four export failed", error);
        button.textContent = isWord ? "Try Word again" : "Try download again";
      }).finally(() => {
        delete button.dataset.connectFourBusy;
        button.disabled = false;
        if (!button.textContent?.startsWith("Try")) button.textContent = isWord ? "Download Word" : "Download PDF";
      });
    };

    refresh();
    document.addEventListener("click", handleClick, true);
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
      restorePresentationControls();
      document.querySelector("style[data-connect-four-reveal-style]")?.remove();
    };
  }, []);

  return null;
}
