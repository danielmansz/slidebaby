#!/usr/bin/env node
/* Product entry point; delegate only registered local template commands. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {defaultSkillRoot,readRegistry,resolveTemplate,localPath} from './template-registry.mjs';
export async function route(argv,{skillRoot=defaultSkillRoot}={}){
 const [command,...input]=argv;
 if(!command||command==='help'||command==='--help')return{help:'Use: slidebaby.mjs templates | resolve [--design ID] [--project PROJECT] | browse --output NEW-project [--design ID] | COMMAND [--design ID] [template command flags]. --design selects a visual template; --template is a layout recipe.'};
 if(command==='templates'){if(input.length)throw Error('templates takes no flags.');const registry=await readRegistry(skillRoot);return{default:registry.default,templates:registry.templates.map(({id,name,version,catalog,capabilities})=>({id,name,version,catalog,capabilities}))};}
 let design;const flags=[];
 for(let i=0;i<input.length;i++){if(input[i]==='--design'){if(design||!input[i+1])throw Error('Supply --design ID once.');design=input[++i];}else flags.push(input[i]);}
 const flag=name=>{const at=flags.indexOf('--'+name);if(at<0)return undefined;if(at===flags.length-1||flags[at+1].startsWith('--')||flags.lastIndexOf('--'+name)!==at)throw Error('Supply --'+name+' VALUE once.');return flags[at+1];};
 const project=flag('project'),selection=await resolveTemplate({skillRoot,design,project}),template=selection.template;
 if(command==='resolve'){if(flags.some((_,i)=>i%2===0&&flags[i]!=='--project'))throw Error('resolve accepts --design and --project only.');return{id:template.id,name:template.name,version:template.version,runtime:template.runtime,manifest:template.manifestPath,legacyProject:selection.legacy};}
 if(command==='browse'){
  if(project||flags.length%2||!flag('output')||flags.some((v,i)=>i%2===0&&!['--output','--lang'].includes(v)))throw Error('Use browse --output NEW-project [--design ID] [--lang en|pl].');
  const lang=flag('lang')||'en';if(!['en','pl'].includes(lang))throw Error('Use --lang en or pl.');
  const output=path.resolve(flag('output')),installed=await fs.realpath(skillRoot);
  if(output===installed||output.startsWith(installed+path.sep))throw Error('Keep projects outside the installed skill.');
  try{await fs.lstat(output);throw Error('Browse output already exists; choose a new project folder.');}catch(e){if(e.code!=='ENOENT')throw e;}
  await fs.mkdir(path.dirname(output),{recursive:true});await fs.cp(template.runtime,output,{recursive:true,errorOnExist:true,force:false});
  const script=await localPath(output,template.commands['make-preview']),child=spawnSync(process.execPath,[script,'--project',output],{encoding:'utf8'});
  if(child.status!==0)throw Error('The copied project is preserved, but its preview failed: '+(child.stderr||child.stdout));
  return{saved:true,visualTemplate:{id:template.id,version:template.version},project:output,html:path.join(output,'presentation.html'),url:pathToFileURL(path.join(output,'presentation.html')).href+'?lang='+lang+'#templates',empty:true};
 }
 const relative=template.commands[command];if(!relative)throw Error('Command is not supported by this visual template: '+command);
 const script=await localPath(template.runtime,relative),args=[...flags];
 // For an existing project, upgraded edit helpers retain its own saved visual runtime.
 // Read-only/new-project commands receive the selected runtime when no project was supplied.
 if(!project&&template.projectCommands?.includes(command))args.push('--project',template.runtime);
 return{script,args,template:template.id};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 const result=await route(process.argv.slice(2));
 if(result.script){const child=spawnSync(process.execPath,[result.script,...result.args],{stdio:'inherit'});if(child.error)throw child.error;process.exitCode=child.status??1;}else console.log(JSON.stringify(result,null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
