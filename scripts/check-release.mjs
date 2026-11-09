#!/usr/bin/env node
/* Read-only release checks using the registered visual-template bundles. */
import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
import{readRegistry,localPath}from'../skills/slidebaby/scripts/template-registry.mjs';
export const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function inventory(root=repo){const files=[];async function walk(folder,prefix=''){for(const entry of(await fs.readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){if(['.git','dist','node_modules'].includes(entry.name))continue;const name=prefix?prefix+'/'+entry.name:entry.name,file=path.join(folder,entry.name);if(entry.isSymbolicLink())throw Error('Release source cannot contain a symlink: '+name);if(entry.isDirectory())await walk(file,name);else if(entry.isFile())files.push(name);else throw Error('Release source needs regular files: '+name);}}await walk(root);return files;}
export async function checkRelease({tests=true,syntax=true}={}){
 const version=JSON.parse(await fs.readFile(path.join(repo,'release.json'))),skill=path.join(repo,version.skillPath),files=await inventory();
 if(!/^\d+\.\d+\.\d+$/.test(version.version)||version.skill!=='slidebaby'||version.skillPath!=='skills/slidebaby'||version.templateRegistry!=='assets/templates.json')throw Error('Unexpected release version or skill identity.');
 const skillText=await fs.readFile(path.join(skill,'SKILL.md'),'utf8'),front=skillText.match(/^---\n([\s\S]*?)\n---/)?.[1];if(!front?.includes('name: '+version.skill+'\n')||!front.includes('version: "'+version.version+'"')||!front.includes('LicenseRef-Slidebaby-Community-1.0'))throw Error('Skill metadata is inconsistent.');
 const description=front.match(/^description: (.+)$/m)?.[1];if(!description||description.length>200)throw Error('Keep the skill description within 200 characters.');
 const registry=await readRegistry(skill),templates=[];
 if(JSON.stringify(version.templates)!==JSON.stringify(registry.templates.map(({id,version})=>({id,version}))))throw Error('Release/registered visual-template versions differ.');
 for(const template of registry.templates){
  const context=vm.createContext({window:{},structuredClone});
  if(!Array.isArray(template.load)||!template.bindings)throw Error('Missing template inspection contract.');
  for(const name of template.load)vm.runInContext(await fs.readFile(await localPath(template.runtime,name),'utf8'),context,{filename:name});
  const deck=context.window[template.bindings.deck],catalog=context.window[template.bindings.catalog],engine=context.window[template.bindings.engine];
  if(deck?.slides?.length!==0)throw Error('The installed starter must be empty: '+template.id);
  const identity=v=>v?.id===template.id&&v?.version===template.version;
  if(!identity(deck.visualTemplate)||!identity(catalog.visualTemplate)||!identity(engine.visualTemplate))throw Error('Saved/catalogue/engine template identity differs: '+template.id);
  if(catalog.entries.length!==template.catalog.recipes||catalog.families.length!==template.catalog.families||engine.layoutVersion!==template.renderer)throw Error('Catalogue/renderer metadata differs: '+template.id);
  const families=[...new Set(catalog.entries.map(e=>e.family))].sort();if(JSON.stringify(families)!==JSON.stringify([...template.capabilities.layouts].sort()))throw Error('Declared layout capabilities differ: '+template.id);
  const log=context.window.SlidebabyChangelog;if(log?.version!==version.version||log.channel!=='release'||log.entries[0]?.version!==version.version||log.entries.some(e=>/^4\./.test(e.version)))throw Error('Public changelog must match the release, without development history.');
  templates.push({id:template.id,version:template.version,...template.catalog,renderer:template.renderer,emptyStarter:true});
 }
 for(const name of ['LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md']){const expected=await fs.readFile(path.join(repo,name));for(const folder of [skill,...registry.templates.map(t=>t.runtime)])if(!expected.equals(await fs.readFile(path.join(folder,name))))throw Error('Legal copies differ: '+name);}
 const problems=[],secret=/(?:\/Users\/[^/\s]+\/|\/var\/folders\/|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
 const runtimePaths=registry.templates.map(t=>path.relative(repo,t.runtime).split(path.sep).join('/'));
 for(const name of files){
  const privateProject=runtimePaths.some(prefix=>name.startsWith(prefix+'/assets/user/')||['generation','edits','exports'].some(dir=>name.startsWith(prefix+'/'+dir+'/')));
  if(privateProject||/(?:^|\/)(?:\.brite|\.DS_Store|\.env(?:\.[^/]+)?|node_modules)(?:\/|$)|\.(?:zip|pdf)$/.test(name)||name.startsWith('work/')||name.startsWith('outputs/'))problems.push('Unintended artifact: '+name);
  if(!/\.(?:webp|png|jpe?g|ttf|otf|woff2?)$/i.test(name)){const content=await fs.readFile(path.join(repo,name),'utf8');if(secret.test(content))problems.push('Private path/credential-like text: '+name);
   if(name.endsWith('.md')&&!name.endsWith('/samples/quick-start.md')){const prose=content.replace(/```[\s\S]*?```/g,'');for(const link of prose.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){let target=link[1].trim().split(/\s+"/)[0].replace(/^<|>$/g,'');if(/^(?:[a-z]+:|#)/i.test(target))continue;target=decodeURIComponent(target.split('#')[0].split('?')[0]);if(!target)continue;const full=path.resolve(path.dirname(path.join(repo,name)),target);if(!full.startsWith(repo+path.sep)||!await fs.stat(full).catch(()=>null))problems.push('Broken local link: '+name+' → '+target);}}
  }
  if(syntax&&/\.(?:js|mjs)$/.test(name)){const checked=spawnSync(process.execPath,['--check',path.join(repo,name)],{encoding:'utf8'});if(checked.status!==0)problems.push(name+': '+checked.stderr);}
 }
 if(problems.length)throw Error(problems.join('\n'));
 if(tests){const testFiles=files.filter(n=>n.endsWith('.test.mjs')).map(n=>path.join(repo,n)),result=spawnSync(process.execPath,['--test',...testFiles],{stdio:'inherit'});if(result.status!==0)throw Error('Bundled tests failed.');}
 return{valid:true,version:version.version,files:files.length,templates,legalCopies:'identical',syntax:syntax?'checked':'not rerun',tests:tests?'passed':'not rerun'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{console.log(JSON.stringify(await checkRelease(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
