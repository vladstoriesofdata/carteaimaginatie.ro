import {test,expect} from '@playwright/test';

test('static metadata and machine-readable routes honor the deployment base',async ({page,request,baseURL})=>{
  const site=process.env.PUBLIC_SITE_URL||'https://vladstoriesofdata.github.io';
  const base=process.env.PUBLIC_BASE_PATH||'/';
  await page.goto('./');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(base,site).href);
  const favicon=page.locator('link[rel="icon"]');
  await expect(favicon).toHaveAttribute('href',`${base}favicon.svg`);
  expect((await request.get(new URL('favicon.svg',baseURL!).href)).status()).toBe(200);
  const robots=await request.get('robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(new URL(`${base}sitemap-index.xml`,site).href);
  const sitemap=await request.get('sitemap-0.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain(new URL(`${base}despre-proiect/`,site).href);
  await page.goto('404.html');
  await expect(page.getByRole('heading',{name:'Pagina nu a fost găsită'})).toBeVisible();
  await page.getByRole('link',{name:'Exploreaza ImagiNatie'}).click();
  await expect(page).toHaveURL(baseURL!);
});
