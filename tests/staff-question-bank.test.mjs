import test from 'node:test';
import assert from 'node:assert/strict';
import {staffQuestionBank,activityQuestions} from '../app/2027/staff-question-bank.ts';
import {staffVisualPrompts} from '../app/2027/visual-prompts.ts';
const ids=new Set();
test('every topic has at least 24 direct questions with source-aligned focus IDs and valid history identifiers',()=>{
 assert.equal(staffQuestionBank.length,31);
 for(const t of staffQuestionBank){assert.ok(t.questions.length>=24,t.title);assert.ok(t.oneWordQuestions.length>0,t.title);const fs=new Set(t.focuses.map(f=>f.id));for(const q of [...t.questions,...t.clozeQuestions]){assert.match(q.id,/^y(7|8|9|10)-u\d{2}-f\d+-[ks]\d+$/);assert.ok(!ids.has(q.id),q.id);ids.add(q.id);assert.ok(fs.has(q.focusId),q.id);assert.ok(q.q&&q.a,q.id);}for(const f of t.focuses)assert.ok(t.questions.some(q=>q.focusId===f.id),f.id);}
});
test('Quick Quiz and One Worders always use direct questions, never missing-word statements',()=>{
 for(const t of staffQuestionBank)for(const activity of ['quick-quiz','one-worders'])for(const q of activityQuestions(t,activity)){assert.doesNotMatch(q.q,/_{2,}|^Complete:/i);if(activity==='one-worders'){assert.ok(q.oneWord);assert.ok(q.a.split(/\s+/).length<=6,q.a);}}
});
test('cloze has a single deliberate gap and its word-bank answer reconstructs the complete statement',()=>{
 for(const t of staffQuestionBank){assert.ok(t.clozeQuestions.length,t.title);for(const q of t.clozeQuestions){assert.ok(q.clozeText&&q.clozeAnswer,q.id);assert.equal(q.clozeText.replace('________',q.clozeAnswer),q.a,q.id);}}
});
test('picture prompts have six intentional clues for every 2027 topic',()=>{
 for(const t of staffQuestionBank){assert.equal(staffVisualPrompts[t.id]?.length,6,t.title);for(const [symbol,answer] of staffVisualPrompts[t.id])assert.ok(symbol&&answer);}
});
