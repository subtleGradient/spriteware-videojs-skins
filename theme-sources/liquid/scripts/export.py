from PIL import Image,ImageDraw,ImageChops
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];out=root/'public/themes/liquid';out.mkdir(parents=True,exist_ok=True)
regions={'previous':('ellipse',[242,1007,367,1123]),'play':('ellipse',[386,982,563,1145]),'pause':('ellipse',[577,1008,689,1123]),'stop':('ellipse',[697,1009,810,1123]),'next':('ellipse',[822,1008,937,1123]),'chapters':('ellipse',[74,941,193,1027]),'captions':('ellipse',[74,1052,194,1137]),'fullscreen':('roundrect',[854,307,916,357])}
normal=Image.open(root/'artwork/normal.png').convert('RGBA')
allowed=Image.new('L',normal.size);ad=ImageDraw.Draw(allowed)
for name,(kind,box) in regions.items():
 x,y,r,b=box
 mask=Image.new('L',(r-x,b-y));d=ImageDraw.Draw(mask)
 (d.ellipse if kind=='ellipse' else d.rounded_rectangle)((0,0,r-x-1,b-y-1),fill=255,**({'radius':13} if kind!='ellipse' else {}));allowed.paste(mask,(x,y))
 for state in ['normal','hover','pressed','focus','disabled']:
  im=Image.open(root/f'artwork/{state}.png').convert('RGBA');patch=im.crop(box);mask=Image.new('L',patch.size);d=ImageDraw.Draw(mask)
  (d.ellipse if kind=='ellipse' else d.rounded_rectangle)((0,0,r-x-1,b-y-1),fill=255,**({'radius':13} if kind!='ellipse' else {}));patch.putalpha(mask);patch.save(out/f'{name}-{state}.png')
# Opaque button faces prevent source alpha from double-compositing at rest.
normal.putalpha(ImageChops.lighter(normal.getchannel('A'),allowed));normal.save(out/'frame.png')
# Match actual original thumb diameter and center rather than resizing unrelated sheets.
for name,center,size in [('seek',(473,929),60),('volume',(1003,813),50)]:
 x,y=center;r=size//2
 for state in ['normal','hover','pressed','focus','disabled']:
  p=root/('artwork/original-with-thumbs.png' if state=='normal' else f'artwork/jewels-{state}.png')
  im=Image.open(p).convert('RGBA');patch=im.crop((x-r,y-r,x+r,y+r));mask=Image.new('L',patch.size);ImageDraw.Draw(mask).ellipse((1,1,size-2,size-2),fill=255);patch.putalpha(mask);patch.save(out/f'{name}-{state}.png')
report={'regions':regions,'dimensions':normal.size,'alpha_exterior':normal.getpixel((0,0))[3],'alpha_aperture':normal.getpixel((500,500))[3],'outside_changed':{}}
for state in ['normal','hover','pressed','focus','disabled']:
 composite=normal.copy()
 for name,(kind,box) in regions.items():
  patch=Image.open(out/f'{name}-{state}.png');composite.alpha_composite(patch,box[:2])
 diff=ImageChops.difference(composite,normal);outside=ImageChops.multiply(diff.convert('RGB'),Image.merge('RGB',[ImageChops.invert(allowed)]*3));report['outside_changed'][state]=sum(1 for p in outside.getdata() if p!=(0,0,0))
 composite.save(root/f'proof/{state}-registered.png');diff.save(root/f'proof/{state}-difference.png')
 if state=='normal':report['normal_reconstruction_identical']=not diff.getbbox()
allowed.save(root/'proof/permitted-regions.png')
json.dump(report,open(root/'proof/registration-report.json','w'),indent=2)
# Static composition for visual review. It does not assert browser rendering.
back=Image.new('RGBA',normal.size,(4,10,20,255));poster=Image.open('/workspace/shared/aquadeck/public/assets/poster.jpg').convert('RGBA');poster.thumbnail((665,444));back.alpha_composite(poster,(258+(665-poster.width)//2,366+(444-poster.height)//2));back.alpha_composite(normal)
for name,center,size in [('seek',(473,930),60),('volume',(1003,813),50)]:back.alpha_composite(Image.open(out/f'{name}-normal.png'),(center[0]-size//2,center[1]-size//2))
back.save(root/'proof/static-composition.png');back.resize((390,520),Image.Resampling.LANCZOS).save(root/'proof/static-mobile390.png');back.resize((320,427),Image.Resampling.LANCZOS).save(root/'proof/static-mobile320.png')
print(json.dumps(report,indent=2))
