"""Original procedural SDR motion study. No third-party footage/audio/assets."""
import numpy as np, subprocess, wave
from pathlib import Path
P=Path(__file__).parent
W,H,FPS,SECONDS=960,540,24,24
xx,yy=np.meshgrid(np.linspace(-W/H,W/H,W,dtype=np.float32),np.linspace(1,-1,H,dtype=np.float32))
def env(rx,ry,rz,t):
    a=np.arctan2(rx,rz); b=ry
    bands=(np.sin(a*2+b*2.8+t)*.5+.5)
    cyan=np.array([.04,.84,.96]); violet=np.array([.57,.12,.8]); pink=np.array([1,.25,.53])
    base=cyan[None,None,:]*(1-bands[:,:,None])+violet[None,None,:]*bands[:,:,None]
    q=np.exp(-((np.sin(a+t)+b*.6)/.24)**2)
    base=base*(1-q[:,:,None]*.8)+pink*q[:,:,None]*.8
    strip=np.exp(-((np.sin(a-t)+b*.9)/.11)**2)
    soft=np.exp(-((b-.55)/.25)**2)*.5
    return np.clip(base*.65+(strip+soft)[:,:,None]*.8,0,1)
out=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(P/'silent.mp4')],stdin=subprocess.PIPE)
for frame in range(FPS*SECONDS):
    t=2*np.pi*frame/(FPS*SECONDS)
    glow1=np.exp(-((xx-.8*np.sin(t))**2+(yy-.45*np.cos(t))**2)*1.7)
    glow2=np.exp(-((xx+.9*np.cos(t))**2+(yy+.6*np.sin(t))**2)*2.5)
    base=np.zeros((H,W,3),dtype=np.float32)+np.array([.012,.025,.065],dtype=np.float32)
    base+=glow1[:,:,None]*np.array([.015,.24,.31])+glow2[:,:,None]*np.array([.22,.025,.16])
    # Wide translucent caustic ribbons, periodic in time.
    for k in range(3):
        center=.48*np.sin(xx*1.35+t+k*.9)+.36*(k-1)
        ridge=np.exp(-((yy-center)/(.025+k*.015))**2)
        base+=ridge[:,:,None]*np.array([[.04,.5,.65],[.45,.07,.3],[.05,.28,.45]][k])*.4
    # Layered chrome orbs with reflection mapped from a moving synthetic studio.
    for cx,cy,r,phase in [(-1.18+.15*np.cos(t),.42+.12*np.sin(t),.30,1),(.9+.26*np.cos(t),-.36+.16*np.sin(t),.42,2),(-.12+.21*np.sin(t),.04+.14*np.cos(t),.67,0)]:
        dx=(xx-cx)/r; dy=(yy-cy)/r; d2=dx*dx+dy*dy
        shadow=np.exp(-(((xx-cx-.05)/(r*1.15))**2+((yy-cy+.13)/(r*.95))**2)*2)*.52
        base*=1-shadow[:,:,None]
        z=np.sqrt(np.maximum(0,1-d2))
        refl=env(2*dx*z,2*dy*z,2*z*z-1,t+phase)
        rim=(1-z)**3
        refl=refl*(.62+.35*z[:,:,None])+rim[:,:,None]*np.array([.28,.5,.55])
        highlight=np.exp(-((dx+.34)**2+(dy-.55)**2)/.008)
        refl+=highlight[:,:,None]*.7
        edge=np.clip((1-d2)*W*r/4,0,1)
        base=base*(1-edge[:,:,None])+np.clip(refl,0,1)*edge[:,:,None]
    # mild corner vignette
    base*=np.clip(1-.12*(xx*xx+yy*yy),.55,1)[:,:,None]
    out.stdin.write((np.clip(base,0,1)*255+.5).astype('uint8').tobytes())
    if frame%144==0: print(f'frame {frame}/{FPS*SECONDS}',flush=True)
out.stdin.close(); assert out.wait()==0
sr=48000
s=np.arange(sr*SECONDS,dtype=np.float64)/sr
# Periodic frequencies, smooth loop, intentionally quiet synthetic ambient chord.
a=.055*(np.sin(2*np.pi*110*s)+.6*np.sin(2*np.pi*165*s)+.4*np.sin(2*np.pi*220*s))
a*=.7+.3*np.cos(2*np.pi*s/SECONDS)
stereo=np.stack([a,a*.92],axis=1)
with wave.open(str(P/'audio.wav'),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((stereo*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(P/'silent.mp4'),'-i',str(P/'audio.wav'),'-c:v','copy','-c:a','aac','-b:a','96k','-shortest','-movflags','+faststart',str(P/'aqua-motion.mp4')],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-ss','4','-i',str(P/'aqua-motion.mp4'),'-frames:v','1',str(P/'poster.jpg')],check=True)
print('Complete',flush=True)
