#!/usr/bin/env node
/* Export only the saved current presentation. Uses existing local dependencies. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const options={};
for(let i=2;i<process.argv.length;i+=2){const flag=process.argv[i],value=process.argv[i+1];if(!['--project','--playwright-module','--pdf-lib-module','--browser-executable'].includes(flag)||!value)throw new Error('Use local --project, --playwright-module, --pdf-lib-module, and --browser-executable paths. Nothing is installed automatically.');options[flag.slice(2)]=value;}
const root=await fs.realpath(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const {lockProject,unlockProject,commitFiles,captureProject,currentHtml,currentPdf}=await import('./publish.mjs');
const lock=await lockProject(root);
try{
const expected=await captureProject(root);
// Verify original source and every tracked later edit before exporting.
const {verifyDocument}=await import('./verify-document.mjs');await verifyDocument(root);
const require=createRequire(import.meta.url);
let chromium,PDFDocument;
try {
  const playwright=await import(options['playwright-module']?pathToFileURL(path.resolve(options['playwright-module'])).href:'playwright');chromium=playwright.chromium||playwright.default?.chromium;if(!chromium?.launch)throw new Error('The supplied Playwright module does not expose Chromium.');
  ({PDFDocument}=require(options['pdf-lib-module']||'pdf-lib'));
}catch(error){throw new Error(`An existing Playwright and pdf-lib runtime is required. Provide the local module paths; this exporter does not install dependencies. ${error.message}`);}
const browser=await chromium.launch({headless:true,...(options['browser-executable']?{executablePath:options['browser-executable']}:{})});
let buffer,fingerprint,pages,layoutVersion,fitting;
try {
  const context=await browser.newContext({viewport:{width:1920,height:1080}});
  await context.route(/^https?:/,route=>route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'?lang=en#presentation');
  await page.waitForFunction(()=>window.Brite?.ready,{timeout:20000});
  const report=await page.evaluate(()=>window.Brite.report());
  if(!report.valid||report.empty||errors.length)throw new Error(`PDF export blocked: ${JSON.stringify({empty:report.empty,issues:report.issues,errors})}. Previous PDFs and their manifest were preserved.`);
  fitting=report.measurements?.filter(m=>m.cardBodySize).map(({id,cardTypography,cardBodySize,cardBodyLines,cardIds,variant})=>({id,cardTypography,cardBodySize,cardBodyLines,cardIds,variant}));
  fingerprint=await page.evaluate(()=>Brite.fingerprint());layoutVersion=await page.evaluate(()=>Brite.layoutVersion);
  pages=await page.evaluate(()=>Brite.getDeck().slides.length);
  // Settle print geometry before Chromium paints repeated absolute header/footer fields.
  await page.emulateMedia({media:'print'});await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  buffer=await page.pdf({printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true});
  const pdf=await PDFDocument.load(buffer);
  if(pdf.getPageCount()!==pages||pdf.getPages().some(page=>Math.abs(page.getWidth()-1440)>1||Math.abs(page.getHeight()-810)>1))throw new Error('PDF page count or size is incorrect. Previous manifest preserved.');
}finally{await browser.close();}
const revision=new Date().toISOString().replace(/[-:]/g,'').replace(/\..+/,'')+'-'+crypto.randomBytes(3).toString('hex');
const entry={filename:'presentation.pdf',path:currentPdf,revision,fingerprint,layoutVersion,pages,preview:currentHtml,stable:true};
const {renderPreview,assertExportTargets}=await import('./make-preview.mjs');
await assertExportTargets(root);
const html=await renderPreview(root,{exportEntry:entry,pdfBytes:buffer});
const sources=['presentation.js','catalog.js','engine.js','slides.css','app.css','app.js'];
const sourceRecord={revision,files:await Promise.all(sources.map(async name=>({name,sha256:crypto.createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex')})))};
const published=await commitFiles(root,[
 {path:currentPdf,bytes:buffer},
 {path:'exports/source-revision.json',bytes:Buffer.from(JSON.stringify(sourceRecord,null,2))},
 {path:'exports.js',bytes:Buffer.from('/* Last checked current export. */\nwindow.BRITE_EXPORT='+JSON.stringify(entry,null,2)+';\n')},
 {path:currentHtml,bytes:Buffer.from(html)}
],{lock,kind:'export',expected});
console.log(JSON.stringify({saved:true,...entry,standalone:true,fitting,history:published.history},null,2));
}finally{await unlockProject(lock);}
