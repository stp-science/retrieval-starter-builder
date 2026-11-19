import { QUESTIONS } from './questions.mjs';
import { DURATION_MS, SEGMENTS, applySegment, shuffle, balancedDeck, remainingMs, timeLabel, targetRotation, pointedSegment } from './core.mjs?v=negative-scores-1';
import { createMusicPlayer } from './music.mjs?v=quiet-autoplay-2';

const $ = id => document.getElementById(id);
const bank = new Map(QUESTIONS.map(q => [q.id, q]));
const ACTIVE_KEY = 'talbot-wheel-round-v1';
const RECORDS_KEY = 'talbot-wheel-records-v1';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const format = n => new Intl.NumberFormat('en-NZ').format(n);
let state = null, rotation = 0, timerHandle, spinFrame, audio, master;
let sound = true, nextTick = 0, lastDisplayedTime = '', finishing = false;
const musicPlayer = createMusicPlayer($('background-music'), $('music'));

function storeRound() { try { sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(state)); } catch {} }
function readRecords() { try { const r = JSON.parse(localStorage.getItem(RECORDS_KEY) || '[]'); return Array.isArray(r) ? r.filter(x => typeof x.name === 'string' && Number.isFinite(x.score)).slice(0,10) : []; } catch { return []; } }
function tone(freq, duration = .12, level = .07, type = 'sine', delay = 0) {
  if (!sound || !audio || document.hidden) return;
  const start = audio.currentTime + delay;
  const o = audio.createOscillator(), gain = audio.createGain();
  o.type = type; o.frequency.value = freq;
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(level,start+.006);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  o.connect(gain); gain.connect(master); o.start(start); o.stop(start+duration+.02);
  o.onended = () => { o.disconnect(); gain.disconnect(); };
}
function startAudio() {
  if (!sound) return;
  try {
    if (!audio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      audio = new Audio(); master = audio.createGain(); master.gain.value=.65;
      const comp = audio.createDynamicsCompressor(); master.connect(comp); comp.connect(audio.destination);
    }
    master.gain.value=sound?.65:0;
    audio.resume().catch(()=>{});
  } catch {}
}
function fanfare(big = false) { [523.25,659.25,783.99,big?1046.5:880].forEach((f,i)=>tone(f,.2,.1,'triangle',i*.09)); }
function say(line) { $('host-line').textContent = '“'+line+'”'; }
function celebrate(big=false) {
  if (reducedMotion) return;
  const colors=['#ffdc79','#35edda','#ff4aa2','#ae78ff','#fff9df'];
  for(let i=0;i<(big?65:25);i++) {
    const c=document.createElement('i');c.className='confetti';
    c.style.left=Math.random()*100+'%';c.style.background=colors[i%colors.length];
    c.style.setProperty('--drift',(Math.random()-.5)*350+'px');c.style.animationDelay=Math.random()*.35+'s';
    $('celebration').append(c);setTimeout(()=>c.remove(),3000);
  }
}
function drawWheel(angle = rotation) {
  const canvas=$('wheel'),ctx=canvas.getContext('2d');if(!ctx)return;
  const c=500,step=Math.PI*2/SEGMENTS.length;
  ctx.clearRect(0,0,1000,1000);
  ctx.save();ctx.translate(c,c);
  const rim=ctx.createRadialGradient(0,0,430,0,0,485);rim.addColorStop(0,'#d69c39');rim.addColorStop(.35,'#ffe9a2');rim.addColorStop(.6,'#77521b');rim.addColorStop(1,'#f9d078');
  ctx.beginPath();ctx.arc(0,0,478,0,Math.PI*2);ctx.fillStyle=rim;ctx.fill();
  ctx.beginPath();ctx.arc(0,0,450,0,Math.PI*2);ctx.fillStyle='#29133d';ctx.fill();
  ctx.save();ctx.rotate(angle-Math.PI/2);
  const colors=['#ee458b','#37d8cf','#8956df','#f7bb41','#4c76e6','#d960cb'];
  SEGMENTS.forEach((s,i)=>{
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,434,i*step,(i+1)*step);ctx.closePath();
    const color=s.multiplier===3?'#ffe597':s.multiplier?'#39e6a8':s.value<0?'#552039':colors[i%colors.length];
    ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#221031';ctx.lineWidth=2;ctx.stroke();
    ctx.save();ctx.rotate((i+.5)*step);ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.font=(s.multiplier?'900 43px':'900 35px')+' Trebuchet MS, Arial, sans-serif';
    ctx.fillStyle=s.value<0?'#ffb9cf':s.multiplier?'#221239':i%colors.length===2||i%colors.length===4?'#fff9ef':'#221239';
    ctx.fillText(s.label,406,1);ctx.restore();
  });ctx.restore();
  for(let i=0;i<36;i++){
    const a=i*Math.PI*2/36;ctx.beginPath();ctx.arc(Math.cos(a)*464,Math.sin(a)*464,6.3,0,Math.PI*2);
    ctx.fillStyle=i%2===0?'#fff9d9':'#ffc35b';ctx.shadowBlur=10;ctx.shadowColor='#ffbd43';ctx.fill();ctx.shadowBlur=0;
  }
  ctx.restore();
}
function updateScore(){
  $('score').textContent=format(state.score);$('correct-count').textContent=state.correct+' / '+state.attempts;
}
function showGame(){
  $('intro').hidden=true;$('results').hidden=true;$('game').hidden=false;
  document.body.classList.add('playing');$('contestant-name').textContent=state.name;
  $('site-footer').hidden=true;updateScore();
}
function currentQuestion(){ return bank.get(state.deck[state.index]); }
function createChoices(){ const q=currentQuestion();state.choices=shuffle([q.a,...q.wrong]); }
function renderQuestion(){
  const q=currentQuestion();if(!q){finish(false);return;}
  $('topic').textContent=q.topic;$('question-number').textContent='QUESTION '+(state.index+1);
  $('question').textContent=q.q;$('answers').replaceChildren();
  state.choices.forEach((text,i)=>{
    const b=document.createElement('button');b.className='answer';b.type='button';
    const l=document.createElement('span');l.className='letter';l.textContent='ABCD'[i];
    const t=document.createElement('span');t.textContent=text;b.append(l,t);b.onclick=()=>answer(i);$('answers').append(b);
  });
  $('next').hidden=true;$('feedback').textContent='';$('feedback').className='feedback';
  $('instruction').textContent='Choose your answer to earn a spin.';setSpin(false);
  if(state.phase!=='question') renderAnswered();
}
function renderAnswered(){
  const q=currentQuestion(),h=state.history[state.history.length-1];if(!q||!h)return;
  [...$('answers').children].forEach((b,i)=>{
    b.disabled=true;if(state.choices[i]===q.a)b.classList.add('correct');
    if(i===h.choice&&!h.correct)b.classList.add('wrong');
  });
  $('feedback').className='feedback '+(h.correct?'good':'bad');
  if(h.correct){
    $('feedback').textContent='Correct! You’ve earned a spin.';
    $('instruction').textContent='Click the wheel or press Space.';
    setSpin(state.phase==='spinReady');
    if(state.phase==='feedback'){$('next').hidden=false;$('instruction').textContent='Ready for another question?';}
  } else {
    $('feedback').textContent='The correct answer is: '+q.a;
    $('next').hidden=false;$('instruction').textContent='Read the answer, then keep going.';
  }
}
function setSpin(ready){
  $('spin').disabled=!ready;$('spin').classList.toggle('ready',ready);
  $('spin-label').innerHTML=ready?'SPIN!':state?.phase==='spinning'?'SPINNING':'ANSWER<br>TO SPIN';
  $('spin-hint').textContent=ready?'PRESS SPACE':state?.phase==='spinning'?'GOOD LUCK!':'EARN YOUR SHOT';
}
function startGame(name){
  clearInterval(timerHandle);cancelAnimationFrame(spinFrame);finishing=false;nextTick=0;
  state={id:crypto.randomUUID?.()||String(Date.now()),name:name.trim().slice(0,24)||'Contestant',score:0,correct:0,attempts:0,index:0,phase:'question',deadline:Date.now()+DURATION_MS,deck:balancedDeck(QUESTIONS).map(q=>q.id),history:[],rotation:0,pending:null};
  rotation=0;createChoices();showGame();renderQuestion();drawWheel();
  $('wheel-result').textContent='THE WHEEL IS WAITING…';say('Welcome, '+state.name+'! Let’s spin some science.');
  musicPlayer.startRound();startAudio();fanfare();storeRound();tick();timerHandle=setInterval(tick,100);
  window.scrollTo({top:0,behavior:'instant'});
}
function answer(index){
  if(!state||state.phase!=='question'||index<0||index>3)return;
  if(remainingMs(state.deadline,Date.now())<=0){timeout();return;}
  startAudio();const q=currentQuestion(),right=state.choices[index]===q.a;
  state.attempts++;if(right)state.correct++;
  state.history.push({id:q.id,choice:index,selected:state.choices[index],correct:right});
  state.phase=right?'spinReady':'feedback';updateScore();renderAnswered();
  if(right){tone(660,.13);tone(880,.18,.08,'sine',.09);say(shuffle(['That’s the one! Give that wheel a spin.','Correct! Let’s see what the wheel has for you.','Science sorted. Now for the spin!'])[0]);$('wheel-result').textContent='YOU’VE EARNED A SPIN!';}
  else {tone(200,.2,.07,'triangle');say('Take a look at the answer. The next one’s yours!');$('wheel-result').textContent='NEXT QUESTION, FRESH CHANCE.';}
  storeRound();
}
function nextQuestion(){
  if(!state||state.phase!=='feedback')return;
  if(remainingMs(state.deadline,Date.now())<=0){timeout();return;}
  state.index++;
  if(state.index>=state.deck.length){finish(false,true);return;}
  state.phase='question';state.pending=null;createChoices();renderQuestion();storeRound();
}
function spin(){
  if(!state||state.phase!=='spinReady')return;
  startAudio();state.phase='spinning';setSpin(false);$('next').hidden=true;
  const index=Math.floor(Math.random()*SEGMENTS.length);
  const end=targetRotation(rotation,index,4);
  state.pending={index,end};storeRound();
  $('wheel-result').textContent='COME ON, BIG POINTS…';say('Round and round… where will it land?');
  const began=performance.now(),from=rotation,duration=reducedMotion?100:1850;
  let lastWedge=-1,lastSound=0;
  const step=now=>{
    if(!state||state.phase!=='spinning')return;
    const t=Math.min(1,(now-began)/duration),eased=1-Math.pow(1-t,4);
    rotation=from+(end-from)*eased;drawWheel();
    const wedge=pointedSegment(rotation);
    if(wedge!==lastWedge&&now-lastSound>45){tone(1100,.018,.03,'triangle');lastSound=now;lastWedge=wedge;}
    if(t<1)spinFrame=requestAnimationFrame(step);else settleSpin();
  };spinFrame=requestAnimationFrame(step);
}
function settleSpin(){
  if(!state?.pending||state.phase!=='spinning')return;
  const {index,end}=state.pending,s=SEGMENTS[index],before=state.score;
  rotation=end;state.rotation=end;drawWheel();state.score=applySegment(before,s);
  const change=state.score-before;
  state.history[state.history.length-1].spin=s.label;
  state.pending=null;state.phase='feedback';updateScore();setSpin(false);
  $('score').classList.remove('score-flash');void $('score').offsetWidth;$('score').classList.add('score-flash');
  $('wheel-result').textContent=s.multiplier?(s.multiplier===3?'TRIPLE POINTS!':'DOUBLE POINTS!'):change<0?format(change)+' POINTS': '+'+format(change)+' POINTS';
  if(s.multiplier){if(before<0){tone(196,.2);say('That multiplier also multiplies negative scores. Time for a comeback!');}else{fanfare(true);celebrate(true);say(before===0?'A multiplier! Build a total and the next one could be huge.':s.multiplier===3?'Triple! Now that’s a game changer!':'Double points! That’s how you climb the board.');}}
  else if(s.value<0){tone(330,.2);tone(196,.25,.07,'triangle',.12);say(state.score===0?'A tough spin. You’re still in the game!':'A few points gone. Plenty more to win back!');}
  else {tone(784,.12);tone(1046,.2,.08,'triangle',.09);if(s.value>=1000)celebrate();say(s.value>=1000?'Big points! That’s a beautiful spin.':'Points on the board. Keep that science coming!');}
  $('next').hidden=false;$('instruction').textContent='Ready for another question?';storeRound();
  if(finishing||remainingMs(state.deadline,Date.now())<=0)finish(false);
}
function tick(){
  if(!state||state.phase==='results')return;
  const ms=remainingMs(state.deadline,Date.now()),label=timeLabel(ms);
  if(label!==lastDisplayedTime){$('timer').textContent=label;lastDisplayedTime=label;}
  $('timer-fill').style.width=(ms/DURATION_MS*100)+'%';
  document.body.classList.toggle('urgent',ms<=60000);document.body.classList.toggle('last-seconds',ms<=10000);
  if(ms<=10000&&ms>0&&Math.ceil(ms/1000)!==nextTick){nextTick=Math.ceil(ms/1000);tone(880,.04,.04);}
  if(ms<=0)timeout();
}
function timeout(){
  if(!state||state.phase==='results'||finishing)return;
  finishing=true;clearInterval(timerHandle);$('timer').textContent='0:00';$('timer-fill').style.width='0%';
  if($('end-dialog').open)$('end-dialog').close();
  if(state.phase==='spinReady'){spin();return;}
  if(state.phase==='spinning')return;
  finish(false);
}
function finish(early=false,exhausted=false){
  if(!state||state.phase==='results')return;
  cancelAnimationFrame(spinFrame);clearInterval(timerHandle);
  // Resolve an already-earned spin once before an early finish.
  if(state.phase==='spinning'&&state.pending){const s=SEGMENTS[state.pending.index];state.score=applySegment(state.score,s);state.history[state.history.length-1].spin=s.label;state.pending=null;}
  state.phase='results';state.early=early;state.finishedAt=Date.now();
  musicPlayer.finishRound();
  try{sessionStorage.removeItem(ACTIVE_KEY);}catch{}
  let records=readRecords();
  if(!early){records=records.filter(r=>r.id!==state.id);records.push({id:state.id,name:state.name,score:state.score,correct:state.correct,attempts:state.attempts,date:state.finishedAt});records.sort((a,b)=>b.score-a.score||b.correct-a.correct);try{localStorage.setItem(RECORDS_KEY,JSON.stringify(records.slice(0,10)));}catch{}}
  $('game').hidden=true;$('intro').hidden=true;$('results').hidden=false;$('site-footer').hidden=false;
  document.body.classList.remove('playing','urgent','last-seconds');
  $('result-name').textContent=state.name;$('final-score').textContent=format(state.score);
  $('results').querySelector('h2').textContent=early?'ROUND ENDED':exhausted?'BANK COMPLETE!':'TIME’S UP!';
  $('result-stats').textContent=state.correct+' correct out of '+state.attempts+' answered'+(state.attempts?' · '+Math.round(state.correct/state.attempts*100)+'% accuracy':'')+(early?' · Early finish (unranked)':'');
  $('review').hidden=true;$('review-toggle').textContent='REVIEW ANSWERS';$('review').replaceChildren();
  for(const h of state.history){const q=bank.get(h.id);if(!q)continue;const p=document.createElement('p');if(!h.correct)p.className='missed';const b=document.createElement('strong');b.textContent=(h.correct?'✓ ':'✕ ')+q.q;p.append(b,document.createElement('br'),document.createTextNode('Correct answer: '+q.a));if(!h.correct)p.append(document.createElement('br'),document.createTextNode('Your answer: '+h.selected));$('review').append(p);}
  if(!state.history.length)$('review').textContent='No questions answered this round.';
  renderRecords($('records'));fanfare(true);if(!early)celebrate(true);
  window.scrollTo({top:0,behavior:'instant'});
}
function renderRecords(el){
  el.replaceChildren();const records=readRecords();
  if(!records.length){const p=document.createElement('p');p.className='record-note';p.textContent='Complete a five-minute round to set the first score.';el.append(p);return;}
  records.slice(0,5).forEach((r,i)=>{const li=document.createElement('li'),n=document.createElement('span'),s=document.createElement('strong');n.textContent=(i+1)+'. '+r.name;s.textContent=format(r.score);li.append(n,s);el.append(li);});
}
function resume(){
  try{
    const raw=JSON.parse(sessionStorage.getItem(ACTIVE_KEY)||'null');
    if(!raw||typeof raw.name!=='string'||!Array.isArray(raw.deck)||!raw.deck.every(id=>bank.has(id))||!raw.deck.length||!['question','spinReady','spinning','feedback'].includes(raw.phase)||!Number.isFinite(raw.deadline)||!Array.isArray(raw.history)||!Array.isArray(raw.choices)||raw.choices.length!==4||!Number.isFinite(raw.score))return;
    state=raw;rotation=state.rotation||0;showGame();renderQuestion();drawWheel();say('Welcome back! Your original clock is still running.');
    if(state.phase==='spinning'&&state.pending){settleSpin();}
    if(state.phase==='results')return;
    tick();if(state.phase!=='results'){musicPlayer.startRound();timerHandle=setInterval(tick,100);}
  }catch{state=null;}
}

