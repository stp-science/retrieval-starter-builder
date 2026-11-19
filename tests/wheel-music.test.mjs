import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameShowMusic} from '../public/wheel-of-fortune/soundtrack.mjs';

function fakeAudio() {
  const events=[];
  const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(){}});
  const node=()=>({connect(){},disconnect(){},gain:param(),frequency:param(),start(t){events.push({kind:'start',t})},stop(t){events.push({kind:'stop',t})}});
  const context={currentTime:0,sampleRate:48000,createGain:node,createOscillator:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(c,len)=>({getChannelData:()=>new Float32Array(len)})};
  let scheduled=null,intervals=0,clears=0;
  const timers={setInterval(fn){scheduled=fn;intervals++;return intervals},clearInterval(){clears++;scheduled=null}};
  return {context,timers,events,pump:()=>scheduled?.(),counts:()=>({intervals,clears})};
}
test('soundtrack starts on request and repeated starts never duplicate its loop',()=>{
  const a=fakeAudio(),music=createGameShowMusic(a.context,{},a.timers);
  assert.equal(music.playing,false);assert.equal(a.events.length,0);
  music.start();music.start();
  assert.equal(music.playing,true);assert.equal(a.counts().intervals,1);
  assert.ok(a.events.some(e=>e.kind==='start'));
});
test('stop clears the scheduler and stops queued voices; restart creates one loop',()=>{
  const a=fakeAudio(),music=createGameShowMusic(a.context,{},a.timers);
  music.start();const before=a.events.length;music.stop();
  assert.equal(music.playing,false);assert.equal(a.counts().clears,1);
  assert.ok(a.events.slice(before).some(e=>e.kind==='stop'));
  music.start();assert.equal(a.counts().intervals,2);assert.equal(music.playing,true);
});
test('a hidden or suspended tab cannot cause an unbounded catch-up audio burst',()=>{
  const a=fakeAudio(),music=createGameShowMusic(a.context,{},a.timers);
  music.start();const before=a.events.filter(e=>e.kind==='start').length;
  a.context.currentTime=200;a.pump();
  a.context.currentTime=200.1;a.pump();
  const added=a.events.filter(e=>e.kind==='start').length-before;
  assert.ok(added>0 && added<30);
  assert.ok(a.events.filter(e=>e.kind==='start'&&e.t>100).every(e=>e.t>=200));
});
