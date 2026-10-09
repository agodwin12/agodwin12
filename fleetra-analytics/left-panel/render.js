// node render.js  -> left-panel@2x.png
const { chromium } = require('/opt/node-tools/node_modules/playwright-core');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1182, height: 875 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.resolve(__dirname, 'left-panel@2x.png') });
  await browser.close();
  console.log('rendered');
})();
