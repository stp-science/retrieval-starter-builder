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
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /10,366(?:<!-- -->)?-question bank/i);
  assert.match(html, /every Year 7–9 topic contains 40 questions checked against its topic guide/i);
  assert.match(html, /Year (?:<!-- -->)?10/i);
  assert.match(html, /Year (?:<!-- -->)?11/i);
  assert.match(html, /Year (?:<!-- -->)?12/i);
  assert.match(html, /Year (?:<!-- -->)?13/i);
  assert.match(html, /IB Sciences/i);
  assert.doesNotMatch(html, /topic-option selected/i);
});

test("includes every IB Biology, Chemistry and Physics syllabus topic", async () => {
  const biology = await readFile(new URL("../app/ib-biology-data.ts", import.meta.url), "utf8");
  const chemistry = await readFile(new URL("../app/ib-chemistry-data.ts", import.meta.url), "utf8");
  const physics = await readFile(new URL("../app/ib-physics-data.ts", import.meta.url), "utf8");
  const bank = await readFile(new URL("../app/ib-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.equal((biology.match(/^  b\(/gm) ?? []).length, 40);
  assert.equal((chemistry.match(/^  c\(/gm) ?? []).length, 22);
  assert.equal((physics.match(/^  p\(/gm) ?? []).length, 27);
  assert.match(bank, /year: "IB"/);
  assert.match(bank, /oneWordQuestions: buildOneWordQuestions/);
  assert.match(page, /ibSubjects/);
  assert.match(page, /IB Sciences/);
});

test("includes the ten Year 12 NCEA external assessment units", async () => {
  const bank = await readFile(new URL("../app/year12-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const standardCodes = [...bank.matchAll(/standard: "AS (\d{5})"/g)].map((match) => match[1]);

  assert.equal(standardCodes.length, 10);
  assert.equal(new Set(standardCodes).size, 10);
  assert.deepEqual(
    [...standardCodes].sort(),
    ["91156", "91157", "91159", "91164", "91165", "91166", "91170", "91171", "91173", "91294"].sort(),
  );
  assert.match(bank, /Agricultural & Horticultural Science/);
  assert.match(page, /seniorTopics/);
});

test("includes exactly the seven requested Year 10 topics in teaching order", async () => {
  const bank = await readFile(new URL("../app/year10-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topicNames = [...bank.matchAll(/^    name: "([^"]+)",$/gm)].map((match) => match[1]);
  const topicIds = [...bank.matchAll(/^    id: "(y10-[a-z-]+)",$/gm)].map((match) => match[1]);

  assert.deepEqual(topicNames, [
    "Atoms, Ions and the Periodic Table",
    "Forces and Motion",
    "Genetics",
    "Acids and Bases",
    "Electricity",
    "Human Body",
    "Earth Science",
  ]);
  assert.equal(topicIds.length, 7);
  assert.equal(new Set(topicIds).size, 7);
  assert.match(bank, /questions\.length < 40/);
  assert.match(bank, /oneWordQuestions\.length < 40/);
  assert.match(page, /year10Topics/);
  assert.match(page, /\[7, 8, 9, 10, 11, 12, 13, "IB"\]/);
});

test("includes the requested Year 11 Biology, Chemistry and Physics courses", async () => {
  const bank = await readFile(new URL("../app/year11-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topicIds = [...bank.matchAll(/^    id: "(y11-[a-z-]+)",$/gm)].map((match) => match[1]);
  const topicNames = [...bank.matchAll(/^    name: "([^"]+)",$/gm)].map((match) => match[1]);

  assert.equal(topicIds.length, 12);
  assert.equal(new Set(topicIds).size, 12);
  assert.deepEqual(topicNames.slice(0, 7), [
    "Cells and Cell Processes",
    "Genetics",
    "Human Responses",
    "Immunity",
    "Atomic Structure, Bonding, Acids and Bases",
    "Rates of Reaction",
    "Organic Chemistry",
  ]);
  assert.equal((bank.match(/^    course: "Biology",$/gm) ?? []).length, 4);
  assert.equal((bank.match(/^    course: "Chemistry",$/gm) ?? []).length, 3);
  assert.equal((bank.match(/^    course: "Physics",$/gm) ?? []).length, 5);
  assert.equal((bank.match(/^    programme: "STP Diploma",$/gm) ?? []).length, 12);
  assert.doesNotMatch(bank, /programme: "AQA GCSE Physics"/);
  assert.match(bank, /questions\.length < 60/);
  assert.match(bank, /oneWordQuestions\.length < 40/);
  assert.match(page, /year11Topics/);
  assert.match(page, /year11Courses/);
  assert.match(page, /Year 11 course/);
});

test("matches Year 11 Physics to the St Peter's Diploma course overview", async () => {
  const bank = await readFile(new URL("../app/year11-physics-question-bank.ts", import.meta.url), "utf8");
  const topicNames = [...bank.matchAll(/^    name: "([^"]+)",$/gm)].map((match) => match[1]);

  assert.deepEqual(topicNames, ["Mechanics", "Electricity & Magnetism", "Waves", "Particle Physics"]);
  assert.equal((bank.match(/^    id: "y11-physics-[a-z-]+",$/gm) ?? []).length, 4);
  assert.match(bank, /distance-time gradient/);
  assert.match(bank, /velocity-time area/);
  assert.match(bank, /Kirchhoff's current law/);
  assert.match(bank, /electrostatic potential energy/);
  assert.match(bank, /electric shock/);
  assert.match(bank, /fixed resistor/);
  assert.match(bank, /right-hand grip rule/);
  assert.match(bank, /plane-mirror image/);
  assert.match(bank, /wave units/);
  assert.match(bank, /total internal reflection/);
  assert.match(bank, /Brownian motion/);
  assert.match(bank, /background radiation/);
  assert.match(bank, /background count correction/);
  assert.match(bank, /half-life/);
  assert.match(bank, /half-life calculation/);
  assert.match(bank, /decay curve/);
  assert.match(bank, /mass-energy equivalence/);
  assert.match(bank, /bannedLegacyKeywords/);
  assert.match(bank, /coreAnswers\.size < 16/);
});

test("adds progressive Scientific Skills questions to every year and subject section", async () => {
  const bank = await readFile(new URL("../app/scientific-skills-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(bank, /scientificSkillsTopics\.length !== 18/);
  assert.match(bank, /topic\.keywords\.length !== 20/);
  assert.match(bank, /topic\.questions\.length !== 60/);
  assert.match(bank, /topic\.oneWordQuestions\.length !== 40/);
  assert.match(bank, /year11Courses\.map/);
  assert.match(bank, /nceaCourses\.map/);
  assert.match(bank, /ibScienceSubjects\.map/);
  assert.match(bank, /"Agricultural & Horticultural Science"/);
  assert.match(page, /\.\.\.scientificSkillsTopics/);
  assert.match(css, /\.strand-dot\.skills/);
});

test("keeps activity keywords subject-specific across every topic", async () => {
  const ibBank = await readFile(new URL("../app/ib-question-bank.ts", import.meta.url), "utf8");
  const curriculum = await readFile(new URL("../app/curriculum-topics.ts", import.meta.url), "utf8");
  const quality = await readFile(new URL("../app/keyword-quality.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(ibBank, /subjectKeywordVocabulary/);
  assert.match(ibBank, /topic\.keywords\.length !== 16/);
  assert.match(curriculum, /keywordRefinements/);
  assert.match(quality, /vagueStandaloneKeywords/);
  assert.match(page, /assertSpecificKeywordSets\(topics\)/);
});

test("builds Thinking & Linking grids from connected keyword pairs", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const linking = await readFile(new URL("../app/thinking-linking-keywords.ts", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /buildThinkingLinkingKeywords\(selectedTopics\)/);
  assert.match(page, /assertThinkingLinkingCoverage\(topics\)/);
  assert.match(linking, /connectionPairs/);
  assert.match(linking, /selectedPairs\.flatMap/);
  assert.match(css, /\.linking-grid div[^}]*text-transform: none/);
  assert.doesNotMatch(css, /\.linking-grid div[^}]*text-transform: capitalize/);
});

test("includes the eight Year 13 NCEA Level 3 external assessment units", async () => {
  const bank = await readFile(new URL("../app/year13-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const topicIds = [...bank.matchAll(/id: "(y13-[a-z-]+)"/g)].map((match) => match[1]);
  const standardCodes = [...bank.matchAll(/standard: "AS (\d{5})"/g)].map((match) => match[1]);

  assert.equal(topicIds.length, 8);
  assert.equal(new Set(topicIds).size, 8);
  assert.deepEqual(
    [...standardCodes].sort(),
    ["91390", "91391", "91392", "91524", "91526", "91531", "91603", "91606"].sort(),
  );
  assert.match(bank, /year: 13/);
  assert.match(bank, /oneWordQuestions/);
  assert.match(page, /year13Topics/);
  assert.match(page, /Year \$\{year\} NCEA science course/);
});

test("uses explicit response commands for senior equation and multi-part prompts", async () => {
  const year12 = await readFile(new URL("../app/year12-question-bank.ts", import.meta.url), "utf8");
  const year13 = await readFile(new URL("../app/year13-question-bank.ts", import.meta.url), "utf8");

  assert.match(year12, /Define momentum and write its equation\./);
  assert.match(year12, /Define electric current and write its equation in terms of charge and time\./);
  assert.doesNotMatch(year12, /How is reaction enthalpy estimated from bond enthalpies\?/);

  assert.match(year13, /Write the equation linking emf, terminal voltage, current, and internal resistance/);
  assert.match(year13, /state what happens to reactance, impedance, current, and the phase difference/);
  assert.match(year13, /Calculate the magnitude and direction of its impulse/);
  assert.doesNotMatch(year13, /How is impedance found for a series LCR circuit\?/);
  assert.doesNotMatch(year13, /Find terminal voltage\./);
});

test("uses direct student-friendly wording across generated question banks", async () => {
  const year10 = await readFile(new URL("../app/year10-question-bank.ts", import.meta.url), "utf8");
  const year10Electricity = await readFile(new URL("../app/year10-data/electricity.ts", import.meta.url), "utf8");
  const year10Forces = await readFile(new URL("../app/year10-data/forces-motion.ts", import.meta.url), "utf8");
  const year11Physics = await readFile(new URL("../app/year11-physics-question-bank.ts", import.meta.url), "utf8");
  const ib = await readFile(new URL("../app/ib-question-bank.ts", import.meta.url), "utf8");
  const skills = await readFile(new URL("../app/scientific-skills-question-bank.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const clarity = await readFile(new URL("../app/question-clarity.ts", import.meta.url), "utf8");
  const audit = await readFile(new URL("../scripts/audit-question-language.ts", import.meta.url), "utf8");

  assert.match(year11Physics, /Name the method of thermal energy transfer through a solid\./);
  assert.doesNotMatch(year11Physics, /without bulk movement of matter/);
  assert.match(year10, /delete expandedQuestions\[topicId\]/);
  assert.match(year10Electricity, /What type of circuit has only one path for current\?/);
  assert.match(year10Electricity, /What type of circuit has two or more branches\?/);
  assert.match(year10Forces, /\["F = ma"/);
  assert.match(year10Forces, /\["a = Δv\/Δt"/);
  assert.doesNotMatch(year10, /Explain the scientific role|helps explain|important when studying|Describe the connection between/);
  assert.match(year11Physics, /If an object has fewer electrons than protons, what is its overall charge\?/);
  assert.match(year11Physics, /Which type of circuit lets other home lights stay on when one light is switched off\?/);
  assert.doesNotMatch(ib, /A student is revising|What should they remember|Compare how .* contribute to/);
  assert.match(ib, /What do we call \$\{definition\}\?/);
  assert.doesNotMatch(ib, /Identify the .* term described here|Complete this explanation:/);
  assert.match(skills, /What do we call \$\{definition\}\?/);
  assert.doesNotMatch(skills, /Name the scientific skill used for this purpose|What scientific skill is described as/);
  assert.match(page, /\.map\(clarifyQuestion\)/, "the full question bank does not use the clarity pass");
  assert.match(clarity, /Answer yes or no/, "yes-no prompts do not tell students how to answer");
  assert.match(clarity, /what does \$\{symbol\} represent/, "equation prompts do not identify the target symbol");
  assert.match(audit, /make the equation symbol being recalled explicit/, "the full-bank audit does not reject indirect equation clues");
  assert.match(audit, /ask which type of circuit or connection/, "the full-bank audit does not reject compressed circuit wording");
});

test("keeps Years 7-9 guide-scoped while expanding later year groups", async () => {
  const expansion = await readFile(new URL("../app/year-group-expansion.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const configuredTopicIds = [...expansion.matchAll(/^  "(y(?:7|8|9|10|12|13)-[a-z-]+)": \[/gm)].map((match) => match[1]);

  assert.equal(configuredTopicIds.length, 57);
  assert.equal(new Set(configuredTopicIds).size, 57);
  assert.match(expansion, /fullyExpandedJuniorTopics !== 17/);
  assert.match(expansion, /topicConcepts\.length !== 6 && topicConcepts\.length !== 14/);
  assert.match(expansion, /expandedOneWordQuestions/);
  assert.match(expansion, /contains a Yes\/No One Worders prompt/);
  assert.match(page, /function topicExpansionQuestions\(topic: Topic\)/);
  assert.match(page, /typeof topic\.year === "number" && topic\.year >= 7 && topic\.year <= 9/);
  assert.match(page, /\.\.\.topicExpansionQuestions\(topic\)/);
  assert.match(page, /\.\.\.topicExpansionOneWordQuestions\(topic\)/);
  assert.doesNotMatch(page, /\.\.\.\(expandedQuestions\[topic\.id\] \?\? \[\]\)/);
  assert.doesNotMatch(page, /\.\.\.\(expandedOneWordQuestions\[topic\.id\] \?\? \[\]\)/);
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
  assert.match(powerpoint, /shape: isPlacemat \|\| isChallengeGrid \? "roundRect" : "ellipse"/, "PowerPoint number shapes are missing");
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

test("keeps PDF dividers and PowerPoint headers safely inset", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const polish = await readFile(new URL("../app/activity-polish.css", import.meta.url), "utf8");

  assert.match(page, /divider\.className = "pdf-title-divider"/, "PDF export does not create a dedicated title divider");
  assert.match(polish, /> h2::after \{\s*display: none !important;/, "fragile PDF title pseudo-divider is still visible");
  assert.match(polish, /> \.pdf-title-divider \{[\s\S]*margin: 12px 0 12px !important;/, "PDF title divider spacing is missing");
  assert.match(powerpoint, /const HEADER_TEXT_MARGIN = \{ left: 0\.32/, "PowerPoint banner text is not inset");
  assert.match(powerpoint, /const INSTRUCTION_TEXT_MARGIN = \{ left: 0\.24, right: 0\.2/, "PowerPoint instructions lack internal padding");
  assert.equal((powerpoint.match(/margin: HEADER_TEXT_MARGIN/g) ?? []).length, 2, "PowerPoint banner inset is not applied to both slides");
  assert.equal((powerpoint.match(/margin: INSTRUCTION_TEXT_MARGIN/g) ?? []).length, 2, "PowerPoint instruction padding is not applied to both slides");
});

test("keeps Challenge Grid points and export cards aligned", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const polish = await readFile(new URL("../app/activity-polish.css", import.meta.url), "utf8");

  assert.match(powerpoint, /case "challenge-grid"[\s\S]*promptPoints/, "Challenge Grid point values are not extracted for PowerPoint");
  assert.match(powerpoint, /promptPoints\[index\]/, "Challenge Grid point values are not drawn on PowerPoint cards");
  assert.ok((powerpoint.match(/promptPoints\[index\]/g) ?? []).length >= 2, "Challenge Grid points are not shown on both question and answer slides");
  assert.match(polish, /\.pdf-export \.starter-sheet \.challenge-grid \{[\s\S]*gap: 10px !important;[\s\S]*border: 0 !important;/, "PDF Challenge Grid lacks aligned card spacing");
  assert.match(polish, /\.pdf-export \.starter-sheet \.challenge-grid > div \{[\s\S]*box-sizing: border-box !important;/, "PDF Challenge Grid cards do not use stable sizing");
  assert.match(page, /pdf-export-title::after \{ content: none !important; display: none !important; \}/, "PDF clone does not suppress the duplicate title divider");
});

test("uses the correct Year 11 weight equation and direct equation wording", async () => {
  const physics = await readFile(new URL("../app/year11-physics-question-bank.ts", import.meta.url), "utf8");

  assert.match(physics, /In W = mg, what does W represent\?/, "Year 11 weight prompt is not student friendly");
  assert.match(physics, /W = mg = 6 × 9\.8 = 58\.8 N\./, "Year 11 weight worked answer uses the wrong symbol");
  assert.doesNotMatch(physics, /F = mg/, "Year 11 weight still uses F instead of W");
  assert.doesNotMatch(physics, /Which (?:motion |circuit )?quantity is calculated using/, "indirect Year 11 equation clues remain");
});

test("lets teachers flag generated questions for review", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /questionReportEmail = "gary\.talbot@stpeters\.school\.nz"/, "question reports use the wrong review address");
  assert.doesNotMatch(page, /gary\.talbot@stpetersschool\.nz/, "the previous review address is still present");
  assert.match(page, /function questionReportId/, "stable question report IDs are missing");
  assert.match(page, /className="flag-button"/, "per-question flag buttons are missing");
  assert.match(page, /Flag a question/, "question report selector is missing");
  assert.match(page, /Question ID/, "question IDs are not included in reports");
  assert.match(page, /Teacher comment/, "teacher comments are not included in reports");
  assert.match(page, /https:\/\/formsubmit\.co\/ajax\//, "question reports are not sent through the form service");
  assert.match(page, /formSubmitAccepted/, "the form service response is not checked before claiming success");
  assert.match(page, /payload\?\.success === true \|\| payload\?\.success === "true"/, "successful delivery is not verified from the response body");
  assert.match(page, /questionReportMailto/, "question reports do not have an email fallback");
  assert.match(page, /Open email report/, "the email fallback is not offered when automatic delivery fails");
  assert.match(page, /\.question-controls, \.swap-button, \.flag-button/, "PDF cleanup does not remove question controls");
  assert.match(styles, /\.question-report-backdrop/, "question report dialog styling is missing");
  assert.match(styles, /@media print[\s\S]*\.flag-button/, "flag controls can leak into printed activities");
});

test("lets teachers send general site feedback", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(page, /className="general-feedback-button"/, "general feedback button is missing");
  assert.match(page, /Feedback &amp; help/, "prominent feedback button label is missing");
  assert.match(page, /className="topbar-actions"[\s\S]*className="general-feedback-button"/, "general feedback button should remain visible in the sticky top bar");
  assert.match(page, /Something isn&apos;t working/, "problem-report option is missing");
  assert.match(page, /Suggestion for improvement/, "improvement option is missing");
  assert.match(page, /submitGeneralFeedback/, "general feedback submission is missing");
  assert.match(page, /Selected topics/, "general feedback does not include topic context");
  assert.match(page, /Current activity/, "general feedback does not include activity context");
  assert.match(page, /window\.navigator\.userAgent/, "general feedback does not include technical context");
  assert.match(page, /generalFeedbackMailto/, "general feedback email fallback is missing");
  assert.match(page, /Open email feedback/, "general feedback fallback action is missing");
  assert.match(styles, /\.general-feedback-button/, "general feedback button styling is missing");
  assert.match(styles, /@media print[\s\S]*\.general-feedback-button/, "general feedback control can leak into printouts");
});
