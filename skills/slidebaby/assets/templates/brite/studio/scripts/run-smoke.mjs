#!/usr/bin/env node
/* Optional reproducible fixture. Runs only on explicit request, in new output/scratch folders. */
import fs from 'node:fs/promises';
import {visualTemplate,installedSkillRoot} from './design.mjs';
import {constants} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readFlags,runtimeFlags,checkRuntime} from './check-runtime.mjs';
import {snapshot} from './source.mjs';
import {resolvePlan} from './plan.mjs';
import {loadCatalog} from './check-plan.mjs';
async function absent(file){try{await fs.access(file);throw Error('This path already exists. Choose a new output/scratch name: '+file);}catch(e){if(e.code!=='ENOENT')throw e;}}
export async function runSmoke(options){
 if(!options.output||!options.scratch)throw Error('Use --output NEW-project and --scratch NEW-work-folder.');
 const project=await fs.realpath(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..')),output=path.resolve(options.output),scratch=path.resolve(options.scratch);
 const protectedRoot=await installedSkillRoot(project)||project;
 for(const folder of [output,scratch])if(folder===protectedRoot||folder.startsWith(protectedRoot+path.sep))throw Error('Keep the sample output and scratch outside the installed skill/studio.');
 if(output===scratch||output.startsWith(scratch+path.sep)||scratch.startsWith(output+path.sep))throw Error('Choose separate output and scratch folders.');
 await absent(output);await absent(scratch);
 const runtime=await checkRuntime({...options,project});
 if(!runtime.ready)return{saved:false,status:'runtime-missing',...runtime};
 await fs.mkdir(path.dirname(scratch),{recursive:true});await fs.mkdir(scratch);
 await fs.writeFile(path.join(scratch,'runtime.json'),JSON.stringify(runtime,null,2),{flag:'wx'});
 const input=path.join(scratch,'source.md');await fs.copyFile(path.join(project,'samples/quick-start.md'),input,constants.COPYFILE_EXCL);
 await fs.copyFile(path.join(project,'assets/figma/section-photo.webp'),path.join(scratch,'sample-workspace.webp'),constants.COPYFILE_EXCL);
 await fs.copyFile(path.join(project,'assets/images/cover.webp'),path.join(scratch,'sample-cover.webp'),constants.COPYFILE_EXCL);
 const source=await snapshot(input,{exactSlides:3,allowContinuation:false,preserveBoundaries:true});
 const ref=id=>({ref:id}),picture=id=>({image:{asset:id},imageAlt:ref(id)}),plan={schemaVersion:1,sourceHash:source.artifactHash,presentation:{visualTemplate:structuredClone(visualTemplate),title:'Atlas — Brite photo sample',language:'en',footer:'BRITE SAMPLE / ATLAS',date:'',chrome:{brand:{kind:'text',text:'Atlas'},pageNumbers:true}},slides:[
  {id:'sample-cover',chrome:{section:'Brite sample'},candidates:[{template:'cover-default',rationale:'Opening statement and introduction with the explicitly bundled sample workspace photo.',fields:{title:ref('b0001'),description:ref('b0002'),...picture('b0003')}}]},
  {id:'sample-cards',chrome:{section:'Brite sample'},candidates:[{template:'cards-default',rationale:'Three parallel planning features and the explicitly supplied sample photo.',fields:{title:ref('b0004'),description:ref('b0005'),cards:[{title:ref('b0006'),description:ref('b0007')},{title:ref('b0008'),description:ref('b0009')},{title:ref('b0010'),description:ref('b0011')}],...picture('b0012')}}]},
  {id:'sample-section',chrome:{section:'Brite sample'},candidates:[{template:'divider-image',rationale:'A supplied next-step statement and the explicitly bundled workspace photograph.',fields:{title:ref('b0013'),description:ref('b0014'),...picture('b0015')}}]}
 ]};
 const resolved=resolvePlan(source,plan,await loadCatalog(project));
 await fs.writeFile(path.join(scratch,'source.json'),JSON.stringify(source,null,2),{flag:'wx'});await fs.writeFile(path.join(scratch,'plan.json'),JSON.stringify(plan,null,2),{flag:'wx'});await fs.writeFile(path.join(scratch,'coverage.json'),JSON.stringify(resolved.coverage,null,2),{flag:'wx'});
 const child=spawnSync(process.execPath,[path.join(project,'scripts/build-deck.mjs'),'--source',path.join(scratch,'source.json'),'--plan',path.join(scratch,'plan.json'),'--project',project,'--output',output,'--scratch',path.join(scratch,'build'),'--playwright-module',runtime.runtime.playwrightModule,'--pdf-lib-module',runtime.runtime.pdfLibModule,'--browser-executable',runtime.runtime.browserExecutable],{encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
 await fs.writeFile(path.join(scratch,'build.log'),child.stdout+'\n'+child.stderr+(child.error?'\n'+child.error.message:''),{flag:'wx'});
 if(child.status!==0)throw Error('The optional sample did not complete. No completed PDF is claimed. Inspect the preserved work at '+scratch+'.');
 const built=JSON.parse(child.stdout),result={saved:true,sampleOnly:true,output,slides:3,sourceBlocks:source.blocks.length,export:built.export,preview:built.html,html:built.html,pdf:built.pdf,project:built.project,summary:options.lang==='pl'?'Test gotowy: 3 przykładowe slajdy, projekt HTML i PDF. To fikcyjny przykład, nie Twoja prezentacja.':'Test ready: 3 sample slides, an HTML project and PDF. This fictional example is separate from your presentation.'};
 await fs.writeFile(path.join(scratch,'result.json'),JSON.stringify(result,null,2),{flag:'wx'});return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.includes('--help'))console.log('Optional Brite sample: node scripts/run-smoke.mjs --output NEW-project --scratch NEW-work-folder [runtime options from check-runtime.mjs] [--lang en|pl]. Never installs dependencies or replaces existing folders.');
 else try{const result=await runSmoke(readFlags([...runtimeFlags,'output','scratch']));console.log(JSON.stringify(result,null,2));if(!result.saved)process.exitCode=2;}catch(e){console.log(JSON.stringify({saved:false,error:e.message}));process.exitCode=2;}
}
