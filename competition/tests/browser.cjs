// Optional end-to-end test: needs Playwright and Chromium, not required to run the app.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const requests=[];page.on('request',r=>requests.push(r.url()));
 const base=process.env.BASE_URL||'http://127.0.0.1:4173';
 await page.goto(base);await page.evaluate(()=>localStorage.clear());await page.reload();
 const output=path.resolve(__dirname,'../docs/validation');fs.mkdirSync(output,{recursive:true});
 assert.equal(await page.locator('.scene-card').count(),5);
 await page.screenshot({path:path.join(output,'desktop.png'),fullPage:true});
 const ids=['dorm','family','signature','friend','love'];
 for(const [i,id] of ids.entries()){
  await page.locator(`[data-start="${id}"]`).first().click();
  for(let n=0;n<3;n++){await page.locator(`[data-object="${n}"]`).click();assert.ok((await page.locator('#object-tip').innerText()).length>25);}
  await page.locator('[data-next]').click();assert.ok(await page.locator('[data-next]').isDisabled());
  await page.locator('[data-goal="1"]').click();await page.locator('[data-next]').click();
  await page.locator(`[data-say="${i%2}"]`).click();await page.locator(`[data-round="${i%2?'pause':'direct'}"]`).click();
  await page.locator('[data-next]').click();assert.ok(await page.locator('[data-next]').isDisabled());
  await page.locator('[data-need="0"]').click();await page.locator('[data-regulate="1"]').click();await page.locator('[data-next]').click();
  assert.ok(await page.locator('[data-next]').isDisabled());
  if(i===0){
   await page.locator('#rewrite').fill('   ');assert.ok(await page.locator('[data-next]').isDisabled());
   await page.locator('#rewrite').fill('<img src=x onerror=alert(1)> 我想好好休息，可以一起商量吗？');
   await page.locator('[data-example]').click();await page.locator('#close-info').click();
   assert.ok((await page.locator('#rewrite').inputValue()).includes('<img'));
   await page.locator('[data-exit]').click();await page.locator('#close-info').click();assert.ok(await page.locator('#rewrite').isVisible());
  } else await page.locator('[data-example]').click();
  await page.locator('[data-next]').click();assert.equal(await page.locator('.after img').count(),0);
  assert.ok((await page.locator('.after blockquote').innerText()).length>10);
  assert.ok((await page.locator('.ending').innerText()).includes('固定示例'));
  if(i===0)await page.screenshot({path:path.join(output,'comparison.png'),fullPage:true});
  await page.locator('[data-next]').click();assert.ok(await page.locator('[data-save]').isDisabled());
  await page.locator('[data-feeling="1"]').click();await page.locator('[data-save]').click();
  assert.equal(await page.locator('[data-save]').count(),0);
  await page.locator('header [data-nav="home"]').click();
 }
 await page.reload();await page.locator('header [data-nav="records"]').click();assert.equal(await page.locator('.record').count(),5);
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-export]').click();const download=await downloadPromise;
 const exportPath=path.join(output,'test-export.json');await download.saveAs(exportPath);
 const exported=JSON.parse(fs.readFileSync(exportPath,'utf8'));assert.equal(exported.records.length,5);fs.unlinkSync(exportPath);
 await page.locator('[data-delete]').first().click();await page.locator('#close-info').click();assert.equal(await page.locator('.record').count(),5);
 await page.locator('[data-delete]').first().click();await page.locator('#confirm-delete').click();await page.reload();
 await page.locator('header [data-nav="records"]').click();assert.equal(await page.locator('.record').count(),4);
 await page.locator('header [data-nav="home"]').click();
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:path.join(output,'mobile.png'),fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('[data-start="family"]').click();
 await page.screenshot({path:path.join(output,'mobile-story.png'),fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('[data-object="1"]').click();await page.locator('[data-next]').click();await page.locator('[data-goal="0"]').click();await page.locator('[data-next]').click();
 await page.locator('[data-say="1"]').click();await page.locator('[data-round="pause"]').click();await page.locator('[data-next]').click();
 await page.locator('[data-need="1"]').click();await page.locator('[data-regulate="2"]').click();await page.locator('[data-next]').click();
 await page.locator('#rewrite').fill('听到这些比较，我有点难受。我们周末再聊计划好吗？');await page.locator('[data-next]').click();await page.locator('[data-next]').click();await page.locator('[data-feeling="0"]').click();await page.locator('[data-save]').click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 // Corrupt storage and unavailable storage must still leave the app usable.
 await page.evaluate(()=>localStorage.setItem('respeak.practice.v1','broken json'));await page.reload();assert.equal(await page.locator('.scene-card').count(),5);assert.ok(await page.locator('.warning').isVisible());
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Blocked')}}));
 const bp=await blocked.newPage();await bp.goto(base);assert.equal(await bp.locator('.scene-card').count(),5);await blocked.close();
 assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith(base)||u.startsWith('blob:')),'App must not request remote resources');
 console.log('PASS: 5 complete desktop flows, both dialogue branches, 3 hotspots per scene, private pause gates, custom/reference rewrite, HTML escaping, exit cancellation, local persistence, duplicate prevention, JSON export, deletion, complete mobile flow (390px), storage failures, no external requests, no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
