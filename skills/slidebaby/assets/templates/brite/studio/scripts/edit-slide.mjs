#!/usr/bin/env node
import{assertProjectDesign,assertWritableProject,visualTemplate}from'./design.mjs';
import{legalFiles,assertLegalCompatibility,completeFontNotices}from'./legal-notices.mjs';
/* Check in staging, then update the current project with recoverable internal history. */
import fs from'node:fs/promises';import path from'node:path';import crypto from'node:crypto';import{fileURLToPath,pathToFileURL}from'node:url';import{spawnSync}from'node:child_process';
import{ingestImage}from'./ingest-image.mjs';
import{args,hash}from'./source.mjs';import{loadCatalog}from'./check-plan.mjs';import{applySlideEdit,contentHash,verifyNormalizedInput}from'./edit-core.mjs';import{exists,readDeck,verifyDocument}from'./verify-document.mjs';
import{applyDeckEdit,verifyDeckNormalizedInput}from'./deck-edit-core.mjs';
import{lockProject,unlockProject,captureProject,publishProject,currentHtml}from'./publish.mjs';
const o=args(['project','slide','input','output','scratch','studio','playwright-module','pdf-lib-module','browser-executable','allow-additional-slides','lang']);
if(o['allow-additional-slides']!=null&&!['true','false'].includes(o['allow-additional-slides']))throw Error('Use --allow-additional-slides true or false.');
if(o.lang!=null&&!['en','pl'].includes(o.lang))throw Error('Use --lang en or pl.');
for(const key of ['project','input','playwright-module','pdf-lib-module','browser-executable'])if(!o[key])throw new Error(`Missing --${key}. Read EDITING_WORKFLOW.md.`);
const helperStudio=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),project=await fs.realpath(o.project),output=path.resolve(o.output||project),inPlace=output===project,scratch=path.resolve(o.scratch||path.join(project,'.brite/work'));
let studio=await fs.realpath(o.studio||project);
await assertWritableProject(output);await assertProjectDesign(project);await assertProjectDesign(studio);
if(!inPlace&&await exists(output))throw new Error('A separate copy needs a new output folder. Omit --output to update the current project.');
if(inPlace&&path.basename(project)==='studio'&&path.basename(path.dirname(project))==='assets'&&await exists(path.resolve(project,'../../SKILL.md')))throw Error('Keep the installed skill starter unchanged. Create a presentation project before editing it.');
for(const folder of [project,studio])if((!inPlace&&output.startsWith(folder+path.sep))||scratch===folder||(scratch.startsWith(folder+path.sep)&&scratch!==path.join(project,'.brite/work')))throw new Error('Use the default internal work folder or scratch outside the source project/skill.');
const lock=await lockProject(project);
let stage,completed=false;
try{
const expected=inPlace?await captureProject(project):null;
if(inPlace)await (await import('./make-preview.mjs')).assertExportTargets(project);
async function safeTree(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(folder===project&&entry.name==='.brite')continue;if(entry.isSymbolicLink())throw new Error(`Symbolic links are outside this revision workflow: ${file}`);if(entry.isDirectory())await safeTree(file);}}
await safeTree(project);await verifyDocument(project);await assertLegalCompatibility(project,helperStudio);
const inputBytes=await fs.readFile(path.resolve(o.input)),operation=JSON.parse(inputBytes),normalized=structuredClone(operation),parent=await readDeck(path.join(project,'presentation.js'));
const operations=o.slide?[normalized]:(normalized.slides||[]).map(s=>s.edit).filter(Boolean);
const latestCatalog=await loadCatalog(helperStudio),requests=o.slide?[{id:o.slide,edit:normalized}]:(normalized.slides||[]);
const newProjection=!!normalized.splitSlides||requests.some(({id,edit})=>{
 if(!edit)return false;const item=parent.slides.find(s=>s.id===id),target=latestCatalog.entries.find(e=>e.id===edit.template);
 return(item&&target&&item.layout!==target.family)||edit.addCards?.some(c=>!c.title||!c.description)||edit.updateCards?.some(c=>c.title===null||c.description===null||c.title===''||c.description==='');
});
// A new layout operation can opt into the additive v24 renderer on v23 projects.
// Other saved runtimes remain deliberate --studio upgrades.
if(!o.studio&&newProjection){const source=await fs.readFile(path.join(project,'engine.js'),'utf8'),version=Number(source.match(/brite-studio-(\d+)/)?.[1]);if(![23,24].includes(version))throw Error('This layout operation needs an explicit compatible --studio upgrade for the older saved runtime.');studio=await fs.realpath(helperStudio);}
if(!o.slide&&Object.hasOwn(normalized,'slideEntrance')){
 const viewerCss=await fs.readFile(path.join(studio,'app.css'),'utf8');
 if(!viewerCss.includes('.presenting:not(.slide-entrance-disabled)'))throw Error('This viewer predates the slideEntrance setting. Use an explicit compatible --studio upgrade before saving this change.');
}
if(!inPlace&&output.startsWith(studio+path.sep))throw Error('Keep output outside the installed studio.');
for(const operation of operations)if(Array.isArray(operation.addCards))for(const card of operation.addCards)card.id??=`card-${crypto.randomUUID()}`;
await fs.mkdir(scratch,{recursive:true});const scratchStat=await fs.lstat(scratch);if(!scratchStat.isDirectory()||scratchStat.isSymbolicLink())throw Error('Scratch must be a real directory.');stage=await fs.mkdtemp(path.join(scratch,'brite-edit-'));const root=path.join(stage,'presentation');
await fs.writeFile(path.join(stage,'owner.json'),JSON.stringify({kind:'brite-edit-staging',project}),{flag:'wx'});
// Parent outputs remain intact. Carry replayable source/history, not every old derived PDF/HTML.
await fs.mkdir(root);
for(const name of await fs.readdir(project)){
 if(name==='.brite'||name==='exports'||name===currentHtml||/^preview-\d{8}T\d{6}-[a-f\d]{6}\.html$/.test(name))continue;
 await fs.cp(path.join(project,name),path.join(root,name),{recursive:true,errorOnExist:true,force:false});
}
await fs.writeFile(path.join(root,'exports.js'),'/* New revision: the parent retains its prepared PDF. */\nwindow.BRITE_EXPORT=null;\n');
// Replace only code in the new staging copy; merge asset copies without overwriting a differing existing file.
const runtime=['index.html','assets/IMAGE_OPTIMIZATION.json','assets/fonts.css','app.js','app.css','engine.js','slides.css','catalog.js','i18n.js','changelog.js','AGENTS.md','AGENT_GUIDE.md','README.md','TEMPLATE_CONTRACTS.md','SOURCE_TO_DECK.md','SHARED_SLIDE_ELEMENTS.md','EDITING_WORKFLOW.md','BRAND_PROFILE.md','ASSET_GUIDANCE.md','NARRATIVE.md','WEBPAGE.md','DELIVERY.md','LIVE_PREVIEW.md','PRODUCT_RELEASES.md','PALETTES.md','BACKGROUND_IMAGES.md','REFLOW.md',...legalFiles,'samples','scripts'];
for(const name of runtime){const from=name==='scripts'||name==='changelog.js'||name.endsWith('.md')||legalFiles.includes(name)?path.join(helperStudio,name):path.join(studio,name);await fs.cp(from,path.join(root,name),{recursive:true,force:true});}
async function mergeAssets(from,to){await fs.mkdir(to,{recursive:true});for(const entry of await fs.readdir(from,{withFileTypes:true})){const source=path.join(from,entry.name),target=path.join(to,entry.name);if(entry.isSymbolicLink())throw new Error('Runtime asset links are not supported.');if(entry.isDirectory())await mergeAssets(source,target);else if(await exists(target)){if(hash(await fs.readFile(source))!==hash(await fs.readFile(target)))throw new Error(`An existing asset differs from the skill: ${target}. Source retained; do not overwrite it.`);}else await fs.copyFile(source,target);}}
await mergeAssets(path.join(studio,'assets'),path.join(root,'assets'));await completeFontNotices(helperStudio,root);
const renderer=(await fs.readFile(path.join(root,'engine.js'),'utf8')).match(/brite-studio-\d+/)?.[0];if(!renderer)throw Error('Unknown Brite renderer.');
await fs.writeFile(path.join(root,'visual-template.json'),JSON.stringify({schemaVersion:1,...visualTemplate,renderer,deckIdentityRequired:parent.visualTemplate!==undefined},null,2));
const assets=[];
async function imagePath(container,key){
 if(typeof container[key]!=='string'||/^[a-z][a-z\d+.-]*:/i.test(container[key]))throw new Error('Supply a local image file, not a URL.');
 const source=path.resolve(project,container[key]),playwright=await import(pathToFileURL(path.resolve(o['playwright-module'])).href),chromium=playwright.chromium||playwright.default?.chromium;if(!chromium?.launch)throw new Error('The supplied Playwright module does not expose Chromium.');
 const record=await ingestImage({original:source,root,chromium,executablePath:path.resolve(o['browser-executable'])});record.inputPath=container[key];record.inputBase=project;container[key]=record.path;assets.push(record);
}
async function brand(settings){if(settings?.brand?.kind==='image')await imagePath(settings.brand,'src');}
for(const operation of operations){if(operation.image&&typeof operation.image==='object')await imagePath(operation.image,'src');if(operation.background&&typeof operation.background==='object')await imagePath(operation.background,'src');}
if(!o.slide){
 await brand(normalized.chrome);
 for(const item of normalized.slides||[])await brand(item.chrome);
 for(const item of normalized.addSlides||[]){const content=item.content||{};if(content.image)await imagePath(content,'image');if(content.background)await imagePath(content.background,'src');for(const image of content.images||[])await imagePath(image,'src');await brand(content.chrome);}
}
(o.slide?verifyNormalizedInput:verifyDeckNormalizedInput)(operation,normalized,assets,{requireAssetBinding:true});
const catalog=await loadCatalog(root),{deck,report}=o.slide?applySlideEdit(parent,o.slide,normalized,catalog):applyDeckEdit(parent,normalized,catalog),rev=crypto.randomUUID(),editDir=path.join(root,'edits');await fs.mkdir(editDir,{recursive:true});

