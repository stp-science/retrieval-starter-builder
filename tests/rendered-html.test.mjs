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
  assert.match(page, /activity === "cops-robbers" && knowledgeFocus === "focused"/, "focused Cops & Robbers answer control is missing");
  assert.match(page, /className="knowledge-answer"/, "focused Cops & Robbers model answer is missing");
  assert.match(page, /cloze-context/, "contextual Cloze Recall prompt is missing");
  assert.match(page, /presentation-stage/, "full-screen teaching mode is missing");
  assert.match(page, /availableHeight \/ requiredHeight/, "full-screen automatic fitting is missing");
  assert.match(page, /presentationItemCount > 8 \? "many-prompts"/, "high-question full-screen layout is missing");
  assert.match(powerpoint, /Answers/, "PowerPoint answer slide is missing");
  assert.match(powerpoint, /activity-flashcard-sprint/, "Flashcard Sprint PowerPoint suppression is missing");
  assert.doesNotMatch(polish, /color-mix\(/, "PDF-incompatible colour syntax remains");
});

test("keeps every activity covered by the export system", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const polish = await readFile(new URL("../app/activity-polish.css", import.meta.url), "utf8");
  const activityIds = [...page.matchAll(/\{ id: "([a-z-]+)", name:/g)].map((match) => match[1]);

  for (const id of activityIds) {
    assert.match(powerpoint, new RegExp(`"${id}"\\s*:`), `PowerPoint palette missing for ${id}`);
  }

  assert.match(page, /clonedDocument\.documentElement\.classList\.add\("pdf-export"\)/, "PDF export-mode styling is not enabled");
  assert.match(page, /orientation: isLandscapePlacemat \? "landscape" : "portrait"/, "PDF orientation selection is missing");
  assert.match(page, /PageOrientation\.LANDSCAPE/, "Word landscape placemat is missing");
  assert.match(page, /className="question-number number-badge"/, "real Quick Quiz number badges are missing");
  assert.doesNotMatch(polish, /\.question-list li::before/, "Quick Quiz still relies on a fragile CSS-only number badge");
  assert.match(polish, /\.pdf-export[\s\S]*grid-template-columns/, "PDF-safe grid overrides are missing");
  assert.match(powerpoint, /shape: isPlacemat \? "roundRect" : "ellipse"/, "PowerPoint number shapes are missing");
  assert.match(
    powerpoint,
    /\.question-list li > span:not\(\.question-number\)/,
    "PowerPoint still extracts Quick Quiz number badges as separate prompts",
  );
  assert.match(
    powerpoint,
    /activity === "quick-quiz" \|\| activity === "one-worders" \? 2 : undefined/,
    "Numbered PowerPoint activities are not fixed to a readable two-column layout",
  );
});

test("builds a fresh four-person Retrieval Placemat and reshuffles List It", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /"retrieval-placemat": 4/, "Retrieval Placemat is not fixed to four zones");
  assert.match(page, /function openEndedPlacematQuestion/, "open-ended placemat prompt conversion is missing");
  assert.match(page, /question\.kind === "explain"/, "Retrieval Placemat does not prefer explanation prompts");
  assert.match(page, /buildListPrompts\(selectedTopics, listPromptSet\)/, "List It does not use the previous set when regenerating");
  assert.match(page, /topicOrder = \[\.\.\.topicOrder\.slice\(1\), topicOrder\[0\]\]/, "List It does not guarantee a changed topic order");
});

test("uses subtopics for focused knowledge activities and strengthens yes-no questions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const concepts = await readFile(new URL("../app/focused-concepts.ts", import.meta.url), "utf8");
  const configuredTopicIds = [...concepts.matchAll(/^  "(y[789]-[a-z-]+)": \[/gm)].map((match) => match[1]);

  assert.equal(configuredTopicIds.length, 31, "focused concept coverage is incomplete");
  assert.equal(new Set(configuredTopicIds).size, 31, "focused concept topic IDs are duplicated");
  assert.match(page, /focusedKnowledgePool\(selectedTopics\)/, "Brain Dump and Cops & Robbers still use ordinary questions");
  assert.match(page, /Focused concept:/, "focused knowledge export label is missing");
  assert.match(page, /function addYesNoExplanation/, "yes-no follow-up rule is missing");
  assert.match(page, /Explain why\./, "yes-no questions do not require an explanation");
  assert.match(page, /question\.kind === "short" && !isYesNoQuestion/, "One Worders still permits yes-no questions");
});

test("keeps activity blocks intact across PDF and Word pages", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /safeBreakRatios/, "PDF safe page breaks are missing");
  assert.match(page, /\.question-list > li/, "Quick Quiz and One Worders are missing PDF-safe block boundaries");
  assert.match(page, /\.match-item/, "Match-Up is missing PDF-safe block boundaries");
  assert.match(page, /if \(canvas\.height - sourceY > pageHeightPx\)/, "PDF exports still use unrestricted page slicing");
  assert.match(page, /clonedSheet\.style\.transform = "none"/, "Full-screen scaling can still leak into PDF exports");
  assert.match(page, /cantSplit: true/, "Word card rows can still split across pages");
  assert.match(page, /\]\s*\}\)\), 2, 5200\)\);/, "Word flashcards do not use large fixed rows");
  assert.match(page, /const compactCell =/, "Compact Match-Up Word cells are missing");
  assert.match(page, /new TableRow\(\{ cantSplit: true, children:/, "Match-Up Word rows can still split across pages");
});

test("keeps Answer First free from starter-word scaffolds", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.doesNotMatch(page, /questionScaffold|Question starter:/, "Answer First still includes a starter-word scaffold");
  assert.doesNotMatch(powerpoint, /answer-scaffold|Question starter:/, "PowerPoint still includes a starter-word scaffold");
  assert.doesNotMatch(styles, /\.answer-scaffold/, "unused Answer First scaffold styling remains");
});
