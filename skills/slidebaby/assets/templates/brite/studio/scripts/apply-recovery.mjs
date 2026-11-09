#!/usr/bin/env node
/* Explicitly accepted measured proposal → ordinary replayable edit → guarded publication. */
import {assertWritableProject} from './design.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {args,digest} from './source.mjs';import {readDeck,verifyDocument,exists} from './verify-document.mjs';import {captureProject,lockProject,unlockProject,publishProject} from './publish.mjs';import {loadCatalog} from './check-plan.mjs';import {assertLosslessRecoveryRequest,recoveryToolchainHash} from './recovery.mjs';
export async function applyRecovery(options){
 for(const key of ['project','proposal','choice','playwright-module','pdf-lib-module','browser-executable'])if(!options[key])throw Error('Missing --'+key+'. Read REFLOW.md.');
 if(options.accept!=='true')throw Error('Present the concrete proposal and wait for acceptance. Apply only with --accept true after the user accepts this choice.');
 const proposalFile=await fs.realpath(options.proposal),proposal=JSON.parse(await fs.readFile(proposalFile)),target=path.resolve(options.project),studio=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 await assertWritableProject(target);
 if(proposal.schemaVersion!==1||proposal.kind!=='slidebaby-fit-recovery'||path.resolve(proposal.target)!==target)throw Error('Use the proposal for this exact intended project.');
 if(proposal.toolchainHash!==await recoveryToolchainHash())throw Error('The layout tools changed since this proposal. Regenerate it with the current skill.');
 if(path.basename(target)==='studio'&&await exists(path.resolve(target,'../../SKILL.md')))throw Error('Keep the installed skill starter unchanged.');
 if(target===studio||target.startsWith(studio+path.sep))throw Error('Do not publish into the installed studio.');
 const draft=await fs.realpath(proposal.draft);if(draft===target||target.startsWith(draft+path.sep))throw Error('Keep the source draft separate from the intended project.');
 if(digest(await captureProject(draft))!==digest(proposal.draftSnapshot))throw Error('The proposal draft changed. Regenerate the proposal instead of applying stale ranges.');
 await verifyDocument(draft);const choice=proposal.choices?.find(c=>c.id===options.choice);if(!choice||choice.requestHash!==digest(choice.request))throw Error('The selected recovery request is missing or changed.');
 const catalog=await loadCatalog(studio),before=await readDeck(path.join(draft,'presentation.js')),result=assertLosslessRecoveryRequest(before,choice.request,catalog);
 if(digest(result.deck)!==choice.resultHash||result.deck.slides.length!==choice.toCount)throw Error('The proposal no longer produces its reviewed result.');
 if(!proposal.allowAdditionalSlides&&result.deck.slides.length>before.slides.length)throw Error('This request forbids additional slides.');
 const updating=await exists(target);
 if(updating&&!proposal.expectedTarget)throw Error('The new-project destination now exists. Keep it and regenerate a proposal for the intended project.');
 if(!updating&&proposal.expectedTarget)throw Error('The original saved project is unavailable. Restore it or deliberately create a new proposal.');
 let lock;
 try{
  if(updating){lock=await lockProject(target);await verifyDocument(target);if(digest(await captureProject(target))!==digest(proposal.expectedTarget))throw Error('The saved presentation changed since this proposal. Regenerate it; the current files are preserved.');}
  const folder=path.dirname(proposalFile),input=path.join(folder,'accepted-'+crypto.randomUUID()+'.json'),output=path.join(path.dirname(draft),'accepted-'+crypto.randomUUID());
  await fs.writeFile(input,JSON.stringify(choice.request,null,2),{flag:'wx'});
  const flags=['--project',draft,'--studio',studio,'--input',input,'--output',output,'--allow-additional-slides','false'];for(const key of ['playwright-module','pdf-lib-module','browser-executable'])flags.push('--'+key,path.resolve(options[key]));
  const child=spawnSync(process.execPath,[path.join(studio,'scripts/edit-deck.mjs'),...flags],{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
  await fs.writeFile(path.join(folder,'accepted-export-'+crypto.randomUUID()+'.log'),child.stdout+'\n'+child.stderr,{flag:'wx'});
  if(child.status!==0)throw Error('The accepted choice did not complete export. The previous project remains intact. Preserve diagnostics at '+folder+'. '+child.stderr.slice(0,1600));
  await verifyDocument(output);let publication;
  if(updating)publication=await publishProject(output,target,{lock,expected:proposal.expectedTarget,replaceRecords:true});
  else{await fs.mkdir(path.dirname(target),{recursive:true});await fs.mkdir(target);for(const name of await fs.readdir(output))if(name!=='.brite')await fs.cp(path.join(output,name),path.join(target,name),{recursive:true,errorOnExist:true,force:false});}
  const accepted={schemaVersion:1,choice:choice.id,proposalHash:digest(proposal),sourceDraft:proposal.draft,output:target,slides:result.deck.slides.length,acceptedAt:new Date().toISOString(),history:publication?.history??null};await fs.writeFile(path.join(folder,'accepted-'+crypto.randomUUID()+'-receipt.json'),JSON.stringify(accepted,null,2),{flag:'wx'});
  return{saved:true,status:'accepted',output:target,html:path.join(target,'presentation.html'),pdf:path.join(target,'exports/presentation.pdf'),project:path.join(target,'index.html'),slides:result.deck.slides.length,choice:choice.id,existingTextPreserved:true,history:publication?.history??null};
 }finally{if(lock)await unlockProject(lock);}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(JSON.stringify(await applyRecovery(args(['project','proposal','choice','accept','playwright-module','pdf-lib-module','browser-executable'])),null,2));}catch(error){console.error(error.message);process.exitCode=1;}
