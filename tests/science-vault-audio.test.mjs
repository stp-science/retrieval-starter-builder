import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createShowAudio} from '../public/science-vault/audio.mjs';
class FakeMusic {
 static last;
 constructor(src){this.src=src;this.paused=true;this.plays=0;FakeMusic.last=this;}
 play(){this.paused=false;this.plays++;return Promise.resolve();}
 pause(){this.paused=true;}
}
test('music starts with Play, is enabled by default and loops',()=>{
 const audio=createShowAudio({Music:FakeMusic,Context:null});const media=FakeMusic.last;
 assert.equal(audio.enabled,true);assert.equal(media.paused,true);
 audio.start();assert.equal(media.paused,false);assert.equal(media.loop,true);assert.ok(media.src.endsWith('/science-vault/assets/vault-suspense.mp3'));
 const base=media.volume;audio.setRisk(500);assert.ok(media.volume>base);audio.setRisk(0);assert.equal(media.volume,base);audio.urgent();assert.ok(media.playbackRate>1);audio.stop();assert.equal(media.paused,true);
});
test('mute stops music and stays muted when the player restarts',()=>{
 const audio=createShowAudio({Music:FakeMusic,Context:null});const media=FakeMusic.last;
 audio.start();audio.toggle();assert.equal(audio.enabled,false);assert.equal(media.paused,true);
 audio.stop();audio.start();assert.equal(media.paused,true);
 audio.toggle();assert.equal(media.paused,false);
 audio.stop();assert.equal(media.paused,true);
});