$('bank-count').textContent=QUESTIONS.length;
$('start-form').onsubmit=e=>{e.preventDefault();if($('name').value.trim())startGame($('name').value);else $('name').focus();};
$('spin').onclick=spin;$('next').onclick=nextQuestion;
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Effects on':'Effects off';$('sound').setAttribute('aria-pressed',String(sound));if(sound){startAudio();tone(660);}else if(master)master.gain.value=0;};
$('music').onclick=()=>musicPlayer.toggle();
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='Use browser full screen';}};
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
$('again').onclick=()=>{state=null;$('results').hidden=true;$('intro').hidden=false;$('name').focus();};
$('review-toggle').onclick=()=>{$('review').hidden=!$('review').hidden;$('review-toggle').textContent=$('review').hidden?'REVIEW ANSWERS':'HIDE ANSWERS';};
$('show-records').onclick=()=>{renderRecords($('dialog-records'));$('records-dialog').showModal();};
$('close-records').onclick=()=>$('records-dialog').close();
$('end-round').onclick=()=>$('end-dialog').showModal();
$('keep-playing').onclick=()=>$('end-dialog').close();
$('confirm-end').onclick=()=>{$('end-dialog').close();finish(true);};
document.addEventListener('keydown',e=>{
  if(!state||state.phase==='results'||document.querySelector('dialog[open]')||['INPUT','TEXTAREA'].includes(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
  const i='1234'.indexOf(e.key),j='abcd'.indexOf(e.key.toLowerCase());
  if((i>=0||j>=0)&&state.phase==='question'){e.preventDefault();answer(i>=0?i:j);}
  if(e.code==='Space'){e.preventDefault();if(state.phase==='spinReady')spin();else if(state.phase==='feedback')nextQuestion();}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick();if(audio)startAudio();}musicPlayer.sync();});
window.addEventListener('pagehide',()=>{musicPlayer.stop();if(state&&state.phase!=='results')storeRound();});
// If the browser requires a gesture, any normal click or keypress starts the
// enabled music. Leave the music button's own explicit toggle in control.
function unlockMusic(event) {
  if(event.target?.closest?.('#music'))return;
  if($('background-music').paused)musicPlayer.sync();
}
document.addEventListener('click',unlockMusic,{capture:true});
document.addEventListener('keydown',unlockMusic,{capture:true});
drawWheel();musicPlayer.autoplay();resume();
