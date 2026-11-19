"""Build the original Wheel of Fortune background theme. Requires numpy, scipy and ffmpeg."""
from pathlib import Path
import subprocess
import tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

RATE = 44100
SECONDS = 32
LENGTH = RATE * SECONDS
mix = np.zeros((LENGTH, 2), dtype=np.float64)
rng = np.random.default_rng(20261119)


def put(wave, start, pan=0):
    indices = (np.arange(len(wave)) + round(start * RATE)) % LENGTH
    gains = np.sqrt([(1 - pan) / 2, (1 + pan) / 2])
    np.add.at(mix, indices, wave[:, None] * gains)


def envelope(length, attack=.008, release=.045):
    env = np.ones(length)
    a, r = min(round(attack*RATE), length//2), min(round(release*RATE), length//2)
    if a: env[:a] = np.linspace(0, 1, a)
    if r: env[-r:] = np.linspace(1, 0, r)**1.5
    return env


def note(midi, start, duration, level, sound='keys', pan=0):
    t = np.arange(round(duration * RATE)) / RATE
    f = 440 * 2**((midi - 69) / 12)
    if sound == 'brass':
        vibrato = .002 * np.sin(2*np.pi*5.4*t)
        phase = 2*np.pi*f*(t + vibrato*t*.12)
        wave = sum(np.sin(h*phase) / h**1.4 for h in range(1, 8))
        wave += .18*np.sin(phase*1.003)
        wave *= (1-.3*t/duration)
    elif sound == 'bass':
        wave = np.sin(2*np.pi*f*t) + .3*np.sin(4*np.pi*f*t) + .12*np.sin(6*np.pi*f*t)
        wave *= np.exp(-t*5)
    elif sound == 'bell':
        wave = np.sin(2*np.pi*f*t)*np.exp(-t*9) + .35*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*16)
    else:
        wave = (np.sin(2*np.pi*f*t) + .25*np.sin(4*np.pi*f*t) + .1*np.sin(6*np.pi*f*t))*np.exp(-t*6)
    put(wave * envelope(len(t)) * level, start, pan)


def drum(start, kind):
    duration = {'kick':.22, 'snare':.14, 'hat':.055, 'shaker':.075}[kind]
    t = np.arange(round(duration*RATE))/RATE
    if kind == 'kick':
        phase = 2*np.pi*(44*t + (115-44)*(.018)*(1-np.exp(-t/.018)))
        wave = np.sin(phase) * np.exp(-t*22) * .7
    else:
        wave = rng.uniform(-1,1,len(t))
        cutoff = 1600 if kind == 'snare' else 6400
        wave = sosfilt(butter(2,cutoff,fs=RATE,btype='highpass',output='sos'),wave)
        wave *= np.exp(-t*(35 if kind=='snare' else 65))
        wave *= .3 if kind=='snare' else .16
        if kind=='snare': wave += .12*np.sin(2*np.pi*180*t)*np.exp(-t*40)
    put(wave*envelope(len(t),.001,.01),start,.3 if kind in ('hat','shaker') else 0)


chords = [
 (36,[60,64,67,69],[76,0,79,81,0,79,76,0,74,0,72,74,76,0,0,0]),
 (45,[61,64,67,69],[73,0,76,79,0,81,79,0,76,0,73,0,76,0,0,0]),
 (38,[60,62,65,69],[74,0,77,81,0,79,77,0,76,0,74,0,72,74,0,0]),
 (43,[59,62,65,69],[71,0,74,77,0,79,77,0,74,0,71,0,74,0,0,0]),
 (41,[60,64,65,69],[77,0,81,84,0,81,79,0,77,0,76,0,77,0,0,0]),
 (41,[60,62,65,68],[77,0,80,84,0,80,77,0,74,0,72,0,74,0,0,0]),
 (43,[60,64,67,69],[76,0,79,81,0,79,76,0,74,0,72,0,76,0,79,0]),
 (43,[59,62,65,68],[77,0,76,74,0,71,74,0,79,0,77,0,74,71,0,0]),
]
for chorus in range(2):
    for bar,(bass,keys,tune) in enumerate(chords):
        for beat in range(16):
            at = chorus*16 + bar*2 + beat*.125 + (.012 if beat%2 else 0)
            if beat in (0,8): drum(at,'kick')
            if beat in (4,12): drum(at,'snare')
            if beat%2==0: drum(at,'hat')
            if chorus and beat%2: drum(at,'shaker')
            if beat in (0,4,8,12):
                note(bass+({0:0,4:7,8:12,12:7}[beat]),at,.25,.3,'bass')
            if beat in (0,6,10,14):
                for pitch in keys: note(pitch,at,.2,.095,'keys',-.35)
            if tune[beat]:
                note(tune[beat],at,.22 if beat==12 else .17,.16,'brass',.18)
                if chorus: note(tune[beat]-12,at,.15,.04,'brass',-.1)
            if bar==7 and beat in (12,13,14,15):
                note([79,83,86,91][beat-12],at,.25,.09,'bell',-.25)

# Short stereo ambience and gentle soft limiting. Delay wraps for a seamless loop.
original=mix.copy()
mix += np.roll(original,round(.085*RATE),axis=0)*.10
mix += np.roll(original[:,::-1],round(.14*RATE),axis=0)*.08
mix = np.tanh(mix*1.3)
rms = np.sqrt(np.mean(mix**2))
mix *= min(.18/rms, .94/np.max(np.abs(mix)))
root=Path(__file__).resolve().parents[1]
output=root/'public/wheel-of-fortune/assets/gameshow-theme.mp3'
with tempfile.TemporaryDirectory() as temp:
    wave=Path(temp)/'theme.wav'
    wavfile.write(wave,RATE,(mix*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wave),'-codec:a','libmp3lame','-b:a','96k','-metadata','title=Mr Talbot’s Game Show Theme','-metadata','artist=Original classroom game music',str(output)],check=True)
print(f'{output.name}: {SECONDS}s, RMS {20*np.log10(np.sqrt(np.mean(mix**2))):.1f} dBFS, peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS, {output.stat().st_size} bytes')
