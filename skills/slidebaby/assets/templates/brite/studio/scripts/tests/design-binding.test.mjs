import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {hash} from '../source.mjs';
import {verifyDocument} from '../verify-document.mjs';
const studio=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
async function project(t,{legacy=false,edited=true}={}){
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'slidebaby-design-binding-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
 for(const name of ['engine.js','catalog.js','samples'])await fs.cp(path.join(studio,name),path.join(root,name),{recursive:true});
 const deck={title:'A supplied project',slides:[{id:'cover',layout:'cover',template:{id:'cover-no-image',version:1},title:'Our original wording'}]};
 if(!legacy)deck.visualTemplate={id:'brite',version:'1.0.0'};
 await fs.writeFile(path.join(root,'visual-template.json'),JSON.stringify({schemaVersion:1,id:'brite',version:'1.0.0',renderer:'brite-studio-24',deckIdentityRequired:!legacy}));
 const bytes='window.BRITE_PRESENTATION='+JSON.stringify(deck)+';\n';await fs.writeFile(path.join(root,'presentation.js'),bytes);
 if(edited){await fs.mkdir(path.join(root,'edits'));await fs.writeFile(path.join(root,'edits/base-presentation.js'),bytes);await fs.writeFile(path.join(root,'edits/manifest.json'),JSON.stringify({schemaVersion:1,baseFileHash:hash(bytes),revisions:[]}));}
 return{root,deck};
}
test('Replay rejects deleted visual identity even though legacy slide-content hashes exclude deck metadata',async t=>{
 const{root,deck}=await project(t);assert((await verifyDocument(root)).valid);
 delete deck.visualTemplate;await fs.writeFile(path.join(root,'presentation.js'),'window.BRITE_PRESENTATION='+JSON.stringify(deck)+';');
 // Marker requirement is deliberately disabled here to exercise replay binding itself.
 await fs.writeFile(path.join(root,'visual-template.json'),JSON.stringify({schemaVersion:1,id:'brite',version:'1.0.0',renderer:'brite-studio-24',deckIdentityRequired:false}));
 await assert.rejects(verifyDocument(root),/source plan/);
});
test('New plain projects require their saved identity while legacy projects remain readable',async t=>{
 const{root,deck}=await project(t,{edited:false});delete deck.visualTemplate;await fs.writeFile(path.join(root,'presentation.js'),'window.BRITE_PRESENTATION='+JSON.stringify(deck)+';');
 await assert.rejects(verifyDocument(root),/identity is missing/);
 const legacy=await project(t,{legacy:true});assert((await verifyDocument(legacy.root)).valid);
});
