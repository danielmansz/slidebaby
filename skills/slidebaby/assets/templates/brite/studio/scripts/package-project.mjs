#!/usr/bin/env node
/* Current editable project ZIP. Never prunes or writes into the source project. */
import fs from 'node:fs/promises';
import {legalFiles,assertEmbeddedLegalNotices} from './legal-notices.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {args,hash} from './source.mjs';
import {verifyDocument,readDeck,exists} from './verify-document.mjs';
import {checkedSnapshot} from './live-preview.mjs';
import {makeZip} from './zip.mjs';
const top=new Set(['visual-template.json','index.html','presentation.js','exports.js','presentation.html','app.js','app.css','engine.js','slides.css','catalog.js','i18n.js','changelog.js','AGENTS.md','AGENT_GUIDE.md','README.md','TEMPLATE_CONTRACTS.md','SOURCE_TO_DECK.md','SHARED_SLIDE_ELEMENTS.md','EDITING_WORKFLOW.md','BRAND_PROFILE.md','ASSET_GUIDANCE.md','ASSET_NOTES.md','NARRATIVE.md','WEBPAGE.md','DELIVERY.md','LIVE_PREVIEW.md','PRODUCT_RELEASES.md','PALETTES.md','BACKGROUND_IMAGES.md','REFLOW.md',...legalFiles]);
const directories=new Set(['assets','scripts','samples','generation','edits']);
async function settled(root){
 if(await exists(path.join(root,'.brite/lock.json')))throw Error('Wait for the current project save to finish before packaging.');
 const file=path.join(root,'.brite/transaction.json');if(await exists(file)){const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('Invalid recovery state.');const record=JSON.parse(await fs.readFile(file));if(!['committed','rolled-back'].includes(record.status))throw Error('Resolve the interrupted/conflicting save before packaging.');}
}
export async function packageProject({project,output}={}){
 if(!project||!output)throw Error('Use --project CURRENT-project --output NEW-project.zip.');
 const root=await fs.realpath(project),destination=path.resolve(output),parent=await fs.realpath(path.dirname(destination));
 if(path.extname(destination).toLowerCase()!=='.zip'||parent===root||parent.startsWith(root+path.sep))throw Error('Write a new ZIP outside the source project.');
 if(await exists(destination))throw Error('Archive already exists. Choose a new archive filename.');
 await settled(root);await verifyDocument(root);const deck=await readDeck(path.join(root,'presentation.js'));
 if(!deck?.slides?.length)throw Error('Package a completed presentation, not the installed empty starter.');
 const checked=await checkedSnapshot(root,null);if(!checked)throw Error('A checked current HTML/PDF pair is required.');await assertEmbeddedLegalNotices(root);
 const selected=[],excluded=[];let inputBytes=0;
 async function walk(directory,relative=''){
  const entries=(await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
  for(const entry of entries){const name=relative?relative+'/'+entry.name:entry.name;
   const include=!relative?(top.has(name)||directories.has(name)||name==='exports'):relative==='exports'?['presentation.pdf','source-revision.json'].includes(entry.name):true;
   if(!include){excluded.push(name);continue;}
   if(entry.isSymbolicLink())throw Error('Portable projects do not follow symlinks: '+name);
   if(entry.isDirectory())await walk(path.join(directory,entry.name),name);
   else if(entry.isFile()){const file=path.join(directory,entry.name),stat=await fs.stat(file);inputBytes+=stat.size;if(inputBytes>512*1024*1024||selected.length>=59998)throw Error('Portable project exceeds the supported archive size/file limit.');const bytes=await fs.readFile(file);selected.push({name,bytes,sha256:hash(bytes)});}
   else throw Error('Portable projects require regular files: '+name);
  }
 }
 await walk(root);
 // Reject concurrent changes, including notes/assets outside the PDF fingerprint.
 await settled(root);await verifyDocument(root);
 for(const file of selected)if(hash(await fs.readFile(path.join(root,file.name)))!==file.sha256)throw Error('The project changed during packaging. Retry from its current saved state.');
 const after=await checkedSnapshot(root,null);if(!after||after.version!==checked.version)throw Error('The checked presentation changed during packaging. Retry.');
 const manifest={schemaVersion:1,kind:'slidebaby-current-project',revision:checked.revision,slides:deck.slides.length,notes:'Current editable project. Generation and replay records/assets are retained. Local recovery snapshots, live session state and unrecognized files are excluded; source files remain untouched.',excluded,files:selected.map(({name,sha256,bytes})=>({path:name,sha256,bytes:bytes.length}))};
 const archive=makeZip([...selected.map(({name,bytes})=>({name:'slidebaby-presentation/'+name,bytes})),{name:'slidebaby-presentation/PROJECT_ARCHIVE.json',bytes:Buffer.from(JSON.stringify(manifest,null,2)+'\n')}]);
 await fs.writeFile(destination,archive,{flag:'wx'});
 return{saved:true,archive:destination,bytes:archive.length,inputBytes,files:selected.length+1,slides:deck.slides.length,revision:checked.revision,excluded,sourceUnchanged:true};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--help'))console.log('Optional backup/transfer: node scripts/package-project.mjs --project CURRENT-project --output NEW-project.zip. Uses existing Node only; excludes recovery snapshots/live state without changing the source project.');
 else try{console.log(JSON.stringify(await packageProject(args(['project','output'])),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
}
