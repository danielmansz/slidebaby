#!/usr/bin/env node
/* Append a template instance using local JSON content. No packages or network. */
import{visualTemplate,assertDesign,assertProjectDesign,assertWritableProject}from'./design.mjs';
import{ingestImage}from'./ingest-image.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const options={};
for(let i=2;i<process.argv.length;i+=2){const flag=process.argv[i],value=process.argv[i+1];if(!['--project','--template','--input','--playwright-module','--browser-executable'].includes(flag)||!value)throw new Error('Use --template ID --input content.json and optionally --project /path/to/project.');options[flag.slice(2)]=value;}
if(!options.template||!options.input)throw new Error('Both --template and --input are required. Read AGENT_GUIDE.md.');
const root=path.resolve(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
await assertWritableProject(root);await assertProjectDesign(root);
const content=JSON.parse(await fs.readFile(path.resolve(options.input),'utf8'));
if(!content.slide||typeof content.slide!=='object'||Array.isArray(content.slide))throw new Error('The JSON input needs a slide object.');
const context=vm.createContext({window:{},structuredClone});
for(const filename of ['samples/brite.js','catalog.js','presentation.js'])vm.runInContext(await fs.readFile(path.join(root,filename),'utf8'),context,{filename});
const catalog=context.window.BriteCatalog,deck=structuredClone(context.window.BRITE_PRESENTATION);
if(!deck||!Array.isArray(deck.slides))throw new Error('The saved presentation is not a valid deck. Its source was not changed.');
if(deck.slides.length)throw new Error('For a saved presentation use edit-deck.mjs addSlides. It updates the same HTML/PDF with source checks and recovery history.');
if(deck.slides.length>=60)throw new Error('This deck already has 60 slides. Split it before appending.');
if(content.presentation){
  const allowed=['title','language','footer','date','chrome','visualTemplate'];
  for(const [key,value]of Object.entries(content.presentation)){if(!allowed.includes(key)||(!['chrome','visualTemplate'].includes(key)&&typeof value!=='string'))throw new Error(`Unsupported presentation metadata: ${key}`);deck[key]=value;}
}
deck.visualTemplate??=structuredClone(visualTemplate);assertDesign(deck.visualTemplate);
const chromeIssues=catalog.validateChrome(deck.chrome);if(chromeIssues.length)throw new Error(chromeIssues.map(i=>i.message).join(' '));
if(!catalog.entries.some(e=>e.id===options.template))throw new Error('This template is retired from new compositions. Choose a current designed template, such as split-no-image.');
const slide=catalog.instantiate(options.template,content.slide);
slide.id=`${options.template}-${crypto.randomUUID()}`;
const issues=catalog.validateContract(slide);
if(issues.length)throw new Error(issues.map(issue=>`${issue.field}: ${issue.message}`).join('\n'));
const imported=[];let chromium;
async function optimize(src){if(/^[a-z][a-z\d+.-]*:/i.test(src))throw new Error('Supply a local image.');if(options['playwright-module']&&!chromium){const playwright=await import(pathToFileURL(path.resolve(options['playwright-module'])).href);chromium=playwright.chromium||playwright.default?.chromium;if(!chromium?.launch)throw new Error('The supplied Playwright module does not expose Chromium.');}const record=await ingestImage({original:path.resolve(root,src),root,chromium,executablePath:options['browser-executable']});imported.push(record);return record.path;}
if(slide.image)slide.image=await optimize(slide.image);
if(slide.background)slide.background.src=await optimize(slide.background.src);
if(slide.logo)slide.logo=await optimize(slide.logo);
for(const image of slide.images||[])image.src=await optimize(image.src);
for(const settings of [slide.chrome,deck.chrome])if(settings?.brand?.kind==='image')settings.brand.src=await optimize(settings.brand.src);
deck.slides.push(slide);
const revision=new Date().toISOString().replace(/[-:.]/g,'')+'-'+crypto.randomBytes(3).toString('hex');
const history=path.join(root,'history');await fs.mkdir(history,{recursive:true});
await fs.copyFile(path.join(root,'presentation.js'),path.join(history,`presentation-${revision}.js`));
if(imported.length)await fs.writeFile(path.join(history,`assets-${revision}.json`),JSON.stringify(imported,null,2),{flag:'wx'});
const temporary=path.join(root,`.presentation-${revision}.js`);
await fs.writeFile(temporary,'/* Saved by the agent. Templates remain in catalog.js. */\nwindow.BRITE_PRESENTATION = '+JSON.stringify(deck,null,2)+';\n',{flag:'wx'});
await fs.rename(temporary,path.join(root,'presentation.js'));
console.log(JSON.stringify({saved:true,slideId:slide.id,slides:deck.slides.length,next:'Validate the saved deck and run scripts/export.mjs. No PDF was changed by this append operation.'}));
