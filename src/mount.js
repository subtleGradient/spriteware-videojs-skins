import {mediaChapters,currentChapter,chapterDestination,repeatedToggle} from './chapters.js';
import {prepareArtwork} from './artwork.js';
import {mediaTitle} from './media-title.js';
import {bindSeekPointer} from './seek.js';
import {supportsMediaVolume,applyMediaVolume,bindVolumePointer} from './volume.js';
import {createVideoFullscreen} from './fullscreen.js';
import {chapterTabExit,chapterArrowIndex} from './keyboard.js';
import '@videojs/html/video/player';
import '@videojs/html/ui/container';
import nebula from './themes/nebula.js';
import biopod from './themes/biopod.js';
import liquid from './themes/liquid.js';
import './skin.css';
import {bundledAssets} from './assets.js';
export const spritewareThemes={nebula,biopod,liquid};
/** Mount one player without changing existing host content or page presentation. */
export function mountSpriteware(host,options={}){
 if(!host||host.nodeType!==1||!host.ownerDocument)throw new TypeError('host must be an Element');
 if(typeof options.src!=='string'||!options.src.trim())throw new TypeError('src is required');
 const theme=Object.hasOwn(spritewareThemes,options.theme||'nebula')?spritewareThemes[options.theme||'nebula']:null;
 if(!theme)throw new TypeError('Unknown Spriteware theme');
 const document=host.ownerDocument,window=document.defaultView;
 const root=document.createElement('div');root.className='spriteware';
 const controller=new window.AbortController(),signal=controller.signal;let disposed=false;
 const listen=(target,type,fn)=>target.addEventListener(type,fn,{signal});
 const asset=path=>options.assetBase?new URL(path,new URL(options.assetBase,document.baseURI)).href:bundledAssets[path];
 const authoredChapters=(Array.isArray(options.chapters)?options.chapters:[]).map(c=>({time:Number(c.time??c.startTime),label:String(c.label??c.title??'Chapter')})).filter(c=>Number.isFinite(c.time)&&c.time>=0).sort((a,b)=>a.time-b.time);
 const resolveChapters=duration=>options.chapters==='auto'?mediaChapters(video.currentSrc||video.src,duration):authoredChapters.filter(c=>!Number.isFinite(duration)||c.time<duration);
root.innerHTML=`<video-player data-sw="player"><section class="scene" data-artwork="loading" aria-label="${theme.name} video player"><div class="aperture"><media-container><video data-sw="video" playsinline preload="metadata" tabindex="-1"></video></media-container><p data-sw="screen-error" role="status"></p></div><img class="frame" width="${theme.width}" height="${theme.height}" alt="" fetchpriority="high" ><span class="title-readout"></span><span class="time-readout" aria-live="off">00:00 / 00:00</span><div class="chapter-menu" hidden><strong>CHAPTERS</strong><button data-sw="close-chapters">Close</button></div></section></video-player>`;
const $=s=>root.querySelector(s.replace(/#([\w-]+)/g,'[data-sw="$1"]')),scene=$('.scene'),video=$('#video'),player=$('#player');

 if(options.crossOrigin)video.crossOrigin=options.crossOrigin;
 video.src=options.src;
 if(options.poster)video.poster=options.poster;
 if(options.title)video.setAttribute('data-title',String(options.title));
 $('.frame').src=asset(theme.frame);
 for(const caption of options.captions||[]){const track=document.createElement('track');track.kind='captions';track.src=caption.src;track.srclang=caption.language||'en';track.label=caption.label||track.srclang;video.append(track)}
 const notice=document.createElement('p');notice.className='spriteware-notice';notice.dataset.sw='notice';notice.setAttribute('role','status');root.append(notice);
 host.append(root);
const currentMediaTitle=()=>mediaTitle({title:video.getAttribute('data-title')||video.getAttribute('title'),currentSrc:video.currentSrc,src:video.getAttribute('src')||video.querySelector('source')?.getAttribute('src'),baseURI:document.baseURI});
$('.title-readout').textContent=currentMediaTitle();
const ready=prepareArtwork({frame:$('.frame'),scene,video,signal,onError:message=>{$('#notice').textContent=message}});
scene.dataset.theme=theme.id;
scene.style.aspectRatio=`${theme.width}/${theme.height}`;
function place(el,[x,y,w,h]){Object.assign(el.style,{left:`${x/theme.width*100}%`,top:`${y/theme.height*100}%`,width:`${w/theme.width*100}%`,height:`${h/theme.height*100}%`})}
place($('.aperture'),theme.aperture.box);$('.aperture').style.clipPath=theme.aperture.polygon;
place($('.title-readout'),theme.title);place($('.time-readout'),theme.time);
for(const control of theme.controls){
 const button=document.createElement('button');button.type='button';button.tabIndex=0;button.dataset.sw=control.id;button.className='control';button.setAttribute('aria-label',control.label);button.title=control.label;if(control.toggle)button.setAttribute('aria-pressed','false');
 const hit=control.hit||control.box;place(button,hit);const cap=document.createElement('span');cap.className='cap';cap.setAttribute('aria-hidden','true');const [x,y,w,h]=control.box,[hx,hy,hw,hh]=hit;Object.assign(cap.style,{left:`${(x-hx)/hw*100}%`,top:`${(y-hy)/hh*100}%`,width:`${w/hw*100}%`,height:`${h/hh*100}%`});
 for(const state of ['normal','hover','pressed','focus','disabled'])cap.style.setProperty(`--${state}`,`url("${asset(theme.assetRoot+(control.asset||control.id)+'-'+state+'.png')}")`);
 button.append(cap);if(control.text){const text=document.createElement('span');text.className='pill-label';text.textContent=control.text;Object.assign(text.style,{left:cap.style.left,top:cap.style.top,width:cap.style.width,height:cap.style.height});button.append(text)}scene.append(button)
}
const mute=document.createElement('button');mute.dataset.sw='mute';mute.className='mute';mute.type='button';mute.tabIndex=0;mute.setAttribute('aria-label','Mute');mute.title='Mute';place(mute,theme.mute);scene.append(mute);
for(const id of ['seek','volume']){
 const spec=theme[id],input=document.createElement('input');input.dataset.sw=id;input.type='range';input.tabIndex=0;input.min=0;input.max=id==='seek'?24:1;input.step=id==='seek'?.01:.01;input.value=id==='seek'?0:.65;input.setAttribute('aria-label',id==='seek'?'Video position':'Volume');input.className=`range ${id}`;place(input,spec.hit);scene.append(input);
 const thumb=document.createElement('img');thumb.dataset.sw=id+'-jewel';thumb.className='jewel';thumb.alt='';thumb.draggable=false;scene.append(thumb);
 const state=()=>input.disabled?'disabled':input.dataset.pressed?'pressed':input.matches(':focus-visible')?'focus':input.matches(':hover')?'hover':'normal';
 const draw=()=>{const value=+input.value/(+input.max||1),x=spec.from[0]+(spec.to[0]-spec.from[0])*value,y=spec.from[1]+(spec.to[1]-spec.from[1])*value;place(thumb,[x-spec.thumb/2,y-spec.thumb/2,spec.thumb,spec.thumb]);thumb.src=asset(theme.assetRoot+id+'-'+state()+'.png')};
 input.draw=draw;for(const event of ['focus','blur','pointerenter','pointerleave','input'])listen(input,event,draw);listen(input,'pointerdown',()=>{input.dataset.pressed='true';draw()});listen(window,'pointerup',()=>{delete input.dataset.pressed;draw()});listen(window,'pointercancel',()=>{delete input.dataset.pressed;draw()});draw()
}
// DOM traversal follows the physical reading order; geometry remains unchanged.
for(const id of ['seek','previous','play','pause','stop','next','mute','volume','chapters','captions','fullscreen'])scene.append($('#'+id));
scene.append($('.chapter-menu'));
$('.chapter-menu').setAttribute('role','dialog');$('.chapter-menu').setAttribute('aria-label','Video chapters');
$('.chapter-menu').querySelectorAll('button').forEach(b=>b.tabIndex=0);
let volumeWritable=supportsMediaVolume(video);if(volumeWritable)video.volume=.65;
const fmt=t=>`${String(Math.floor((t||0)/60)).padStart(2,'0')}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
let seeking=false,buffering=false,chapters=[],chapterSignature='';
function sync(){
 if(disposed)return;
 const nextChapters=resolveChapters(video.duration),signature=JSON.stringify(nextChapters);
 if(signature!==chapterSignature){
  const menu=$('.chapter-menu'),focused=menu.contains(document.activeElement);chapters=nextChapters;chapterSignature=signature;
  menu.querySelectorAll('[data-time]').forEach(b=>b.remove());
  for(const chapter of chapters){const b=document.createElement('button');b.type='button';b.dataset.time=String(chapter.time);b.textContent=chapter.label;menu.insertBefore(b,$('#close-chapters'))}
  if(focused)closeMenu();
 }
 $('#chapters').disabled=!chapters.length;

 $('.time-readout').textContent=`${fmt(video.currentTime)} / ${fmt(Number.isFinite(video.duration)?video.duration:0)}`;
 const ready=Number.isFinite(video.duration)&&video.duration>0;$('#seek').disabled=!ready;$('#seek').max=ready?video.duration:24;if(!seeking)$('#seek').value=video.currentTime;$('#seek').setAttribute('aria-valuetext',`${fmt(video.currentTime)} of ${fmt(video.duration)}`);$('#seek').draw();
 $('#volume').value=video.muted?0:video.volume;$('#volume').setAttribute('aria-valuetext',volumeWritable?`${Math.round((video.muted?0:video.volume)*100)} percent`:'Use device volume buttons');$('#volume').setAttribute('aria-disabled',String(!volumeWritable));$('#volume').draw();
 $('#mute').setAttribute('aria-label',video.muted?'Unmute':'Mute');$('#mute').setAttribute('aria-pressed',String(video.muted));
 $('#play').dataset.latched=String(!video.paused);$('#pause').dataset.latched=String(video.paused&&video.currentTime>0);
 const cc=[...video.textTracks].some(t=>t.kind==='captions'&&t.mode==='showing');$('#captions').setAttribute('aria-pressed',String(cc));$('#captions').disabled=![...video.textTracks].some(t=>t.kind==='captions');
 $('.chapter-menu').querySelectorAll('[data-time]').forEach((b,i)=>b.setAttribute('aria-current',String(currentChapter(chapters,video.currentTime)===i)));
 $('#previous').disabled=!chapters.length||video.currentTime<.2;$('#next').disabled=!chapters.length||currentChapter(chapters,video.currentTime)===chapters.length-1;
 $('.title-readout').textContent=video.error?'TRANSMISSION ERROR':buffering&&!video.paused?'BUFFERING…':currentMediaTitle();
}
$('#play').onclick=()=>{const attempt=video.play();attempt?.catch(()=>{$('#screen-error').textContent='Playback was blocked. Tap Play to try again.'});sync()};
$('#pause').onclick=()=>{video.pause();sync()};
const seek=t=>{if(disposed||!Number.isFinite(t)||!Number.isFinite(video.duration))return;video.currentTime=Math.max(0,Math.min(video.duration,t));sync()};
$('#stop').onclick=()=>{video.pause();seek(0)};
for(const [id,direction] of [['previous',-1],['next',1]])$('#'+id).onclick=()=>{const target=chapterDestination(chapters,video.currentTime,direction);if(target!==null)seek(target)};
$('#mute').onclick=()=>{const silent=video.muted||video.volume===0;if(silent&&video.volume===0&&volumeWritable)video.volume=.65;video.muted=!silent;sync()};
function changeVolume(value){
 if(!volumeWritable||!applyMediaVolume(video,value)){volumeWritable=false;$('#notice').textContent='This device controls sound level with its volume buttons. The speaker button still mutes and unmutes.'}
 sync();
}
$('#volume').oninput=e=>changeVolume(+e.target.value);
const disposeVolume=bindVolumePointer($('#volume'),scene,theme,changeVolume);
$('#volume').onkeydown=e=>{let value;const current=video.muted?0:video.volume;if(['ArrowUp','ArrowRight'].includes(e.key))value=current+.05;else if(['ArrowDown','ArrowLeft'].includes(e.key))value=current-.05;else if(e.key==='Home')value=0;else if(e.key==='End')value=1;else return;e.preventDefault();changeVolume(value)};
const endScrub=bindSeekPointer($('#seek'),scene,theme,{duration:()=>video.duration,seek,dragging:active=>{seeking=active;sync()}});
listen(window,'blur',endScrub);
$('#seek').oninput=e=>seek(+e.target.value);
$('#seek').onkeydown=e=>{let t;const delta={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5,PageUp:10,PageDown:-10};if(e.key in delta)t=video.currentTime+delta[e.key];else if(e.key==='Home')t=0;else if(e.key==='End')t=video.duration;else return;e.preventDefault();seek(t)};
$('#captions').onclick=()=>{const track=[...video.textTracks].find(t=>t.kind==='captions');if(track)track.mode=track.mode==='showing'?'hidden':'showing';sync()};listen(video.textTracks,'change',sync);
function closeMenu(restore=true){$('.chapter-menu').hidden=true;$('#chapters').setAttribute('aria-expanded','false');if(restore)$('#chapters').focus({preventScroll:true})}
$('#chapters').setAttribute('aria-expanded','false');$('#chapters').onclick=()=>{const open=$('.chapter-menu').hidden;$('.chapter-menu').hidden=!open;$('#chapters').setAttribute('aria-expanded',String(open));if(open)$('.chapter-menu button').focus()};
$('.chapter-menu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.time)seek(+b.dataset.time);closeMenu()};
// Native button Enter/Space behavior is preserved; arrows navigate the chapter popup.
listen($('.chapter-menu'),'keydown',e=>{const buttons=[...$('.chapter-menu').querySelectorAll('button')],i=buttons.indexOf(document.activeElement);const exit=chapterTabExit(e.key,e.shiftKey,i,buttons.length);if(exit){e.preventDefault();closeMenu(false);const opener=$('#chapters');let target=opener;if(exit==='after-opener'){const focusable=[...root.querySelectorAll('button,input,a[href],summary,[tabindex]')].filter(el=>el.tabIndex>=0&&!el.disabled&&!el.closest('[hidden],[inert]')&&el.getClientRects().length);target=focusable[focusable.indexOf(opener)+1]||opener}target.focus({preventScroll:true});return}const chapters=buttons.filter(b=>b.hasAttribute('data-time')),next=chapterArrowIndex(e.key,chapters.indexOf(document.activeElement),chapters.length);if(next===null)return;e.preventDefault();chapters[next].focus()});
listen($('.chapter-menu'),'focusout',()=>queueMicrotask(()=>{if(!$('.chapter-menu').hidden&&!$('.chapter-menu').contains(document.activeElement))closeMenu(false)}));
const videoClose=document.createElement('button');videoClose.type='button';videoClose.className='video-close';videoClose.textContent='Close video';videoClose.hidden=true;scene.append(videoClose);
const videoFullscreenStatus=document.createElement('p');videoFullscreenStatus.className='video-fullscreen-status';videoFullscreenStatus.hidden=true;videoFullscreenStatus.setAttribute('role','status');scene.append(videoFullscreenStatus);
const videoFullscreen=createVideoFullscreen({doc:document,win:window,video,button:$('#fullscreen'),onMessage:message=>{$('#notice').textContent=message;videoFullscreenStatus.textContent=message;},onExpanded:expanded=>{root.classList.toggle('video-expanded',expanded);if(expanded){root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Expanded video')}else{root.removeAttribute('role');root.removeAttribute('aria-modal');root.removeAttribute('aria-label')}videoClose.hidden=!expanded;videoFullscreenStatus.hidden=!expanded;scene.querySelectorAll('.control,.range,.mute,.chapter-menu').forEach(el=>el.inert=expanded);if(expanded)videoClose.focus({preventScroll:true});}});
$('#fullscreen').onclick=videoFullscreen.toggle;videoClose.onclick=videoFullscreen.exit;
listen(root,'keydown',e=>{
 if(e.key==='Tab'&&videoFullscreen.mode==='expanded'){e.preventDefault();(document.activeElement===videoClose?video:videoClose).focus();return}
 if(e.key==='Escape'){if(!$('.chapter-menu').hidden){e.preventDefault();closeMenu()}else if(videoFullscreen.active){e.preventDefault();videoFullscreen.exit()}}
 if((e.key===' '||e.key==='Enter')&&e.target.matches('button')){if(e.repeat){e.preventDefault();return}if(e.target.matches('.control'))e.target.dataset.held='true'}
 if(!scene.contains(e.target)||e.target.matches('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey||!$('.chapter-menu').hidden)return;
 if(repeatedToggle(e.key,e.repeat)){e.preventDefault();return}
 if(e.key.toLowerCase()==='k'){e.preventDefault();video.paused?$('#play').click():$('#pause').click()}
 if(e.key.toLowerCase()==='m'){e.preventDefault();$('#mute').click()}
 if(e.key.toLowerCase()==='f'){e.preventDefault();$('#fullscreen').click()}
});
const release=()=>root.querySelectorAll('[data-held]').forEach(b=>delete b.dataset.held);listen(root,'keyup',release);listen(window,'blur',release);listen(root,'focusout',release);
for(const event of ['loadstart','emptied','play','pause','timeupdate','loadedmetadata','durationchange','volumechange','ended','seeked'])listen(video,event,sync);
listen(video,'waiting',()=>{buffering=true;sync()});for(const event of ['playing','canplay'])listen(video,event,()=>{buffering=false;$('#screen-error').textContent='';sync()});listen(video,'error',()=>{$('#screen-error').textContent='Transmission interrupted. Reload to reconnect.';sync()});
sync();
 function dispose(){
  if(disposed)return;
  disposed=true;controller.abort();endScrub.dispose();disposeVolume();videoFullscreen.dispose();
  for(const el of root.querySelectorAll('*')){el.onclick=null;el.oninput=null;el.onkeydown=null}
  video.pause();video.removeAttribute('src');video.querySelectorAll('track,source').forEach(el=>el.remove());video.load();root.remove();
 }
 return {root,theme,video,player,ready,sync,seek,play:()=>disposed?Promise.reject(new Error('Player disposed')):video.play(),pause:()=>video.pause(),dispose};
}
