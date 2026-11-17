// The hit target may be wider than the artwork; seek along the actual rail.
export function seekFraction(clientX,clientY,rect,theme){
 const [ax,ay]=theme.seek.from,[bx,by]=theme.seek.to;
 const x=(clientX-rect.left)*theme.width/rect.width,y=(clientY-rect.top)*theme.height/rect.height;
 const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
 const v=length?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)):0;
 return v<1e-9?0:v>1-1e-9?1:v;
}
export function bindSeekPointer(input,scene,theme,{duration,seek,dragging}){
 const listeners=[];
 const on=(type,fn)=>{input.addEventListener(type,fn);listeners.push([type,fn])};
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
 on('pointerdown',e=>{
  if(input.disabled||e.isPrimary===false||e.button!==0||!Number.isFinite(duration())||duration()<=0)return;
  e.preventDefault();input.focus({preventScroll:true});pointer=e.pointerId;
  input.setPointerCapture(pointer);input.dataset.pressed='true';dragging(true);update(e);
 });
 on('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();update(e)});
 on('pointerup',e=>{if(e.pointerId!==pointer)return;update(e);finish()});
 on('pointercancel',e=>{if(e.pointerId===pointer)finish()});
 on('lostpointercapture',finish);on('blur',finish);
 on('click',e=>e.stopPropagation());
 finish.dispose=()=>{finish();for(const [type,fn] of listeners)input.removeEventListener(type,fn)};
 return finish;
}