let manifest;
if(await exists(path.join(editDir,'manifest.json')))manifest=JSON.parse(await fs.readFile(path.join(editDir,'manifest.json'),'utf8'));
else{const bytes=await fs.readFile(path.join(project,'presentation.js'));await fs.writeFile(path.join(editDir,'base-presentation.js'),bytes,{flag:'wx'});manifest={schemaVersion:1,baseFileHash:hash(bytes),revisions:[]};}
const inputFile=`input-${rev}.json`;await fs.writeFile(path.join(editDir,inputFile),inputBytes,{flag:'wx'});
const record={schemaVersion:1,normalizationVersion:2,...(o.slide?{slideId:o.slide}:{scope:'deck'}),beforeHash:contentHash(parent),afterHash:contentHash(deck),operation:normalized,assets,inputFile,inputHash:hash(inputBytes),report,parent:path.basename(project)};
const recordBytes=JSON.stringify(record,null,2),recordFile=`revision-${rev}.json`;await fs.writeFile(path.join(editDir,recordFile),recordBytes,{flag:'wx'});manifest.revisions.push({file:recordFile,sha256:hash(recordBytes)});
await fs.writeFile(path.join(editDir,'manifest.json'),JSON.stringify(manifest,null,2));
await fs.writeFile(path.join(root,'presentation.js'),'/* Validated later edit; original source and edit requests are retained. */\nwindow.BRITE_PRESENTATION='+JSON.stringify(deck,null,2)+';\n');
await verifyDocument(root);
const exported=spawnSync(process.execPath,[path.join(root,'scripts/export.mjs'),'--project',root,'--playwright-module',path.resolve(o['playwright-module']),'--pdf-lib-module',path.resolve(o['pdf-lib-module']),'--browser-executable',path.resolve(o['browser-executable'])],{encoding:'utf8'});
if(exported.status!==0){
 if((exported.stderr||'').includes('PDF export blocked:')){
  const {proposeRecovery}=await import('./recovery.mjs');const recovery=await proposeRecovery({draft:root,target:output,expectedTarget:expected,runtime:o,lang:o.lang,allowAdditionalSlides:o['allow-additional-slides']!=='false'});
  const error=new Error('The requested edit needs a reviewed reflow choice.');error.recovery=recovery;throw error;
 }
 throw new Error(`Edit did not fit or export. The parent project/PDF are unchanged. Draft preserved at ${root}. ${exported.stderr||exported.stdout}`);
}
const preview=JSON.parse(exported.stdout).preview;
await fs.writeFile(path.join(editDir,`result-${rev}.json`),JSON.stringify({report,export:JSON.parse(exported.stdout),preview},null,2),{flag:'wx'});
let published;
if(inPlace)published=await publishProject(root,project,{lock,expected});
else{await fs.mkdir(path.dirname(output),{recursive:true});await fs.mkdir(output);for(const name of await fs.readdir(root))if(name!=='.brite')await fs.cp(path.join(root,name),path.join(output,name),{recursive:true,errorOnExist:true,force:false});}
completed=true;
console.log(JSON.stringify({saved:true,inPlace,output,preview,html:path.join(output,preview),pdf:path.join(output,JSON.parse(exported.stdout).path),project:path.join(output,'index.html'),...report,history:published?.history??null,export:{...JSON.parse(exported.stdout),history:published?.history??null}},null,2));
}catch(error){if(error.recovery){console.log(JSON.stringify(error.recovery,null,2));process.exitCode=2;}else throw error;}finally{
 if(lock)await unlockProject(lock);
 // Only this operation's completed staging copies are disposable; failures retain diagnostics.
 if(completed&&stage&&path.dirname(stage)===scratch&&path.basename(stage).startsWith('brite-edit-')){const marker=JSON.parse(await fs.readFile(path.join(stage,'owner.json'),'utf8'));if(marker.kind==='brite-edit-staging'&&marker.project===project)await fs.rm(stage,{recursive:true,force:false}).catch(error=>console.error('Saved; temporary staging retained: '+error.message));}
}
