import{assertProjectDesign,assertDesignBinding}from'./design.mjs';
import{validateAssetRecord}from'./ingest-image.mjs';
/* Original source checks plus a hash-checked, replayable later-edit chain. */
import fs from'node:fs/promises';import path from'node:path';import vm from'node:vm';import{fileURLToPath}from'node:url';
import{hash,args,digest}from'./source.mjs';import{loadCatalog}from'./check-plan.mjs';import{applySlideEdit,contentHash,verifyNormalizedInput}from'./edit-core.mjs';import{verifyGeneration}from'./verify-generation.mjs';
import{applyDeckEdit,verifyDeckNormalizedInput}from'./deck-edit-core.mjs';
export async function exists(file){try{await fs.access(file);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
export async function readDeck(file){const context=vm.createContext({window:{}});vm.runInContext(await fs.readFile(file,'utf8'),context,{timeout:1000});return structuredClone(context.window.BRITE_PRESENTATION);}
export async function verifyDocument(root){
 await assertProjectDesign(root,await readDeck(path.join(root,'presentation.js')));
 const edited=await exists(path.join(root,'edits/manifest.json')),generated=await exists(path.join(root,'generation'));
 if(!edited)return generated?verifyGeneration(root):{valid:true,mode:'plain',edits:0};
 const manifest=JSON.parse(await fs.readFile(path.join(root,'edits/manifest.json'),'utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.revisions)||manifest.revisions.length>100)throw new Error('Invalid edit manifest.');
 const originBytes=await fs.readFile(path.join(root,'edits/base-presentation.js'));if(hash(originBytes)!==manifest.baseFileHash)throw new Error('The archived edit origin changed.');
 const origin=await readDeck(path.join(root,'edits/base-presentation.js'));if(generated)await verifyGeneration(root,{deck:origin});
 let expected=origin;const catalog=await loadCatalog(root);
 for(const revision of manifest.revisions){
  if(!/^revision-[a-zA-Z0-9-]+\.json$/.test(revision.file))throw new Error('Invalid revision filename.');
  const bytes=await fs.readFile(path.join(root,'edits',revision.file));if(hash(bytes)!==revision.sha256)throw new Error('An edit request changed after validation.');
  const record=JSON.parse(bytes);if(record.schemaVersion!==1||record.beforeHash!==contentHash(expected))throw new Error('Edit history does not match the previous content.');
  for(const asset of record.assets||[]){validateAssetRecord(asset);if(!/^assets\/user\/[a-f\d]{64}\.(?:png|jpg|jpeg|webp|svg)$/.test(asset.path)||hash(await fs.readFile(path.join(root,asset.path)))!==asset.sha256)throw new Error('An added photo changed after validation.');}
  if(!/^input-[a-zA-Z0-9-]+\.json$/.test(record.inputFile))throw new Error('Invalid edit input filename.');
  const rawInput=await fs.readFile(path.join(root,'edits',record.inputFile));(record.scope==='deck'?verifyDeckNormalizedInput:verifyNormalizedInput)(JSON.parse(rawInput),record.operation,record.assets,{requireAssetBinding:record.normalizationVersion===2});
  if(hash(rawInput)!==record.inputHash)throw new Error('The preserved edit input changed.');
  expected=record.scope==='deck'?applyDeckEdit(expected,record.operation,catalog).deck:applySlideEdit(expected,record.slideId,record.operation,catalog).deck;
  if(contentHash(expected)!==record.afterHash)throw new Error('Edit result differs from the validated request.');
 }
 const actual=await readDeck(path.join(root,'presentation.js'));assertDesignBinding(actual,{presentation:expected});for(const slide of actual.slides)if(digest(slide.cardTypography??null)!==digest(expected.slides.find(s=>s.id===slide.id)?.cardTypography??null))throw new Error('Card typography differs from the tracked edit history.');if(contentHash(actual)!==contentHash(expected))throw new Error('Saved content/identity no longer matches the original source and tracked edits.');
 return {valid:true,mode:generated?'source-and-edits':'plain-and-edits',slides:actual.slides.length,edits:manifest.revisions.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const o=args(['project']);if(!o.project)throw new Error('Use --project /path.');console.log(JSON.stringify(await verifyDocument(path.resolve(o.project)),null,2));}
