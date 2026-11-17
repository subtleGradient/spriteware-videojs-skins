from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageFont
import json,numpy as np
root=Path(__file__).resolve().parents[1];out=root/'public/themes/biopod';out.mkdir(parents=True,exist_ok=True)
normal=Image.open(root/'artwork/normal.png').convert('RGBA')
regions={'previous':('ellipse',[170,996,294,1107]),'play':('ellipse',[318,976,502,1126]),'pause':('ellipse',[526,998,635,1107]),'stop':('ellipse',[660,998,770,1107]),'next':('ellipse',[795,997,909,1108]),'chapters':('rounded',[127,1157,371,1226]),'captions':('rounded',[396,1157,650,1226]),'fullscreen':('rounded',[673,1157,921,1226])}
allowed=Image.new('L',normal.size)
for name,(kind,(x,y,r,b)) in regions.items():
 d=ImageDraw.Draw(allowed)
 if kind=='ellipse':d.ellipse((x,y,r-1,b-1),fill=255)
 else:d.rounded_rectangle((x,y,r-1,b-1),radius=34,fill=255)
# Canonical control surfaces are opaque so overlaying a normal patch is pixel-identical.
alpha=normal.getchannel('A');alpha.paste(255,(0,0),allowed);normal.putalpha(alpha);normal.save(out/'frame.png')
report={'canvas':list(normal.size),'regions':regions,'states':{},'alpha':{'outer':normal.getpixel((0,0))[3],'aperture':normal.getpixel((500,500))[3]}}
for state in ['normal','hover','pressed','focus','disabled']:
 raw=normal if state=='normal' else Image.open(root/'artwork'/f'{state}-raw.png').convert('RGBA')
 assert raw.size==normal.size
 raw_alpha=raw.getchannel('A');raw_alpha.paste(255,(0,0),allowed);raw.putalpha(raw_alpha)
 registered=Image.composite(raw,normal,allowed);registered.save(root/'artwork'/f'{state}-registered.png')
 for name,(kind,box) in regions.items():
  patch=registered.crop(box);patch.putalpha(allowed.crop(box));patch.save(out/f'{name}-{state}.png')
 diff=np.any(np.array(registered)!=np.array(normal),axis=2);outside=np.array(allowed)==0
 report['states'][state]={'outside_changed':int(np.count_nonzero(diff&outside)),'inside_changed':int(np.count_nonzero(diff&~outside))}
 assert report['states'][state]['outside_changed']==0
 # Proof reconstructs the exact browser layer operation: normal master + native-sized patches.
 proof=normal.copy()
 for name,(_,box) in regions.items():proof.alpha_composite(Image.open(out/f'{name}-{state}.png'),box[:2])
 assert np.array_equal(np.array(proof),np.array(registered))
 proof.save(root/'proof'/f'{state}-composite.png')
allowed.save(root/'proof/permitted-regions.png')
(root/'proof/registration-report.json').write_text(json.dumps(report,indent=2)+'\n')
# Existing generated, original C amethyst diamond/bead state artwork; retain aspect ratio.
# Moving jewels are separate from canonical frame, which has empty rails.
source=root/'artwork/thumbs'
for name in ['seek','volume']:
 for state in ['normal','hover','pressed','focus','disabled']:
  im=Image.open(source/f'{name}-{state}.png').convert('RGBA');im.thumbnail((60,60),Image.Resampling.LANCZOS)
  square=Image.new('RGBA',(60,60));square.alpha_composite(im,((60-im.width)//2,(60-im.height)//2));square.save(out/f'{name}-{state}.png')
# Inspection contact sheet, all real registered crops, never synthesized controls.
contact=Image.new('RGB',(1086,5*330),(20,10,27))
for row,state in enumerate(['normal','hover','pressed','focus','disabled']):
 crop=Image.open(root/'proof'/f'{state}-composite.png').crop((100,950,950,1260));contact.paste(crop,(10,row*330),crop);ImageDraw.Draw(contact).text((880,row*330+20),state,fill='white')
contact.save(root/'proof/control-states-contact.png')
print(json.dumps(report,indent=2))
