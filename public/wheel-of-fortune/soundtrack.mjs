// Original game-show lounge theme: brass, electric keys, walking bass and drums.
// Everything is synthesized locally; no downloads or third-party audio services.
export function createGameShowMusic(context, output, timers = {setInterval, clearInterval}) {
  const bus = context.createGain();
  bus.gain.value = 0;
  bus.connect(output);
  const voices = new Set();
  const sixteenth = 60 / 120 / 4;
  let interval = null, step = 0, nextAt = 0;
  const noise = context.createBuffer(1, context.sampleRate * .3, context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;

  const chords = [
    {bass:36, notes:[60,64,67,69], tune:[76,0,79,81,0,79,76,0,74,0,72,74,76,0,0,0]},
    {bass:45, notes:[61,64,67,69], tune:[73,0,76,79,0,81,79,0,76,0,73,0,76,0,0,0]},
    {bass:38, notes:[60,62,65,69], tune:[74,0,77,81,0,79,77,0,76,0,74,0,72,74,0,0]},
    {bass:43, notes:[59,62,65,69], tune:[71,0,74,77,0,79,77,0,74,0,71,0,74,0,0,0]},
    {bass:41, notes:[60,64,65,69], tune:[77,0,81,84,0,81,79,0,77,0,76,0,77,0,0,0]},
    {bass:41, notes:[60,62,65,68], tune:[77,0,80,84,0,80,77,0,74,0,72,0,74,0,0,0]},
    {bass:43, notes:[60,64,67,69], tune:[76,0,79,81,0,79,76,0,74,0,72,0,76,0,79,0]},
    {bass:43, notes:[59,62,65,68], tune:[77,0,76,74,0,71,74,0,79,0,77,0,74,71,0,0]},
  ];
  const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
  function track(source, nodes, end) {
    voices.add(source);
    source.onended = () => { voices.delete(source); for (const n of [source,...nodes]) n.disconnect(); };
    source.stop(end);
  }
  function instrument(midi, time, duration, level, type, cutoff = 1800) {
    const osc = context.createOscillator(), filter = context.createBiquadFilter(), gain = context.createGain();
    osc.type = type; osc.frequency.value = frequency(midi);
    filter.type = 'lowpass'; filter.frequency.setValueAtTime(cutoff,time);
    filter.frequency.exponentialRampToValueAtTime(Math.max(180,cutoff*.45),time+duration);
    gain.gain.setValueAtTime(.0001,time);
    gain.gain.exponentialRampToValueAtTime(level,time+.012);
    gain.gain.exponentialRampToValueAtTime(level*.55,time+Math.min(.06,duration*.5));
    gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
    osc.connect(filter); filter.connect(gain); gain.connect(bus);
    osc.start(time); track(osc,[filter,gain],time+duration+.015);
  }
  function percussion(time, kind) {
    if (kind === 'kick') {
      const osc=context.createOscillator(), gain=context.createGain();
      osc.frequency.setValueAtTime(125,time); osc.frequency.exponentialRampToValueAtTime(45,time+.13);
      gain.gain.setValueAtTime(.3,time); gain.gain.exponentialRampToValueAtTime(.0001,time+.17);
      osc.connect(gain); gain.connect(bus); osc.start(time);track(osc,[gain],time+.18);return;
    }
    const source=context.createBufferSource(), filter=context.createBiquadFilter(), gain=context.createGain();
    source.buffer=noise;filter.type='highpass';filter.frequency.value=kind==='snare'?1400:6500;
    const length=kind==='snare'?.1:.035;
    gain.gain.setValueAtTime(kind==='snare'?.14:.055,time);
    gain.gain.exponentialRampToValueAtTime(.0001,time+length);
    source.connect(filter);filter.connect(gain);gain.connect(bus);source.start(time);track(source,[filter,gain],time+length+.01);
  }
  function schedule() {
    const now=context.currentTime;
    // Drop missed beats after a suspended audio context; never play a catch-up burst.
    if(nextAt<now-.1)nextAt=now+.025;
    let guard=0;
    while(nextAt<now+.14 && guard++<8) {
      const beat=step%16, bar=Math.floor(step/16)%8, chorus=Math.floor(step/128)%2;
      const chord=chords[bar],t=nextAt+(beat%2 ? .012 : 0);
      if(beat===0||beat===8)percussion(t,'kick');
      if(beat===4||beat===12)percussion(t,'snare');
      if(beat%2===0)percussion(t,'hat');
      if([0,4,8,12].includes(beat)) {
        const bassNote=chord.bass+(beat===4?7:beat===8?12:beat===12?7:0);
        instrument(bassNote,t,.2,.22,'triangle',700);
      }
      if([0,6,10,14].includes(beat))for(const n of chord.notes)instrument(n,t,.15,.036,'triangle',2200);
      const note=chord.tune[beat];
      if(note)instrument(note+(chorus&&beat===8?12:0),t,beat===12?.22:.16,.07,'sawtooth',2100);
      // A little bell flourish is the cheesy cherry on the end of every chorus.
      if(bar===7&&[12,13,14,15].includes(beat))instrument([79,83,86,91][beat-12],t,.18,.045,'sine',4200);
      nextAt+=sixteenth;step++;
    }
  }
  return {
    get playing() { return interval !== null; },
    start() {
      if(interval!==null)return;
      nextAt=context.currentTime+.03;
      bus.gain.cancelScheduledValues(context.currentTime);
      bus.gain.setTargetAtTime(.36,context.currentTime,.08);
      schedule();interval=timers.setInterval(schedule,35);
    },
    stop() {
      if(interval!==null)timers.clearInterval(interval);
      interval=null;
      bus.gain.cancelScheduledValues(context.currentTime);
      bus.gain.setTargetAtTime(0,context.currentTime,.012);
      for(const source of voices) { try { source.stop(context.currentTime+.045); } catch {} }
      voices.clear();
    },
  };
}
