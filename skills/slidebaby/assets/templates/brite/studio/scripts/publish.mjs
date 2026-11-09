/* Project-local publication: checked files, compact recovery history, one stable viewer. */
import fs from 'node:fs/promises';
import {assertWritableProject} from './design.mjs';
import {legalFiles,assertLegalCompatibility} from './legal-notices.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gzip,gunzip} from 'node:zlib';
import {promisify} from 'node:util';
const pack=promisify(gzip),unpack=promisify(gunzip),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
export const currentHtml='presentation.html',currentPdf='exports/presentation.pdf';
const uuid=()=>crypto.randomUUID();
const managedTop=new Set(['visual-template.json','index.html','presentation.js','exports.js',currentHtml,'app.js','app.css','engine.js','slides.css','catalog.js','i18n.js','changelog.js','AGENTS.md','AGENT_GUIDE.md','README.md','TEMPLATE_CONTRACTS.md','SOURCE_TO_DECK.md','SHARED_SLIDE_ELEMENTS.md','EDITING_WORKFLOW.md','BRAND_PROFILE.md','ASSET_GUIDANCE.md','NARRATIVE.md','WEBPAGE.md','DELIVERY.md','LIVE_PREVIEW.md','PRODUCT_RELEASES.md','PALETTES.md','BACKGROUND_IMAGES.md','REFLOW.md',...legalFiles]);
const managed=name=>managedTop.has(name)||name===currentPdf||name==='exports/source-revision.json'||/^(assets|scripts|samples|generation|edits)\//.test(name);
const relativeName=name=>typeof name==='string'&&name.length>0&&!path.isAbsolute(name)&&!name.split(/[\\/]/).some(p=>!p||p==='.'||p==='..')&&!name.startsWith('.brite');
async function absent(file){try{await fs.lstat(file);return false;}catch(e){if(e.code==='ENOENT')return true;throw e;}}
async function safe(root,name,{directory=false}={}){
 if(!relativeName(name))throw Error('Publication path must stay inside the presentation project.');
 let current=root;const parts=name.split('/');
 for(let i=0;i<parts.length;i++){current=path.join(current,parts[i]);try{const stat=await fs.lstat(current);if(stat.isSymbolicLink()||((i<parts.length-1||directory)&&!stat.isDirectory()))throw Error('Publication does not follow symlinks or replace path components.');if(i===parts.length-1&&!directory&&!stat.isFile())throw Error('Publication target must be a regular file.');}catch(e){if(e.code==='ENOENT')break;throw e;}}
 return path.join(root,...parts);
}
async function internal(root){const dir=path.join(root,'.brite');try{const s=await fs.lstat(dir);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Invalid .brite project history directory.');}catch(e){if(e.code!=='ENOENT')throw e;await fs.mkdir(dir);}for(const name of ['history','tmp']){const p=path.join(dir,name);if(await absent(p))await fs.mkdir(p);else{const s=await fs.lstat(p);if(!s.isDirectory()||s.isSymbolicLink())throw Error('Invalid internal history path.');}}const journal=path.join(dir,'transaction.json');if(!await absent(journal)){const s=await fs.lstat(journal);if(!s.isFile()||s.isSymbolicLink())throw Error('Invalid internal recovery journal.');}return dir;}
async function writeJournal(root,journal){await internal(root);const temp=path.join(root,'.brite/tmp/journal-'+uuid());await fs.writeFile(temp,JSON.stringify(journal,null,2),{flag:'wx'});await fs.rename(temp,path.join(root,'.brite/transaction.json'));}
async function atomic(root,name,bytes){const target=await safe(root,name);await fs.mkdir(path.dirname(target),{recursive:true});const temp=path.join(root,'.brite','tmp','write-'+uuid());await fs.writeFile(temp,bytes,{flag:'wx'});await fs.rename(temp,target);}
async function owner(root,lock){const actual=JSON.parse(await fs.readFile(path.join(root,'.brite/lock.json'),'utf8'));if(actual.token!==lock?.token||lock.root!==root)throw Error('The presentation write lock changed.');}
export async function lockProject(project){
 const root=await fs.realpath(project);await assertWritableProject(root);await internal(root);const lock={root,token:uuid(),pid:process.pid,startedAt:new Date().toISOString()},file=path.join(root,'.brite/lock.json');
 for(let attempt=0;attempt<2;attempt++)try{await fs.writeFile(file,JSON.stringify(lock),{flag:'wx'});try{await recover(root);}catch(e){await fs.unlink(file);throw e;}return lock;}catch(e){if(e.code!=='EEXIST')throw e;const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Invalid presentation lock file.');const previous=JSON.parse(await fs.readFile(file,'utf8'));if(!Number.isInteger(previous.pid)||previous.pid<1)throw Error('Invalid presentation lock metadata.');let running=true;try{process.kill(previous.pid,0);}catch(error){if(error.code==='ESRCH')running=false;else if(error.code!=='EPERM')throw error;}if(running)throw Error('Another operation is updating this presentation. Wait for it to finish, then retry.');await fs.rename(file,path.join(root,'.brite/history','stale-lock-'+uuid()+'.json'));}
 throw Error('Could not acquire the presentation write lock.');
}
export async function unlockProject(lock){if(!lock)return;await owner(lock.root,lock);await fs.unlink(path.join(lock.root,'.brite/lock.json'));}
async function readOptional(file){try{return await fs.readFile(file);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function recover(root,{preserveConflicts=false}={}){
 const journalFile=path.join(root,'.brite/transaction.json'),bytes=await readOptional(journalFile);if(!bytes)return;
 const journal=JSON.parse(bytes);if(['committed','rolled-back','conflict-preserved'].includes(journal.status))return;
 if(journal.schemaVersion!==1||!/^[a-f\d-]{36}$/.test(journal.id)||!Array.isArray(journal.files)||journal.files.length>1000)throw Error('Invalid presentation recovery journal.');
 const history=path.join(root,'.brite/history',journal.id);const h=await fs.lstat(history);if(!h.isDirectory()||h.isSymbolicLink())throw Error('Invalid recovery history.');
 // Verify every recovery input and current file before changing any of them.
 const recovery=[];
 for(const item of journal.files){const target=await safe(root,item.path),actual=await readOptional(target),actualHash=actual===null?null:sha(actual),conflict=![item.before,item.after].includes(actualHash);if(conflict&&!preserveConflicts)throw Error('A file changed outside the interrupted save. Keep the history and resolve the conflict before recovery.');let before=null;if(item.before!==null){if(!/^\d+\.gz$/.test(item.backup))throw Error('Invalid history backup name.');const p=path.join(history,item.backup),s=await fs.lstat(p);if(!s.isFile()||s.isSymbolicLink())throw Error('Invalid recovery backup.');before=await unpack(await fs.readFile(p));if(sha(before)!==item.before)throw Error('Recovery history hash differs.');}recovery.push({item,target,before,actual,conflict});}
 for(const entry of recovery){if(entry.conflict)continue;if(entry.before!==null)await atomic(root,entry.item.path,entry.before);else if(entry.actual!==null){const target=path.join(history,'uncommitted',entry.item.path);await fs.mkdir(path.dirname(target),{recursive:true});await fs.rename(entry.target,target);}}
 journal.conflicts=recovery.filter(e=>e.conflict).map(e=>e.item.path);journal.status=journal.conflicts.length?'conflict-preserved':'rolled-back';await writeJournal(root,journal);await fs.writeFile(path.join(history,'transaction.json'),JSON.stringify(journal,null,2));
}
export async function commitFiles(project,files,{lock,kind='export',beforeWrite,expected}={}){
 const root=await fs.realpath(project);let ownLock=false;if(!lock){lock=await lockProject(root);ownLock=true;}await owner(root,lock);
 try{
  if(!Array.isArray(files)||new Set(files.map(f=>f.path)).size!==files.length||files.some(f=>!managed(f.path)))throw Error('Publish distinct managed files only.');
  if(expected)for(const [name,before]of Object.entries(expected)){const bytes=await readOptional(await safe(root,name));if((bytes===null?null:sha(bytes))!==before)throw Error('The presentation changed while this save was being prepared. Nothing was published; retry from the current project.');}
  const changes=[];
  for(const file of files){const target=await safe(root,file.path),before=await readOptional(target),after=file.bytes===null?null:Buffer.from(file.bytes);if(expected&&!Object.hasOwn(expected,file.path)&&before!==null)throw Error('A new project file appeared while the save was prepared. Nothing was published.');if((before===null&&after===null)||(before&&after&&before.equals(after)))continue;changes.push({path:file.path,before,after});}
  if(!changes.length)return{changed:0,history:null};
  // The self-contained viewer is the last atomic rename; it always embeds its matching PDF.
  changes.sort((a,b)=>Number(a.path===currentHtml)-Number(b.path===currentHtml));
  const id=uuid(),history=path.join(root,'.brite/history',id);await fs.mkdir(history);
  const journal={schemaVersion:1,id,kind,status:'prepared',createdAt:new Date().toISOString(),files:[]};
  for(const [i,file]of changes.entries()){const backup=file.before===null?null:i+'.gz';if(backup)await fs.writeFile(path.join(history,backup),await pack(file.before),{flag:'wx'});journal.files.push({path:file.path,before:file.before===null?null:sha(file.before),after:file.after===null?null:sha(file.after),backup});}
  await fs.writeFile(path.join(history,'transaction.json'),JSON.stringify(journal,null,2),{flag:'wx'});
  await writeJournal(root,journal);
  try{
   const written=[];const checkWritten=async()=>{for(const file of written){const bytes=await readOptional(await safe(root,file.path));if((bytes===null?null:sha(bytes))!==(file.after===null?null:sha(file.after)))throw Error('A published file changed before the save completed. The external change is preserved.');}};
   for(const [i,file]of changes.entries()){if(beforeWrite)await beforeWrite(file.path,i);await checkWritten();const current=await readOptional(await safe(root,file.path));if((current===null?null:sha(current))!==(file.before===null?null:sha(file.before)))throw Error('A file changed during publication. The external change is preserved; retry from the current project.');if(file.after!==null)await atomic(root,file.path,file.after);else{const target=await safe(root,file.path),retained=path.join(history,'replaced',file.path);await fs.mkdir(path.dirname(retained),{recursive:true});await fs.rename(target,retained);}written.push(file);}
   await checkWritten();
   journal.status='committed';await fs.writeFile(path.join(history,'transaction.json'),JSON.stringify(journal,null,2));await writeJournal(root,journal);
  }catch(error){await recover(root,{preserveConflicts:true});throw error;}
  return{changed:changes.length,history:path.relative(root,history)};
 }finally{if(ownLock)await unlockProject(lock);}
}
export async function treeFiles(root,{excludeInternal=true}={}){const files=[];async function walk(directory,relative=''){for(const entry of await fs.readdir(directory,{withFileTypes:true})){if(!relative&&excludeInternal&&entry.name==='.brite')continue;const name=relative?relative+'/'+entry.name:entry.name;if(entry.isSymbolicLink())throw Error('Project publication does not follow symlinks.');if(entry.isDirectory())await walk(path.join(directory,entry.name),name);else if(entry.isFile())files.push(name);else throw Error('Project publication needs regular files/directories.');}}await walk(root);return files;}
export async function captureProject(root){const snapshot={};for(const name of await treeFiles(root))if(managed(name))snapshot[name]=sha(await fs.readFile(path.join(root,name)));return snapshot;}
export async function publishProject(stage,target,{lock,replaceRecords=false,expected}={}){
 const source=await fs.realpath(stage),root=await fs.realpath(target);if(source===root)throw Error('Validate changes in staging before publication.');
 await assertLegalCompatibility(root,source);
 const names=(await treeFiles(source)).filter(managed),files=await Promise.all(names.map(async name=>({path:name,bytes:await fs.readFile(path.join(source,name))})));
 for(const file of files)if(file.path.startsWith('assets/')){const old=await readOptional(await safe(root,file.path));if(old&&!old.equals(file.bytes))throw Error('An existing project asset differs. Keep it and resolve the explicit asset change; publication was not started.');}
 if(replaceRecords){for(const name of await treeFiles(root))if((/^generation\/(input\.md|source\.json|plan\.json|coverage\.json|fit-report\.json|original\.md|narrative\.json|page\.json)$/.test(name)||/^edits\/(manifest\.json|base-presentation\.js|(?:input|revision|result)-[a-f\d-]{36}\.json)$/.test(name))&&!names.includes(name))files.push({path:name,bytes:null});}
 return commitFiles(root,files,{lock,kind:replaceRecords?'source-rebuild':'edit',expected});
}
