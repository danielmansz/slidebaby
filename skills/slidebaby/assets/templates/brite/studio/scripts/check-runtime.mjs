#!/usr/bin/env node
/* Inspect existing runtimes and probe one offline PDF in memory. No installs or saved config. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {browserCandidates,findWorkingBrowser} from './browser-runtime.mjs';

export const runtimeFlags=['project','module-root','playwright-module','pdf-lib-module','browser-executable','lang'];
export function readFlags(allowed=runtimeFlags){
 const out={};for(let i=2;i<process.argv.length;i++){
  const key=process.argv[i].replace(/^--/,'');
  if(!process.argv[i].startsWith('--')||!allowed.includes(key)||key in out||!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw Error('Use named runtime options with values. Nothing is installed automatically.');
  out[key]=process.argv[++i];
 }if(out.lang!=null&&!['en','pl'].includes(out.lang))throw Error('Use --lang en or --lang pl.');return out;
}
export async function checkRuntime(options={}){
 const lang=options.lang==='pl'?'pl':'en',checks=[],project=path.resolve(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
 const require=createRequire(path.join(project,'__brite_runtime_lookup.cjs'));
 const runtime={node:process.execPath,playwrightModule:null,pdfLibModule:null,browserExecutable:null,browserName:null,browserSource:null};
 const add=(id,status,detail)=>checks.push({id,status,detail});
 const nodeReady=Number(process.versions.node.split('.')[0])>=20;
 add('node',nodeReady?'ok':'missing',nodeReady?process.versions.node:'Brite requires an existing Node.js20+ runtime.');
 function modulePath(name,explicit){
  if(explicit)return require.resolve(path.resolve(explicit));
  if(options['module-root'])return require.resolve(path.join(path.resolve(options['module-root']),name));
  return require.resolve(name,{paths:[project,process.cwd(),path.dirname(fileURLToPath(import.meta.url))]});
 }
 let chromium,PDFDocument;
 if(nodeReady){
  try{runtime.playwrightModule=modulePath('playwright',options['playwright-module']);const mod=await import(pathToFileURL(runtime.playwrightModule).href);chromium=mod.chromium||mod.default?.chromium;if(!chromium?.launch)throw Error('The module does not expose Chromium.');add('playwright','ok','Existing module loaded.');}catch(e){add('playwright','missing',String(e.message).slice(0,600));}
  try{runtime.pdfLibModule=modulePath('pdf-lib',options['pdf-lib-module']);const mod=await import(pathToFileURL(runtime.pdfLibModule).href);PDFDocument=mod.PDFDocument||mod.default?.PDFDocument;if(!PDFDocument?.load)throw Error('The module does not expose PDFDocument.');add('pdf-lib','ok','Existing module loaded.');}catch(e){add('pdf-lib','missing',String(e.message).slice(0,600));}
 }else for(const id of ['playwright','pdf-lib','chromium'])add(id,'skipped','A supported Node runtime is needed first.');
 let selection={selected:null,verified:false,attempts:[]};
 if(nodeReady){
  const candidates=browserCandidates({explicit:options['browser-executable'],cached:chromium?.executablePath()});
  const modulesReady=Boolean(chromium&&PDFDocument);
  async function probe(executablePath){
   let browser;try{
    browser=await chromium.launch({headless:true,executablePath,timeout:12000});
    const context=await browser.newContext();await context.route(/^https?:/,route=>route.abort());const page=await context.newPage();
    await page.setContent('<!doctype html><style>@page{size:1920px 1080px;margin:0}body{margin:40px;font:32px sans-serif}</style><p>Brite runtime check</p>',{timeout:10000});
    const bytes=await page.pdf({printBackground:true,preferCSSPageSize:true,timeout:15000}),pdf=await PDFDocument.load(bytes),size=pdf.getPage(0).getSize();
    if(pdf.getPageCount()!==1||Math.abs(size.width-1440)>1||Math.abs(size.height-810)>1)throw Error('The in-memory PDF has unexpected page geometry.');
   }finally{if(browser)await browser.close();}
  }
  selection=await findWorkingBrowser(candidates,{probe:modulesReady?probe:undefined});
  if(selection.selected){const b=selection.selected;Object.assign(runtime,{browserExecutable:b.executable,browserName:b.name,browserSource:b.source});}
  const found=selection.selected||selection.attempts.length;
  add('chromium',found?'ok':'missing',selection.selected?`Existing ${runtime.browserName} found (${runtime.browserSource}); nothing installed.`:found?'Existing browsers found, but their PDF probes failed.':'No existing compatible Chrome, Edge or Chromium found in known locations or the Playwright cache. Firefox/Safari can view the HTML but cannot replace this PDF renderer.');
  add('pdf-probe',selection.verified?'ok':modulesReady&&found?'failed':'skipped',selection.verified?'Offline launch and one-page PDF verified.':modulesReady&&found?'No tried browser completed the PDF probe. Check attemptedBrowsers before proposing any installation.':'PDF probe needs existing Playwright, pdf-lib and a compatible browser.');
 }else add('pdf-probe','skipped','A supported Node runtime is needed first.');
 const names=lang==='pl'?{node:'Node.js20+',playwright:'moduł Playwright','pdf-lib':'moduł pdf-lib',chromium:'przeglądarka do PDF (Chrome, Edge lub Chromium)','pdf-probe':'działający test eksportu PDF'}:{node:'Node.js20+',playwright:'Playwright module','pdf-lib':'pdf-lib module',chromium:'PDF browser (Chrome, Edge or Chromium)','pdf-probe':'working PDF export probe'};
 const ready=checks.every(check=>check.status==='ok'),missing=checks.filter(check=>['missing','failed'].includes(check.status)).map(check=>check.id);
 return{schemaVersion:1,ready,summary:ready?(lang==='pl'?'Gotowe: mogę przygotować slajdy i PDF.':'Ready: I can prepare the slides and PDF.'):(lang==='pl'?`PDF nie jest jeszcze dostępny. Brakuje lub nie działa: ${missing.map(id=>names[id]||id).join(', ')}. Niczego nie zainstalowano.`:`PDF is not ready. Missing or unavailable: ${missing.map(id=>names[id]||id).join(', ')}. Nothing was installed.`),checks,runtime,attemptedBrowsers:selection.attempts,changes:{dependenciesInstalled:false,configurationSaved:false,persistentServiceStarted:false,networkUsed:false,pdfFileSaved:false}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--help'))console.log('Brite runtime check: node scripts/check-runtime.mjs [--module-root EXISTING-node_modules] [--playwright-module PATH] [--pdf-lib-module PATH] [--browser-executable PATH] [--project PROJECT] [--lang en|pl]. Prints JSON. Exit0=ready,2=missing/unavailable. No installs or saved configuration.');
 else try{const result=await checkRuntime(readFlags());console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=2;}catch(e){console.log(JSON.stringify({ready:false,error:e.message}));process.exitCode=2;}
}
