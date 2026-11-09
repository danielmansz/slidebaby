import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {defaultSkillRoot,readRegistry,resolveTemplate} from '../template-registry.mjs';
import {route} from '../slidebaby.mjs';
import {assertDesign,assertDesignBinding,assertWritableProject} from '../../assets/templates/brite/studio/scripts/design.mjs';

async function fixture(t){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'slidebaby-registry-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 const write=async(name,value)=>{await fs.mkdir(path.dirname(path.join(root,name)),{recursive:true});await fs.writeFile(path.join(root,name),typeof value==='string'?value:JSON.stringify(value));};
 await write('assets/templates.json',{schemaVersion:1,default:'other',templates:[{id:'other',manifest:'templates/other/template.json'}]});
 await write('assets/templates/other/template.json',{schemaVersion:1,id:'other',name:'Independent test adapter',version:'2.0.0',runtime:'studio',renderer:'other-engine-2',catalog:{recipes:1,families:1},capabilities:{layouts:['example'],palettes:['light']},commands:{catalog:'catalog.mjs'},projectCommands:['catalog']});
 await write('assets/templates/other/studio/visual-template.json',{schemaVersion:1,id:'other',version:'2.0.0',renderer:'other-engine-2'});
 await write('assets/templates/other/studio/catalog.mjs','console.log("other adapter");');
 await write('assets/templates/other/studio/engine.js','/* other-engine-2 */');
 return{root,write};
}
test('The public skill resolves Brite through its registry and separates recipes from designs',async()=>{
 const {template}=await resolveTemplate();assert.equal(template.id,'brite');assert.equal(template.catalog.recipes,69);
 const result=await route(['catalog','--design','brite','--template','cover-default']);
 assert(result.script.endsWith('/templates/brite/studio/scripts/catalog.mjs'));
 assert.deepEqual(result.args,['--template','cover-default','--project',template.runtime]);
 const source=await route(['prepare-source','--input','source.md','--output','source.json']);assert(!source.args.includes('--project'));
});
test('Another registered adapter can be selected without Brite files or globals',async t=>{
 const{root}=await fixture(t),registry=await readRegistry(root);assert.equal(registry.default,'other');
 const result=await route(['catalog'],{skillRoot:root});assert.equal(result.template,'other');assert(result.script.endsWith('/other/studio/catalog.mjs'));
});
test('Saved project identity selects its adapter and rejects an explicit conflicting design',async t=>{
 const{root,write}=await fixture(t);
 const alternate=JSON.parse(await fs.readFile(path.join(root,'assets/templates/other/template.json'),'utf8'));alternate.id='alternate';
 await write('assets/templates/alternate/template.json',alternate);await write('assets/templates/alternate/studio/visual-template.json',{schemaVersion:1,id:'alternate',version:'2.0.0',renderer:'other-engine-2'});await write('assets/templates/alternate/studio/catalog.mjs','console.log("alternate");');
 await write('assets/templates.json',{schemaVersion:1,default:'alternate',templates:[{id:'other',manifest:'templates/other/template.json'},{id:'alternate',manifest:'templates/alternate/template.json'}]});
 await write('project/visual-template.json',{schemaVersion:1,id:'other',version:'2.0.0',renderer:'other-engine-2'});await write('project/engine.js','/* other-engine-2 */');
 const project=path.join(root,'project'),before=await fs.readFile(path.join(project,'visual-template.json'));
 assert.equal((await resolveTemplate({skillRoot:root,project})).template.id,'other');
 await assert.rejects(resolveTemplate({skillRoot:root,design:'alternate',project}),/Changing a project visual template/);
 assert((await fs.readFile(path.join(project,'visual-template.json'))).equals(before));
});
test('Unknown design/version and unrecognized legacy projects never fall back to the default',async t=>{
 const{root,write}=await fixture(t),project=path.join(root,'project');
 await assert.rejects(resolveTemplate({skillRoot:root,design:'missing'}),/Unknown visual template/);
 await write('project/visual-template.json',{schemaVersion:1,id:'other',version:'9.0.0',renderer:'other-engine-2'});
 await assert.rejects(resolveTemplate({skillRoot:root,project}),/unavailable/);
 await write('legacy/engine.js','/* unrelated project */');await write('legacy/catalog.js','/* unrelated catalog */');
 await assert.rejects(resolveTemplate({skillRoot:root,project:path.join(root,'legacy')}),/Cannot identify/);
});
test('Recognized pre-registry Brite projects resolve without changing their files',async t=>{
 const{root,write}=await fixture(t),{template}=await resolveTemplate();
 for(const name of ['engine.js','catalog.js'])await write('legacy/'+name,await fs.readFile(path.join(template.runtime,name),'utf8'));
 const project=path.join(root,'legacy');assert.equal((await resolveTemplate({project})).legacy,true);
 assert.deepEqual((await fs.readdir(project)).sort(),['catalog.js','engine.js']);
});
test('Bundle path escapes and duplicate template IDs reject before command execution',async t=>{
 const{root,write}=await fixture(t);
 await write('assets/templates.json',{schemaVersion:1,default:'other',templates:[{id:'other',manifest:'../outside.json'}]});
 await assert.rejects(readRegistry(root),/inside/);
 await write('assets/templates.json',{schemaVersion:1,default:'other',templates:[{id:'other',manifest:'templates/other/template.json'},{id:'other',manifest:'templates/other/template.json'}]});
 await assert.rejects(readRegistry(root),/duplicate/);
});
test('Relocated installed starters and descendants cannot be edited as projects',async()=>{
 const {template}=await resolveTemplate();
 await assert.rejects(assertWritableProject(template.runtime),/installed skill/);
 await assert.rejects(assertWritableProject(path.join(defaultSkillRoot,'new-project')),/installed skill/);
});
test('Visual-template metadata cannot be changed or removed from its source binding',()=>{
 const visualTemplate={id:'brite',version:'1.0.0'};
 assertDesign(visualTemplate);assertDesign(undefined);
 assert.throws(()=>assertDesign({id:'unknown',version:'1.0.0'}),/incompatible/);
 assert.throws(()=>assertDesign(null),/incompatible/);
 assert.throws(()=>assertDesignBinding({}, {presentation:{visualTemplate}}),/source plan/);
 assertDesignBinding({visualTemplate:{version:'1.0.0',id:'brite'}},{presentation:{visualTemplate}});
});
