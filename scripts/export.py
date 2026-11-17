from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1];report=json.load(open(root/'proof/registration-report.json'));out=root/'public/themes/nebula';out.mkdir(parents=True,exist_ok=True)
for name,(kind,box) in report['regions'].items():
 x,y,r,b=box
 for state in ['normal','hover','pressed','focus','disabled']:
  master=Image.open(root/'artwork'/f'{state}.png').convert('RGBA');patch=master.crop(box);mask=Image.new('L',patch.size);d=ImageDraw.Draw(mask)
  if kind=='ellipse':d.ellipse((0,0,r-x,b-y),fill=255)
  else:d.rounded_rectangle((0,0,r-x,b-y),radius=39,fill=255)
  patch.putalpha(mask);patch.save(out/f'{name}-{state}.png')
paths={'normal':root/'artwork/original-with-thumbs.png'}
for state in ['pressed','focus','disabled']:
 paths[state]=root/'artwork'/f'jewels-{state}.png'
for name,center in [('seek',(406,945)),('volume',(945,870))]:
 for state,p in paths.items():
  x,y=center;patch=Image.open(p).convert('RGBA').crop((x-30,y-30,x+30,y+30));mask=Image.new('L',(60,60));ImageDraw.Draw(mask).ellipse((1,1,59,59),fill=255);patch.putalpha(mask);patch.save(out/f'{name}-{state}.png')

# Hover generation moved both spheres: reject it, retain the registered normal state.
for name in ["seek","volume"]:
 Image.open(out/f"{name}-normal.png").save(out/f"{name}-hover.png")
