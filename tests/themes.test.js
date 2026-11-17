import test from 'node:test';import assert from 'node:assert/strict';import {existsSync,readFileSync} from 'node:fs';import nebula from '../src/themes/nebula.js';import biopod from '../src/themes/biopod.js';
for(const theme of [nebula,biopod]){
 test(`${theme.id}: all states, bounds and non-overlapping 320px targets`,()=>{
  const regions=theme.controls.map(c=>({id:c.id,box:c.hit||c.box})).concat([{id:'seek',box:theme.seek.hit},{id:'volume',box:theme.volume.hit},{id:'mute',box:theme.mute}]);
  for(const {id,box:[x,y,w,h]} of regions){assert.ok(x>=0&&y>=0&&x+w<=theme.width&&y+h<=theme.height,id+' bounds');assert.ok(w*308/theme.width>=24&&h*308/theme.width>=24,id+' target');}
  for(let i=0;i<regions.length;i++)for(let j=i+1;j<regions.length;j++){const a=regions[i].box,b=regions[j].box;assert.ok(!(Math.min(a[0]+a[2],b[0]+b[2])>Math.max(a[0],b[0])&&Math.min(a[1]+a[3],b[1]+b[3])>Math.max(a[1],b[1])),`${regions[i].id}/${regions[j].id}`)}
  for(const c of theme.controls)for(const state of ['normal','hover','pressed','focus','disabled'])assert.ok(existsSync(new URL('../public/'+theme.assetRoot+(c.asset||c.id)+'-'+state+'.png',import.meta.url)));
 });
}
test('BIOPOD remains a theme of the one engine',()=>{const s=readFileSync(new URL('../src/player.js',import.meta.url),'utf8');assert.match(s,/const themes=\{nebula,biopod\}/);assert.match(s,/theme.filename/);assert.equal((s.match(/video-player id=/g)||[]).length,1)});
