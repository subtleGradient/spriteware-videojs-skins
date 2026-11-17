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
import './style.css';
const themes={nebula,biopod,liquid},theme=themes[new URLSearchParams(location.search).get('skin')]||nebula;
const base=import.meta.env.BASE_URL,asset=p=>base+p;
document.title=theme.name+' · Spriteware';
document.querySelector('h1').textContent=theme.name;
document.querySelector('header p:last-child').textContent=theme.subtitle;
const themeNav=document.createElement('nav');themeNav.setAttribute('aria-label','Player skins');
for(const entry of Object.values(themes)){const link=document.createElement('a');link.href='?skin='+entry.id;link.textContent=entry.name;if(entry.id===theme.id)link.setAttribute('aria-current','page');themeNav.append(link,document.createTextNode(' · '))}
document.querySelector('.notes').append(themeNav);
const mount=document.querySelector('#mount');
mount.innerHTML=`<video-player id="player"><section class="scene" aria-label="${theme.name} video player"><div class="aperture"><media-container><video id="video" playsinline preload="metadata" tabindex="-1" src="${asset('media/aqua-motion.mp4')}" poster="${asset('media/poster.jpg')}"><track kind="captions" srclang="en" label="Visual descriptions" src="${asset('media/captions.vtt')}"></video></media-container><p id="screen-error" role="status"></p></div><img class="frame" width="${theme.width}" height="${theme.height}" alt="" fetchpriority="high" src="${asset(theme.frame)}"><span class="title-readout"></span><span class="time-readout" aria-live="off">00:00 / 00:24</span><div class="chapter-menu" hidden><strong>CHAPTERS</strong><button data-time="0">01 · Chromatic drift</button><button data-time="8">02 · Pearl current</button><button data-time="16">03 · Prismatic tide</button><button id="close-chapters">Close</button></div></section></video-player>`;
const $=s=>document.querySelector(s),scene=$('.scene'),video=$('#video'),player=$('#player');
const currentMediaTitle=()=>mediaTitle({title:video.getAttribute('data-title')||video.getAttribute('title'),currentSrc:video.currentSrc,src:video.getAttribute('src')||video.querySelector('source')?.getAttribute('src'),baseURI:document.baseURI});
$('.title-readout').textContent=currentMediaTitle();
scene.style.aspectRatio=`${theme.width}/${theme.height}`;
function place(el,[x,y,w,h]){Object.assign(el.style,{left:`${x/theme.width*100}%`,top:`${y/theme.height*100}%`,width:`${w/theme.width*100}%`,height:`${h/theme.height*100}%`})}
place($('.aperture'),theme.aperture.box);$('.aperture').style.clipPath=theme.aperture.polygon;
place($('.title-readout'),theme.title);place($('.time-readout'),theme.time);
for(const control of theme.controls){
 const button=document.createElement('button');button.type='button';button.tabIndex=0;button.id=control.id;button.className='control';button.setAttribute('aria-label',control.label);button.title=control.label;if(control.toggle)button.setAttribute('aria-pressed','false');
 const hit=control.hit||control.box;place(button,hit);const cap=document.createElement('span');cap.className='cap';cap.setAttribute('aria-hidden','true');const [x,y,w,h]=control.box,[hx,hy,hw,hh]=hit;Object.assign(cap.style,{left:`${(x-hx)/hw*100}%`,top:`${(y-hy)/hh*100}%`,width:`${w/hw*100}%`,height:`${h/hh*100}%`});
 for(const state of ['normal','hover','pressed','focus','disabled'])cap.style.setProperty(`--${state}`,`url("${asset(theme.assetRoot+(control.asset||control.id)+'-'+state+'.png')}")`);
 button.append(cap);if(control.text){const text=document.createElement('span');text.className='pill-label';text.textContent=control.text;Object.assign(text.style,{left:cap.style.left,top:cap.style.top,width:cap.style.width,height:cap.style.height});button.append(text)}scene.append(button)
}
const mute=document.createElement('button');mute.id='mute';mute.className='mute';mute.type='button';mute.tabIndex=0;mute.setAttribute('aria-label','Mute');mute.title='Mute';place(mute,theme.mute);scene.append(mute);
for(const id of ['seek','volume']){
 const spec=theme[id],input=document.createElement('input');input.id=id;input.type='range';input.tabIndex=0;input.min=0;input.max=id==='seek'?24:1;input.step=id==='seek'?.01:.01;input.value=id==='seek'?0:.65;input.setAttribute('aria-label',id==='seek'?'Video position':'Volume');input.className=`range ${id}`;place(input,spec.hit);scene.append(input);
 const thumb=document.createElement('img');thumb.id=id+'-jewel';thumb.className='jewel';thumb.alt='';thumb.draggable=false;scene.append(thumb);
 const state=()=>input.disabled?'disabled':input.dataset.pressed?'pressed':input.matches(':focus-visible')?'focus':input.matches(':hover')?'hover':'normal';
 const draw=()=>{const value=+input.value/(+input.max||1),x=spec.from[0]+(spec.to[0]-spec.from[0])*value,y=spec.from[1]+(spec.to[1]-spec.from[1])*value;place(thumb,[x-spec.thumb/2,y-spec.thumb/2,spec.thumb,spec.thumb]);thumb.src=asset(theme.assetRoot+id+'-'+state()+'.png')};
 input.draw=draw;for(const event of ['focus','blur','pointerenter','pointerleave','input'])input.addEventListener(event,draw);input.addEventListener('pointerdown',()=>{input.dataset.pressed='true';draw()});window.addEventListener('pointerup',()=>{delete input.dataset.pressed;draw()});window.addEventListener('pointercancel',()=>{delete input.dataset.pressed;draw()});draw()
}
// DOM traversal follows the physical reading order; geometry remains unchanged.
for(const id of ['seek','previous','play','pause','stop','next','mute','volume','chapters','captions','fullscreen'])scene.append($('#'+id));
scene.append($('.chapter-menu'));
$('.chapter-menu').setAttribute('role','dialog');$('.chapter-menu').setAttribute('aria-label','Video chapters');
$('.chapter-menu').querySelectorAll('button').forEach(b=>b.tabIndex=0);
await customElements.whenDefined('video-player');let volumeWritable=supportsMediaVolume(video);if(volumeWritable)video.volume=.65;
const fmt=t=>`${String(Math.floor((t||0)/60)).padStart(2,'0')}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
let seeking=false,buffering=false;
function sync(){
 $('.time-readout').textContent=`${fmt(video.currentTime)} / ${fmt(Number.isFinite(video.duration)?video.duration:24)}`;
 const ready=Number.isFinite(video.duration);$('#seek').disabled=!ready;$('#seek').max=ready?video.duration:24;if(!seeking)$('#seek').value=video.currentTime;$('#seek').setAttribute('aria-valuetext',`${fmt(video.currentTime)} of ${fmt(video.duration)}`);$('#seek').draw();
 $('#volume').value=video.muted?0:video.volume;$('#volume').setAttribute('aria-valuetext',volumeWritable?`${Math.round((video.muted?0:video.volume)*100)} percent`:'Use device volume buttons');$('#volume').setAttribute('aria-disabled',String(!volumeWritable));$('#volume').draw();
 $('#mute').setAttribute('aria-label',video.muted?'Unmute':'Mute');$('#mute').setAttribute('aria-pressed',String(video.muted));
 $('#play').dataset.latched=String(!video.paused);$('#pause').dataset.latched=String(video.paused&&video.currentTime>0);
 const cc=[...video.textTracks].some(t=>t.kind==='captions'&&t.mode==='showing');$('#captions').setAttribute('aria-pressed',String(cc));
 $('.chapter-menu').querySelectorAll('[data-time]').forEach(b=>b.setAttribute('aria-current',String(Math.floor(video.currentTime/8)*8===+b.dataset.time)));
 $('#previous').disabled=video.currentTime<.2;$('#next').disabled=video.currentTime>=16;
 $('.title-readout').textContent=video.error?'TRANSMISSION ERROR':buffering&&!video.paused?'BUFFERING…':currentMediaTitle();
}
$('#play').onclick=()=>{const attempt=video.play();attempt?.catch(()=>{$('#screen-error').textContent='Playback was blocked. Tap Play to try again.'});sync()};
$('#pause').onclick=()=>{video.pause();sync()};
const seek=t=>{if(!Number.isFinite(video.duration))return;video.currentTime=Math.max(0,Math.min(video.duration,t));sync()};
$('#stop').onclick=()=>{video.pause();seek(0)};
$('#previous').onclick=()=>seek(video.currentTime%8>2?Math.floor(video.currentTime/8)*8:Math.max(0,Math.floor(video.currentTime/8)-1)*8);
$('#next').onclick=()=>seek(Math.min(16,(Math.floor(video.currentTime/8)+1)*8));
$('#mute').onclick=()=>{video.muted=!video.muted;sync()};
function changeVolume(value){
 if(!volumeWritable||!applyMediaVolume(video,value)){volumeWritable=false;$('#notice').textContent='This device controls sound level with its volume buttons. The speaker button still mutes and unmutes.'}
 sync();
}
$('#volume').oninput=e=>changeVolume(+e.target.value);
bindVolumePointer($('#volume'),scene,theme,changeVolume);
$('#volume').onkeydown=e=>{let value;const current=video.muted?0:video.volume;if(['ArrowUp','ArrowRight'].includes(e.key))value=current+.05;else if(['ArrowDown','ArrowLeft'].includes(e.key))value=current-.05;else if(e.key==='Home')value=0;else if(e.key==='End')value=1;else return;e.preventDefault();changeVolume(value)};
const endScrub=bindSeekPointer($('#seek'),scene,theme,{duration:()=>video.duration,seek,dragging:active=>{seeking=active;sync()}});
window.addEventListener('blur',endScrub);
$('#seek').oninput=e=>seek(+e.target.value);
$('#seek').onkeydown=e=>{let t;const delta={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5,PageUp:10,PageDown:-10};if(e.key in delta)t=video.currentTime+delta[e.key];else if(e.key==='Home')t=0;else if(e.key==='End')t=video.duration;else return;e.preventDefault();seek(t)};
$('#captions').onclick=()=>{const track=[...video.textTracks].find(t=>t.kind==='captions');if(track)track.mode=track.mode==='showing'?'hidden':'showing';sync()};video.textTracks.addEventListener('change',sync);
function closeMenu(restore=true){$('.chapter-menu').hidden=true;$('#chapters').setAttribute('aria-expanded','false');if(restore)$('#chapters').focus({preventScroll:true})}
$('#chapters').setAttribute('aria-expanded','false');$('#chapters').onclick=()=>{const open=$('.chapter-menu').hidden;$('.chapter-menu').hidden=!open;$('#chapters').setAttribute('aria-expanded',String(open));if(open)$('.chapter-menu button').focus()};
$('.chapter-menu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.time)seek(+b.dataset.time);closeMenu()};
// Native button Enter/Space behavior is preserved; arrows navigate the chapter popup.
$('.chapter-menu').addEventListener('keydown',e=>{const buttons=[...$('.chapter-menu').querySelectorAll('button')],i=buttons.indexOf(document.activeElement);const exit=chapterTabExit(e.key,e.shiftKey,i,buttons.length);if(exit){e.preventDefault();closeMenu(false);const opener=$('#chapters');let target=opener;if(exit==='after-opener'){const focusable=[...document.querySelectorAll('button,input,a[href],summary,[tabindex]')].filter(el=>el.tabIndex>=0&&!el.disabled&&!el.closest('[hidden],[inert]')&&el.getClientRects().length);target=focusable[focusable.indexOf(opener)+1]||opener}target.focus({preventScroll:true});return}const chapters=buttons.filter(b=>b.hasAttribute('data-time')),next=chapterArrowIndex(e.key,chapters.indexOf(document.activeElement),chapters.length);if(next===null)return;e.preventDefault();chapters[next].focus()});
$('.chapter-menu').addEventListener('focusout',()=>queueMicrotask(()=>{if(!$('.chapter-menu').hidden&&!$('.chapter-menu').contains(document.activeElement))closeMenu(false)}));
const videoClose=document.createElement('button');videoClose.type='button';videoClose.className='video-close';videoClose.textContent='Close video';videoClose.hidden=true;scene.append(videoClose);
const videoFullscreenStatus=document.createElement('p');videoFullscreenStatus.className='video-fullscreen-status';videoFullscreenStatus.hidden=true;videoFullscreenStatus.setAttribute('role','status');scene.append(videoFullscreenStatus);
const videoFullscreen=createVideoFullscreen({video,button:$('#fullscreen'),onMessage:message=>{$('#notice').textContent=message;videoFullscreenStatus.textContent=message;},onExpanded:expanded=>{document.body.classList.toggle('video-expanded',expanded);videoClose.hidden=!expanded;videoFullscreenStatus.hidden=!expanded;document.querySelector('header').inert=expanded;document.querySelector('.notes').inert=expanded;if(expanded)videoClose.focus({preventScroll:true});}});
$('#fullscreen').onclick=videoFullscreen.toggle;videoClose.onclick=videoFullscreen.exit;
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(!$('.chapter-menu').hidden){e.preventDefault();closeMenu()}else if(videoFullscreen.active){e.preventDefault();videoFullscreen.exit()}}
 if((e.key===' '||e.key==='Enter')&&e.target.matches('button')){if(e.repeat){e.preventDefault();return}if(e.target.matches('.control'))e.target.dataset.held='true'}
 if(!scene.contains(e.target)||e.target.matches('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey||!$('.chapter-menu').hidden)return;
 if(e.key.toLowerCase()==='k'){e.preventDefault();video.paused?$('#play').click():$('#pause').click()}
 if(e.key.toLowerCase()==='m'){e.preventDefault();$('#mute').click()}
 if(e.key.toLowerCase()==='f'){e.preventDefault();$('#fullscreen').click()}
});
const release=()=>document.querySelectorAll('[data-held]').forEach(b=>delete b.dataset.held);document.addEventListener('keyup',release);window.addEventListener('blur',release);document.addEventListener('focusout',release);
for(const event of ['loadstart','emptied','play','pause','timeupdate','loadedmetadata','durationchange','volumechange','ended','seeked'])video.addEventListener(event,sync);
video.addEventListener('waiting',()=>{buffering=true;sync()});for(const event of ['playing','canplay'])video.addEventListener(event,()=>{buffering=false;$('#screen-error').textContent='';sync()});video.addEventListener('error',()=>{$('#screen-error').textContent='Transmission interrupted. Reload to reconnect.';sync()});
sync();window.spriteware={theme,video,player,sync,seek};
