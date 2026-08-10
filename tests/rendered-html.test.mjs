import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("includes the expanded 24-activity catalogue", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const activityIds = [...source.matchAll(/\{ id: "([a-z-]+)", name:/g)].map((match) => match[1]);

  assert.equal(activityIds.length, 24);
  assert.equal(new Set(activityIds).size, 24);
  for (const id of [
    "retrieval-clock",
    "picture-prompts",
    "question-chain",
    "match-up",
    "cloze-recall",
    "flashcard-sprint",
    "two-things",
    "connect-four",
  ]) {
    assert.ok(activityIds.includes(id), `missing activity: ${id}`);
  }
});

test("includes the teacher-testing activity improvements", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const polish = await readFile(new URL("../app/activity-polish.css", import.meta.url), "utf8");

  assert.match(page, /\[4, 6, 8, 10, 12, 16\]/, "four-prompt option is missing");
  assert.match(page, /Knowledge focus/, "focused Brain Dump and Cops & Robbers option is missing");
  assert.match(page, /Write your own question/, "custom question editor is missing");
  assert.match(page, /roulette-answer-button/, "per-question Roulette reveal is missing");
  assert.match(page, /cloze-context/, "contextual Cloze Recall prompt is missing");
  assert.match(page, /presentation-stage/, "full-screen teaching mode is missing");
  assert.match(powerpoint, /Answers/, "PowerPoint answer slide is missing");
  assert.match(powerpoint, /activity-flashcard-sprint/, "Flashcard Sprint PowerPoint suppression is missing");
  assert.doesNotMatch(polish, /color-mix\(/, "PDF-incompatible colour syntax remains");
});
