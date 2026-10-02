import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, relative, dirname, extname, sep } from 'node:path';
import * as cheerio from 'cheerio';

const root = resolve(process.argv[2] || 'dist');
const base = `/${(process.env.PUBLIC_BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
let checked = 0;
async function checkResource(url, file) {
  if (!url || url.startsWith('data:') || url.startsWith('#')) return;
  if (/^(https?:)?\/\//i.test(url)) throw new Error(`Remote resource in ${relative(root,file)}: ${url}`);
  const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
  let target;
  if (pathname.startsWith('/')) {
    if (!pathname.startsWith(base)) throw new Error(`Wrong base path in ${relative(root,file)}: ${url}`);
    target = resolve(root, pathname.slice(base.length));
  } else target = resolve(dirname(file), pathname);
  if (relative(root,target).startsWith(`..${sep}`)) throw new Error(`Resource outside build: ${url}`);
  await access(target).catch(()=>{throw new Error(`Missing local resource in ${relative(root,file)}: ${url}`);});
  checked++;
}
async function walk(directory) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    if (entry.name === 'legacy' || entry.name.startsWith('.env')) throw new Error(`Reference/private file in build: ${entry.name}`);
    const file = resolve(directory,entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!['.html','.css','.js'].includes(extname(file))) continue;
    const text = await readFile(file,'utf8');
    if (/https?:\/\/(?:www\.)?carteaimaginatie\.ro(?:\/|["'])/i.test(text)) throw new Error(`Original-site runtime URL in ${relative(root,file)}`);
    if (/wp-content\/plugins|wp-includes|jquery|ninja-forms|elementor\/assets/i.test(text)) throw new Error(`Legacy runtime in ${relative(root,file)}`);
    if (extname(file)==='.html') {
      const $=cheerio.load(text);
      for (const element of $('img[src],script[src],source[src],video[src],audio[src],video[poster],link[rel="stylesheet"],link[rel="icon"],link[rel="preload"]').toArray()) {
        const e=$(element);
        await checkResource(e.attr('src') || e.attr('href') || e.attr('poster'),file);
      }
      for(const element of $('[srcset]').toArray()) {
        for(const value of $(element).attr('srcset').split(',')) await checkResource(value.trim().split(/\s+/)[0],file);
      }
    }
    if (extname(file)==='.css') for(const match of text.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) await checkResource(match[1],file);
  }
}
try { await walk(root); console.log(`Build verified: ${checked} local resource references; no original-site runtime dependencies.`); }
catch(error) { console.error(error.message); process.exitCode=1; }
