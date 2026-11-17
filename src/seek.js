// The hit target may be wider than the artwork; seek along the actual rail.
export function seekFraction(clientX,clientY,rect,theme){
 const [ax,ay]=theme.seek.from,[bx,by]=theme.seek.to;
 const x=(clientX-rect.left)*theme.width/rect.width,y=(clientY-rect.top)*theme.height/rect.height;
 const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
 const v=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;
 return v<1e-9?0:v>1-1e-9?1:v;
}
export function bindSeekPointer(input,scene,theme,{duration,seek,dragging}){
 let pointer=null;
 const update=e=>{
  const d=duration();if(!Number.isFinite(d)||d<=0)return;
  const time=seekFraction(e.clientX,e.clientY,scene.getBoundingClientRect(),theme)*d;
  input.value=String(time);seek(time);
 };
 const finish=()=>{
  if(pointer===null)return;
  const id=pointer;pointer=null;
  if(input.hasPointerCapture(id))input.releasePointerCapture(id);
  delete input.dataset.pressed;dragging(false);
 };
 input.addEventListener('pointerdown',e=>{
  if(input.disabled||e.isPrimary===false||e.button!==0||!Number.isFinite(duration())||duration()<=0)return;
  e.preventDefault();input.focus({preventScroll:true});pointer=e.pointerId;
  input.setPointerCapture(pointer);input.dataset.pressed='true';dragging(true);update(e);
 });
 input.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();update(e)});
 input.addEventListener('pointerup',e=>{if(e.pointerId!==pointer)return;update(e);finish()});
 input.addEventListener('pointercancel',e=>{if(e.pointerId===pointer)finish()});
 input.addEventListener('lostpointercapture',finish);input.addEventListener('blur',finish);
 input.addEventListener('click',e=>e.stopPropagation());
 return finish;
}
