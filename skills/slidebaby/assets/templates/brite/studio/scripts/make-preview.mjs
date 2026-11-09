/* Self-contained derived viewer. Editable project files and source references stay unchanged. */
import fs from 'node:fs/promises';
import {assertProjectDesign} from './design.mjs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {args} from './source.mjs';
import {readLegalNotices,legalNoticeBlock} from './legal-notices.mjs';
import {commitFiles,currentHtml,lockProject,unlockProject,captureProject} from './publish.mjs';
const types={'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.gif':'image/gif','.avif':'image/avif','.ttf':'font/ttf','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.pdf':'application/pdf'};
const script=text=>'<script>\n'+text.replace(/<\/script/gi,'<\\/script')+'\n</script>';
export async function renderPreview(project,{exportEntry,pdfBytes}={}){
 const root=await fs.realpath(project),assets=Object.create(null);
 async function dataURL(relative){
  if(assets[relative])return assets[relative];
  if(typeof relative!=='string'||path.isAbsolute(relative)||path.win32.isAbsolute(relative)||/^[a-z][a-z\d+.-]*:/i.test(relative)||relative.split(/[\\/]/).includes('..'))throw Error('Preview requires project-local assets.');
  let current=root;
  for(const part of relative.split('/').filter(p=>p&&p!=='.')){current=path.join(current,part);if((await fs.lstat(current)).isSymbolicLink())throw Error('Preview does not follow asset symlinks.');}
  const full=await fs.realpath(path.join(root,relative));
  if(!full.startsWith(root+path.sep))throw Error('Preview asset escapes the project.');
  const mime=types[path.extname(relative).toLowerCase()];if(!mime)throw Error('Unsupported preview asset: '+relative);
  return assets[relative]=`data:${mime};base64,${(await fs.readFile(full)).toString('base64')}`;
 }
 let html=await fs.readFile(path.join(root,'index.html'),'utf8');
 // Export current visual dependencies, never the whole retained assets/user tree.
 // Materialize both palettes so the complete offline catalogue remains functional.
 const context=vm.createContext({window:{},structuredClone});
 let engineSource='';
 for(const name of ['samples/brite.js','catalog.js','presentation.js','engine.js'])if(html.includes(`<script src="${name}" defer>`)){const source=await fs.readFile(path.join(root,name),'utf8');if(name==='engine.js')engineSource=source;vm.runInContext(source,context,{filename:name,timeout:2000});}
 const needed=new Set();
 const image=value=>{if(typeof value==='string'&&value.trim())needed.add(value);};
 const chrome=value=>{if(value?.brand?.kind==='image')image(value.brand.src);};
 const catalog=context.window.BriteCatalog;
 function slide(value,owner){if(!value)return;image(value.image);image(value.background?.src);for(const item of value.images||[])image(item.src);if(catalog?.resolveChrome)chrome(catalog.resolveChrome(value,owner));else{image(value.logo);chrome(value.chrome);chrome(owner?.chrome);}}
 const deck=context.window.BRITE_PRESENTATION;await assertProjectDesign(root,deck);for(const value of deck?.slides||[])slide(value,deck);
 if(catalog)for(const entry of catalog.entries)for(const palette of ['light','dark'])slide(catalog.materialize(entry.id,{palette}),catalog.metadata);
 if(context.window.BriteEngine?.assetSources)for(const name of context.window.BriteEngine.assetSources)image(name);
 else{
  // Compatible older projects retain their renderer. Read only its explicit
  // bundled artwork literals; never discover images by walking user folders.
  for(const match of engineSource.matchAll(/["'](assets\/[^"'\s]+\.(?:svg|webp|png|jpe?g))["']/g)){
   image(match[1]);if(match[1].endsWith('.svg')){const dark=match[1].replace(/\.svg$/,'-dark.svg');try{await fs.lstat(path.join(root,dark));image(dark);}catch(e){if(e.code!=='ENOENT')throw e;}}
  }
 }
 for(const name of needed)await dataURL(name);
 let pdf=exportEntry;if(pdf===undefined){const context={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,'exports.js'),'utf8'),context,{timeout:1000});pdf=context.window.BRITE_EXPORT;}
 if(pdf){if(!/^exports\/[\w./-]+\.pdf$/.test(pdf.path)||pdf.path.includes('..'))throw Error('Invalid PDF manifest path.');if(pdfBytes)assets[pdf.path]='data:application/pdf;base64,'+Buffer.from(pdfBytes).toString('base64');else await dataURL(pdf.path);}
 for(const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]){
  let css=await fs.readFile(path.join(root,match[1]),'utf8');
  for(const url of [...css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)]){
   if(/^(data:|https?:|#)/.test(url[1]))throw Error('Preview stylesheet must use local assets.');
   const name=path.posix.normalize(path.posix.join(path.posix.dirname(match[1]),url[1]));
   css=css.replace(url[0],`url("${await dataURL(name)}")`);
  }
  html=html.replace(match[0],()=>'<style>\n'+css+'\n</style>');
 }
 for(const match of [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)])html=html.replace(match[0],match[0].replace('src="'+match[1]+'"','src="'+await dataURL(match[1])+'"'));
 const scripts=[];
 for(const match of html.matchAll(/<script src="([^"]+)" defer><\/script>/g)){
  if(!/^[a-zA-Z0-9/._-]+$/.test(match[1])||match[1].includes('..'))throw Error('Preview only supports local runtime scripts.');
  scripts.push(script(match[1]==='exports.js'&&exportEntry!==undefined?'window.BRITE_EXPORT='+JSON.stringify(exportEntry)+';':await fs.readFile(path.join(root,match[1]),'utf8')));
 }
 const notices=await readLegalNotices(root);
 const inline=script('window.BRITE_INLINE_ASSETS='+JSON.stringify(Object.fromEntries(Object.entries(assets).filter(([name])=>!types[path.extname(name).toLowerCase()]?.startsWith('font/')))).replaceAll('<','\\u003c')+';');
 html=html.replace(/\s*<script src="[^"]+" defer><\/script>/g,'').replace('</body>',()=>legalNoticeBlock(notices)+inline+'\n'+scripts.join('\n')+'\n</body>');
 return '<!-- Brite generated current viewer -->\n'+html;
}
export async function assertViewerTarget(root){
 try{const stat=await fs.lstat(path.join(root,currentHtml));if(!stat.isFile()||stat.isSymbolicLink())throw Error('The stable HTML target is not a regular file.');const previous=await fs.readFile(path.join(root,currentHtml),'utf8');if(!previous.includes('Brite generated current viewer')&&!previous.includes('window.BRITE_INLINE_ASSETS='))throw Error('presentation.html already exists and is not a generated Brite viewer. Keep it and choose another presentation project.');}catch(e){if(e.code!=='ENOENT')throw e;}
}
export async function assertExportTargets(root){
 await assertViewerTarget(root);
 try{const stat=await fs.lstat(path.join(root,'exports/presentation.pdf'));if(!stat.isFile()||stat.isSymbolicLink())throw Error('The stable PDF target is not a regular file.');const context={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,'exports.js'),'utf8'),context,{timeout:1000});if(context.window.BRITE_EXPORT?.path!=='exports/presentation.pdf')throw Error('exports/presentation.pdf exists without a matching Brite manifest. Keep it and resolve the target before export.');}catch(e){if(e.code!=='ENOENT')throw e;}
 try{const stat=await fs.lstat(path.join(root,'exports/source-revision.json'));if(!stat.isFile()||stat.isSymbolicLink())throw Error('The source revision target is not a regular file.');const record=JSON.parse(await fs.readFile(path.join(root,'exports/source-revision.json'),'utf8')),context={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,'exports.js'),'utf8'),context,{timeout:1000});if(typeof record.revision!=='string'||record.revision!==context.window.BRITE_EXPORT?.revision||!Array.isArray(record.files)||record.files.length!==6||record.files.some(item=>!['presentation.js','catalog.js','engine.js','slides.css','app.css','app.js'].includes(item.name)||!/^[a-f\d]{64}$/.test(item.sha256))||new Set(record.files.map(item=>item.name)).size!==6)throw Error('exports/source-revision.json exists without matching Brite export records. Keep it and resolve the target before export.');}catch(e){if(e.code!=='ENOENT')throw e;}
}
export async function makePreview(project,filename){
 const root=await fs.realpath(project),target=path.resolve(filename||path.join(root,currentHtml));
 if(target===path.join(root,currentHtml)){
  const lock=await lockProject(root);try{const expected=await captureProject(root);await assertViewerTarget(root);const html=await renderPreview(root);await commitFiles(root,[{path:currentHtml,bytes:Buffer.from(html)}],{kind:'preview',lock,expected});}finally{await unlockProject(lock);}
 }else await fs.writeFile(target,await renderPreview(root),{flag:'wx'});
 return path.relative(root,target);
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const o=args(['project','output']);if(!o.project)throw Error('Use --project folder [--output NEW-file.html]. The default updates presentation.html with internal history.');
 console.log(await makePreview(path.resolve(o.project),o.output?path.resolve(o.output):undefined));
}
