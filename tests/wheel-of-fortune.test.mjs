import test from 'node:test';
import assert from 'node:assert/strict';
import {SEGMENTS,applySegment,balancedDeck,targetRotation,pointedSegment,remainingMs,timeLabel} from '../public/wheel-of-fortune/core.mjs';
import {QUESTIONS} from '../public/wheel-of-fortune/questions.mjs';
test('wheel has the requested losses, doubles and exactly one triple',()=>{
 assert.equal(SEGMENTS.length,24);
 assert.equal(SEGMENTS.filter(s=>s.multiplier===3).length,1);
 assert.equal(SEGMENTS.filter(s=>s.multiplier===2).length,2);
 assert.equal(SEGMENTS.filter(s=>s.value<0).length,3);
});
test('wheel scoring adds, subtracts and multiplies the total',()=>{
 assert.equal(applySegment(1000,{value:500}),1500);
 assert.equal(applySegment(1000,{value:-250}),750);
 assert.equal(applySegment(100,{value:-500}),-400);
 assert.equal(applySegment(0,{value:-250}),-250);
 assert.equal(applySegment(-250,{value:100}),-150);
 assert.equal(applySegment(-250,{multiplier:2}),-500);
 assert.equal(applySegment(-250,{multiplier:3}),-750);
 assert.equal(applySegment(1250,{multiplier:2}),2500);
 assert.equal(applySegment(1250,{multiplier:3}),3750);
 assert.equal(applySegment(0,{multiplier:3}),0);
});
test('every animated landing agrees with the visible top pointer',()=>{
 for(let lap=0;lap<30;lap++)for(let i=0;i<24;i++){
  const current=lap*2*Math.PI+.173;
  const end=targetRotation(current,i);
  assert.equal(pointedSegment(end),i);
  assert.ok(end-current>=8*Math.PI);
 }
});
test('question bank has four distinct options and excludes later ecosystem content',()=>{
 assert.equal(QUESTIONS.length,153);
 assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,153);
 for(const q of QUESTIONS){
  assert.equal(q.wrong.length,3,q.q);
  assert.equal(new Set([q.a,...q.wrong]).size,4,q.q);
  assert.ok(q.q&&q.a&&q.topic&&q.source);
  assert.ok(!/tohu|mātauranga|restoration|sustainability|conservation/i.test(q.q));
 }
});
test('deck includes every question once and mixes all nine topics at the start',()=>{
 const deck=balancedDeck(QUESTIONS);
 assert.equal(deck.length,QUESTIONS.length);
 assert.equal(new Set(deck.map(q=>q.id)).size,QUESTIONS.length);
 assert.equal(new Set(deck.slice(0,9).map(q=>q.topic)).size,9);
});
test('five-minute timer uses an absolute deadline and stops at zero',()=>{
 const start=1000,deadline=start+300000;
 assert.equal(timeLabel(remainingMs(deadline,start)),'5:00');
 assert.equal(timeLabel(remainingMs(deadline,start+240000)),'1:00');
 assert.equal(timeLabel(remainingMs(deadline,start+299001)),'0:01');
 assert.equal(remainingMs(deadline,start+900000),0);
 assert.equal(timeLabel(-1),'0:00');
});
