import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {SEGMENTS,applySegment,targetRotation,pointedSegment,remainingMs} from '../public/wheel-of-fortune/core.mjs';

const source=await fs.readFile(new URL('../public/wheel-of-fortune/game.mjs',import.meta.url),'utf8');
// Exercise the actual animation and settlement functions without real-time waits.
const spinSource=source.slice(source.indexOf('function spin(){'),source.indexOf('function tick(){'));
function animation(reducedMotion){
  let frame;
  const elements=new Map();
  const $=id=>{
    if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,offsetWidth:1,classList:{add(){},remove(){}}});
    return elements.get(id);
  };
  const state={phase:'spinReady',score:0,history:[{}],pending:null,deadline:301000};
  const context=vm.createContext({state,rotation:0,reducedMotion,finishing:false,
    SEGMENTS,applySegment,targetRotation,pointedSegment,remainingMs,$,
    Math:Object.assign(Object.create(Math),{random:()=>.1}),
    Date:{now:()=>1000},performance:{now:()=>0},
    requestAnimationFrame:fn=>(frame=fn,1),
    startAudio(){},setSpin(){},storeRound(){},say(){},tone(){},fanfare(){},celebrate(){},drawWheel(){},updateScore(){},
    format:n=>new Intl.NumberFormat('en-NZ').format(n),
    finish(){throw Error('The round should not finish during this spin');},
  });
  vm.runInContext(spinSource,context);
  context.spin();
  return {state,context,elements,step:ms=>frame(ms)};
}
for(const reduced of [false,true]){
  test(`spin lasts five seconds with reduced motion ${reduced?'on':'off'}`,()=>{
    const a=animation(reduced);
    for(const time of [0,100,1000,1850,3000,4999]){
      a.step(time);assert.equal(a.state.phase,'spinning');assert.equal(a.state.score,0);
    }
    a.step(5000);assert.equal(a.state.phase,'feedback');assert.equal(a.state.score,-250);
    assert.equal(pointedSegment(a.context.rotation),2);
    a.step(6000);assert.equal(a.state.score,-250);
  });
}
test('animation slows progressively and finishes with fewer rotations',()=>{
  const a=animation(false);
  a.step(0);const start=a.context.rotation;
  a.step(1000);const first=a.context.rotation;
  a.step(4000);const nearEnd=a.context.rotation;
  a.step(5000);const end=a.context.rotation;
  assert.ok(first-start>end-nearEnd);
  assert.ok(end-start>=6*Math.PI && end-start<8*Math.PI);
});
test('reduced-motion mode uses fewer turns without an instant reveal',()=>{
  const a=animation(true);a.step(4999);assert.equal(a.state.phase,'spinning');
  a.step(5000);assert.ok(a.context.rotation>=2*Math.PI && a.context.rotation<4*Math.PI);
});
test('slow computers still land on the correct wedge and award points once',()=>{
  const a=animation(false);a.step(7000);
  assert.equal(a.state.phase,'feedback');assert.equal(pointedSegment(a.context.rotation),2);
  assert.equal(a.state.score,-250);a.step(15000);assert.equal(a.state.score,-250);
});
