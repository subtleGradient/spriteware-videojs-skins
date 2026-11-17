from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageFont
import numpy as np,json
root=Path(__file__).resolve().parents[1];art=root/'artwork';out=root/'proof';normal=Image.open(art/'normal.png').convert('RGBA');W,H=normal.size
# Fixed NORMAL-master coordinates. These cover cap interiors only, never the socket/shell.
regions={
 'previous':('ellipse',(115,1005,246,1128)),
 'play':('ellipse',(249,978,480,1155)),
 'pause':('ellipse',(481,1007,606,1130)),
 'stop':('ellipse',(608,1007,736,1130)),
 'next':('ellipse',(735,1006,867,1131)),
 'chapters':('rounded',(145,1170,376,1257)),
 'captions':('rounded',(375,1169,607,1258)),
 'chapter-step':('rounded',(607,1170,873,1258)),
}
mask=Image.new('L',(W,H));d=ImageDraw.Draw(mask)
for kind,box in regions.values():
 if kind=='ellipse':d.ellipse(box,fill=255)
 else:d.rounded_rectangle(box,radius=39,fill=255)
mask.save(out/'permitted-regions.png');report={'canvas':[W,H],'regions':regions,'states':{}}
base=np.array(normal).astype(int);allowed=np.array(mask)>0
for state in ['normal','hover','pressed','focus','disabled']:
 raw=Image.open(art/(state+'.png')).convert('RGBA')
 if raw.size!=(W,H):raise ValueError('Reject canvas drift')
 # Do not use generated full-frame states: generator changes non-control pixels.
 # At unchanged coordinates, replace only bounded face interiors in canonical master.
 final=Image.composite(raw,normal,mask) if state!='normal' else normal.copy()
 final.save(out/(state+'-registered.png'))
 diff=np.abs(np.array(final).astype(int)-base);rawdiff=np.abs(np.array(raw).astype(int)-base)
 report['states'][state]={'raw_outside_mask_changed_pixels':int(np.any(rawdiff>0,axis=2)[~allowed].sum()),'registered_outside_mask_changed_pixels':int(np.any(diff>0,axis=2)[~allowed].sum()),'max_outside_difference':int(diff[~allowed].max())}
 heat=np.any(diff>0,axis=2);heatimg=np.zeros((H,W,4),dtype=np.uint8);heatimg[heat]=[255,0,200,255];Image.fromarray(heatimg).save(out/(state+'-difference.png'))
# Exact-source-scale transport/pills comparisons, no independent sprite resize.
contact=Image.new('RGB',(900,5*310),(20,15,22));draw=ImageDraw.Draw(contact)
for i,state in enumerate(['normal','hover','pressed','focus','disabled']):
 im=Image.open(out/(state+'-registered.png'));crop=im.crop((95,975,995,1260));contact.paste(crop,(0,i*310+25),crop);draw.text((12,i*310+6),state.upper()+' / exact source scale',fill='white')
contact.save(out/'controls-contact-1x.png')
# Whole scene normal master vs bounded replacements at uniform 320px scene width.
contact=Image.new('RGB',(5*320,460),(20,15,22));draw=ImageDraw.Draw(contact)
for i,state in enumerate(['normal','hover','pressed','focus','disabled']):
 im=Image.open(out/(state+'-registered.png'));im.thumbnail((320,427));contact.paste(im,(i*320,26),im);draw.text((i*320+10,6),state.upper(),fill='white')
contact.save(out/'scene-contact-320.png')
json.dump(report,open(out/'registration-report.json','w'),indent=2)
print(json.dumps(report,indent=2))
