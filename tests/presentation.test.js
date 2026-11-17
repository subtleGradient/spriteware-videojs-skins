import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const js=readFileSync(new URL('../src/player.js',import.meta.url),'utf8');
test('hover label contrast is theme scoped, not shared lime text on purple',()=>{
 assert.match(js,/scene.dataset.theme=theme.id/);
 assert.match(css,/\.scene\[data-theme=nebula\] \.control:hover \.pill-label\{color:#233000\}/);
 assert.doesNotMatch(css,/(?:^|})\.control:hover \.pill-label/);
});
test('mount reserves canonical artwork ratio before player initialization at both widths',()=>{
 assert.match(css,/#mount\{width:min\(100%,620px\);aspect-ratio:1086\/1448;margin:auto\}/);
 assert.match(css,/@media\(min-width:700px\) and \(min-height:600px\)\{#mount\{width:/);
 assert.match(css,/video-player\{display:block;width:100%;/);
});
