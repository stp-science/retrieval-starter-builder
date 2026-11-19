import test from 'node:test';
import assert from 'node:assert/strict';
import {assessAnswerPattern,rapidAnswerLimit,RUSH_PENALTY} from '../public/wheel-of-fortune/fair-play.mjs';
const attempt=(correct=false,responseMs=200)=>({correct,responseMs,rapidLimitMs:1500});
const quickWrong=()=>Array.from({length:5},()=>attempt());

test('one fast answer and fewer than five answers never trigger a warning',()=>{
  for(let n=1;n<5;n++)assert.equal(assessAnswerPattern(quickWrong().slice(0,n)).event,null);
});
test('first pattern gives a warning with no points lost',()=>{
  const result=assessAnswerPattern(quickWrong());
  assert.deepEqual(result.event,{kind:'warning',points:0});
  assert.equal(result.guard.penalties,0);assert.equal(result.guard.lastEventAttempt,5);
});
test('continued rapid wrong answers cost 500 only after five new answers',()=>{
  const first=assessAnswerPattern(quickWrong());
  const history=[...quickWrong(),...quickWrong()];
  assert.equal(assessAnswerPattern(history.slice(0,9),first.guard).event,null);
  const second=assessAnswerPattern(history,first.guard);
  assert.deepEqual(second.event,{kind:'penalty',points:RUSH_PENALTY});
  assert.equal(second.guard.penalties,1);
  assert.equal(assessAnswerPattern(history,second.guard).event,null);
});
test('fast, accurate retrieval never triggers the guessing check',()=>{
  assert.equal(assessAnswerPattern(Array.from({length:5},()=>attempt(true))).event,null);
  assert.equal(assessAnswerPattern([attempt(false),attempt(false),attempt(true),attempt(true),attempt(true)]).event,null);
});
test('slow incorrect answers are not penalised',()=>{
  assert.equal(assessAnswerPattern(Array.from({length:5},()=>attempt(false,4000))).event,null);
});
test('requires four fast answers, with at least three of those wrong',()=>{
  assert.equal(assessAnswerPattern([attempt(),attempt(),attempt(),attempt(false,3000),attempt(false,3000)]).event,null);
  assert.equal(assessAnswerPattern([attempt(),attempt(),attempt(true),attempt(true),attempt(false,3000)]).event,null);
  assert.equal(assessAnswerPattern([attempt(),attempt(),attempt(),attempt(true),attempt(true,3000)]).event.kind,'warning');
});
test('careful answers break the pattern before a penalty',()=>{
  const first=assessAnswerPattern(quickWrong());
  const history=[...quickWrong(),...Array.from({length:5},()=>attempt(false,4000))];
  assert.equal(assessAnswerPattern(history,first.guard).event,null);
});
test('warning state survives round persistence',()=>{
  const first=assessAnswerPattern(quickWrong());
  const restored=JSON.parse(JSON.stringify(first.guard));
  assert.equal(assessAnswerPattern([...quickWrong(),...quickWrong()],restored).event.kind,'penalty');
});
test('untracked answers from an older game version do not count as rapid',()=>{
  assert.equal(assessAnswerPattern(Array.from({length:5},()=>({correct:false}))).event,null);
});
test('timing allowance scales with text length within conservative bounds',()=>{
  const short=rapidAnswerLimit({q:'Unit of force?',a:'Newton',wrong:['Joule','Watt','Pascal']});
  const long=rapidAnswerLimit({q:'word '.repeat(80),a:'answer',wrong:['wrong 1','wrong 2','wrong 3']});
  assert.equal(short,1000);assert.equal(long,2000);
});
