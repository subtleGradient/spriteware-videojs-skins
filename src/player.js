import '@videojs/html/video/player';
import '@videojs/html/ui/container';
import nebula from './themes/nebula.js';
import './style.css';
const themes={nebula},theme=themes[new URLSearchParams(location.search).get('skin')]||nebula;
const base=import.meta.env.BASE_URL,asset=p=>base+p;
const mount=document.querySelector('#mount');
mount.innerHTML=`<video-player id="player"><section class="scene" aria-label="${theme.name} video player"><div class="aperture"><media-container><video id="video" playsinline preload="metadata" src="${asset('media/aqua-motion.mp4')}" poster="${asset('media/poster.jpg')}"><track kind="captions" srclang="en" label="Visual descriptions" src="${asset('media/captions.vtt')}"></video></media-container><p id="screen-error" role="status"></p></div><img class="frame" width="${theme.width}" height="${theme.height}" alt="" fetchpriority="high" src="${asset(theme.frame)}"><span class="title-readout">nebula_pop.mpg</span><span class="time-readout" aria-live="off">00:00 / 00:24</span><div class="chapter-menu" hidden><strong>CHAPTERS</strong><button data-time="0">01 · Chromatic drift</button><button data-time="8">02 · Pearl current</button><button data-time="16">03 · Prismatic tide</button><button id="close-chapters">Close</button></div></section></video-player>`;
const $=s=>document.querySelector(s),scene=$('.scene'),video=$('#video'),player=$('#player');
scene.style.aspectRatio=`${theme.width}/${theme.height}`;player.style.setProperty("--scene-fit-width",`${theme.width/theme.height*100}dvh`);
function place(el,[x,y,w,h]){Object.assign(el.style,{left:`${x/theme.width*100}%`,top:`${y/theme.height*100}%`,width:`${w/theme.width*100}%`,height:`${h/theme.height*100}%`})}
place($('.aperture'),theme.aperture.box);$('.aperture').style.clipPath=theme.aperture.polygon;
place($('.title-readout'),theme.title);place($('.time-readout'),theme.time);
for(const control of theme.controls){
 const button=document.createElement('button');button.type='button';button.id=control.id;button.className='control';button.setAttribute('aria-label',control.label);button.title=control.label;if(control.toggle)button.setAttribute('aria-pressed','false');
 const hit=control.hit||control.box;place(button,hit);const cap=document.createElement('span');cap.className='cap';cap.setAttribute('aria-hidden','true');const [x,y,w,h]=control.box,[hx,hy,hw,hh]=hit;Object.assign(cap.style,{left:`${(x-hx)/hw*100}%`,top:`${(y-hy)/hh*100}%`,width:`${w/hw*100}%`,height:`${h/hh*100}%`});
 for(const state of ['normal','hover','pressed','focus','disabled'])cap.style.setProperty(`--${state}`,`url("${asset(theme.assetRoot+(control.asset||control.id)+'-'+state+'.png')}")`);
 button.append(cap);if(control.text){const text=document.createElement('span');text.className='pill-label';text.textContent=control.text;button.append(text)}scene.append(button)
}
const mute=document.createElement('button');mute.id='mute';mute.className='mute';mute.type='button';mute.setAttribute('aria-label','Mute');mute.title='Mute';place(mute,theme.mute);scene.append(mute);
for(const id of ['seek','volume']){
 const spec=theme[id],input=document.createElement('input');input.id=id;input.type='range';input.min=0;input.max=id==='seek'?24:1;input.step=id==='seek'?.01:.01;input.value=id==='seek'?0:.65;input.setAttribute('aria-label',id==='seek'?'Video position':'Volume');input.className=`range ${id}`;place(input,spec.hit);scene.append(input);
 const thumb=document.createElement('img');thumb.id=id+'-jewel';thumb.className='jewel';thumb.alt='';thumb.draggable=false;scene.append(thumb);
 const state=()=>input.disabled?'disabled':input.dataset.pressed?'pressed':input.matches(':focus-visible')?'focus':input.matches(':hover')?'hover':'normal';
 const draw=()=>{const value=+input.value/(+input.max||1),x=spec.from[0]+(spec.to[0]-spec.from[0])*value,y=spec.from[1]+(spec.to[1]-spec.from[1])*value;place(thumb,[x-spec.thumb/2,y-spec.thumb/2,spec.thumb,spec.thumb]);thumb.src=asset(theme.assetRoot+id+'-'+state()+'.png')};
 input.draw=draw;for(const event of ['focus','blur','pointerenter','pointerleave','input'])input.addEventListener(event,draw);input.addEventListener('pointerdown',()=>{input.dataset.pressed='true';draw()});window.addEventListener('pointerup',()=>{delete input.dataset.pressed;draw()});window.addEventListener('pointercancel',()=>{delete input.dataset.pressed;draw()});draw()
}
await customElements.whenDefined('video-player');video.volume=.65;
const fmt=t=>`${String(Math.floor((t||0)/60)).padStart(2,'0')}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
let seeking=false,buffering=false;
function sync(){
 $('.time-readout').textContent=`${fmt(video.currentTime)} / ${fmt(Number.isFinite(video.duration)?video.duration:24)}`;
 const ready=Number.isFinite(video.duration);$('#seek').disabled=!ready;$('#seek').max=ready?video.duration:24;if(!seeking)$('#seek').value=video.currentTime;$('#seek').setAttribute('aria-valuetext',`${fmt(video.currentTime)} of ${fmt(video.duration)}`);$('#seek').draw();
 $('#volume').value=video.muted?0:video.volume;$('#volume').setAttribute('aria-valuetext',`${Math.round((video.muted?0:video.volume)*100)} percent`);$('#volume').draw();
 $('#mute').setAttribute('aria-label',video.muted?'Unmute':'Mute');$('#mute').setAttribute('aria-pressed',String(video.muted));
 $('#play').dataset.latched=String(!video.paused);$('#pause').dataset.latched=String(video.paused&&video.currentTime>0);
 const cc=[...video.textTracks].some(t=>t.kind==='captions'&&t.mode==='showing');$('#captions').setAttribute('aria-pressed',String(cc));
 $('.chapter-menu').querySelectorAll('[data-time]').forEach(b=>b.setAttribute('aria-current',String(Math.floor(video.currentTime/8)*8===+b.dataset.time)));
 $('#previous').disabled=video.currentTime<.2;$('#next').disabled=video.currentTime>=16;
 $('.title-readout').textContent=video.error?'TRANSMISSION ERROR':buffering&&!video.paused?'BUFFERING…':'nebula_pop.mpg';
}
$('#play').onclick=()=>{const attempt=video.play();attempt?.catch(()=>{$('#screen-error').textContent='Playback was blocked. Tap Play to try again.'});sync()};
$('#pause').onclick=()=>{video.pause();sync()};
const seek=t=>{if(!Number.isFinite(video.duration))return;video.currentTime=Math.max(0,Math.min(video.duration,t));sync()};
$('#stop').onclick=()=>{video.pause();seek(0)};
$('#previous').onclick=()=>seek(video.currentTime%8>2?Math.floor(video.currentTime/8)*8:Math.max(0,Math.floor(video.currentTime/8)-1)*8);
$('#next').onclick=()=>seek(Math.min(16,(Math.floor(video.currentTime/8)+1)*8));
$('#mute').onclick=()=>{video.muted=!video.muted;sync()};
$('#volume').oninput=e=>{video.volume=+e.target.value;video.muted=video.volume===0;sync()};
$('#seek').addEventListener('pointerdown',()=>seeking=true);for(const e of ['pointerup','pointercancel','blur'])window.addEventListener(e,()=>{seeking=false;sync()});
$('#seek').oninput=e=>seek(+e.target.value);
$('#seek').onkeydown=e=>{let t;const delta={ArrowRight:5,ArrowUp:5,ArrowLeft:-5,ArrowDown:-5,PageUp:10,PageDown:-10};if(e.key in delta)t=video.currentTime+delta[e.key];else if(e.key==='Home')t=0;else if(e.key==='End')t=video.duration;else return;e.preventDefault();seek(t)};
$('#captions').onclick=()=>{const track=[...video.textTracks].find(t=>t.kind==='captions');if(track)track.mode=track.mode==='showing'?'hidden':'showing';sync()};video.textTracks.addEventListener('change',sync);
function closeMenu(){$('.chapter-menu').hidden=true;$('#chapters').setAttribute('aria-expanded','false');$('#chapters').focus()}
$('#chapters').setAttribute('aria-expanded','false');$('#chapters').onclick=()=>{const open=$('.chapter-menu').hidden;$('.chapter-menu').hidden=!open;$('#chapters').setAttribute('aria-expanded',String(open));if(open)$('.chapter-menu button').focus()};
$('.chapter-menu').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.time)seek(+b.dataset.time);closeMenu()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('.chapter-menu').hidden){e.preventDefault();closeMenu()}else if(document.fullscreenElement){e.preventDefault();document.exitFullscreen().catch(()=>{$('#notice').textContent='Use the Fullscreen button to exit.'})}}if((e.key===' '||e.key==='Enter')&&e.target.matches('.control'))e.target.dataset.held='true'});
const release=()=>document.querySelectorAll('[data-held]').forEach(b=>delete b.dataset.held);document.addEventListener('keyup',release);window.addEventListener('blur',release);document.addEventListener('focusout',release);
$('#fullscreen').onclick=async()=>{$('#notice').textContent='';try{if(document.fullscreenElement)await document.exitFullscreen();else if(player.requestFullscreen)await player.requestFullscreen();else if(video.webkitEnterFullscreen)video.webkitEnterFullscreen();else $('#notice').textContent='Fullscreen is unavailable in this browser.'}catch{$('#notice').textContent='Fullscreen could not open. Playback still works here.'}};
document.addEventListener('fullscreenchange',()=>$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
for(const event of ['play','pause','timeupdate','loadedmetadata','durationchange','volumechange','ended','seeked'])video.addEventListener(event,sync);
video.addEventListener('waiting',()=>{buffering=true;sync()});for(const event of ['playing','canplay'])video.addEventListener(event,()=>{buffering=false;$('#screen-error').textContent='';sync()});video.addEventListener('error',()=>{$('#screen-error').textContent='Transmission interrupted. Reload to reconnect.';sync()});
sync();window.spriteware={theme,video,player,sync,seek};
