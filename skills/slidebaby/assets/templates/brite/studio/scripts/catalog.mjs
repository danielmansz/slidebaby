#!/usr/bin/env node
/* Read-only export of the same contracts used by the renderer. No packages/network. */
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const options={};
for(let i=2;i<process.argv.length;i+=2){const flag=process.argv[i],value=process.argv[i+1];if(!['--project','--template'].includes(flag)||!value)throw new Error('Use [--project /path/to/project] [--template ID].');options[flag.slice(2)]=value;}
const root=path.resolve(options.project||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const context=vm.createContext({window:{},structuredClone});
for(const filename of ['samples/brite.js','catalog.js'])vm.runInContext(await fs.readFile(path.join(root,filename),'utf8'),context,{filename});
const catalog=context.window.BriteCatalog;
const entries=catalog.entries.filter(entry=>!options.template||entry.id===options.template).map(({id,version,family,name,aliases,description,contract,pairedTemplate})=>({id,version,family,name,aliases,description,pairedTemplate,contract}));
if(!entries.length)throw new Error(`Unknown template: ${options.template}`);
console.log(JSON.stringify({schemaVersion:catalog.schemaVersion,visualTemplate:catalog.visualTemplate??{id:"brite",version:"1.0.0"},families:catalog.families,chrome:catalog.chromeContract,templates:entries},null,2));
