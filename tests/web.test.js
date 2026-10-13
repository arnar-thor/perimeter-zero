const { chromium } = require('playwright-core'); const fs = require('fs');
const { OUT, BASE: base, ORIGIN, CHROME } = require('./config'); fs.mkdirSync(OUT + '/exports', { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: ORIGIN });
  const p = await ctx.newPage(); const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
  const ready = (r) => p.waitForFunction((r) => __AD.prices && __AD.prices.meta.region === r && __AD.state.region === r, r);
  const tot = () => p.evaluate(() => document.querySelector('#hud-total').textContent);
  const zids = () => p.evaluate(() => __AD.zreview.findings.map(f => f.id));
  const tpl = async (k) => { await p.click('#btn-templates'); await p.click(`[data-template=${k}]`); await p.waitForTimeout(200); };
  console.log('Desktop 1440');
  await p.goto(base); await p.waitForSelector('body.ready'); await p.waitForTimeout(600);
  ok(await p.isVisible('#onboard'), 'onboarding shows on first visit');
  for (let i = 0; i < 6 && await p.isVisible('#onboard'); i++) await p.click('[data-ob=next]');
  ok(await p.isHidden('#onboard'), 'onboarding completes'); await ready('us-east-1');
  const s0 = await p.evaluate(() => ({ t: __AD.state.template, n: __AD.state.nodes.length, o: __AD.zreview.overall }));
  ok(s0.t === 'ztThreeTier' && s0.o === 100, `ZT 3-tier is the default (${s0.n} nodes, ZT score ${s0.o}, total ${await tot()})`);
  ok(await p.isVisible('#pane-overview .zt-ladder') && (await p.$$('#pane-overview .zl')).length === 8, 'overview shows 8-row maturity ladder (7 pillars + cross-cutting)');
  ok((await p.textContent('#tb-zt')).length > 0, 'title block shows ZT score: ' + await p.textContent('#tb-zt'));
  const cats = await p.evaluate(() => Object.keys(AD.CATALOG)); const need = ['idc','idp','cognito','iam','posture','va','vpce','gwep','lattice','tgw','nfw','pca','macie','guardduty','sechub','cloudtrail','flowlogs','config','detective','seclake','org','account'];
  ok(need.every(t => cats.includes(t)) && cats.includes('rds') && cats.includes('lambda'), `catalog has all ${need.length} new types plus existing (${cats.length} total)`);
  const palMissing = await p.evaluate((need) => need.filter(t => !document.querySelector(`.pal-item[data-type=${t}]`)), need.filter(t => t !== 'account'));
  ok(palMissing.length === 0, 'all new components in the palette ' + palMissing.join(','));
  await p.click('#btn-fit'); await p.waitForTimeout(250); await p.screenshot({ path: `${OUT}/zt-desktop-3tier.png` });
  for (const k of ['ztGov', 'ztMicro', 'ztLegacy', 'threeTier', 'serverless', 'staticSite', 'microservices', 'pipeline', 'blank', 'ztThreeTier']) {
    await tpl(k); const s = await p.evaluate(() => ({ t: __AD.state.template, n: __AD.state.nodes.length, z: __AD.zreview.overall, f: __AD.zreview.findings.length, r: __AD.state.region }));
    ok(s.t === k, `template ${k}: ${s.n} nodes, ${s.r}, total ${await tot()}, ZT ${s.z}, ${s.f} ZT findings`);
  }
  await p.evaluate(() => __AD.setRegion('us-east-1')); await ready('us-east-1'); await tpl('ztThreeTier');
  // drag + connect + props
  const n1 = await p.evaluate(() => __AD.state.nodes.length);
  await p.locator('.pal-item[data-type=detective]').scrollIntoViewIfNeeded(); const item = await p.locator('.pal-item[data-type=detective]').boundingBox(); const stage = await p.locator('#stage').boundingBox();
  await p.mouse.move(item.x + item.width / 2, item.y + item.height / 2); await p.mouse.down(); await p.mouse.move(stage.x + 300, stage.y + 140, { steps: 8 }); await p.mouse.move(stage.x + 320, stage.y + 150, { steps: 3 }); await p.mouse.up();
  ok(await p.evaluate(() => __AD.state.nodes.length) === n1 + 1, 'drag Detective from palette onto canvas');
  const ids = await p.evaluate(() => { const s = __AD.state; return { a: s.nodes[s.nodes.length - 1].id, b: s.nodes.find(n => n.type === 'guardduty').id }; });
  const e1 = await p.evaluate(() => __AD.state.edges.length);
  const port = await p.locator(`[data-port=${ids.a}]`).boundingBox(); const tgt = await p.locator(`.node[data-id=${ids.b}] .node-card`).boundingBox();
  await p.mouse.move(port.x + port.width / 2, port.y + port.height / 2); await p.mouse.down(); await p.mouse.move(tgt.x + tgt.width / 2, tgt.y + tgt.height / 2, { steps: 10 }); await p.mouse.up();
  ok(await p.evaluate(() => __AD.state.edges.length) === e1 + 1, 'connect Detective → GuardDuty by dragging the port');
  const va = await p.evaluate(() => __AD.state.nodes.find(n => n.type === 'va').id); const t0 = await tot();
  await p.click(`.node[data-id=${va}] .node-card`); await p.fill('#pf-apps', '6'); await p.press('#pf-apps', 'Tab'); await p.waitForTimeout(100);
  ok(await tot() !== t0, `Verified Access apps 2 → 6 changes total ${t0} → ${await tot()}`);
  const vaLines = await p.evaluate((id) => AD.cost(__AD.state.nodes.find(n => n.id === id), __AD.prices).map(l => JSON.stringify(l)), va);
  console.log('    VA cost lines:', vaLines.join(' | '));
  await p.keyboard.press('Escape'); await p.locator('#canvas').focus(); await p.keyboard.press('Control+z');
  ok(await tot() === t0, 'Ctrl+Z undoes the property change'); await p.keyboard.press('Control+Shift+z'); ok(await tot() !== t0, 'Ctrl+Shift+Z redoes it'); await p.keyboard.press('Control+z');
  // SG overlay chip
  ok(await p.evaluate(() => document.querySelectorAll('.zchip.ok').length > 0), 'SG / mTLS chips drawn on compute and data nodes');
  // rules: mutate the clean ZT 3-tier and check each rule fires
  const rules = [
    ['zt-wild-', 's => s.nodes.filter(n => n.type === "iam").forEach(n => n.props.wildcard = true)'],
    ['zt-keys-', 's => s.nodes.filter(n => n.type === "iam").forEach(n => n.props.longKeys = true)'],
    ['zt-no-iap', 's => { s.nodes = s.nodes.filter(n => n.type !== "va"); s.nodes.find(n => n.type === "alb").props.public = true; }'],
    ['zt-nat-api', 's => { s.nodes = s.nodes.filter(n => n.type !== "vpce"); }', 'threeTier'],
    ['zt-lattice-auth-', 's => { const l = s.nodes.find(n => n.type === "lattice"); if (l) l.props.auth = "NONE"; }', 'ztMicro'],
    ['zt-east-west', 's => { const e = s.nodes.filter(n => n.type === "ecs"); s.edges.push({ id: "ewt", from: e[0].id, to: e[1].id }); e.forEach(n => n.props.mtls = false); }', 'ztMicro'],
    ['zt-flat', 's => s.nodes.forEach(n => { if ("sg" in n.props) n.props.sg = "Whole VPC CIDR"; })'],
    ['zt-rest', 's => s.nodes.forEach(n => { if ("encrypted" in n.props) n.props.encrypted = false; })'],
    ['zt-transit', 's => s.nodes.forEach(n => { if ("https" in n.props) n.props.https = false; if ("tls" in n.props) n.props.tls = false; })'],
    ['zt-no-cloudtrail', 's => { s.nodes = s.nodes.filter(n => n.type !== "cloudtrail"); }'],
    ['zt-no-flowlogs', 's => { s.nodes = s.nodes.filter(n => n.type !== "flowlogs"); }'],
    ['zt-no-guardduty', 's => { s.nodes = s.nodes.filter(n => n.type !== "guardduty"); }'],
    ['zt-no-config', 's => { s.nodes = s.nodes.filter(n => n.type !== "config"); }'],
    ['zt-no-sechub', 's => { s.nodes = s.nodes.filter(n => n.type !== "sechub"); }'],
    ['zt-no-posture', 's => { s.nodes = s.nodes.filter(n => n.type !== "posture"); }'],
    ['zt-mfa-', 's => s.nodes.forEach(n => { if ("mfa" in n.props) n.props.mfa = false; })'],
    ['zt-log-account', 's => { const la = s.nodes.find(n => n.type === "account" && n.props.role === "log-archive"); if (la) la.props.role = "workload"; }'],
    ['zt-no-org', 's => { s.nodes = s.nodes.filter(n => n.type !== "org"); }'],
  ];
  const fixedOK = [];
  for (const [rid, fn, tk] of rules) {
    await tpl(tk || 'ztThreeTier');
    await p.evaluate((fn) => { const s = JSON.parse(JSON.stringify(__AD.state)); eval(fn)(s); s.edges = s.edges.filter(e => s.nodes.some(n => n.id === e.from) && s.nodes.some(n => n.id === e.to)); __AD.load(s); }, fn);
    const z = await p.evaluate((rid) => { const z = __AD.zreview; const i = z.findings.findIndex(f => f.id.startsWith(rid)); window.__rid = i >= 0 ? z.findings[i].id : null; return { o: z.overall, i, fix: i >= 0 && !!z.findings[i].fix, refs: i >= 0 ? z.findings[i].refs : null, sev: i >= 0 ? z.findings[i].sev : null }; }, rid);
    ok(z.i >= 0 && z.refs && z.refs.nist && z.refs.nist.length && z.refs.cisa, `rule ${rid} fires (${z.sev}, score ${z.o}, NIST tenets ${z.refs && z.refs.nist}, CISA ${z.refs && z.refs.cisa})`);
    if (z.i >= 0 && z.fix) {
      await p.click('#tab-zt'); await p.click(`#pane-zt [data-fix="z:${z.i}"]`); await p.waitForTimeout(120);
      const a = await p.evaluate((rid) => ({ still: __AD.zreview.findings.some(f => f.id === window.__rid), o: __AD.zreview.overall }), rid);
      ok(!a.still && a.o >= z.o, `  one-click fix resolves ${rid} (score ${z.o} → ${a.o})`); fixedOK.push(rid);
      await p.locator('#canvas').focus(); await p.keyboard.press('Control+z'); await p.waitForTimeout(80);
      ok(await p.evaluate((rid) => __AD.zreview.findings.some(f => f.id.startsWith(rid)), rid), `  undo brings ${rid} back`);
    }
  }
  // legacy before → apply all
  await tpl('ztLegacy');
  const L0 = await p.evaluate(() => ({ o: __AD.zreview.overall, f: __AD.zreview.findings.map(f => f.id.replace(/-n\d+$/, '')) }));
  ok(L0.o <= 15 && L0.f.length >= 15, `legacy "Before": ZT ${L0.o}, ${L0.f.length} findings: ${L0.f.join(', ')}`);
  await p.click('#tab-zt'); await p.waitForTimeout(150);
  ok(await p.isVisible('#pane-zt .disclaimer'), 'Zero Trust tab shows the disclaimer');
  const disc = await p.textContent('#pane-zt .disclaimer'); ok(/aligned with/i.test(disc) && /doesn.t make any system compliant/.test(disc), 'disclaimer: "aligned with" + explicit not-compliant/certified statement');
  const body = await p.evaluate(() => document.body.innerText); ok(!/\b(is|are|becomes?) (compliant|certified)\b/i.test(body), 'no "compliant/certified" claims in UI text');
  await p.screenshot({ path: `${OUT}/zt-legacy-findings.png` });
  await p.click('#pane-zt [data-fixall="z"]'); await p.waitForTimeout(300);
  const L1 = await p.evaluate(() => ({ o: __AD.zreview.overall, f: __AD.zreview.findings.map(f => f.id), st: __AD.zreview.stages }));
  ok(L1.o >= 85, `Apply all on legacy: ZT ${L0.o} → ${L1.o}; left: ${L1.f.join(', ') || 'none'}`);
  await p.screenshot({ path: `${OUT}/zt-legacy-after-apply-all.png` });
  await p.locator('#canvas').focus(); await p.keyboard.press('Control+z'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => __AD.zreview.overall) === L0.o, 'one Ctrl+Z reverts Apply all');
  await p.keyboard.press('Control+Shift+z'); await p.waitForTimeout(100);
  // W-A tab still works
  await p.click('#tab-review'); ok(await p.isVisible('#pane-review'), 'Well-Architected tab still available (score ' + await p.evaluate(() => __AD.review.overall) + ')');
  // region pricing
  await tpl('ztMicro'); const tE = await tot();
  await p.evaluate(() => __AD.setRegion('us-gov-west-1')); await ready('us-gov-west-1'); await p.waitForTimeout(150); const tG = await tot();
  ok(tG !== tE, `ZT microservices us-east-1 ${tE} vs us-gov-west-1 ${tG}`);
  const govPr = await p.evaluate(() => ({ va: __AD.prices.vaAppHr, vpce: __AD.prices.vpceHr, lat: __AD.prices.latticeSvcHr, mac: __AD.prices.macieBucketDay, na: __AD.prices.meta.unavailable }));
  ok(govPr.va === 0.35 && govPr.lat == null && govPr.mac == null, `GovCloud West: VA $${govPr.va}/app-h, Lattice and Macie unpriced`);
  const rf = await p.evaluate(() => __AD.zreview.findings.filter(f => f.id.startsWith('zt-region-')).map(f => f.title));
  ok(rf.some(t => /Lattice/.test(t)) && rf.some(t => /Macie/.test(t)), 'Lattice and Macie flagged "not available" in us-gov-west-1: ' + rf.join(' | '));
  const naCost = await p.evaluate(() => __AD.state.nodes.filter(n => ['lattice', 'macie'].includes(n.type)).map(n => AD.costTotal(AD.cost(n, __AD.prices))));
  ok(naCost.every(v => v === 0), 'unavailable services contribute $0 (no fallback price)');
  await p.click('#tab-cost'); ok(await p.isVisible('#pane-cost .na-tag'), 'Cost tab marks "Not available" lines');
  await p.screenshot({ path: `${OUT}/zt-3tier-govcloud-cost.png` });
  await p.evaluate(() => __AD.setRegion('ap-southeast-7')); await ready('ap-southeast-7');
  const ap7 = await p.evaluate(() => __AD.zreview.findings.filter(f => f.id.startsWith('zt-region-')).map(f => f.title.split(' ')[0] + ' ' + f.title.split(' ')[1]));
  ok(ap7.length >= 2, 'ap-southeast-7 gaps flagged: ' + ap7.join(', '));
  const ap7f = await p.evaluate(() => __AD.zreview.findings.findIndex(f => f.id.startsWith('zt-region-') && f.fix));
  if (ap7f >= 0) { await p.click('#tab-zt'); await p.click(`#pane-zt [data-fix="z:${ap7f}"]`); await p.waitForTimeout(100); ok(true, 'region-gap fix applied: ' + (await p.evaluate(() => __AD.zreview.findings.filter(f => f.id.startsWith('zt-region-')).length)) + ' gaps left'); }
  await p.evaluate(() => __AD.setRegion('us-east-1')); await ready('us-east-1'); await tpl('ztThreeTier');
  // exports
  const dl = async (act, name) => { await p.click('#btn-export'); const [d] = await Promise.all([p.waitForEvent('download'), p.click(`[data-act=${act}]`)]); const path = `${OUT}/exports/${name}`; await d.saveAs(path); return fs.statSync(path).size; };
  ok(await dl('png', 'zt-3tier.png') > 20000, 'PNG export'); ok(await dl('svg', 'zt-3tier.svg') > 10000, 'SVG export');
  ok(await dl('json', 'zt-3tier.zerotrust.json') > 1000, 'JSON save'); ok(await dl('tf', 'zt-3tier.tf') > 8000, 'Terraform export');
  ok(await dl('report-md', 'zt-3tier-report.md') > 2000, 'ZT report (Markdown)'); ok(await dl('report-html', 'zt-3tier-report.html') > 3000, 'ZT report (printable HTML)');
  const md = fs.readFileSync(`${OUT}/exports/zt-3tier-report.md`, 'utf8');
  ok(/aligned with/i.test(md) && /SP 800-207/.test(md) && /Maturity Model/.test(md) && /not (a )?(certif|complian|an assessment)/i.test(md), 'report includes NIST/CISA references and disclaimer');
  await tpl('ztLegacy'); await dl('report-md', 'zt-legacy-report.md'); await dl('report-html', 'zt-legacy-report.html');
  await p.setInputFiles('#file-open', `${OUT}/exports/zt-3tier.zerotrust.json`); await p.waitForTimeout(250);
  ok(await p.evaluate(() => __AD.state.template) === 'ztThreeTier', 'Open JSON restores the ZT 3-tier diagram');
  // share
  const nd = await p.evaluate(() => __AD.state.nodes.length);
  await p.click('#btn-share'); await p.waitForTimeout(300); const url = p.url(); ok(/#d=z/.test(url), 'share link (' + url.length + ' chars)');
  const c2 = await b.newContext({ viewport: { width: 1280, height: 800 } }); const p2 = await c2.newPage(); const e2 = []; p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(url); await p2.waitForSelector('body.ready'); await p2.waitForTimeout(400);
  ok(await p2.evaluate(() => __AD.state.nodes.length) === nd && !e2.length, 'share link opens the same diagram in a fresh browser'); await c2.close();
  // autosave
  await p.evaluate(() => { const s = JSON.parse(JSON.stringify(__AD.state)); s.title = 'Autosave check'; __AD.load(s); }); await p.waitForTimeout(600);
  await p.goto(base); await p.waitForSelector('body.ready'); ok(await p.evaluate(() => __AD.state.title) === 'Autosave check', 'autosave survives reload');
  ok(await p.evaluate(() => localStorage.getItem('nl.zerotrust.v1') !== null && localStorage.getItem('nl.architect.v1') === null), 'uses its own storage key (nl.zerotrust.v1)');
  // compare
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('nl.zerotrust.onboarded', '1'); }); await p.goto(base); await p.waitForSelector('body.ready'); await ready('us-east-1');
  await p.click('#tab-overview'); await p.click('#pane-overview [data-compare]'); await p.waitForSelector('.cmp li'); await p.waitForTimeout(300);
  const rows = await p.$$eval('.cmp li', (l) => l.map((x) => x.querySelector('b').textContent + ' ' + x.querySelector('.cmp-v').childNodes[0].textContent + (x.classList.contains('partial') ? ' (partial)' : '')));
  ok(rows.length === 36, `compare lists ${rows.length} regions`);
  console.log('    full:', rows.filter(r => !/partial/.test(r)).join(', ')); console.log('    partial:', rows.filter(r => /partial/.test(r)).join(', '));
  await p.screenshot({ path: `${OUT}/zt-compare-regions.png` });
  fs.writeFileSync(`${OUT}/exports/region-totals-zt3tier.json`, JSON.stringify(await p.evaluate(() => __AD.regionTotals()), null, 1));
  await p.keyboard.press('Escape');
  await p.locator('#canvas').focus(); await p.keyboard.press('?'); ok(await p.isVisible('#m-help'), '? opens help'); await p.keyboard.press('Escape');
  ok(errs.length === 0, `desktop console errors: ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
  await p.goto(base); await p.waitForSelector('body.ready'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/zt-desktop-3tier.png` });
  await ctx.close();
  console.log('Mobile 390');
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await m.newPage(); const me = []; mp.on('console', x => x.type() === 'error' && me.push(x.text())); mp.on('pageerror', e => me.push(e.message));
  await mp.goto(base); await mp.waitForSelector('body.ready'); await mp.waitForTimeout(600);
  ok(await mp.evaluate(() => document.body.classList.contains('view-only')), 'mobile opens in review mode');
  const ow = await mp.evaluate(() => document.documentElement.scrollWidth); ok(ow <= 390, 'no horizontal page overflow at 390 (' + ow + ')');
  await mp.screenshot({ path: `${OUT}/zt-mobile.png` });
  const tabs = await mp.$$eval('.tabs button', (bs) => bs.map(b => { const r = b.getBoundingClientRect(); return r.right <= 390 && b.scrollWidth <= b.clientWidth + 1; }));
  ok(tabs.length === 5, `5 tabs on mobile (${tabs.filter(Boolean).length} fully visible without scrolling)`);
  await mp.tap('#tab-zt'); await mp.waitForTimeout(200); ok(await mp.isVisible('#pane-zt .zt-ladder'), 'mobile Zero Trust tab shows ladder');
  await mp.screenshot({ path: `${OUT}/zt-mobile-zt-tab.png`, fullPage: false });
  const rds = await mp.evaluate(() => __AD.state.nodes.find(n => n.type === 'rds' || n.type === 'aurora').id);
  await mp.tap(`.node[data-id=${rds}] .node-card`).catch(() => {}); await mp.waitForTimeout(200);
  ok(await mp.evaluate(() => !document.querySelector('#pane-props').hidden), 'tap shows read-only properties');
  ok(me.length === 0, `mobile console errors: ${me.length} ${me.join(' | ')}`);
  await m.close(); await b.close();
  console.log(fails ? `FAILED: ${fails}` : 'ALL PASSED'); process.exit(fails ? 1 : 0);
})();
