#!/usr/bin/env node
/**
 * Every locale must say what English says, in the same shape.
 *
 *   node scripts/i18n/validate-messages.mjs            all locales
 *   node scripts/i18n/validate-messages.mjs pt th      only these
 *
 * Checks, per locale against messages/en.json:
 *   - the same keys and the same array lengths, nothing missing, nothing extra
 *   - every string parses as ICU MessageFormat, with the same argument names
 *     and the same rich-text tags (<email>, ...) as English
 *   - no dash used as punctuation: no em or en dash, no " - " between words
 *     (a hyphen inside a word is fine). English is checked as well
 * Exits 1 on any problem, printing each one.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'messages');
const load = (l) => JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8'));
const en = load('en');
const wanted = process.argv.slice(2);
const locales = (wanted.length ? wanted : readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)))
  .filter((l) => l !== 'en');

function shape(ast, out = { args: new Set(), tags: new Set() }) {
  for (const el of ast) {
    if (el.type === TYPE.argument || el.type === TYPE.number || el.type === TYPE.date || el.type === TYPE.time) out.args.add(el.value);
    if (el.type === TYPE.plural || el.type === TYPE.select) {
      out.args.add(el.value);
      for (const opt of Object.values(el.options)) shape(opt.value, out);
    }
    if (el.type === TYPE.tag) { out.tags.add(el.value); shape(el.children, out); }
  }
  return out;
}
const DASH = /[\u2013\u2014]|\s-\s|^-\s|\s-$/;
const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

let problems = 0;
const report = (l, p, msg) => { problems++; console.log(`${l}: ${p}: ${msg}`); };

function walk(l, ref, cur, p) {
  if (typeof ref === 'string') {
    if (typeof cur !== 'string') return report(l, p, 'missing or not a string');
    if (DASH.test(cur)) report(l, p, 'uses a dash as punctuation');
    let a, b;
    try { a = shape(parse(ref)); } catch { return; }
    try { b = shape(parse(cur)); } catch (e) { return report(l, p, `ICU syntax: ${e.message}`); }
    if (!same(a.args, b.args)) report(l, p, `arguments ${[...b.args]} != ${[...a.args]}`);
    if (!same(a.tags, b.tags)) report(l, p, `tags ${[...b.tags]} != ${[...a.tags]}`);
    return;
  }
  if (Array.isArray(ref)) {
    if (!Array.isArray(cur) || cur.length !== ref.length) return report(l, p, `array length ${cur?.length} != ${ref.length}`);
    ref.forEach((v, i) => walk(l, v, cur[i], `${p}[${i}]`));
    return;
  }
  if (ref && typeof ref === 'object') {
    if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return report(l, p, 'missing object');
    for (const k of Object.keys(ref)) walk(l, ref[k], cur[k], p ? `${p}.${k}` : k);
    for (const k of Object.keys(cur)) if (!(k in ref)) report(l, p ? `${p}.${k}` : k, 'not in English');
    return;
  }
  if (cur !== ref) report(l, p, 'non-string value differs from English');
}

if (!wanted.length) {
  (function english(o, p) {
    if (typeof o === 'string') { if (DASH.test(o)) report('en', p, 'uses a dash as punctuation'); return; }
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) english(v, Array.isArray(o) ? `${p}[${k}]` : p ? `${p}.${k}` : k);
  })(en, '');
}

for (const l of locales) {
  let cur;
  try { cur = load(l); } catch (e) { report(l, '', `unreadable: ${e.message}`); continue; }
  walk(l, en, cur, '');
}
console.log(problems ? `${problems} problem(s)` : `ok: ${locales.length} locale(s) match English`);
process.exit(problems ? 1 : 0);
