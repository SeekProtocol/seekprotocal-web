#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * Blog translations: export the English source and check every translation.
 *
 *   node --experimental-strip-types scripts/i18n/blog-translations.mjs export
 *       writes content/blog/en.json from lib/blog-data.ts (the English source
 *       of truth; en.json is the file translators work from, regenerate it
 *       after editing a post)
 *   node --experimental-strip-types scripts/i18n/blog-translations.mjs check [lang...]
 *       every content/blog/<lang>.json must have every post, the same number of
 *       paragraphs, the same markdown link targets, and no dash as punctuation
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = join(root, 'content', 'blog');
const FIELDS = ['title', 'excerpt', 'content', 'imageAlt', 'readTime', 'category'];
const DASH = /[–—]|\s-\s|^-\s|\s-$/;

const mode = process.argv[2];
if (mode === 'export') {
  const { blogPosts } = await import(join(root, 'lib', 'blog-data.ts'));
  const out = {};
  for (const post of blogPosts) out[post.slug] = Object.fromEntries(FIELDS.map((f) => [f, post[f]]));
  writeFileSync(join(dir, 'en.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`exported ${blogPosts.length} posts`);
  process.exit(0);
}
if (mode !== 'check') { console.error('usage: export | check [lang...]'); process.exit(2); }

const en = JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8'));
const wanted = process.argv.slice(3);
const langs = (wanted.length ? wanted : readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))).filter((l) => l !== 'en');
const links = (s) => [...String(s).matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]).join('|');
let problems = 0;
const report = (l, p, m) => { problems++; console.log(`${l}: ${p}: ${m}`); };
for (const l of langs) {
  let cur;
  try { cur = JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8')); } catch (e) { report(l, '', `unreadable: ${e.message}`); continue; }
  for (const [slug, ref] of Object.entries(en)) {
    const post = cur[slug];
    if (!post) { report(l, slug, 'missing post'); continue; }
    for (const f of FIELDS) {
      const a = ref[f], b = post[f];
      if (Array.isArray(a)) {
        if (!Array.isArray(b) || b.length !== a.length) { report(l, `${slug}.${f}`, `paragraphs ${b?.length} != ${a.length}`); continue; }
        a.forEach((x, i) => {
          if (typeof b[i] !== 'string' || !b[i].trim()) report(l, `${slug}.${f}[${i}]`, 'empty');
          else {
            if (DASH.test(b[i])) report(l, `${slug}.${f}[${i}]`, 'uses a dash as punctuation');
            if (links(x) !== links(b[i])) report(l, `${slug}.${f}[${i}]`, `links ${links(b[i])} != ${links(x)}`);
          }
        });
      } else if (typeof b !== 'string' || !b.trim()) report(l, `${slug}.${f}`, 'missing');
      else if (DASH.test(b)) report(l, `${slug}.${f}`, 'uses a dash as punctuation');
    }
    for (const k of Object.keys(post)) if (!FIELDS.includes(k)) report(l, `${slug}.${k}`, 'unknown field');
  }
  for (const slug of Object.keys(cur)) if (!(slug in en)) report(l, slug, 'not an English post');
}
console.log(problems ? `${problems} problem(s)` : `ok: ${langs.length} language(s) match the English blog`);
process.exit(problems ? 1 : 0);
