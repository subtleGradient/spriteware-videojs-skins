import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mediaTitle} from '../src/media-title.js';
test('actual resource basename wins, never a theme fiction or signed query',()=>{
 assert.equal(mediaTitle({src:'/media/aqua-motion.mp4'}),'aqua-motion.mp4');
 assert.equal(mediaTitle({currentSrc:'https://cdn.example/Real%20Film.mp4?token=secret#t=2',src:'old.mov'}),'Real Film.mp4');
 assert.equal(mediaTitle({src:'../assets/demo.webm',baseURI:'https://example.com/player/'}),'demo.webm');
});
test('explicit meaningful title can label opaque streams',()=>{
 assert.equal(mediaTitle({title:'  Ocean at dusk  ',src:'blob:opaque'}),'Ocean at dusk');
 assert.equal(mediaTitle({title:' ',src:'/demo.mp4'}),'demo.mp4');
});
test('safe fallback for missing, directory and non-file source forms',()=>{
 for(const src of ['',undefined,'https://example.com/','data:video/mp4;base64,secret','blob:https://example.com/private-id','javascript:alert(1)'])assert.equal(mediaTitle({src}),'Video');
 assert.equal(mediaTitle({src:'https://example.com/bad%ZZ.mp4'}),'bad%ZZ.mp4');
});
test('untrusted title is literal text and integration never interpolates it as HTML',()=>{
 assert.equal(mediaTitle({title:'<img src=x onerror=alert(1)>'}),'<img src=x onerror=alert(1)>');
 const source=readFileSync(new URL('../src/mount.js',import.meta.url),'utf8');
 assert.match(source,/<span class="title-readout"><\/span>/);
 assert.match(source,/\$\('\.title-readout'\)\.textContent=currentMediaTitle\(\)/);
 assert.doesNotMatch(source,/theme\.filename|nebula_pop\.mpg|cosmic_drift\.avi|bio_rhythm\.mov/);
});
