import test from 'node:test';import assert from 'node:assert/strict';import {createVideoFullscreen} from '../src/fullscreen.js';
function setup(){
 const video=new EventTarget();Object.assign(video,{readyState:4,controls:false,tabIndex:-1,webkitDisplayingFullscreen:false});const attrs=new Map([['tabindex','-1']]);video.getAttribute=k=>attrs.get(k)??null;video.setAttribute=(k,v)=>attrs.set(k,v);video.removeAttribute=k=>attrs.delete(k);
 const doc=new EventTarget();doc.fullscreenEnabled=true;doc.fullscreenElement=null;
 const labels=[];const button={setAttribute:(k,v)=>labels.push(v),focus:()=>{}};const messages=[],expanded=[];let timer;
 const c=createVideoFullscreen({video,button,doc,win:{scrollX:0,scrollY:20,scrollTo:()=>{}},onExpanded:x=>expanded.push(x),onMessage:x=>messages.push(x),schedule:fn=>{timer=fn;return 1},cancel:()=>{timer=null}});
 return {video,doc,c,messages,expanded,labels,tick:()=>timer?.()};
}
test('standard video fullscreen is invoked synchronously in the original tap',()=>{const x=setup();let called=false;x.video.requestFullscreen=()=>{called=true;x.doc.fullscreenElement=x.video;x.doc.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve()};x.c.toggle();assert.equal(called,true);assert.equal(x.c.mode,'native');assert.equal(x.video.controls,true)});
test('iPhone native entry requires confirmation and restores on native exit',()=>{const x=setup();x.doc.fullscreenEnabled=false;let called=0;x.video.webkitSupportsFullscreen=true;x.video.webkitEnterFullscreen=()=>{called++};x.c.toggle();assert.equal(called,1);assert.equal(x.c.mode,'pending');x.video.webkitDisplayingFullscreen=true;x.video.dispatchEvent(new Event('webkitbeginfullscreen'));assert.equal(x.c.mode,'native');x.video.webkitDisplayingFullscreen=false;x.video.dispatchEvent(new Event('webkitendfullscreen'));assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false)});
test('silent Safari no-op does not leave the fullscreen button permanently latched',()=>{const x=setup();x.doc.fullscreenEnabled=false;x.video.webkitEnterFullscreen=()=>{};x.c.toggle();x.tick();assert.equal(x.c.mode,'expanded');assert.equal(x.expanded.at(-1),true);x.c.toggle();assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false);x.c.toggle();assert.equal(x.c.mode,'pending')});
test('rejected standard fullscreen gives video-only fallback and visible explanation',async()=>{const x=setup();x.video.requestFullscreen=()=>Promise.reject(new Error('denied'));x.c.toggle();await Promise.resolve();assert.equal(x.c.mode,'expanded');assert.match(x.messages.at(-1),/unavailable/);x.c.exit();assert.equal(x.c.mode,'inline')});
test('unsupported and not-yet-loaded video still respond to the first tap',()=>{for(const readyState of [0,4]){const x=setup();x.video.readyState=readyState;x.c.toggle();assert.equal(x.c.mode,'expanded');assert.equal(x.video.controls,true);assert.ok(x.messages.at(-1));}});
test('unsupported WebKit capability is not called and no automatic delayed API call occurs',()=>{const x=setup();x.doc.fullscreenEnabled=false;x.video.webkitSupportsFullscreen=false;x.video.webkitEnterFullscreen=()=>assert.fail('unsupported API');x.c.toggle();assert.equal(x.c.mode,'expanded');x.tick();assert.equal(x.c.mode,'expanded')});
test('synchronous native exceptions recover and retain a working exit',()=>{const x=setup();x.doc.fullscreenEnabled=false;x.video.webkitEnterFullscreen=()=>{throw Error('unsupported')};x.c.toggle();assert.equal(x.c.mode,'expanded');x.c.exit();assert.equal(x.c.active,false);assert.equal(x.video.getAttribute('tabindex'),'-1')});
test('native exit uses only video/document API and waits for confirmation',()=>{const x=setup();x.video.requestFullscreen=()=>{x.doc.fullscreenElement=x.video;x.doc.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve()};x.doc.exitFullscreen=()=>{x.doc.fullscreenElement=null;x.doc.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve()};x.c.toggle();x.c.exit();assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false)});

