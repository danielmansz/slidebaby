/* Carry licenses as document data; never execute their contents or follow links. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {digest,hash} from './source.mjs';
export const legalFiles=Object.freeze(['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md']);
const fontNotices=Object.freeze(['assets/licenses/DM-Mono-OFL.txt','assets/licenses/Outfit-OFL.txt','assets/licenses/Source-Serif-LICENSE.md']);
async function read(root,name){
 let current=root;
 for(const part of name.split('/')){current=path.join(current,part);let stat;try{stat=await fs.lstat(current);}catch(e){if(e.code==='ENOENT')return null;throw e;}if(stat.isSymbolicLink())throw Error('License notices do not follow symlinks: '+name);}
 const stat=await fs.stat(current);if(!stat.isFile()||stat.size>1024*1024)throw Error('License notices must be regular text files up to 1 MB: '+name);
 return fs.readFile(current,'utf8');
}
const priorToolNotices=Object.freeze({'THIRD_PARTY_NOTICES.md':['de9ee59e6153a41c64502ff4703568aed7be760ef77255b093b2798d1ac7cf7d','c0361457163a1f0361ed313e33d907f25893e1fddb7990be057e788717e1d816']});
export async function assertLegalCompatibility(project,source){
 const previousLicense=await read(project,'LICENSE'),currentLicense=await read(source,'LICENSE');
 for(const name of legalFiles){
  const old=await read(project,name),next=await read(source,name);if(old===null||next===null||old===next)continue;
  if(name!=='LICENSE'&&previousLicense!==null&&previousLicense===currentLicense&&priorToolNotices[name]?.includes(hash(old)))continue;
  throw Error('Existing '+name+' differs from the current skill. Preserve it and explicitly reconcile the license files before upgrading this project.');
 }
}
export async function completeFontNotices(source,project){
 for(const name of fontNotices)if(await read(project,name)===null){const text=await read(source,name);if(text!==null){await fs.mkdir(path.dirname(path.join(project,name)),{recursive:true});await fs.writeFile(path.join(project,name),text,{flag:'wx'});}}
}
export async function readLegalNotices(project){
 const documents=[];for(const name of [...legalFiles,...fontNotices]){const text=await read(project,name);if(text!==null)documents.push({path:name,text});}
 const license=documents.find(d=>d.path==='LICENSE'),summary=documents.find(d=>d.path==='LICENSING.md'),ours=license?.text.startsWith('Slidebaby Community License 1.0\n')||summary?.text.includes('LicenseRef-Slidebaby-Community-1.0');
 if(ours&&[...legalFiles,...fontNotices].some(name=>!documents.some(d=>d.path===name)))throw Error('Incomplete Slidebaby legal notices. Restore LICENSE, licensing/third-party notes and the bundled font licenses before exporting.');
 return documents.length?{schemaVersion:1,kind:'slidebaby-legal-notices',...(ours?{license:'LicenseRef-Slidebaby-Community-1.0'}:{}),documents}:null;
}
export function legalNoticeBlock(notices){
 return notices?'\n<script id="slidebaby-license-notices" type="application/json">\n'+JSON.stringify(notices,null,2).replaceAll('<','\\u003c')+'\n</script>\n':'';
}

export async function assertEmbeddedLegalNotices(project){
 const notices=await readLegalNotices(project),html=await fs.readFile(path.join(project,'presentation.html'),'utf8');
 const blocks=[...html.matchAll(/<script id="slidebaby-license-notices" type="application\/json">\n([\s\S]*?)\n<\/script>/g)];
 if(notices?.license||html.includes('id="slidebaby-license-notices"')){
  if(blocks.length!==1)throw Error('Re-export the presentation to retain its complete license notices.');
  let embedded;try{embedded=JSON.parse(blocks[0][1]);}catch{throw Error('The standalone HTML has invalid license notices. Re-export it.');}
  if(digest(embedded)!==digest(notices))throw Error('The license notices differ from the standalone HTML. Re-export before packaging.');
 }
}
