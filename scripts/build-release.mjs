#!/usr/bin/env node
/* New local release artifacts only. No installation, git mutation or upload. */
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath} from 'node:url';import {checkRelease,inventory,repo} from './check-release.mjs';import {makeZip} from './zip.mjs';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export async function buildRelease(output){
 await checkRelease({tests:false,syntax:false});const meta=JSON.parse(await fs.readFile(path.join(repo,'release.json'))),target=path.resolve(output||path.join(repo,'dist',meta.version));
 const dist=path.join(repo,'dist');
 if(target===repo||(target.startsWith(repo+path.sep)&&target!==dist&&!target.startsWith(dist+path.sep)))throw Error('Keep release output outside source folders.');
 try{await fs.lstat(target);throw Error('Release output already exists. Choose a new directory.');}catch(e){if(e.code!=='ENOENT')throw e;}
 const allowedRoots=new Set(['skills','docs','scripts','.github']),allowedFiles=new Set(['README.md','AGENTS.md','CONTRIBUTING.md','LICENSE','LICENSING.md','THIRD_PARTY_NOTICES.md','CREDITS.md','CHANGELOG.md','RELEASE_NOTES.md','release.json','.gitignore','.gitattributes']);const names=await inventory(),unexpected=names.filter(n=>!allowedRoots.has(n.split('/')[0])&&!allowedFiles.has(n));if(unexpected.length)throw Error('Review unexpected source files before packing: '+unexpected.join(', '));
 const source=await Promise.all(names.map(async name=>({name,bytes:await fs.readFile(path.join(repo,name))}))),prefix=meta.skillPath+'/',skill=source.filter(f=>f.name.startsWith(prefix)).map(f=>({name:meta.skill+'/'+f.name.slice(prefix.length),bytes:f.bytes}));
 const outputs=[{name:'slidebaby-skill-v'+meta.version+'.zip',bytes:makeZip(skill)},{name:'slidebaby-source-v'+meta.version+'.zip',bytes:makeZip(source.map(f=>({name:'slidebaby/'+f.name,bytes:f.bytes})))}];
 const manifest={schemaVersion:1,product:meta.product,version:meta.version,prepared:meta.prepared,skill:meta.skill,templates:meta.templates,artifacts:outputs.map(f=>({name:f.name,bytes:f.bytes.length,sha256:sha(f.bytes)})),sourceFiles:source.map(f=>({path:f.name,sha256:sha(f.bytes)}))};
 await fs.mkdir(path.dirname(target),{recursive:true});await fs.mkdir(target);for(const file of outputs)await fs.writeFile(path.join(target,file.name),file.bytes,{flag:'wx'});
 await fs.writeFile(path.join(target,'SHA256SUMS'),outputs.map(f=>sha(f.bytes)+'  '+f.name).join('\n')+'\n',{flag:'wx'});await fs.writeFile(path.join(target,'RELEASE_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});await fs.copyFile(path.join(repo,'RELEASE_NOTES.md'),path.join(target,'RELEASE_NOTES.md'),fs.constants.COPYFILE_EXCL);
 return{saved:true,output:target,...manifest};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{const args=process.argv.slice(2);if(args.length&&!(args.length===2&&args[0]==='--out'))throw Error('Use --out NEW-release-directory.');const result=await buildRelease(args[1]);console.log(JSON.stringify({saved:result.saved,output:result.output,version:result.version,artifacts:result.artifacts},null,2));}catch(e){console.error(e.message);process.exitCode=1;}
