import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, basename } from 'node:path';
import * as cheerio from 'cheerio';
import sharp from 'sharp';

const origin = 'https://carteaimaginatie.ro';
async function download(url, destination) {
  const parsed = new URL(url);
  if (![origin, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'].includes(parsed.origin)) {
    throw new Error(`Unapproved capture origin: ${parsed.origin}`);
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, buffer);
  return buffer;
}
const home = cheerio.load(await readFile('legacy/index.html', 'utf8'));
const records = [];
for (const element of home('.eael-filterable-gallery-item-wrap').toArray()) {
  const item = home(element);
  const category = item.attr('class').match(/eael-cf-(\S+)/)[1];
  const sourceUrl = item.find('img').attr('src');
  const localPath = `images/${category}/${basename(new URL(sourceUrl).pathname)}`;
  const buffer = await download(sourceUrl, `public/${localPath}`);
  const { width, height, format } = await sharp(buffer).metadata();
  if (!width || !height || format !== 'jpeg') throw new Error(`Invalid image: ${sourceUrl}`);
  records.push({ category, title: item.find('.fg-item-title').text().trim(), sourceUrl, localPath, width, height, order: records.filter(r => r.category === category).length });
}
for (const [category, count] of Object.entries({calatoria:25,'din-carte':8,prieteni:1})) {
  if (records.filter(r=>r.category===category).length !== count) throw new Error(`Wrong count: ${category}`);
}
const documents = {};
for (const slug of ['despre-proiect', 'politica-de-confidentialitate']) {
  const $ = cheerio.load(await readFile(`legacy/${slug}.html`, 'utf8'));
  const content = $('.entry-content');
  const container = content.length ? content : $('[data-elementor-id]').first();
  const images = [];
  for (const image of container.find('img').toArray()) {
    const src = $(image).attr('src');
    if (!src || !src.startsWith(origin)) continue;
    const localPath = `images/project/${basename(new URL(src).pathname)}`;
    const buffer = await download(src, `public/${localPath}`);
    const { width, height } = await sharp(buffer).metadata();
    images.push({ sourceUrl:src, localPath, width, height });
  }
  // Preserve text and inline semantic markup, never the original script/runtime.
  const blocks = container.find('h1,h2,h3,h4,p,ul,ol').filter((_,e)=>!$(e).parents('script,style,nav,ul,ol').length).map((_,e)=>{
    const clone = $(e).clone();
    clone.find('script,style').remove();
    clone.find('*').each((_,n)=>{ for(const a of Object.keys(n.attribs ?? {})) if(a!=='href') delete n.attribs[a]; });
    for(const a of Object.keys(clone[0].attribs ?? {})) delete clone[0].attribs[a];
    return clone.text().trim() ? $.html(clone) : null;
  }).get();
  const projectParagraphs=container.find('.elementor-text-editor > span').map((_,e)=>$(e).text().replace(/\s+/g,' ').trim()).get();
  documents[slug] = { blocks, images, projectParagraphs };
}
await mkdir('src/data', { recursive:true });
await writeFile('legacy/manifest.json', JSON.stringify({ captured:'2026-10-02', records, documents },null,2)+'\n');
const data = records.map(({sourceUrl,localPath,...r})=>({...r,src:localPath}));
await writeFile('src/data/gallery.json', JSON.stringify(data,null,2)+'\n');
await writeFile('legacy/documents.json', JSON.stringify(documents,null,2)+'\n');
await writeFile('src/data/project.json',JSON.stringify({paragraphs:documents['despre-proiect'].projectParagraphs},null,2)+'\n');
const privacy=cheerio.load(documents['politica-de-confidentialitate'].blocks.join(''));
await writeFile('src/data/privacy.json',JSON.stringify({text:privacy('p').last().text().replace(/\s+/g,' ').trim()},null,2)+'\n');
// Capture only required styles as inspection material.
for(const $link of home('link[rel="stylesheet"]').toArray()) {
  const href=home($link).attr('href');
  if(href?.startsWith(origin) && /post-(58|169|274|398)\.css|global\.css|popup\.css|essential-addons.*\.css/.test(href)) {
    await download(href,`legacy/styles/${basename(new URL(href).pathname)}`);
  }
}
const fontCss = await download('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap','legacy/fonts.css');
const fontSources=[...fontCss.toString().matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m=>m[1]);
const fontManifest=[];
for(const [i,url] of [...new Set(fontSources)].entries()) {
  const path=`fonts/font-${i}${new URL(url).pathname.endsWith('.ttf') ? '.ttf' : '.woff2'}`;
  await download(url,`public/${path}`);
  fontManifest.push({ sourceUrl:url, localPath:path });
}
await writeFile('legacy/font-manifest.json',JSON.stringify(fontManifest,null,2)+'\n');
console.log(`Captured ${records.length} gallery images; documents: ${Object.keys(documents).join(', ')}; ${fontManifest.length} fonts.`);
