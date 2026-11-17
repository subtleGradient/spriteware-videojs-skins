// Keep pointer geometry in the same master coordinates as the illustrated rail.
export function volumeAtPoint(clientX, clientY, rect, theme) {
 const [ax,ay]=theme.volume.from,[bx,by]=theme.volume.to;
 const x=(clientX-rect.left)/rect.width*theme.width;
 const y=(clientY-rect.top)/rect.height*theme.height;
 const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
 const value=length ? Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/length)) : 0;
 return value<1e-9?0:value>1-1e-9?1:value;
}
export function supportsMediaVolume(video) {
 const before=video.volume,probe=before<.5?.75:.25;
 try {video.volume=probe;return Math.abs(video.volume-probe)<.001}
 catch{return false}
 finally{try{video.volume=before}catch{}}
}
export function applyMediaVolume(video,value) {
 const requested=Math.max(0,Math.min(1,value));
 try {video.volume=requested}catch{return false}
 // Never infer mute from a rejected/ignored device volume write.
 if(Math.abs(video.volume-requested)>.001)return false;
 video.muted=requested===0;
 return true;
}
export function bindVolumePointer(input,scene,theme,apply) {
 let pointer=null;
 const update=e=>apply(volumeAtPoint(e.clientX,e.clientY,scene.getBoundingClientRect(),theme));
 input.addEventListener('pointerdown',e=>{
  if(e.isPrimary===false||e.button!==0)return;
  e.preventDefault();input.focus({preventScroll:true});pointer=e.pointerId;
  input.setPointerCapture(pointer);update(e);
 });
 input.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;e.preventDefault();update(e)});
 const finish=e=>{if(e.pointerId!==pointer)return;if(input.hasPointerCapture(pointer))input.releasePointerCapture(pointer);pointer=null};
 input.addEventListener('pointerup',finish);input.addEventListener('pointercancel',finish);
 input.addEventListener('lostpointercapture',()=>pointer=null);
 // A drag ending by the speaker must never become a mute click.
 input.addEventListener('click',e=>e.stopPropagation());
}
