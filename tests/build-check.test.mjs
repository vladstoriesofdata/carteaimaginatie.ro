import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function scan(html, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'imaginatie-build-'));
  try {
    writeFileSync(join(dir, 'index.html'), html);
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
    return spawnSync(process.execPath, ['scripts/check-build.mjs', dir], { encoding:'utf8', env:{...process.env,PUBLIC_BASE_PATH:'/carteaimaginatie.ro/'} });
  } finally { rmSync(dir, {recursive:true,force:true}); }
}
test('build check accepts local resources under the repository base',()=>{
  const result=scan('<img src="/carteaimaginatie.ro/image.svg"><a href="https://vladmihanta.gumroad.com/">Book</a>',{'image.svg':'<svg></svg>'});
  assert.equal(result.status,0,result.stderr);
});
test('build check rejects externally hosted image dependencies',()=>{
  const result=scan('<img src="https://images.example.test/art.jpg">');
  assert.equal(result.status,1);
  assert.match(result.stderr,/remote resource/i);
});
test('build check rejects root asset paths in a repository deployment',()=>{
  const result=scan('<img src="/image.svg">',{'image.svg':'<svg></svg>'});
  assert.equal(result.status,1);
  assert.match(result.stderr,/base path/i);
});
test('build check rejects CSS font dependencies on a CDN',()=>{
  const result=scan('<link rel="stylesheet" href="/carteaimaginatie.ro/style.css">',{'style.css':'@font-face{src:url(https://fonts.gstatic.com/font.woff2)}'});
  assert.equal(result.status,1);
  assert.match(result.stderr,/remote resource/i);
});
test('build check rejects original-site URLs in bundled runtime code',()=>{
  const result=scan('<script src="/carteaimaginatie.ro/site.js"></script>',{'site.js':'fetch("https://carteaimaginatie.ro/wp-json/submissions")'});
  assert.equal(result.status,1);
  assert.match(result.stderr,/original-site runtime/i);
});
test('custom-domain metadata does not imply an original-site runtime dependency',()=>{
  const result=scan('<link rel="canonical" href="https://carteaimaginatie.ro/"><meta property="og:image" content="https://carteaimaginatie.ro/image.svg"><img src="/carteaimaginatie.ro/image.svg">',{'image.svg':'<svg></svg>'});
  assert.equal(result.status,0,result.stderr);
});
