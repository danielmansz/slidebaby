/* Local, manifest-driven visual-template selection. No installs or remote code. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const idPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const defaultSkillRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function localPath(root,relative){
 if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||path.win32.isAbsolute(relative)||relative.split(/[\\/]/).some(p=>!p||p==='.'||p==='..'))throw Error('Template paths must stay inside their bundle.');
 const base=await fs.realpath(root);let current=base;
 for(const part of relative.split('/')){current=path.join(current,part);if((await fs.lstat(current)).isSymbolicLink())throw Error('Template paths cannot follow symlinks.');}
 const resolved=await fs.realpath(current);if(!resolved.startsWith(base+path.sep))throw Error('Template path escapes its bundle.');return resolved;
}
export async function readRegistry(skillRoot=defaultSkillRoot){
 const assets=await localPath(skillRoot,'assets'),registry=JSON.parse(await fs.readFile(await localPath(assets,'templates.json'),'utf8'));
 if(registry.schemaVersion!==1||!Array.isArray(registry.templates)||!registry.templates.length)throw Error('Invalid visual-template registry.');
 const templates=[],ids=new Set();
 for(const entry of registry.templates){
  if(!idPattern.test(entry.id)||ids.has(entry.id))throw Error('Invalid or duplicate visual-template ID.');ids.add(entry.id);
  const file=await localPath(assets,entry.manifest),manifest=JSON.parse(await fs.readFile(file,'utf8'));
  if(manifest.schemaVersion!==1||manifest.id!==entry.id||typeof manifest.name!=='string'||!/^\d+\.\d+\.\d+$/.test(manifest.version)||typeof manifest.renderer!=='string'||!manifest.catalog||!manifest.capabilities||!manifest.commands||!Object.keys(manifest.commands).length)throw Error('Invalid visual-template manifest: '+entry.id);
  if(!Number.isInteger(manifest.catalog.recipes)||manifest.catalog.recipes<1||!Number.isInteger(manifest.catalog.families)||manifest.catalog.families<1||!Array.isArray(manifest.capabilities.layouts)||!manifest.capabilities.layouts.length||!Array.isArray(manifest.capabilities.palettes)||!manifest.capabilities.palettes.length||!Array.isArray(manifest.projectCommands)||manifest.projectCommands.some(command=>!Object.hasOwn(manifest.commands,command)))throw Error('Invalid template capabilities or project commands: '+entry.id);
  const runtime=await localPath(path.dirname(file),manifest.runtime);
  for(const [command,relative]of Object.entries(manifest.commands)){if(!idPattern.test(command)||(await fs.stat(await localPath(runtime,relative))).isDirectory())throw Error('Invalid template command: '+command);}
  const marker=JSON.parse(await fs.readFile(await localPath(runtime,'visual-template.json'),'utf8'));
  if(marker.schemaVersion!==1||marker.id!==manifest.id||marker.version!==manifest.version||marker.renderer!==manifest.renderer)throw Error('Template/runtime identity differs: '+entry.id);
  templates.push({...manifest,runtime,manifestPath:file});
 }
 if(!ids.has(registry.default))throw Error('The default visual template is not registered.');
 return{schemaVersion:1,default:registry.default,templates};
}
function matchesLegacy(template,engine){const rule=template.legacy;if(!rule||!engine.includes(rule.engineMarker))return false;const escaped=rule.rendererPrefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),match=engine.match(new RegExp(escaped+'(\\d+)'));return !!match&&Number(match[1])>=rule.min&&Number(match[1])<=rule.max;}
export async function projectTemplate(project,registry){
 const root=await fs.realpath(project);let marker;
 try{marker=JSON.parse(await fs.readFile(await localPath(root,'visual-template.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(marker){
  const template=registry.templates.find(t=>t.id===marker.id);
  if(marker.schemaVersion!==1||!template||marker.version!==template.version)throw Error('This project uses an unknown or unavailable visual-template version. Keep its saved runtime; do not substitute another template.');
  const engine=await fs.readFile(await localPath(root,'engine.js'),'utf8');
  if(typeof marker.renderer!=='string'||!engine.includes(marker.renderer)||(marker.renderer!==template.renderer&&!matchesLegacy(template,engine)))throw Error('Project template/renderer identity differs.');
  return{template,legacy:false};
 }
 const engine=await fs.readFile(await localPath(root,'engine.js'),'utf8'),catalog=await fs.readFile(await localPath(root,'catalog.js'),'utf8');
 const matches=registry.templates.filter(t=>{const rule=t.legacy;if(!rule||!engine.includes(rule.engineMarker)||!catalog.includes(rule.catalogMarker))return false;const match=engine.match(new RegExp(rule.rendererPrefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(\\d+)'));return match&&Number(match[1])>=rule.min&&Number(match[1])<=rule.max;});
 if(matches.length!==1)throw Error('Cannot identify this legacy project. Keep it unchanged; no default visual template was substituted.');
 return{template:matches[0],legacy:true};
}
export async function resolveTemplate({skillRoot=defaultSkillRoot,design,project}={}){
 const registry=await readRegistry(skillRoot);
 if(design!=null&&!registry.templates.some(t=>t.id===design))throw Error('Unknown visual template: '+design);
 const saved=project?await projectTemplate(project,registry):null;
 if(saved&&design&&saved.template.id!==design)throw Error('Changing a project visual template requires an explicit content-mapping workflow; this command preserves its current design.');
 return{registry,template:saved?.template||registry.templates.find(t=>t.id===(design||registry.default)),legacy:saved?.legacy||false};
}
