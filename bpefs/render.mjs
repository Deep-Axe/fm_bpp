import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fileUrl = 'file://' + path.join(__dirname, 'index.html').replace(/\\/g, '/');

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

await page.goto(fileUrl, { waitUntil: 'networkidle0' });
// give web fonts a beat to settle
await page.evaluate(() => document.fonts && document.fonts.ready);
await new Promise(r => setTimeout(r, 400));

await page.pdf({
  path: path.join(__dirname, 'STRIDE_Executive_Summary.pdf'),
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
});

// High-res PNG previews of each page for visual QA
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
const pages = await page.$$('.page');
for (let i = 0; i < pages.length; i++) {
  await pages[i].screenshot({ path: path.join(__dirname, `preview_p${i + 1}.png`) });
}

await browser.close();
console.log('Rendered PDF + previews for', pages.length, 'pages.');
