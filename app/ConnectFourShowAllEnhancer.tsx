"use client";

import { useEffect } from "react";

function getConnectFourSheet() {
  return document.querySelector<HTMLElement>(".starter-sheet.activity-connect-four");
}

function getAnswerBoxes(sheet: HTMLElement) {
  return Array.from(sheet.querySelectorAll<HTMLElement>(".connect-four-square-answer"));
}

function updatePerSquareButtons(sheet: HTMLElement) {
  sheet.querySelectorAll<HTMLButtonElement>(".connect-four-reveal-button").forEach((button) => {
    const card = button.closest<HTMLElement>(".connect-four-grid > div");
    const answer = card?.querySelector<HTMLElement>(".connect-four-square-answer");
    if (!answer) return;
    button.textContent = answer.hidden ? "Reveal answer" : "Hide answer";
    button.setAttribute("aria-expanded", answer.hidden ? "false" : "true");
  });
}

function updateShowAllLabels(sheet: HTMLElement) {
  const answers = getAnswerBoxes(sheet);
  const allVisible = answers.length > 0 && answers.every((answer) => !answer.hidden);
  document.querySelectorAll<HTMLButtonElement>("[data-connect-four-show-all='true']").forEach((button) => {
    button.textContent = allVisible ? "Hide all answers" : "Show all answers";
    button.setAttribute("aria-expanded", allVisible ? "true" : "false");
  });
}

function toggleAllAnswers(sheet: HTMLElement) {
  const answers = getAnswerBoxes(sheet);
  if (!answers.length) return;
  const shouldShow = answers.some((answer) => answer.hidden);
  answers.forEach((answer) => {
    answer.hidden = !shouldShow;
  });
  updatePerSquareButtons(sheet);
  updateShowAllLabels(sheet);
}

function makeButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "connect-four-show-all-button";
  button.dataset.connectFourShowAll = "true";
  button.textContent = "Show all answers";
  button.setAttribute("aria-expanded", "false");
  return button;
}

function installButtons() {
  const sheet = getConnectFourSheet();
  if (!sheet) {
    document.querySelectorAll("[data-connect-four-show-all='true']").forEach((button) => button.remove());
    return;
  }

  if (!sheet.querySelector("[data-connect-four-show-all='true']")) {
    const grid = sheet.querySelector(".connect-four-grid");
    const button = makeButton();
    button.classList.add("connect-four-show-all-sheet");
    if (grid?.nextSibling) sheet.insertBefore(button, grid.nextSibling);
    else sheet.appendChild(button);
  }

  const controls = sheet.closest<HTMLElement>(".presentation-stage")?.querySelector<HTMLElement>(".presentation-controls");
  if (controls && !controls.querySelector("[data-connect-four-show-all='true']")) {
    const button = makeButton();
    button.classList.add("connect-four-show-all-presentation");
    controls.insertBefore(button, controls.firstChild);
  }

  updateShowAllLabels(sheet);
}

function installStyles() {
  if (document.querySelector("style[data-connect-four-show-all-style]")) return;
  const style = document.createElement("style");
  style.dataset.connectFourShowAllStyle = "true";
  style.textContent = `
    .connect-four-show-all-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 8px 14px;
      border: 1px solid #365f72;
      border-radius: 999px;
      background: #eef4f7;
      color: #263244;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
    }
    .connect-four-show-all-button:hover { background: #dceaf0; }
    .connect-four-show-all-sheet { margin: 12px 0 4px; }
    .presentation-controls .connect-four-show-all-presentation { margin-right: 8px; }
    .pdf-export .connect-four-show-all-button { display: none !important; }
  `;
  document.head.appendChild(style);
}

export default function ConnectFourShowAllEnhancer() {
  useEffect(() => {
    installStyles();

    const handleClick = (event: MouseEvent) => {
      const button = event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("[data-connect-four-show-all='true']")
        : null;
      if (!button) return;
      const sheet = getConnectFourSheet();
      if (!sheet) return;
      event.preventDefault();
      event.stopPropagation();
      toggleAllAnswers(sheet);
    };

    installButtons();
    document.addEventListener("click", handleClick, true);
    const observer = new MutationObserver(installButtons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
      document.querySelectorAll("[data-connect-four-show-all='true']").forEach((button) => button.remove());
      document.querySelector("style[data-connect-four-show-all-style]")?.remove();
    };
  }, []);

  return null;
}
