import test from 'node:test';
import assert from 'node:assert/strict';
import {createMusicPlayer} from '../public/wheel-of-fortune/music.mjs';

function setup({blocked=false}={}) {
  let hidden=false;
  const calls=[];
  const media={paused:true,ended:false,error:null,addEventListener(){},play(){calls.push('play');if(blocked)return Promise.reject(new Error('Autoplay blocked'));this.paused=false;return Promise.resolve();},pause(){calls.push('pause');this.paused=true;},load(){calls.push('load');}};
  const button={textContent:'',attributes:{},setAttribute(k,v){this.attributes[k]=v;}};
  const player=createMusicPlayer(media,button,()=>hidden);
  return {player,media,button,calls,hide:value=>hidden=value};
}
test('welcome screen offers a real Play music button and starts playback on click',async()=>{
  const {player,media,button}=setup();
  assert.equal(button.textContent,'Play music');assert.equal(media.paused,true);
  await player.toggle();assert.equal(media.paused,false);assert.equal(button.textContent,'Music on');
  assert.equal(button.attributes['aria-pressed'],'true');assert.equal(media.loop,true);assert.ok(media.volume>=.5);
});
test('a game starts the track automatically and a finish pauses it',async()=>{
  const {player,media,button}=setup();
  await player.startRound();assert.equal(media.paused,false);
  await player.finishRound();assert.equal(media.paused,true);assert.equal(button.textContent,'Play music');
});
test('browser autoplay rejection never leaves a false Music on state',async()=>{
  const {player,media,button}=setup({blocked:true});
  await player.startRound();assert.equal(media.paused,true);
  assert.equal(button.textContent,'Play music');assert.equal(button.attributes['aria-pressed'],'false');
});
test('music mute persists across a round and can be reenabled',async()=>{
  const {player,media,button}=setup();
  await player.startRound();await player.toggle();assert.equal(media.paused,true);assert.equal(button.textContent,'Music off');
  await player.startRound();assert.equal(media.paused,true);
  await player.toggle();assert.equal(media.paused,false);assert.equal(button.textContent,'Music on');
});
test('switching tabs pauses music and returning resumes a live round',async()=>{
  const {player,media,hide}=setup();await player.startRound();
  hide(true);await player.sync();assert.equal(media.paused,true);
  hide(false);await player.sync();assert.equal(media.paused,false);
  await player.finishRound();hide(true);await player.sync();hide(false);await player.sync();assert.equal(media.paused,true);
});
