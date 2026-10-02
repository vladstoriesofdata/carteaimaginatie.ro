import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const origin='http://127.0.0.1:4321/';
await mkdir('docs/screenshots',{recursive:true});
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.goto(origin);
  await page.locator('#gallery.is-masonry').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.gallery-item:not([hidden]) img').first().evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/home-desktop.png'});
  await page.getByRole('button',{name:'DIN CARTE',exact:true}).click();
  await page.locator('.gallery-item:not([hidden]) img').first().evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/din-carte-desktop.png'});
  await page.getByRole('button',{name:'PRIETENI',exact:true}).click();
  await page.locator('.gallery-item:not([hidden]) img').first().evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/prieteni-desktop.png'});
  await page.getByRole('button',{name:'Trimite o trăznaie',exact:true}).click();
  await page.screenshot({path:'docs/screenshots/story-dialog.png'});
  await page.goto(new URL('despre-proiect/',origin).href);
  await page.locator('.project-cover img').evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/about-desktop.png'});
  await page.goto(new URL('politica-de-confidentialitate/',origin).href);
  await page.locator('main img').evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/privacy-desktop.png'});
  await page.setViewportSize({width:375,height:812});
  await page.goto(origin);
  await page.locator('#gallery.is-masonry').waitFor();
  await page.locator('.gallery-item:not([hidden]) img').first().evaluate(e=>e.decode());
  await page.screenshot({path:'docs/screenshots/home-mobile.png'});
  console.log('Saved seven local preview screenshots in docs/screenshots/.');
} finally { await browser.close(); }
