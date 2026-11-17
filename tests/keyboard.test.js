import test from 'node:test';import assert from 'node:assert/strict';import {chapterTabExit,chapterArrowIndex} from '../src/keyboard.js';
test('Shift+Tab from first chapter returns to opener',()=>assert.equal(chapterTabExit('Tab',true,0,4),'opener'));
test('Tab from Close continues after opener, never BODY',()=>assert.equal(chapterTabExit('Tab',false,3,4),'after-opener'));
test('interior Tab and Shift+Tab retain native order',()=>{for(let i=0;i<3;i++)assert.equal(chapterTabExit('Tab',false,i,4),null);for(let i=1;i<4;i++)assert.equal(chapterTabExit('Tab',true,i,4),null)});
test('Escape and arrow handling remain separate',()=>{for(const key of ['Escape','ArrowDown','ArrowUp','Home','End'])assert.equal(chapterTabExit(key,false,3,4),null)});
test('single-item popup can exit in either direction without trapping',()=>{assert.equal(chapterTabExit('Tab',true,0,1),'opener');assert.equal(chapterTabExit('Tab',false,0,1),'after-opener')});
test('unknown focus and empty popup do not intercept Tab',()=>{assert.equal(chapterTabExit('Tab',true,-1,4),null);assert.equal(chapterTabExit('Tab',false,0,0),null)});

test('Home and End target first and last chapter, excluding Close',()=>{assert.equal(chapterArrowIndex('Home',1,3),0);assert.equal(chapterArrowIndex('End',0,3),2)});
test('arrows wrap only among chapters',()=>{assert.equal(chapterArrowIndex('ArrowDown',2,3),0);assert.equal(chapterArrowIndex('ArrowUp',0,3),2)});
test('arrows from Close return to chapter collection',()=>{assert.equal(chapterArrowIndex('ArrowUp',-1,3),2);assert.equal(chapterArrowIndex('ArrowDown',-1,3),0)});
