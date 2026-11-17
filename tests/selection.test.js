import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
test('nonselectable text is scoped to hardware UI, not page copy or native video',()=>{
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*user-select[^{}]*)\}/g)];
 assert.ok(rules.length>0);
 for(const [,selector,body] of rules){assert.match(selector,/\.scene\s+:is\(/);assert.doesNotMatch(selector,/\bhtml\b|\bbody\b|\bvideo\b|\.notes/);assert.match(body,/-webkit-user-select:none/);assert.match(body,/(?:^|;)user-select:none/)}
});
