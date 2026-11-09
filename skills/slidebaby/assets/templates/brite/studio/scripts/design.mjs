/* Brite adapter identity. Keep recipe IDs and the saved visual runtime independent. */
import fs from 'node:fs/promises';
import path from 'node:path';
export const visualTemplate=Object.freeze({id:'brite',version:'1.0.0'});
export function assertDesign(value,{optional=true}={}){
 if(value===undefined&&optional)return;
 if(!value||Array.isArray(value)||Object.keys(value).some(k=>!['id','version'].includes(k))||value.id!==visualTemplate.id||value.version!==visualTemplate.version)throw Error('Unknown or incompatible visual template. This runtime renders Brite 1.0.0; preserve the saved project instead of substituting a design.');
}
export function assertDesignBinding(deck,plan){
 assertDesign(deck.visualTemplate);assertDesign(plan.presentation?.visualTemplate);
 if((deck.visualTemplate===undefined)!==(plan.presentation?.visualTemplate===undefined))throw Error('Visual-template identity differs from the source plan.');
}
export async function assertProjectDesign(root,deck){
 let marker;try{marker=JSON.parse(await fs.readFile(path.join(root,'visual-template.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(marker){if(marker.schemaVersion!==1)throw Error('Invalid visual-template marker.');assertDesign({id:marker.id,version:marker.version},{optional:false});const engine=await fs.readFile(path.join(root,'engine.js'),'utf8');if(typeof marker.renderer!=='string'||!engine.includes(marker.renderer))throw Error('Saved visual-template renderer differs.');}
 if(deck){assertDesign(deck.visualTemplate);if(marker?.deckIdentityRequired===true&&deck.visualTemplate===undefined)throw Error('Visual-template identity is missing from this project. Restore its saved identity; do not substitute a default design.');}
}
export async function installedSkillRoot(root){
 let current=path.resolve(root);
 for(;;){try{const content=await fs.readFile(path.join(current,'SKILL.md'),'utf8');if(/^name: (?:slidebaby|brite-compose)\s*$/m.test(content))return current;}catch(e){if(e.code!=='ENOENT'&&e.code!=='ENOTDIR')throw e;}const parent=path.dirname(current);if(parent===current)return null;current=parent;}
}
export async function assertWritableProject(root){if(await installedSkillRoot(root))throw Error('Keep the installed skill and its template starters unchanged. Create a project outside the installed skill.');}
