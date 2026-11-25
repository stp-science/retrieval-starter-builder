"""Compose an original cinematic risk bed for Science Vault. No sampled music.
Requires numpy, scipy and ffmpeg. All tails wrap to keep the loop seamless.
"""
from pathlib import Path
import subprocess
import tempfile
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

RATE=44100
BPM=96
BEAT=60/BPM
SECONDS=40
LENGTH=RATE*SECONDS
rng=np.random.default_rng(410926)
mix=np.zeros((LENGTH,2),dtype=np.float64)

def put(wave,at,level=1,pan=0):
    indices=(np.arange(len(wave))+round(at*RATE))%LENGTH
    gains=np.sqrt([(1-pan)/2,(1+pan)/2])
    np.add.at(mix,indices,wave[:,None]*level*gains)

def env(n,attack=.01,release=.05):
    out=np.ones(n);a=min(n//2,round(attack*RATE));r=min(n//2,round(release*RATE))
    if a: out[:a]=np.linspace(0,1,a)
    if r: out[-r:]=np.linspace(1,0,r)**1.5
    return out

def note(midi,at,duration,level,kind='pulse',pan=0):
    t=np.arange(round(duration*RATE))/RATE;f=440*2**((midi-69)/12)
    if kind=='sub':
        wave=(np.sin(2*np.pi*f*t)+.38*np.sin(2*np.pi*f*2*t)+.15*np.sin(2*np.pi*f*3*t))*np.exp(-t*4)
    elif kind=='string':
        wave=sum((np.sin(2*np.pi*f*h*t)+np.sin(2*np.pi*f*1.002*h*t))*.5/h**1.7 for h in range(1,7))
        wave*=.65+.22*np.sin(2*np.pi*5.3*t)
    elif kind=='metal':
        wave=(np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*2.71*t))*np.exp(-t*8)
    else:
        wave=(np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*2*f*t)+.08*np.sin(2*np.pi*3*f*t))*np.exp(-t*12)
    put(wave*env(len(t),.025 if kind=='string' else .004,.3 if kind=='string' else .03),at,level,pan)

def hit(at,kind='heart',level=1,pan=0):
    duration={'heart':.4,'tick':.045,'impact':1.5,'tom':.35}[kind]
    t=np.arange(round(duration*RATE))/RATE
    if kind in ('heart','tom'):
        f0=115 if kind=='heart' else 180;f1=43 if kind=='heart' else 68
        phase=2*np.pi*(f1*t+(f0-f1)*.025*(1-np.exp(-t/.025)))
        wave=np.sin(phase)*np.exp(-t*(14 if kind=='heart' else 11))
        wave+=.15*np.sin(2*phase)*np.exp(-t*22)
    elif kind=='tick':
        wave=sosfilt(butter(2,[1800,4200],btype='bandpass',fs=RATE,output='sos'),rng.normal(0,1,len(t)))
        wave*=np.exp(-t*110)
        wave+=.25*np.sin(2*np.pi*1700*t)*np.exp(-t*150)
    else:
        noise=sosfilt(butter(2,750,btype='lowpass',fs=RATE,output='sos'),rng.normal(0,1,len(t)))
        wave=(noise*.8+np.sin(2*np.pi*43*t)*.6)*np.exp(-t*4)
    put(wave*env(len(t),.002,.015),at,level,pan)

# D-minor pedal, dissonant upper neighbour, a persistent clock and heartbeat.
# There is no verse/chorus melody or triumphant major-key resolution.
for bar in range(16):
    at=bar*4*BEAT
    root=38 if bar%8<6 else 34 if bar%8==6 else 37
    note(root,at,1.0,.25,'sub')
    note(root,at+2*BEAT,.8,.19,'sub')
    for pulse in (0,2):
        hit(at+pulse*BEAT,'heart',.20)
        hit(at+pulse*BEAT+.19,'heart',.09)
    for step in range(8):
        pitch=[62,69,74,69,62,69,75,69][step]
        if bar%8>=6: pitch-=1
        note(pitch,at+step*BEAT/2,.23,.065+(.014 if bar>=8 else 0),'pulse',-.22 if step%2 else .22)
        hit(at+step*BEAT/2,'tick',.065 if step%2==0 else .035,.35 if step%2 else -.35)
    if bar%2==0:
        for pitch,level in [(50,.055),(57,.045),(65,.032),(75,.018)]:
            note(pitch,at,4.95,level,'string',-.3 if pitch%2 else .3)
    if bar%4==0: hit(at,'impact',.22)
    if bar%4==3:
        for beat in (2,2.75,3.5):hit(at+beat*BEAT,'tom',.075)
    if bar in (3,7,11,15):
        note(86,at+3*BEAT,.8,.027,'metal',.35)
        duration=2*BEAT;t=np.arange(round(duration*RATE))/RATE
        noise=sosfilt(butter(2,[400,1800],btype='bandpass',fs=RATE,output='sos'),rng.normal(0,1,len(t)))
        put(noise*(t/duration)**2*env(len(t),.1,.02),at+2*BEAT,.045)

# Dark stereo room: deliberately restrained so questions remain readable.
original=mix.copy()
mix+=np.roll(original[:,::-1],round(.1875*RATE),axis=0)*.16
mix+=np.roll(original,round(.375*RATE),axis=0)*.09
mix=np.tanh(mix*1.2)
rms=np.sqrt(np.mean(mix**2));mix*=min(.18/rms,.94/np.max(np.abs(mix)))
root=Path(__file__).resolve().parents[1]
output=root/'public/science-vault/assets/vault-suspense.mp3'
output.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
    wave=Path(temp)/'vault.wav';wavfile.write(wave,RATE,(mix*32767).astype(np.int16))
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wave),'-codec:a','libmp3lame','-b:a','80k','-metadata','title=Science Vault - Under Pressure','-metadata','artist=Original classroom game music',str(output)],check=True)
print(f'{output.name}: {SECONDS}s, {BPM} BPM, {output.stat().st_size} bytes; peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS')
