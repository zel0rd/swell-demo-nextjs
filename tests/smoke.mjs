import { before, test } from 'node:test';
import assert from 'node:assert/strict';
const base = process.env.BASE_URL || 'http://127.0.0.1:8080';
before(async () => {for(let n=0;n<60;n++){try {if((await fetch(base+'/health',{signal:AbortSignal.timeout(1000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}throw new Error('Server not ready: '+base);});
test('homepage, health and runtime metadata', async () => {
 const page=await fetch(base);assert.equal(page.status,200);assert.match(await page.text(),/DEPLOYMENT PLAYGROUND/);
 const health=await fetch(base+'/health');assert.match(health.headers.get('cache-control'),/no-store/);assert.equal((await health.json()).status,'ok');
 const info=await (await fetch(base+'/api/info')).json();assert.equal(info.framework,'Next.js');assert.ok(info.version);assert.equal(info.SECRET_SENTINEL,undefined);
 if(process.env.EXPECT_VERSION)assert.equal(info.version,process.env.EXPECT_VERSION);
});
test('unicode greeting and invalid input', async () => {
 const result=await (await fetch(base+'/api/hello?name='+encodeURIComponent('파도'))).json();assert.match(result.message,/파도/);
 assert.equal((await fetch(base+'/api/hello?name='+'x'.repeat(101))).status,400);
 assert.equal((await fetch(base+'/missing-page')).status,404);
});
