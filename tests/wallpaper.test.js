import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
test('wallpaper is a standard fixed body background, not a scrolling layer',()=>{assert.match(css,/body\{[^}]*background-image:url\('[^']*meadow-wallpaper.webp'\)[^}]*background-attachment:fixed/);assert.doesNotMatch(css,/body::before|body::after/)});
