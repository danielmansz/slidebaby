#!/usr/bin/env node
/* Ask the OS to open a checked local preview. No server, installs or saved preferences. */
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';import{spawn}from'node:child_process';
import{readFlags}from'./check-runtime.mjs';import{readDeck,verifyDocument}from'./verify-document.mjs';import{checkedSnapshot,previewStatus}from'./live-preview.mjs';
export function systemOpenCommand(target,platform=process.platform){
 if(platform==='darwin')return{command:'/usr/bin/open',args:[target],envPatch:{}};
 if(platform==='win32')return{command:'powershell.exe',args:['-NoProfile','-NonInteractive','-Command','Start-Process -FilePath $env:SLIDEBABY_PREVIEW_TARGET'],envPatch:{SLIDEBABY_PREVIEW_TARGET:target}};
 if(platform==='linux')return{command:'xdg-open',args:[target],envPatch:{}};
 throw Error('No supported system browser opener on this operating system.');
}
export async function previewTarget({project,lang='en',view='presentation'}={}){
 if(!project)throw Error('Use --project with a saved presentation or copied empty template browser.');
 if(!['en','pl'].includes(lang)||!['presentation','templates'].includes(view))throw Error('Use --lang en|pl and --view presentation|templates.');
 const root=await fs.realpath(project),file=path.join(root,'presentation.html'),stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Use the generated current presentation.html, not a link or arbitrary page.');
 const deck=await readDeck(path.join(root,'presentation.js'));let revision=null,live=null;
 if(!Array.isArray(deck.slides))throw Error('Invalid presentation data.');
 if(deck.slides.length){
  await verifyDocument(root);const snapshot=await checkedSnapshot(root,null);if(!snapshot)throw Error('Wait for the checked save to complete before opening.');revision=snapshot.revision;
  const session=await previewStatus(root);if(session.running&&session.revision===revision)live=session.url;
 }else{
  const html=await fs.readFile(file,'utf8');if(!html.startsWith('<!-- Brite generated current viewer -->')||!html.includes('window.BRITE_INLINE_ASSETS='))throw Error('Generate the empty template viewer before opening it.');
 }
 const url=new URL(live||pathToFileURL(file).href);url.searchParams.set('lang',lang);url.hash=view;
 return{project:root,target:url.href,kind:live?'live':'file',revision,html:file};
}
export function dispatchOpen(command,{launch=spawn,timeoutMs=5000}={}){
 return new Promise(resolve=>{
  let child,timer,done=false;const finish=result=>{if(done)return;done=true;clearTimeout(timer);resolve(result);};
  try{child=launch(command.command,command.args,{shell:false,stdio:'ignore',windowsHide:true,env:{...process.env,...command.envPatch}});}
  catch(error){finish({requested:false,reason:error.message});return;}
  child.once('error',error=>finish({requested:false,reason:error.message}));
  child.once('exit',(code,signal)=>finish(code===0?{requested:true,openerPending:false}:{requested:false,reason:`System opener exited with ${code??signal}.`}));
  timer=setTimeout(()=>{child.unref();finish({requested:true,openerPending:true});},timeoutMs);
 });
}
export async function openPreview(options={},deps={}){
 const lang=options.lang==='pl'?'pl':'en',target=await previewTarget(options);let command;
 try{command=systemOpenCommand(target.target,deps.platform);}
 catch(error){return{...target,requested:false,reason:error.message};}
 if(options['dry-run']==='true')return{...target,requested:false,dryRun:true,command};
 const result=await dispatchOpen(command,deps);return{...target,...result,opener:'system-default',visibleVerified:false,message:result.requested?(lang==='pl'?'Wysłano prośbę o otwarcie w domyślnej przeglądarce/aplikacji. Widoczność okna nie została potwierdzona.':'Requested opening in the system default browser/application. Window visibility is not verified.'):(lang==='pl'?'Nie udało się otworzyć zewnętrznego podglądu. Gotowe pliki pozostają dostępne; podaj użytkownikowi HTML i URL.':'External opening is unavailable. The saved files remain ready; provide the HTML and URL.')};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--help'))console.log('Open checked HTML in the system default browser: node scripts/open-preview.mjs --project PROJECT [--lang en|pl] [--view presentation|templates] [--dry-run true]. Reuses a matching live session; otherwise opens the saved file. No installs, server or global settings. Do not run in a remote/headless host expecting a window on another computer.');
 else try{const o=readFlags(['project','lang','view','dry-run']);if(o['dry-run']!=null&&o['dry-run']!=='true')throw Error('Use --dry-run true or omit it.');const result=await openPreview(o);console.log(JSON.stringify(result,null,2));if(!result.requested&&!result.dryRun)process.exitCode=2;}
 catch(error){console.log(JSON.stringify({requested:false,error:error.message}));process.exitCode=2;}
}
