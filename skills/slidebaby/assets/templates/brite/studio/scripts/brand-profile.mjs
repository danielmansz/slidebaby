#!/usr/bin/env node
/* Optional, portable shared-chrome settings. No installs, network fetches or deck edits. */
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {args, hash} from './source.mjs';
import {ingestImage, validateAssetRecord} from './ingest-image.mjs';

const studio = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, allowed, label) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) throw Error(`Invalid ${label} fields.`);
}
async function catalogFor(project = studio) {
  const context = vm.createContext({window: {}, structuredClone});
  for (const file of ['samples/brite.js', 'catalog.js']) vm.runInContext(await fs.readFile(path.join(project, file), 'utf8'), context, {filename: file});
  return context.window.BriteCatalog;
}
async function validateProfile(profile, {saved = false, project = studio} = {}) {
  keys(profile, saved ? ['schemaVersion', 'name', 'chrome', 'assets'] : ['schemaVersion', 'name', 'chrome'], 'brand profile');
  if (profile.schemaVersion !== 1 || typeof profile.name !== 'string' || !profile.name.trim() || !Object.hasOwn(profile, 'chrome')) throw Error('Use schemaVersion:1, a nonempty name and explicit chrome settings.');
  const issues = (await catalogFor(project)).validateChrome(profile.chrome);
  if (issues.length) throw Error(issues.map(issue => issue.message).join(' '));
  if (saved && profile.assets !== undefined && !Array.isArray(profile.assets)) throw Error('Profile assets must be an array.');
  return structuredClone(profile);
}
async function unusedOutput(output) {
  try { await fs.lstat(output); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  throw Error('Output already exists. Choose a NEW profile directory; nothing was overwritten.');
}
function localPath(value, base) {
  if (typeof value !== 'string' || !value.trim() || /^[a-z][a-z\d+.-]*:/i.test(value) || value.includes('\0')) throw Error('Supply a local logo path, not a URL or data URI.');
  return path.resolve(base, value);
}
async function rasterRuntime(options) {
  let modulePath = options['playwright-module'];
  if (!modulePath && options['module-root']) modulePath = createRequire(import.meta.url).resolve(path.join(path.resolve(options['module-root']), 'playwright'));
  if (!modulePath || !options['browser-executable']) throw Error('Raster logos need existing --playwright-module (or --module-root) and --browser-executable paths. Nothing was installed.');
  const module = await import(pathToFileURL(path.resolve(modulePath)).href);
  const chromium = module.chromium || module.default?.chromium;
  if (!chromium?.launch) throw Error('The existing Playwright module does not expose Chromium.');
  return {chromium, executablePath: path.resolve(options['browser-executable'])};
}

export async function saveBrandProfile({input, output, project = studio, ...options}) {
  if (!input || !output) throw Error('Use --input JSON --output NEW-directory.');
  const inputPath = path.resolve(input), outputPath = path.resolve(output);
  await unusedOutput(outputPath);
  const profile = await validateProfile(JSON.parse(await fs.readFile(inputPath, 'utf8')), {project});
  const brand = profile.chrome?.brand;
  let original, runtime = {};
  if (brand?.kind === 'image') {
    original = localPath(brand.src, path.dirname(inputPath));
    if (path.extname(original).toLowerCase() !== '.svg') runtime = await rasterRuntime(options);
  }
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.mkdir(outputPath);
  if (original) {
    const asset = await ingestImage({original, root: outputPath, ...runtime});
    validateAssetRecord(asset);
    profile.chrome.brand.src = asset.path;
    profile.assets = [asset];
  }
  const savedPath = path.join(outputPath, 'brand-profile.json');
  await fs.writeFile(savedPath, JSON.stringify(profile, null, 2) + '\n', {flag: 'wx'});
  return {saved: true, profile: savedPath, name: profile.name, chrome: (await loadBrandProfile(savedPath, {project})).chrome};
}

export async function loadBrandProfile(input, {project = studio} = {}) {
  const profilePath = path.resolve(input);
  const profile = await validateProfile(JSON.parse(await fs.readFile(profilePath, 'utf8')), {saved: true, project});
  const brand = profile.chrome?.brand, assets = profile.assets || [];
  if (brand?.kind === 'image') {
    if (assets.length !== 1 || assets[0]?.path !== brand.src) throw Error('The profile logo must have exactly one matching asset/provenance record.');
    const asset = assets[0];
    keys(asset, ['path', 'sha256', 'source', 'optimization'], 'logo asset');
    const originalPath = asset.source?.path;
    const absoluteOriginal = typeof originalPath === 'string' && (path.posix.isAbsolute(originalPath) || path.win32.isAbsolute(originalPath));
    if (!/^[a-f\d]{64}$/.test(asset.sha256 || '') || !asset.optimization || !object(asset.source) || !absoluteOriginal || !Number.isInteger(asset.source.bytes) || asset.source.bytes < 1) throw Error('Invalid original logo provenance.');
    validateAssetRecord(asset);
    const logoPath = localPath(asset.path, path.dirname(profilePath));
    const realRoot = await fs.realpath(path.dirname(profilePath)), realLogo = await fs.realpath(logoPath);
    const relative = path.relative(realRoot, realLogo);
    if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) throw Error('The profile logo must remain inside its profile folder.');
    const bytes = await fs.readFile(realLogo);
    if (hash(bytes) !== asset.sha256 || bytes.length !== asset.optimization.bytes) throw Error('Profile logo hash/size mismatch. Preserve the earlier profile and create a new one.');
    if (asset.optimization.engine === 'vector-preserved') {
      const svg = bytes.toString('utf8');
      if (!/<svg\b/i.test(svg) || /<(?:script|foreignObject)\b|(?:href|src)\s*=\s*["'](?!#)|<!ENTITY|@import|url\(\s*["']?(?!#)/i.test(svg)) throw Error('Profile SVG must be self-contained and inactive.');
    } else if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw Error('Profile raster derivative must be WebP.');
    profile.chrome.brand.src = realLogo;
  } else if (assets.length) throw Error('Unexpected logo asset in a profile without an image brand.');
  return {valid: true, profile: profilePath, name: profile.name, chrome: profile.chrome};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = args(['input', 'output', 'profile', 'project', 'module-root', 'playwright-module', 'browser-executable']);
    if (options.profile) {
      if (Object.keys(options).some(key => !['profile', 'project'].includes(key))) throw Error('--profile is read-only; use only --profile saved-profile.json [--project studio].');
      console.log(JSON.stringify(await loadBrandProfile(options.profile, {project: options.project}), null, 2));
    } else console.log(JSON.stringify(await saveBrandProfile(options), null, 2));
  } catch (error) {
    console.error(JSON.stringify({valid: false, error: error.message}));
    process.exitCode = 1;
  }
}
