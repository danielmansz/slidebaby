#!/usr/bin/env node
import{visualTemplate,assertDesign,assertProjectDesign,assertWritableProject}from'./design.mjs';
import{legalFiles,assertLegalCompatibility,completeFontNotices}from'./legal-notices.mjs';
/* Agent chooses semantics; this helper verifies coverage, fit, and a new output. */
import os from'node:os';
import{lockProject,unlockProject,captureProject,publishProject}from'./publish.mjs';
import{readDeck,verifyDocument,exists}from'./verify-document.mjs';
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';import{spawnSync}from'node:child_process';
import{ingestImage}from'./ingest-image.mjs';
import{defaultCardId}from'./edit-core.mjs';import{args,hash}from'./source.mjs';import{resolvePlan}from'./plan.mjs';import{loadCatalog}from'./check-plan.mjs';
const options=args(['source','plan','project','output','scratch','playwright-module','pdf-lib-module','browser-executable','allow-additional-slides','lang']);
if(options['allow-additional-slides']!=null&&!['true','false'].includes(options['allow-additional-slides']))throw Error('Use --allow-additional-slides true or false.');
if(options.lang!=null&&!['en','pl'].includes(options.lang))throw Error('Use --lang en or pl.');
for(const key of ['source','plan','output','playwright-module','pdf-lib-module','browser-executable'])if(!options[key])throw new Error(`Missing --${key}. Read the skill workflow. Existing local dependencies are required; nothing is installed.`);
const helperStudio=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.resolve(options.output),updating=await exists(output),project=await fs.realpath(options.project||(updating?output:helperStudio)),scratch=path.resolve(options.scratch||(updating?path.join(output,'.brite/work'):path.join(os.tmpdir(),'brite-build')));
await assertWritableProject(output);await assertProjectDesign(project);
if(updating)await assertProjectDesign(output);
if(updating){const stat=await fs.lstat(output);if(!stat.isDirectory()||stat.isSymbolicLink()||!await exists(path.join(output,'index.html'))||!await exists(path.join(output,'presentation.js'))||!await exists(path.join(output,'exports.js')))throw Error('An existing output must be the current Brite project. Keep other folders unchanged and choose a new project path.');if(path.basename(output)==='studio'&&await exists(path.resolve(output,'../../SKILL.md')))throw Error('Keep the installed skill starter unchanged. Choose a generated presentation project.');await readDeck(path.join(output,'presentation.js'));}
if(output.startsWith(project+path.sep)||scratch===project||(scratch.startsWith(project+path.sep)&&!(updating&&output===project&&scratch===path.join(output,'.brite/work'))))throw Error('Use the current project output and its internal work folder, or output/scratch outside the source studio.');
const lock=updating?await lockProject(output):null;let staging,completed=false;
try{
const expected=updating?await captureProject(output):null;if(updating){await verifyDocument(output);await assertLegalCompatibility(output,helperStudio);}await assertLegalCompatibility(project,helperStudio);
if(updating)await (await import('./make-preview.mjs')).assertExportTargets(output);
const source=JSON.parse(await fs.readFile(options.source,'utf8')),plan=JSON.parse(await fs.readFile(options.plan,'utf8'));
plan.presentation??={};plan.presentation.visualTemplate??=structuredClone(visualTemplate);assertDesign(plan.presentation.visualTemplate);
for(const item of plan.slides)if(!item.cardIds&&Array.isArray(item.candidates?.[0]?.fields?.cards))item.cardIds=item.candidates[0].fields.cards.map((_,i)=>defaultCardId(item.id,i));
const resolved=resolvePlan(source,plan,await loadCatalog(project));
if(hash(await fs.readFile(source.origin,'utf8'))!==source.sourceHash)throw new Error('Original source changed since snapshot. Create a new snapshot and plan.');
if(source.narrative&&hash(await fs.readFile(source.narrative.original.origin,'utf8'))!==source.narrative.original.sourceHash)throw new Error('Original raw material changed after narrative preparation. Prepare a new revision.');
const playwright=await import(pathToFileURL(path.resolve(options['playwright-module'])).href),chromium=playwright.chromium||playwright.default?.chromium;if(!chromium?.launch)throw new Error('The supplied Playwright module does not expose Chromium.');
await fs.mkdir(scratch,{recursive:true});const stat=await fs.lstat(scratch);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Scratch must be a real directory.');staging=await fs.mkdtemp(path.join(scratch,'brite-'));const root=path.join(staging,'presentation');await fs.mkdir(root);await fs.writeFile(path.join(staging,'owner.json'),JSON.stringify({kind:'brite-build-staging',output}),{flag:'wx'});
const files=['index.html','app.js','app.css','engine.js','slides.css','catalog.js','i18n.js','changelog.js','AGENTS.md','AGENT_GUIDE.md','README.md','TEMPLATE_CONTRACTS.md','SOURCE_TO_DECK.md','SHARED_SLIDE_ELEMENTS.md','EDITING_WORKFLOW.md','BRAND_PROFILE.md','ASSET_GUIDANCE.md','NARRATIVE.md','WEBPAGE.md','DELIVERY.md','LIVE_PREVIEW.md','PRODUCT_RELEASES.md','PALETTES.md','BACKGROUND_IMAGES.md','REFLOW.md',...legalFiles,'assets','samples','scripts'];
// New agent guidance travels with this helper, including when the source project predates it.
for(const name of files){const from=name==='scripts'||name==='changelog.js'||name.endsWith('.md')||legalFiles.includes(name)?path.join(helperStudio,name):path.join(project,name);await fs.cp(from,path.join(root,name),{recursive:true,errorOnExist:true,force:false});}
await completeFontNotices(helperStudio,root);
const renderer=(await fs.readFile(path.join(root,'engine.js'),'utf8')).match(/brite-studio-\d+/)?.[0];if(!renderer)throw Error('Unknown Brite renderer.');
await fs.writeFile(path.join(root,'visual-template.json'),JSON.stringify({schemaVersion:1,...visualTemplate,renderer,deckIdentityRequired:true},null,2),{flag:'wx'});
const assetMap=new Map();
async function asset(block){
  if(assetMap.has(block.id))return assetMap.get(block.id).path;
  if(/^[a-z][a-z\d+.-]*:/i.test(block.asset))throw new Error(`Use a local image for ${block.id}; URLs and data URIs are outside this workflow.`);
  const original=path.resolve(path.dirname(source.origin),block.asset),page=source.narrative?.original.webCapture||source.webCapture;
  const originalHash=page?hash(await fs.readFile(original)):null;
  if(page&&!page.selectedAssets.some(a=>a.localPath===original&&a.sha256===originalHash))throw new Error('Page image differs from captured asset.');
  const record=await ingestImage({original,root,chromium,executablePath:path.resolve(options['browser-executable'])});
  assetMap.set(block.id,record);return record.path;
}
for(const item of resolved.slides)for(const candidate of item.candidates)if(candidate.slide.image){const ref=plan.slides.find(s=>s.id===item.id).candidates.find(c=>c.template===candidate.template).fields.image;candidate.slide.image=await asset(source.blocks.find(b=>b.id===ref.asset));}
for(const item of resolved.slides)for(const candidate of item.candidates)if(candidate.slide.images){const mappings=plan.slides.find(s=>s.id===item.id).candidates.find(c=>c.template===candidate.template).fields.images;for(const [index,image]of candidate.slide.images.entries())image.src=await asset(source.blocks.find(b=>b.id===mappings[index].image.asset));}
for(const item of resolved.slides)for(const candidate of item.candidates)if(candidate.slide.background){const mapping=plan.slides.find(s=>s.id===item.id).candidates.find(c=>c.template===candidate.template).fields.background;candidate.slide.background.src=await asset(source.blocks.find(b=>b.id===mapping.image.asset));}
const metadata={title:'',language:'en',footer:'',date:'',...structuredClone(plan.presentation)};if(Object.keys(metadata).some(k=>!['title','language','footer','date','chrome','visualTemplate','slideEntrance'].includes(k)||(!['chrome','visualTemplate','slideEntrance'].includes(k)&&typeof metadata[k]!=='string')))throw new Error('Use title/language/footer/date text, optional chrome and a boolean slideEntrance.');
if(Object.hasOwn(metadata,'slideEntrance')&&typeof metadata.slideEntrance!=='boolean')throw new Error('slideEntrance must be true or false.');
const chromeIssues=(await loadCatalog(project)).validateChrome(metadata.chrome);if(chromeIssues.length)throw new Error(chromeIssues.map(i=>i.message).join(' '));
async function copyBrand(settings,key){if(settings?.brand?.kind==='image')settings.brand.src=await asset({id:key,asset:settings.brand.src});}
await copyBrand(metadata.chrome,'brand-deck');for(const item of resolved.slides)for(const candidate of item.candidates)await copyBrand(candidate.slide.chrome,`brand-${item.id}`);
await fs.writeFile(path.join(root,'presentation.js'),'window.BRITE_PRESENTATION={title:"",language:"en",footer:"",date:"",slides:[]};\n',{flag:'wx'});await fs.writeFile(path.join(root,'exports.js'),'window.BRITE_EXPORT=null;\n',{flag:'wx'});
const browser=await chromium.launch({headless:true,executablePath:path.resolve(options['browser-executable'])});let deck,attempts=[],fitValid=true;
try{
  const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.route(/^https?:/,route=>route.abort());const page=await context.newPage();await page.goto(pathToFileURL(path.join(root,'index.html')).href+'?lang=en#presentation');await page.waitForFunction(()=>window.Brite?.ready);
  const selected=[];
  for(const item of resolved.slides){let accepted;
    for(const candidate of item.candidates){const measurementSlide=structuredClone(candidate.slide);if(measurementSlide.items)for(const item of measurementSlide.items)if(item.target){item.page=resolved.slides.findIndex(s=>s.id===item.target)+1;delete item.target;}const result=await page.evaluate(async({metadata,slide})=>{const result=await BriteEngine.prepare({...metadata,slides:[slide]});return{valid:result.valid,issues:result.issues,measurements:result.measurements};},{metadata,slide:measurementSlide});attempts.push({slideId:item.id,template:candidate.template,...result});if(result.valid){accepted=candidate;break;}}
    if(!accepted){fitValid=false;accepted=item.candidates[0];}selected.push(accepted.slide);
  }
  deck={...metadata,slides:selected};const report=await page.evaluate(async deck=>{const result=await BriteEngine.prepare(deck);return{valid:result.valid,issues:result.issues};},deck);if(!report.valid)fitValid=false;
}finally{await browser.close();}
await fs.writeFile(path.join(root,'presentation.js'),'/* Generated from source references; original input is preserved. */\nwindow.BRITE_PRESENTATION='+JSON.stringify(deck,null,2)+';\n');
await fs.mkdir(path.join(root,'generation'));await fs.writeFile(path.join(root,'generation/input.md'),source.raw,{flag:'wx'});await fs.writeFile(path.join(root,'generation/source.json'),JSON.stringify(source,null,2),{flag:'wx'});await fs.writeFile(path.join(root,'generation/plan.json'),JSON.stringify(plan,null,2),{flag:'wx'});
if(source.narrative){await fs.writeFile(path.join(root,'generation/original.md'),source.narrative.original.raw,{flag:'wx'});await fs.writeFile(path.join(root,'generation/narrative.json'),JSON.stringify(source.narrative,null,2),{flag:'wx'});}
const web=source.narrative?.original.webCapture||source.webCapture;if(web)await fs.writeFile(path.join(root,'generation/page.json'),JSON.stringify(web,null,2),{flag:'wx'});
await fs.writeFile(path.join(root,'generation/coverage.json'),JSON.stringify({...resolved.coverage,chosen:deck.slides.map(s=>({slideId:s.id,template:s.template})),assets:Object.fromEntries(assetMap)},null,2),{flag:'wx'});await fs.writeFile(path.join(root,'generation/fit-report.json'),JSON.stringify({valid:fitValid,attempts},null,2),{flag:'wx'});
if(!fitValid){const {proposeRecovery}=await import('./recovery.mjs');const error=new Error('The source is preserved, but a reviewed reflow choice is needed.');error.recovery=await proposeRecovery({draft:root,target:output,expectedTarget:expected,runtime:options,lang:options.lang,allowAdditionalSlides:options['allow-additional-slides']!=='false'});throw error;}
const result=spawnSync(process.execPath,[path.join(root,'scripts/export.mjs'),'--project',root,'--playwright-module',path.resolve(options['playwright-module']),'--pdf-lib-module',path.resolve(options['pdf-lib-module']),'--browser-executable',path.resolve(options['browser-executable'])],{encoding:'utf8'});
if(result.status!==0)throw new Error(`Export failed; requested output was not created. Staged source is preserved in ${staging}. ${result.stderr||result.stdout}`);
let published;
if(updating)published=await publishProject(root,output,{lock,replaceRecords:true,expected});
else{await fs.mkdir(path.dirname(output),{recursive:true});await fs.mkdir(output);for(const name of await fs.readdir(root))if(name!=='.brite')await fs.cp(path.join(root,name),path.join(output,name),{recursive:true,errorOnExist:true,force:false});}
const exported=JSON.parse(result.stdout);completed=true;
console.log(JSON.stringify({saved:true,inPlace:updating,output,html:path.join(output,exported.preview),pdf:path.join(output,exported.path),project:path.join(output,'index.html'),slides:deck.slides.length,coverage:'complete',addedTitles:resolved.coverage.additions,history:published?.history??null,export:{...exported,history:published?.history??null}},null,2));
}catch(error){if(error.recovery){console.log(JSON.stringify(error.recovery,null,2));process.exitCode=2;}else throw error;}finally{if(lock)await unlockProject(lock);if(completed&&staging&&path.dirname(staging)===scratch&&path.basename(staging).startsWith('brite-')){const marker=JSON.parse(await fs.readFile(path.join(staging,'owner.json'),'utf8'));if(marker.kind==='brite-build-staging'&&marker.output===output)await fs.rm(staging,{recursive:true,force:false}).catch(error=>console.error('Saved; temporary staging retained: '+error.message));}}
