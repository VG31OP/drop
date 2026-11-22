#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = fs.existsSync('drop/web') ? path.resolve('drop/web') : process.cwd();

let hasError = false;

function check(desc, condition) {
  if (condition) {
    console.log(`[PASS] ${desc}`);
  } else {
    console.error(`[FAIL] ${desc}`);
    hasError = true;
  }
}

console.log('=== DROP.VG SEO & IDENTITY VALIDATION ===');

// 1. Validate index.html
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
check('index.html exists', fs.existsSync(indexHtmlPath));

if (fs.existsSync(indexHtmlPath)) {
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  check('Canonical URL points to https://drop.shiroya.in/', html.includes('<link rel="canonical" href="https://drop.shiroya.in/"'));
  check('Meta author attributes Vraj Shiroya', html.includes('content="Vraj Shiroya"'));
  check('OpenGraph title present', html.includes('property="og:title"'));
  check('Twitter card present', html.includes('name="twitter:card"'));

  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  check('JSON-LD script block exists', !!jsonLdMatch);
  if (jsonLdMatch) {
    try {
      const data = JSON.parse(jsonLdMatch[1]);
      check('JSON-LD uses https://schema.org', data['@context'] === 'https://schema.org');
      const graph = data['@graph'] || [];
      const app = graph.find(e => e['@type'] === 'WebApplication');
      check('WebApplication schema present', !!app);
      check('App references creator Vraj Shiroya', !!(app && (app.author?.name === 'Vraj Shiroya' || app.author?.['@id'] === 'https://vraj.shiroya.in/#person')));
    } catch (e) {
      check(`JSON-LD parses cleanly (${e.message})`, false);
    }
  }
}

// 2. Validate robots.txt
const robotsPath = path.join(ROOT_DIR, 'public/robots.txt');
check('robots.txt exists', fs.existsSync(robotsPath));
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, 'utf8');
  check('robots.txt specifies correct sitemap', robots.includes('Sitemap: https://drop.shiroya.in/sitemap.xml'));
}

// 3. Validate sitemap.xml
const sitemapPath = path.join(ROOT_DIR, 'public/sitemap.xml');
check('sitemap.xml exists', fs.existsSync(sitemapPath));
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  check('sitemap.xml contains https://drop.shiroya.in/', sitemap.includes('https://drop.shiroya.in/'));
}

// 4. Validate llms.txt
const llmsPath = path.join(ROOT_DIR, 'public/llms.txt');
check('llms.txt exists', fs.existsSync(llmsPath));
if (fs.existsSync(llmsPath)) {
  const llms = fs.readFileSync(llmsPath, 'utf8');
  check('llms.txt attributes Vraj Shiroya and links to portfolio', llms.includes('https://vraj.shiroya.in/'));
}

if (hasError) {
  process.exitCode = 1;
} else {
  console.log('All DROP.VG SEO & identity checks passed cleanly!\n');
}
