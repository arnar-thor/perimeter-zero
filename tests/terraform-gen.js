const { chromium } = require('playwright-core'); const fs = require('fs'); const path = require('path');
const { BASE, CHROME, OUT } = require('./config'); const TF = path.join(OUT, 'tf');
// Writes <OUT>/tf/<template>/main.tf for every template; then run `terraform init -backend=false && terraform validate` in each.
(async () => {
  const b = await chromium.launch({ executablePath: CHROME }); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(BASE); await p.waitForTimeout(1500);
  const keys = await p.evaluate(() => Object.keys(__AD.templates));
  for (const k of keys) {
    const tf = await p.evaluate(async (k) => { const t = __AD.templates[k].make(); __AD.load(t, { fresh: true }); if (t.region) await __AD.setRegion(t.region); return __AD.terraform(); }, k);
    fs.mkdirSync(path.join(TF, k), { recursive: true }); fs.writeFileSync(path.join(TF, k, 'main.tf'), tf);
  }
  // legacy after apply-all
  await p.evaluate(() => __AD.load(__AD.templates.ztLegacy.make(), { fresh: true }));
  const before = await p.evaluate(() => __AD.zreview.overall);
  await p.click('[data-tab="zt"], #tab-zt').catch(()=>{}); await p.click('[data-fixall="z"]'); await p.waitForTimeout(300);
  const after = await p.evaluate(() => __AD.zreview.overall);
  fs.mkdirSync(path.join(TF, 'ztLegacyFixed'), { recursive: true }); fs.writeFileSync(path.join(TF, 'ztLegacyFixed', 'main.tf'), await p.evaluate(() => __AD.terraform()));
  console.log(keys.join(','), 'legacy', JSON.stringify(before), '->', JSON.stringify(after)); console.log('errors', errs); await b.close();
})();
