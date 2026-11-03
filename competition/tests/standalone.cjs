const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox'],headless:true});try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base=process.env.BASE_URL||'http://127.0.0.1:4173';
 await p.goto(base+'/standalone.html');await p.evaluate(()=>localStorage.clear());await p.reload();
 assert.equal(await p.locator('.scene-card').count(),5);assert.ok(await p.locator('.scene-card img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
 // Block every new network request. The entire flow must still work offline.
 await p.route('**/*',r=>r.abort());
 await p.locator('[data-start="dorm"]').first().click();await p.locator('[data-next]').click();await p.locator('[data-goal="0"]').click();await p.locator('[data-next]').click();await p.locator('[data-say="1"]').click();await p.locator('[data-round="direct"]').click();await p.locator('[data-next]').click();await p.locator('[data-need="0"]').click();await p.locator('[data-regulate="0"]').click();await p.locator('[data-next]').click();await p.locator('[data-example]').click();await p.locator('[data-next]').click();await p.locator('[data-next]').click();await p.locator('[data-feeling="1"]').click();await p.locator('[data-save]').click();await p.unroute('**/*');await p.reload();await p.locator('header [data-nav="records"]').click();assert.equal(await p.locator('.record').count(),1);assert.deepEqual(errors,[]);
 await p.goto(base);for(const width of [320,360,390,768,1440]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+width)}
 console.log('PASS: single-file edition (HTTP) full offline interaction, reload persistence, 5 inline SVGs; 320/360/390/768/1440px no homepage overflow.');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
