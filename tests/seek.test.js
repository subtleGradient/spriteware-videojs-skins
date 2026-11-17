import test from 'node:test';
import assert from 'node:assert/strict';
import {seekFraction,bindSeekPointer} from '../src/seek.js';
import nebula from '../src/themes/nebula.js';
import liquid from '../src/themes/liquid.js';
import biopod from '../src/themes/biopod.js';
for(const theme of [nebula,liquid,biopod])test(`${theme.id}: seek taps map to registered rail at all display sizes`,()=>{
 for(const width of [320,390,620]){
  const rect={left:23,top:57,width,height:width*theme.height/theme.width};
  const [a,b]=[theme.seek.from,theme.seek.to];
  for(const v of [0,.25,.5,.75,1]){const x=rect.left+(a[0]+(b[0]-a[0])*v)*width/theme.width,y=rect.top+(a[1]+(b[1]-a[1])*v)*rect.height/theme.height;assert.ok(Math.abs(seekFraction(x,y,rect,theme)-v)<1e-9)}
 }
});
function fixture(d=24){
 const handlers={},events=[],input={disabled:false,value:'0',dataset:{},addEventListener:(n,f)=>handlers[n]=f,focus:()=>{},setPointerCapture:id=>input.capture=id,hasPointerCapture:id=>input.capture===id,releasePointerCapture:()=>input.capture=null};
 const scene={getBoundingClientRect:()=>({left:0,top:0,width:nebula.width,height:nebula.height})};
 bindSeekPointer(input,scene,nebula,{duration:()=>d,seek:t=>events.push(['seek',t]),dragging:v=>events.push(['dragging',v])});
 const e=(fraction,id=2)=>({clientX:nebula.seek.from[0]+(nebula.seek.to[0]-nebula.seek.from[0])*fraction,clientY:nebula.seek.from[1],pointerId:id,pointerType:'touch',button:0,isPrimary:true,preventDefault(){}});
 return {handlers,events,input,e};
}
test('tap then continuous drag updates playhead and release commits final point',()=>{
 const {handlers:h,events,input,e}=fixture();h.pointerdown(e(.25));assert.deepEqual(events,[['dragging',true],['seek',6]]);h.pointermove(e(.5));assert.equal(input.value,'12');h.pointermove(e(.8,9));assert.equal(input.value,'12');h.pointerup(e(.75));assert.deepEqual(events.slice(-2),[['seek',18],['dragging',false]]);assert.equal(input.capture,null);h.pointermove(e(1));assert.equal(input.value,'18');
});
test('drag outside rail clamps to endpoints and cancel releases state without seeking elsewhere',()=>{
 const {handlers:h,events,input,e}=fixture();h.pointerdown(e(-2));assert.equal(input.value,'0');h.pointermove(e(2));assert.equal(input.value,'24');h.pointercancel(e(.5));assert.deepEqual(events.at(-1),['dragging',false]);assert.equal(input.capture,null);
});
test('lost capture and blur clear drag state once',()=>{
 for(const name of ['lostpointercapture','blur']){const {handlers:h,events,input,e}=fixture();h.pointerdown(e(.5));h[name]();h[name]();assert.equal(events.filter(([n,v])=>n==='dragging'&&!v).length,1);assert.equal(input.dataset.pressed,undefined)}
});
test('disabled or unknown-duration media ignores touch scrubbing',()=>{
 for(const d of [0,NaN,Infinity]){const {handlers:h,events,e}=fixture(d);h.pointerdown(e(.5));assert.deepEqual(events,[])}
 const {handlers:h,events,input,e}=fixture();input.disabled=true;h.pointerdown(e(.5));assert.deepEqual(events,[]);
});
