// node render_v2.js <variant>  -> scene-<variant>@2x.png
const { chromium } = require('/opt/node-tools/node_modules/playwright-core');
const path = require('path');
const v = process.argv[2] || 'desktop';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(__dirname, `scene-${v}.html`));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.resolve(__dirname, `scene-${v}@2x.png`) });
  await browser.close();
  console.log('rendered', v);
})();
