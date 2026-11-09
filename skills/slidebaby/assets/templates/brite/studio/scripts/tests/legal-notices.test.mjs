import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
import {readLegalNotices,legalNoticeBlock,assertLegalCompatibility,completeFontNotices,legalFiles} from '../legal-notices.mjs';import {renderPreview} from '../make-preview.mjs';import {captureProject,publishProject,lockProject,unlockProject} from '../publish.mjs';
const studio=fileURLToPath(new URL('../../',import.meta.url));
async function fixture(t){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'slidebaby-legal-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));return dir;}
test('Current HTML retains exact custom and font terms without changing its empty deck',async()=>{
 const before=await fs.readFile(path.join(studio,'presentation.js')),notices=await readLegalNotices(studio),html=await renderPreview(studio,{exportEntry:null});const embedded=JSON.parse(html.match(/<script id="slidebaby-license-notices" type="application\/json">\n([\s\S]*?)\n<\/script>/)[1]);assert.deepEqual(embedded,notices);assert.equal(embedded.documents.length,6);for(const file of embedded.documents)assert.equal(file.text,await fs.readFile(path.join(studio,file.path),'utf8'));assert.equal(embedded.license,'LicenseRef-Slidebaby-Community-1.0');assert.deepEqual(await fs.readFile(path.join(studio,'presentation.js')),before);
});
test('Notice data cannot close its inert block or execute uploaded markup',()=>{
 const value={documents:[{text:'Copyright <script>throw 1</script>\n<script src="https://invalid.example/execute.js"></script>'}]},block=legalNoticeBlock(value);assert.equal((block.match(/<\/script>/g)||[]).length,1);assert.deepEqual(JSON.parse(block.match(/application\/json">\n([\s\S]*?)\n<\/script>/)[1]),value);assert(!block.includes('<script src='));
});
test('Legacy project gets no invented Slidebaby license; incomplete current notices reject',async t=>{
 const dir=await fixture(t);assert.equal(await readLegalNotices(dir),null);await fs.copyFile(path.join(studio,'LICENSE'),path.join(dir,'LICENSE'));await assert.rejects(readLegalNotices(dir),/Incomplete/);for(const name of legalFiles.slice(1))await fs.copyFile(path.join(studio,name),path.join(dir,name));await completeFontNotices(studio,dir);assert.equal((await readLegalNotices(dir)).documents.length,6);
});
test('Different existing licenses and notice symlinks are preserved and rejected',async t=>{
 const dir=await fixture(t),outside=path.join(dir,'original.txt');await fs.writeFile(outside,'Original legal text');await fs.writeFile(path.join(dir,'LICENSE'),'A different existing license');await assert.rejects(assertLegalCompatibility(dir,studio),/differs/);assert.equal(await fs.readFile(path.join(dir,'LICENSE'),'utf8'),'A different existing license');await fs.mkdir(path.join(dir,'linked'));await fs.symlink(outside,path.join(dir,'linked/LICENSE'));await assert.rejects(readLegalNotices(path.join(dir,'linked')),/symlink/);assert.equal(await fs.readFile(outside,'utf8'),'Original legal text');
});
test('Guarded publication carries legal files and refuses to replace a different user license',async t=>{
 const dir=await fixture(t),stage=path.join(dir,'stage'),target=path.join(dir,'project');await fs.mkdir(stage);await fs.mkdir(target);for(const name of legalFiles)await fs.copyFile(path.join(studio,name),path.join(stage,name));await fs.writeFile(path.join(stage,'presentation.js'),'NEW');await fs.writeFile(path.join(target,'presentation.js'),'OLD');let lock=await lockProject(target);try{await publishProject(stage,target,{lock,expected:await captureProject(target)});}finally{await unlockProject(lock);}for(const name of legalFiles)assert.deepEqual(await fs.readFile(path.join(target,name)),await fs.readFile(path.join(stage,name)));
 await fs.writeFile(path.join(target,'LICENSE'),'Keep this client license');const before=await captureProject(target);lock=await lockProject(target);try{await assert.rejects(publishProject(stage,target,{lock,expected:before}),/differs/);assert.deepEqual(await captureProject(target),before);}finally{await unlockProject(lock);}
});
test('A portable licensed project cannot silently package stale standalone notice text',async t=>{
 const {assertEmbeddedLegalNotices}=await import('../legal-notices.mjs'),dir=await fixture(t);for(const name of legalFiles)await fs.copyFile(path.join(studio,name),path.join(dir,name));await completeFontNotices(studio,dir);await fs.writeFile(path.join(dir,'presentation.html'),legalNoticeBlock(await readLegalNotices(dir)));await assertEmbeddedLegalNotices(dir);await fs.appendFile(path.join(dir,'LICENSE'),'\nChanged notice text\n');await assert.rejects(assertEmbeddedLegalNotices(dir),/differ/);const legacy=path.join(dir,'legacy');await fs.mkdir(legacy);await fs.writeFile(path.join(legacy,'presentation.html'),'<html>Old viewer</html>');await assertEmbeddedLegalNotices(legacy);
});
test('A recognized beta notice upgrades only while the main legal grant is unchanged',async t=>{
 const dir=await fixture(t),legacy=await fs.readFile(new URL('./fixtures/v432-third-party-notices.md',import.meta.url));for(const name of legalFiles)await fs.copyFile(path.join(studio,name),path.join(dir,name));await fs.writeFile(path.join(dir,'THIRD_PARTY_NOTICES.md'),legacy);await assertLegalCompatibility(dir,studio);assert.deepEqual(await fs.readFile(path.join(dir,'THIRD_PARTY_NOTICES.md')),legacy);
 await fs.writeFile(path.join(dir,'LICENSE'),'A separately supplied client license');await assert.rejects(assertLegalCompatibility(dir,studio),/differs/);assert.deepEqual(await fs.readFile(path.join(dir,'THIRD_PARTY_NOTICES.md')),legacy);
});
test('Recognized beta notices publish with recovery while customized notice text remains protected',async t=>{
 const dir=await fixture(t),stage=path.join(dir,'stage'),target=path.join(dir,'target');await fs.mkdir(stage);await fs.mkdir(target);for(const name of legalFiles){await fs.copyFile(path.join(studio,name),path.join(stage,name));await fs.copyFile(path.join(studio,name),path.join(target,name));}await fs.copyFile(new URL('./fixtures/v432-third-party-notices.md',import.meta.url),path.join(target,'THIRD_PARTY_NOTICES.md'));let lock=await lockProject(target);try{await publishProject(stage,target,{lock,expected:await captureProject(target)});}finally{await unlockProject(lock);}assert.deepEqual(await fs.readFile(path.join(target,'THIRD_PARTY_NOTICES.md')),await fs.readFile(path.join(stage,'THIRD_PARTY_NOTICES.md')));
 await fs.appendFile(path.join(target,'THIRD_PARTY_NOTICES.md'),'\nA client-specific source note\n');const before=await captureProject(target);lock=await lockProject(target);try{await assert.rejects(publishProject(stage,target,{lock,expected:before}),/differs/);assert.deepEqual(await captureProject(target),before);}finally{await unlockProject(lock);}
});

test('The pre-split public candidate notice retains its exact narrow upgrade allowance',async t=>{
 const dir=await fixture(t),legacy=await fs.readFile(new URL('./fixtures/v100-rc1-third-party-notices.md',import.meta.url));
 for(const name of legalFiles)await fs.copyFile(path.join(studio,name),path.join(dir,name));
 await fs.writeFile(path.join(dir,'THIRD_PARTY_NOTICES.md'),legacy);await assertLegalCompatibility(dir,studio);
 await fs.appendFile(path.join(dir,'THIRD_PARTY_NOTICES.md'),'\nA separately supplied client note');
 await assert.rejects(assertLegalCompatibility(dir,studio),/differs/);
});
