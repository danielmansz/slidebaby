#!/usr/bin/env node
import{assertDesignBinding,assertProjectDesign}from'./design.mjs';
import{validateAssetRecord}from'./ingest-image.mjs';
import{verifyDocument}from'./verify-document.mjs';
import fs from'node:fs/promises';import path from'node:path';import vm from'node:vm';import{fileURLToPath}from'node:url';
import{resolvePlan}from'./plan.mjs';import{loadCatalog}from'./check-plan.mjs';import{args,digest,hash}from'./source.mjs';
export async function verifyGeneration(root,{deck:suppliedDeck}={}){
  if(!suppliedDeck){try{await fs.access(path.join(root,'edits/manifest.json'));return verifyDocument(root);}catch(error){if(error.code!=='ENOENT')throw error;}}
  const read=name=>fs.readFile(path.join(root,name),'utf8');
  const source=JSON.parse(await read('generation/source.json')),plan=JSON.parse(await read('generation/plan.json')),saved=JSON.parse(await read('generation/coverage.json'));
  const resolved=resolvePlan(source,plan,await loadCatalog(root),{allowRetired:true});
  if(await read('generation/input.md')!==source.raw)throw new Error('The archived input no longer matches its source snapshot.');
  if(source.narrative&&(await read('generation/original.md')!==source.narrative.original.raw||digest(JSON.parse(await read('generation/narrative.json')))!==digest(source.narrative)))throw new Error('Original/narrative records changed after generation.');
  for(const asset of Object.values(saved.assets||{})){validateAssetRecord(asset);if(!/^assets\/user\/[a-f\d]{64}\.(?:png|jpg|jpeg|webp|svg)$/.test(asset.path)||hash(await fs.readFile(path.join(root,asset.path)))!==asset.sha256)throw new Error('An imported asset changed after generation.');}
  const web=source.narrative?.original.webCapture||source.webCapture;if(web&&digest(JSON.parse(await read('generation/page.json')))!==digest(web))throw new Error('Saved page evidence changed.');
  if(web)for(const asset of Object.values(saved.assets||{}))if(!web.selectedAssets.some(a=>a.sha256===asset.source?.sha256&&a.localPath===asset.source?.path))throw new Error('Image provenance differs from captured page.');
  const context=vm.createContext({window:{}});vm.runInContext(await read('presentation.js'),context);const deck=suppliedDeck||context.window.BRITE_PRESENTATION;
  await assertProjectDesign(root,deck);assertDesignBinding(deck,plan);
  if(deck.slides.length!==resolved.slides.length||saved.chosen?.length!==resolved.slides.length)throw new Error('Generated slide count no longer matches source coverage.');
  for(let i=0;i<resolved.slides.length;i++){
    const planned=resolved.slides[i],chosen=saved.chosen[i],actual=deck.slides[i];
    const candidate=planned.candidates.find(c=>c.template===chosen.template?.id&&chosen.template?.version===c.slide.template.version);
    if(chosen.slideId!==planned.id||actual.id!==planned.id||!candidate)throw new Error('Generated slide identity/order no longer matches its plan.');
    const expected=structuredClone(candidate.slide);
    if(expected.image){const assetRef=plan.slides[i].candidates.find(c=>c.template===candidate.template).fields.image.asset;const asset=saved.assets?.[assetRef];if(!asset||!/^assets\/user\/[a-f\d]{64}\.(?:png|jpg|jpeg|webp|svg)$/.test(asset.path))throw new Error('Source figure mapping is missing or invalid.');if(hash(await fs.readFile(path.join(root,asset.path)))!==asset.sha256)throw new Error('A supplied figure changed after coverage validation.');expected.image=asset.path;}
    if(expected.images){const mappings=plan.slides[i].candidates.find(c=>c.template===candidate.template).fields.images;for(const [index,image]of expected.images.entries()){const assetRef=mappings[index].image.asset,asset=saved.assets?.[assetRef];if(!asset||!/^assets\/user\/[a-f\d]{64}\.(?:png|jpg|jpeg|webp|svg)$/.test(asset.path))throw new Error('Gallery source image mapping is missing or invalid.');if(hash(await fs.readFile(path.join(root,asset.path)))!==asset.sha256)throw new Error('A gallery source image changed after coverage validation.');image.src=asset.path;}}
    if(expected.background){const mapping=plan.slides[i].candidates.find(c=>c.template===candidate.template).fields.background,asset=saved.assets?.[mapping.image.asset];if(!asset||!/^assets\/user\/[a-f\d]{64}\.(?:png|jpg|jpeg|webp|svg)$/.test(asset.path)||hash(await fs.readFile(path.join(root,asset.path)))!==asset.sha256)throw new Error('Background source mapping is missing or changed.');expected.background.src=asset.path;}
    if(digest(actual.cardTypography??null)!==digest(expected.cardTypography??null))throw new Error('Card typography differs from the source plan or a tracked edit request.');
    const content=value=>{const copy=structuredClone(value);delete copy.overrides;delete copy.chrome;delete copy.cardNumbers;delete copy.cardTypography;return copy;};
    if(digest(content(actual))!==digest(content(expected)))throw new Error(`Slide ${actual.id} content no longer matches the source plan. Update the source/plan deliberately before exporting.`);
  }
  return {valid:true,slides:deck.slides.length,blocks:resolved.coverage.blocks,sourceHash:source.artifactHash};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const options=args(['project']);if(!options.project)throw new Error('Use --project generated-project.');console.log(JSON.stringify(await verifyGeneration(path.resolve(options.project)),null,2));}
