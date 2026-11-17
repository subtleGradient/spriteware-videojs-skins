/** Video-only fullscreen with confirmed state and a viewport fallback for restricted browsers. */
export function createVideoFullscreen({video,button,doc=document,win=window,onExpanded=()=>{},onMessage=()=>{},schedule=setTimeout,cancel=clearTimeout}){
 let mode='inline',timer=null,previous=null,generation=0,cancelledNative=false;
 const nativeActive=()=>doc.fullscreenElement===video||video.webkitDisplayingFullscreen===true||video.webkitPresentationMode==='fullscreen';
 const clear=()=>{if(timer!==null)cancel(timer);timer=null};
 function prepare(){if(previous)return;previous={controls:video.controls,tabindex:video.getAttribute('tabindex'),scroll:[win.scrollX,win.scrollY]};video.controls=true;video.tabIndex=0;}
 function restore(){clear();mode='inline';onExpanded(false);onMessage('');button.setAttribute('aria-label','Enter fullscreen');if(previous){video.controls=previous.controls;if(previous.tabindex===null)video.removeAttribute('tabindex');else video.setAttribute('tabindex',previous.tabindex);const scroll=previous.scroll;previous=null;button.focus({preventScroll:true});win.scrollTo(...scroll);}}
 function confirm(){if(!nativeActive())return;clear();prepare();mode='native';onExpanded(false);button.setAttribute('aria-label','Exit fullscreen');onMessage('');if(cancelledNative)requestExit();}
 function expand(message='Browser fullscreen is unavailable here. Video is expanded; use Close or Escape to return.'){if(nativeActive()){confirm();return}clear();prepare();mode='expanded';onExpanded(true);button.setAttribute('aria-label','Exit expanded video');onMessage(message);}
 function failure(){if(mode==='pending')expand();}
 function enter(){
  const request=++generation;cancelledNative=false;
  if(video.readyState<1){expand('Video is loading in expanded view. Use Close to return.');return;}
  prepare();mode='pending';onMessage('');
  // A returned void is not proof that native fullscreen actually opened.
  timer=schedule(()=>{if(request===generation&&mode==='pending')expand();},1000);
  try{
   // Safari's dedicated media presenter preserves video-only system controls.
   // Prefer it when advertised, including iPad where both APIs can exist.
   if(typeof video.webkitEnterFullscreen==='function'&&video.webkitSupportsFullscreen!==false){
    video.webkitEnterFullscreen();confirm();
   }else if(doc.fullscreenEnabled!==false&&typeof video.requestFullscreen==='function'){
    const attempt=video.requestFullscreen();attempt?.then(()=>{if(request===generation)confirm()},()=>{if(request===generation)failure()});
   }else if(typeof video.webkitSetPresentationMode==='function'&&video.webkitSupportsPresentationMode?.('fullscreen')){
    video.webkitSetPresentationMode('fullscreen');confirm();
   }else expand();
  }catch{failure();}
 }
 function requestExit(){
  try{
   if(doc.fullscreenElement===video){const attempt=doc.exitFullscreen();attempt?.catch(()=>onMessage('Use the video player’s native exit control.'));}
   else if(video.webkitDisplayingFullscreen&&typeof video.webkitExitFullscreen==='function')video.webkitExitFullscreen();
   else if(video.webkitPresentationMode==='fullscreen'&&typeof video.webkitSetPresentationMode==='function')video.webkitSetPresentationMode('inline');
   else if(nativeActive())onMessage('Use the video player’s native exit control.');
   else restore();
  }catch{onMessage('Use the video player’s native exit control.');}
 }
 function exit(){
  ++generation;cancelledNative=true;
  if(nativeActive()){clear();prepare();mode='native';requestExit();return;}
  restore();
 }
 function toggle(){if(mode==='pending')return;if(mode==='inline')enter();else exit();}
 function changed(){if(nativeActive())confirm();else if(mode==='native')restore();}
 doc.addEventListener('fullscreenchange',changed);video.addEventListener('webkitbeginfullscreen',confirm);video.addEventListener('webkitendfullscreen',()=>{if(mode==='native')restore()});video.addEventListener('webkitpresentationmodechanged',changed);
 return {toggle,exit,get active(){return mode!=='inline'},get mode(){return mode}};
}
