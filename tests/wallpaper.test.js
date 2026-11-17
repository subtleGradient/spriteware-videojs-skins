import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
test('wallpaper is a standard fixed body background, not a scrolling layer',()=>{assert.match(css,/body\{[^}]*background-image:url\('[^']*meadow-wallpaper.webp'\)[^}]*background-attachment:fixed/);assert.doesNotMatch(css,/body::before|body::after/)});

test('iOS uses an inert CSS-only fixed decoration without replacing body background',()=>{assert.match(css,/@supports\(-webkit-touch-callout:none\)/);assert.match(css,/\.wallpaper-fixed\{display:block;position:fixed;inset:0/);assert.match(css,/min-height:100lvh/);assert.doesNotMatch(css,/#4d88cd/);const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/class="wallpaper-fixed" aria-hidden="true"/)});
