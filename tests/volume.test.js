import test from 'node:test';
import assert from 'node:assert/strict';
import {volumeAtPoint,supportsMediaVolume,applyMediaVolume} from '../src/volume.js';
import nebula from '../src/themes/nebula.js';
import liquid from '../src/themes/liquid.js';
import biopod from '../src/themes/biopod.js';
for(const theme of [nebula,liquid,biopod])test(`${theme.id}: touch rail endpoints and midpoint at mobile/desktop`,()=>{
 for(const width of [320,390,620]){
  const rect={left:17,top:39,width,height:width*theme.height/theme.width};
  const point=(v)=>{const [a,b]=[theme.volume.from,theme.volume.to];return [rect.left+(a[0]+(b[0]-a[0])*v)*width/theme.width,rect.top+(a[1]+(b[1]-a[1])*v)*rect.height/theme.height]};
  for(const v of [0,.25,.5,.75,1])assert.ok(Math.abs(volumeAtPoint(...point(v),rect,theme)-v)<1e-9);
 }
});
test('writable volume preserves probe value; nonzero gesture unmutes',()=>{const v={volume:.65,muted:true};assert.equal(supportsMediaVolume(v),true);assert.equal(v.volume,.65);assert.equal(applyMediaVolume(v,.4),true);assert.equal(v.volume,.4);assert.equal(v.muted,false);applyMediaVolume(v,0);assert.equal(v.muted,true)});
test('hardware-only ignored writes never turn a slider tap into mute',()=>{const v={get volume(){return 1},set volume(_) {},muted:false};assert.equal(supportsMediaVolume(v),false);for(const x of [0,.2,.8]){assert.equal(applyMediaVolume(v,x),false);assert.equal(v.muted,false)}});
import {bindVolumePointer} from '../src/volume.js';
test('touch pointer uses rail coordinates, captures drag, ignores other pointers and releases',()=>{
 const handlers={},values=[];let captured=null,focused=false,prevented=0;
 const input={addEventListener:(n,f)=>handlers[n]=f,focus:()=>focused=true,setPointerCapture:id=>captured=id,hasPointerCapture:id=>captured===id,releasePointerCapture:()=>captured=null};
 const scene={getBoundingClientRect:()=>({left:0,top:0,width:nebula.width,height:nebula.height})};
 bindVolumePointer(input,scene,nebula,v=>values.push(v));
 const event=(y,id=7)=>({pointerId:id,isPrimary:true,button:0,pointerType:'touch',clientX:945,clientY:y,preventDefault:()=>prevented++});
 handlers.pointerdown(event(937.5));assert.equal(focused,true);assert.equal(captured,7);assert.equal(values[0],.5);
 handlers.pointermove(event(820,8));assert.equal(values.length,1);
 handlers.pointermove(event(820));assert.equal(values[1],1);
 handlers.pointerup(event(820));assert.equal(captured,null);
 handlers.pointermove(event(1055));assert.equal(values.length,2);assert.equal(prevented,2);
});
