/** Video-only fullscreen with confirmed state and a viewport fallback for restricted browsers. */
export function createVideoFullscreen({video,button,doc=document,win=window,onExpanded=()=>{},onMessage=()=>{},schedule=setTimeout,cancel=clearTimeout}){
 let mode='inline',timer=null,previous=null;
 const nativeActive=()=>doc.fullscreenElement===video||video.webkitDisplayingFullscreen===true||video.webkitPresentationMode==='fullscreen';
 const clear=()=>{if(timer!==null)cancel(timer);timer=null};
 function prepare(){if(previous)return;previous={controls:video.controls,tabindex:video.getAttribute('tabindex'),scroll:[win.scrollX,win.scrollY]};video.controls=true;video.tabIndex=0;}
 function restore(){clear();mode='inline';onExpanded(false);onMessage('');if(previous){video.controls=previous.controls;if(previous.tabindex===null)video.removeAttribute('tabindex');else video.setAttribute('tabindex',previous.tabindex);const scroll=previous.scroll;previous=null;button.setAttribute('aria-label','Enter fullscreen');button.focus({preventScroll:true});win.scrollTo(...scroll);}}
 function confirm(){if(!nativeActive())return;clear();mode='native';onExpanded(false);button.setAttribute('aria-label','Exit fullscreen');onMessage('');}
 function expand(message='Browser fullscreen is unavailable here. Video is expanded; use Close or Escape to return.'){if(nativeActive()){confirm();return}clear();prepare();mode='expanded';onExpanded(true);button.setAttribute('aria-label','Exit expanded video');onMessage(message);}
 function failure(){if(mode==='pending')expand();}
 function enter(){
  if(video.readyState<1){expand('Video is loading in expanded view. Use Close to return.');return;}
  prepare();mode='pending';onMessage('');
  // A returned void is not proof that native fullscreen actually opened.
  timer=schedule(()=>{if(mode==='pending')expand();},1000);
  try{
   // Safari's dedicated media presenter preserves video-only system controls.
   // Prefer it when advertised, including iPad where both APIs can exist.
   if(typeof video.webkitEnterFullscreen==='function'&&video.webkitSupportsFullscreen!==false){
    video.webkitEnterFullscreen();confirm();
   }else if(doc.fullscreenEnabled!==false&&typeof video.requestFullscreen==='function'){
    const attempt=video.requestFullscreen();attempt?.then(confirm,failure);
   }else if(typeof video.webkitSetPresentationMode==='function'&&video.webkitSupportsPresentationMode?.('fullscreen')){
    video.webkitSetPresentationMode('fullscreen');confirm();
   }else expand();
  }catch{failure();}
 }
 function exit(){
  if(mode==='expanded'||mode==='pending'){restore();return;}
  try{
   if(doc.fullscreenElement===video){const attempt=doc.exitFullscreen();attempt?.catch(()=>onMessage('Use the video player’s native exit control.'));}
   else if(video.webkitDisplayingFullscreen&&typeof video.webkitExitFullscreen==='function')video.webkitExitFullscreen();
   else if(video.webkitPresentationMode==='fullscreen'&&typeof video.webkitSetPresentationMode==='function')video.webkitSetPresentationMode('inline');
   else restore();
  }catch{onMessage('Use the video player’s native exit control.');}
 }
 function toggle(){if(mode==='pending')return;if(mode==='inline')enter();else exit();}
 function changed(){if(nativeActive())confirm();else if(mode==='native')restore();}
 doc.addEventListener('fullscreenchange',changed);video.addEventListener('webkitbeginfullscreen',confirm);video.addEventListener('webkitendfullscreen',()=>{if(mode==='native')restore()});video.addEventListener('webkitpresentationmodechanged',changed);
 return {toggle,exit,get active(){return mode!=='inline'},get mode(){return mode}};
}
