import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {scenes,steps,buildRecord} from '../src/data.js';
test('five complete original preset stories with local illustrations',async()=>{
 assert.equal(scenes.length,5);assert.equal(new Set(scenes.map(s=>s.id)).size,5);assert.equal(steps.length,7);
 for(const s of scenes){assert.equal(s.goals.length,3);assert.equal(s.objects.length,3);assert.equal(s.choices.length,2);assert.equal(s.needs.length,3);for(const key of ['original','intro','trigger','follow','suggestion','ending','boundary'])assert.ok(s[key].length>10);await access(new URL(`../assets/${s.id}.svg`,import.meta.url));}
});
test('records preserve user expression and separate it from preset text',()=>{
 const s=scenes[0],r=buildRecord(s,{goal:s.goals[0],need:s.needs[0],rewrite:'我想休息，可以调整台灯的方向吗？',feeling:'更清楚了一点'});
 assert.equal(r.rewrite,'我想休息，可以调整台灯的方向吗？');assert.equal(r.original,s.original);assert.ok(r.id);assert.ok(!Number.isNaN(Date.parse(r.createdAt)));
});
test('built delivery contains entry point and all relative local assets',async()=>{
 const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(html,/lang="zh-CN"/);
 for(const file of ['src/app.js','src/style.css','src/data.js','assets/mark.svg',...scenes.map(s=>`assets/${s.id}.svg`)])await access(new URL(`../dist/${file}`,import.meta.url));
});
