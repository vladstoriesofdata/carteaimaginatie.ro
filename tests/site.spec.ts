import { test, expect } from '@playwright/test';

test('homepage renders the original journey with local assets', async ({page})=>{
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang','ro');
  await expect(page.getByRole('button',{name:'CALATORIA',exact:true})).toBeVisible();
  await expect(page.locator('[data-category="calatoria"] img')).toHaveCount(25);
  await expect(page.locator('[data-category="calatoria"] img').first()).toHaveAttribute('src',/images\/calatoria\/1-cititor\.jpg$/);
});

test('gallery filters preserve original category membership and keyboard operation', async ({page})=>{
  await page.goto('./');
  await page.getByRole('button',{name:'DIN CARTE',exact:true}).click();
  await expect(page.locator('[data-category="din-carte"]:visible')).toHaveCount(8);
  await expect(page.locator('[data-category="calatoria"]:visible')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'DIN CARTE',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'PRIETENI',exact:true}).press('Enter');
  await expect(page.locator('[data-category="prieteni"]:visible')).toHaveCount(1);
  await expect(page.locator('[data-category="prieteni"] img')).toHaveAttribute('alt',/Noah/);
  await page.getByRole('button',{name:'CALATORIA',exact:true}).press('Space');
  await expect(page.locator('[data-category="calatoria"]:visible')).toHaveCount(25);
});

test('project and privacy navigation stays inside the configured base path',async ({page,baseURL})=>{
  await page.goto('./');
  await page.getByRole('link',{name:'Despre proiect',exact:true}).click();
  await expect(page).toHaveURL(new URL('despre-proiect/',baseURL!).href);
  await expect(page.getByRole('heading',{name:'Nati si ImagiNatie'})).toBeVisible();
  await expect(page.getByText('Vlad Mihanta — autorul')).toBeVisible();
  await page.getByRole('link',{name:'Exploreaza ImagiNatie'}).click();
  await expect(page).toHaveURL(baseURL!);
  await page.goto('politica-de-confidentialitate/');
  await expect(page.getByRole('heading',{level:1})).toContainText(/confiden/i);
});

for(const width of [375,768,1440]) test(`images decode locally with no overflow at ${width}px`,async ({page,baseURL})=>{
  await page.setViewportSize({width,height:900});
  const remote:string[]=[];
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(baseURL!).origin) remote.push(r.url());});
  await page.goto('./');
  for(const category of ['CALATORIA','DIN CARTE','PRIETENI']) {
    await page.getByRole('button',{name:category,exact:true}).click();
    const imgs=page.locator('.gallery-item:visible img');
    for(const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty('complete',true);
      expect(await img.evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  for(const route of ['despre-proiect/','politica-de-confidentialitate/']) {
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  expect(remote).toEqual([]);
});
