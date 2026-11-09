#!/usr/bin/env node
import fs from'node:fs/promises';import path from'node:path';import vm from'node:vm';import{fileURLToPath}from'node:url';
import{args}from'./source.mjs';import{resolvePlan}from'./plan.mjs';
export async function loadCatalog(root){const context=vm.createContext({window:{},structuredClone});for(const name of ['samples/brite.js','catalog.js'])vm.runInContext(await fs.readFile(path.join(root,name),'utf8'),context,{filename:name});return context.window.BriteCatalog;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
const options=args(['source','plan','project']);if(!options.source||!options.plan)throw new Error('Use --source source.json --plan plan.json [--project studio].');
const root=path.resolve(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));const source=JSON.parse(await fs.readFile(options.source,'utf8')),plan=JSON.parse(await fs.readFile(options.plan,'utf8'));
const result=resolvePlan(source,plan,await loadCatalog(root));console.log(JSON.stringify({valid:true,...result.coverage,slides:result.slides.map(s=>({id:s.id,candidates:s.candidates.map(c=>c.template)}))},null,2));
}
