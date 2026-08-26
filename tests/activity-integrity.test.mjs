import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps all retrieval activities wired into the app and PowerPoint export", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const powerpoint = await readFile(new URL("../app/PowerPointDownloadEnhancer.tsx", import.meta.url), "utf8");
  const activityIds = [...page.matchAll(/\{ id: "([a-z-]+)", name:/g)].map((match) => match[1]);

  assert.equal(activityIds.length, 24);
  assert.equal(new Set(activityIds).size, 24);

  const groupedPreviewPatterns = new Map([
    ["quick-quiz", /activity === "quick-quiz" \|\| activity === "one-worders"/],
    ["one-worders", /activity === "quick-quiz" \|\| activity === "one-worders"/],
    ["brain-dump", /activity === "brain-dump" \|\| activity === "cops-robbers"/],
    ["cops-robbers", /activity === "brain-dump" \|\| activity === "cops-robbers"/],
  ]);

  for (const id of activityIds) {
    const occurrences = page.match(new RegExp(`"${id}"`, "g")) ?? [];
    assert.ok(occurrences.length >= 3, `${id} is not fully wired through the page`);
    assert.match(
      powerpoint,
      new RegExp(`"${id}"\\s*:`),
      `PowerPoint export palette missing for ${id}`,
    );

    const groupedPattern = groupedPreviewPatterns.get(id);
    if (groupedPattern) {
      assert.match(page, groupedPattern, `Preview renderer missing for ${id}`);
    } else {
      assert.match(
        page,
        new RegExp(`activity === "${id}"`),
        `Preview renderer missing for ${id}`,
      );
    }
  }

  assert.match(page, /className=\{\`starter-sheet activity-\$\{activity\}/);
  assert.match(page, /className="word-button"/);
  assert.match(page, /className="download-button"/);
});

test("keeps Connect Four responsive and fully populated", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const enhancer = await readFile(new URL("../app/ConnectFourEnhancer.tsx", import.meta.url), "utf8");
  const showAll = await readFile(new URL("../app/ConnectFourShowAllEnhancer.tsx", import.meta.url), "utf8");

  assert.match(page, /"connect-four": 16/);
  assert.match(page, /fixedQuestionActivities: ActivityId\[\] = \["connect-four", "retrieval-clock", "retrieval-placemat"\]/);
  assert.match(page, /fixedQuestionActivities\.includes\(activity\) && result\.length < requested/);
  assert.match(page, /unusedFallback\.slice\(0, requested - result\.length\)/);
  assert.match(page, /className="connect-four-grid"/);

  assert.match(enhancer, /dataset\.connectFourReveal/);
  assert.match(enhancer, /connect-four-square-answer/);
  assert.match(showAll, /if \(button\.textContent !== nextLabel\) button\.textContent = nextLabel/);
  assert.match(showAll, /if \(button\.getAttribute\("aria-expanded"\) !== nextExpanded\)/);
  assert.doesNotMatch(
    showAll,
    /button\.textContent = allVisible \? "Hide all answers" : "Show all answers"/,
    "Connect Four show-all control can re-trigger its own MutationObserver",
  );
});