test('iPad prefers native video presenter when both fullscreen APIs exist',()=>{const x=setup();let nativeCalls=0;x.video.webkitSupportsFullscreen=true;x.video.webkitEnterFullscreen=()=>{nativeCalls++;x.video.webkitDisplayingFullscreen=true;x.video.dispatchEvent(new Event('webkitbeginfullscreen'))};x.video.requestFullscreen=()=>assert.fail('generic API must not replace the native video presenter');x.c.toggle();assert.equal(nativeCalls,1);assert.equal(x.c.mode,'native')});
test('unsupported native video presenter still allows standard video fullscreen',()=>{const x=setup();x.video.webkitSupportsFullscreen=false;x.video.webkitEnterFullscreen=()=>assert.fail('unsupported native API');x.video.requestFullscreen=()=>{x.doc.fullscreenElement=x.video;x.doc.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve()};x.c.toggle();assert.equal(x.c.mode,'native')});

test('closing expanded fallback clears its stale status message',()=>{const x=setup();x.c.toggle();assert.ok(x.messages.at(-1));x.c.exit();assert.equal(x.messages.at(-1),'');assert.equal(x.c.mode,'inline')});

test('cancel pending Safari entry safely exits a late native begin with controls intact',()=>{
 const x=setup();let exits=0;x.video.webkitEnterFullscreen=()=>{};
 x.video.webkitExitFullscreen=()=>{exits++;assert.equal(x.video.controls,true)};
 x.c.toggle();x.c.exit();assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false);
 x.video.webkitDisplayingFullscreen=true;x.video.dispatchEvent(new Event('webkitbeginfullscreen'));
 assert.equal(exits,1);assert.equal(x.c.mode,'native');assert.equal(x.video.controls,true);
 x.video.webkitDisplayingFullscreen=false;x.video.dispatchEvent(new Event('webkitendfullscreen'));
 assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false);assert.equal(x.labels.at(-1),'Enter fullscreen');
});
test('late native entry can synchronously exit without leaving stale controls or label',()=>{
 const x=setup();x.video.webkitEnterFullscreen=()=>{};
 x.video.webkitExitFullscreen=()=>{x.video.webkitDisplayingFullscreen=false;x.video.dispatchEvent(new Event('webkitendfullscreen'))};
 x.c.toggle();x.c.exit();x.video.webkitDisplayingFullscreen=true;x.video.dispatchEvent(new Event('webkitbeginfullscreen'));
 assert.equal(x.c.mode,'inline');assert.equal(x.video.controls,false);assert.equal(x.labels.at(-1),'Enter fullscreen');
});
test('cancelled standard promise cannot reopen fallback during a newer request',async()=>{
 const x=setup();let rejectOld;x.video.requestFullscreen=()=>new Promise((_,reject)=>rejectOld=reject);
 x.c.toggle();x.c.exit();x.video.requestFullscreen=()=>new Promise(()=>{});x.c.toggle();
 rejectOld(Error('old request'));await Promise.resolve();assert.equal(x.c.mode,'pending');
});
test('late standard fullscreen after pending cancellation requests exit',()=>{
 const x=setup();let exits=0;x.video.requestFullscreen=()=>new Promise(()=>{});
 x.doc.exitFullscreen=()=>{exits++;x.doc.fullscreenElement=null;x.doc.dispatchEvent(new Event('fullscreenchange'));return Promise.resolve()};
 x.c.toggle();x.c.exit();x.doc.fullscreenElement=x.video;x.doc.dispatchEvent(new Event('fullscreenchange'));
 assert.equal(exits,1);assert.equal(x.c.mode,'inline');assert.equal(x.labels.at(-1),'Enter fullscreen');
});
test('late native entry without an exit API keeps working native controls and explains exit',()=>{
 const x=setup();x.video.webkitEnterFullscreen=()=>{};x.c.toggle();x.c.exit();
 x.video.webkitDisplayingFullscreen=true;x.video.dispatchEvent(new Event('webkitbeginfullscreen'));
 assert.equal(x.c.mode,'native');assert.equal(x.video.controls,true);assert.match(x.messages.at(-1),/native exit/);
 x.video.webkitDisplayingFullscreen=false;x.video.dispatchEvent(new Event('webkitendfullscreen'));
 assert.equal(x.labels.at(-1),'Enter fullscreen');assert.equal(x.video.controls,false);
});
