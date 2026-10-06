import {test,expect} from '@playwright/test';
const enabled=Boolean(process.env.PUBLIC_WEB3FORMS_ACCESS_KEY?.trim());
const endpoint='https://api.web3forms.com/submit';

test.beforeEach(async ({page})=>{
  // Never send test stories to the live service, even if a route is missing.
  await page.route(endpoint,route=>route.abort('blockedbyclient'));
});

test('dialog dismisses with Escape and restores trigger focus',async ({page})=>{
  await page.goto('./');
  const trigger=page.locator('[data-open-story]');
  await trigger.click();
  await expect(page.locator('#story-dialog')).toBeVisible();
  await expect(page.getByLabel('Nume',{exact:false})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#story-dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await page.getByRole('button',{name:'Închide'}).click();
  await expect(page.locator('#story-dialog')).not.toBeVisible();
});

test('unconfigured form cannot transmit a story or claim success',async ({page})=>{
  test.skip(enabled,'This test checks the build without an access key.');
  const outgoing:string[]=[];
  page.on('request',r=>{if(r.method()==='POST')outgoing.push(r.url());});
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await expect(page.getByRole('button',{name:'Trimite',exact:true})).toBeDisabled();
  await expect(page.locator('[data-form-status]')).toContainText('indisponibilă');
  await page.getByLabel('Nume').fill('Test');
  await page.getByLabel('Email').fill('reader@example.test');
  await page.getByRole('textbox',{name:'Trăznaia'}).fill('O poveste de verificare.');
  await page.getByLabel('Email').press('Enter');
  expect(outgoing).toEqual([]);
  await expect(page.locator('[data-form-status]')).not.toContainText('primit');
});

test('configured form validates required values before submitting',async ({page})=>{
  test.skip(!enabled,'Requires the separately built Web3Forms configuration.');
  let sent=false;
  await page.route(endpoint,route=>{sent=true;return route.fulfill({status:200,body:'{"success":true}'});});
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  expect(sent).toBe(false);
  await expect(page.getByLabel('Nume')).toBeFocused();
  await page.getByLabel('Nume').fill('Test');
  await page.getByLabel('Email').fill('invalid');
  await page.getByRole('textbox',{name:'Trăznaia'}).fill('O poveste.');
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  expect(sent).toBe(false);
  await expect(page.getByLabel('Email')).toBeFocused();
});

test('configured form sends consent choices and confirms actual receipt',async ({page})=>{
  test.skip(!enabled,'Requires the separately built Web3Forms configuration.');
  let payload:unknown;
  await page.route(endpoint,async route=>{
    payload=route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,body:{data:payload,message:'Email sent successfully!'}})});
  });
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await page.getByLabel('Nume').fill('Test Reader');
  await page.getByLabel('Email').fill('reader@example.test');
  await page.getByRole('textbox',{name:'Trăznaia'}).fill('O poveste de verificare.');
  await page.getByLabel('Vreau și ilustrație').check();
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  await expect(page.locator('[data-form-status]')).toContainText('primit');
  expect(payload).toEqual({access_key:process.env.PUBLIC_WEB3FORMS_ACCESS_KEY,subject:'O trăznaie nouă — Cartea Imaginație',botcheck:false,name:'Test Reader',email:'reader@example.test',story:'O poveste de verificare.',illustration:true,publicationConsent:false});
  await expect(page.getByRole('textbox',{name:'Trăznaia'})).toHaveValue('');
});

test('form locks submitted fields until a delayed response completes',async ({page})=>{
  test.skip(!enabled,'Requires the separately built Web3Forms configuration.');
  let release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route(endpoint,async route=>{
    await pending;
    await route.fulfill({status:200,body:'{"success":true}'});
  });
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await page.getByLabel('Nume').fill('Test Reader');
  await page.getByLabel('Email').fill('reader@example.test');
  const story=page.getByRole('textbox',{name:'Trăznaia'});
  await story.fill('Povestea trimisă.');
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  try {
    for(const field of await page.locator('#story-form input, #story-form textarea').all()) await expect(field).toBeDisabled();
  } finally { release(); }
  await expect(page.locator('[data-form-status]')).toContainText('primit');
  await expect(story).toHaveValue('');
  for(const field of await page.locator('#story-form input, #story-form textarea').all()) await expect(field).toBeEnabled();
});

for(const failure of ['400','429','500','network','rejected','malformed']) test(`form preserves entered story on ${failure} failure`,async ({page})=>{
  test.skip(!enabled,'Requires the separately built Web3Forms configuration.');
  await page.route(endpoint,route=>failure==='network'?route.abort('failed'):route.fulfill({status:['rejected','malformed'].includes(failure)?200:Number(failure),body:failure==='malformed'?'not json':'{"success":false,"message":"Submission rejected"}'}));
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await page.getByLabel('Nume').fill('Test Reader');
  await page.getByLabel('Email').fill('reader@example.test');
  await page.getByRole('textbox',{name:'Trăznaia'}).fill('Povestea trebuie păstrată.');
  await page.getByLabel('Puteți să afișați').check();
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  await expect(page.locator('[data-form-status]')).toContainText('nu a putut');
  await expect(page.getByRole('textbox',{name:'Trăznaia'})).toHaveValue('Povestea trebuie păstrată.');
  await expect(page.getByLabel('Puteți să afișați')).toBeChecked();
  await expect(page.getByRole('button',{name:'Trimite',exact:true})).toBeEnabled();
  await expect(page.getByRole('textbox',{name:'Trăznaia'})).toBeEnabled();
});

test('honeypot blocks a submission without discarding the story',async ({page})=>{
  test.skip(!enabled,'Requires the separately built Web3Forms configuration.');
  let sent=false;
  page.on('request',request=>{if(request.method()==='POST')sent=true;});
  await page.goto('./');
  await page.locator('[data-open-story]').click();
  await page.getByLabel('Nume').fill('Test Reader');
  await page.getByLabel('Email').fill('reader@example.test');
  const story=page.getByRole('textbox',{name:'Trăznaia'});
  await story.fill('Povestea trebuie păstrată.');
  const honeypot=page.locator('[name="botcheck"]');
  await expect(honeypot).toBeHidden();
  await honeypot.evaluate((field:HTMLInputElement)=>{field.checked=true;});
  await page.getByRole('button',{name:'Trimite',exact:true}).click();
  await expect(page.locator('[data-form-status]')).toContainText('nu a putut');
  expect(sent).toBe(false);
  await expect(story).toHaveValue('Povestea trebuie păstrată.');
});
