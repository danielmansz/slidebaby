/* Package one host-agent DOM capture. Does not crawl or fetch any URL. */
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';import{snapshot,hash,digest,args}from'./source.mjs';
export function validatePageCapture(c,raw){
 if(c?.schemaVersion!==1||c.scope!=='single-page'||c.mainText!==raw||!c.title?.trim()||!Array.isArray(c.limitations)||!Number.isFinite(Date.parse(c.capturedAt)))throw new Error('Incomplete page evidence.');
 const from=new URL(c.requestedUrl),to=new URL(c.finalUrl);if(!['http:','https:'].includes(from.protocol)||to.protocol!=='https:'||from.username||from.password||to.username||to.password)throw new Error('Use public HTTP(S) page addresses without credentials.');
 if(from.hostname.replace(/^www\./,'')!==to.hostname.replace(/^www\./,''))throw new Error('Cross-domain redirect needs explicit source review.');
 if(from.pathname.replace(/\/$/,'')!==to.pathname.replace(/\/$/,'')&&!(from.pathname==='/'&&/^\/[a-z]{2}(?:-[a-z]{2})?\/?$/i.test(to.pathname)))throw new Error('Capture is outside the supplied page.');
 if(!Array.isArray(c.images)||!Array.isArray(c.selectedAssets))throw new Error('Missing page asset evidence.');
 for(const a of c.selectedAssets){if(!c.images.some(i=>i.src===a.url)||!a.localPath||!/^[a-f\d]{64}$/.test(a.sha256??''))throw new Error('Selected asset is not mapped to an image on the captured page.');}
}
export async function preparePage(input,output){
 const c=JSON.parse(await fs.readFile(input,'utf8'));c.schemaVersion=1;c.scope='single-page';c.selectedAssets??=[];validatePageCapture(c,c.mainText);
 for(const a of c.selectedAssets)if(hash(await fs.readFile(a.localPath))!==a.sha256)throw new Error('Downloaded page asset changed: '+a.localPath);
 if(!c.mainText.trim())throw new Error('No readable main-page content. Ask for pasted text, do not invent the page.');
 const root=path.resolve(output);await fs.mkdir(root);await fs.writeFile(root+'/original.md',c.mainText,{flag:'wx'});await fs.writeFile(root+'/page.json',JSON.stringify(c,null,2),{flag:'wx'});
 const s=await snapshot(root+'/original.md');s.webCapture=c;delete s.artifactHash;s.artifactHash=digest(s);await fs.writeFile(root+'/source.json',JSON.stringify(s,null,2),{flag:'wx'});return{valid:true,url:c.finalUrl,blocks:s.blocks.length,assets:c.selectedAssets.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const o=args(['capture','output']);if(!o.capture||!o.output)throw new Error('Use --capture page.json --output NEW-folder.');console.log(JSON.stringify(await preparePage(o.capture,o.output),null,2));}
