import test from 'node:test';
import assert from 'node:assert/strict';
import {mediaChapters,currentChapter,chapterDestination,repeatedToggle} from '../src/chapters.js';
test('demo names and starts remain correct',()=>{const c=mediaChapters('/media/aqua-motion.mp4?v=1',24);assert.deepEqual(c.map(c=>c.time),[0,8,16]);assert.match(c[0].label,/Chromatic/)});
test('other media uses neutral duration-aware segments',()=>{const c=mediaChapters('/movie.mp4',90);assert.deepEqual(c.map(c=>c.time),[0,30,60]);assert.equal(c[0].label,'01 · Part 1')});
test('unknown and invalid durations do not create chapters',()=>{for(const n of [NaN,Infinity,0,-1])assert.deepEqual(mediaChapters('/x',n),[])});
test('ended video retains its final chapter',()=>{const c=mediaChapters('/x',24);assert.equal(currentChapter(c,24),2);assert.equal(currentChapter(c,8),1)});
test('previous and next use same duration-aware chapter positions',()=>{const c=mediaChapters('/x',90);assert.equal(chapterDestination(c,32,-1),0);assert.equal(chapterDestination(c,33,-1),30);assert.equal(chapterDestination(c,35,1),60);assert.equal(chapterDestination(c,90,1),60);assert.equal(chapterDestination([],0,1),null)});
test('toggle shortcut autorepeat is ignored without breaking range keys',()=>{for(const k of ['k','K','m','M','f','F']){assert.equal(repeatedToggle(k,true),true);assert.equal(repeatedToggle(k,false),false)}assert.equal(repeatedToggle('ArrowRight',true),false)});
