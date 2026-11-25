// Browsers unlock audio on the first player gesture. Sound starts enabled.
export function createShowAudio({Music=Audio,Context=globalThis.AudioContext??globalThis.webkitAudioContext}={}) {
 let enabled=true,active=false,context;
 const music=new Music(new URL('../wheel-of-fortune/assets/gameshow-theme.mp3',import.meta.url).href);
 music.loop=true;music.preload='none';music.volume=.13;
 if(typeof document!=='undefined'){music.hidden=true;music.setAttribute('aria-hidden','true');document.body.append(music);}
 function play(){try{const p=music.play();p?.catch?.(()=>{});}catch{}}
 function sync(){if(enabled&&active)play();else music.pause();}
 function notes(type){if(!enabled||!Context)return;try{context??=new Context();const resumed=context.resume();resumed?.catch?.(()=>{});const sequences={start:[392,523,659,784],good:[659,880],bank:[523,659,784,1047],wrong:[220,174,130],finish:[784,659,523,392]};const list=sequences[type]??sequences.good;list.forEach((frequency,i)=>{const start=context.currentTime+i*.105,osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=frequency;osc.type=type==='wrong'?'triangle':'sine';gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.09,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.28);osc.connect(gain);gain.connect(context.destination);osc.start(start);osc.stop(start+.3);});}catch{}}
 return {get enabled(){return enabled;},toggle(){enabled=!enabled;sync();if(enabled)notes('good');return enabled;},start(){active=true;music.currentTime=0;music.playbackRate=1;music.volume=.13;sync();notes('start');},stop(){active=false;music.pause();},urgent(){music.playbackRate=1.12;music.volume=.16;},tone:notes};
}
