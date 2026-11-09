/* Agent-authored narrative with deterministic provenance checks, not an AI summarizer. */
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath}from'node:url';
import{snapshot,validateSnapshot,hash,digest,args,parseSource}from'./source.mjs';
const fail=m=>{throw new Error('Narrative: '+m)};
export function renderDraft(d){
 if(!Array.isArray(d.slides)||!d.slides.length||d.slides.length>60)fail('Provide 1–60 slides.');
 return d.slides.map(s=>{if(!Array.isArray(s.blocks)||!s.blocks.length)fail('Each slide needs blocks.');return s.blocks.map(b=>{if(b.kind==='table'){if(typeof b.text!=='string')fail('A derived table needs pipe-table text.');const parsed=parseSource(b.text);if(parsed.blocks.length!==1||parsed.blocks[0].kind!=='table'||parsed.blocks[0].text!==b.text)fail('A derived table must be one complete plain-text Markdown pipe table.');return b.text;}if(!['heading','paragraph','list-item','figure'].includes(b.kind)||typeof b.text!=='string'||!b.text.trim()||b.text.includes('\n'))fail('Use nonempty single-line heading, paragraph or list-item blocks.');if(b.kind==='figure'){if(typeof b.asset!=='string'||/[\r\n)]/.test(b.asset)||/[\[\]]/.test(b.text))fail('Use a supplied local figure with a safe alt and path.');return `![${b.text}](${b.asset})`;}return(b.kind==='heading'?'# ':b.kind==='list-item'?'- ':'')+b.text;}).join('\n\n')}).join('\n\n---\n\n')+'\n';
}
export function validateNarrative(n,raw){
 if(n?.schemaVersion!==1||n.mode!=='narrative')fail('Unsupported record.');
 if(n.original?.narrative)fail('Use the original raw source, not nested narrative sources.');validateSnapshot(n.original);
 const d=n.draft;if(!d||d.authorization!=='create-narrative'||!d.brief?.trim())fail('Record the user brief authorizing narrative creation.');
 if(!d.review||!['facts','qualifications','attribution'].every(k=>d.review[k]===true)||!d.review.notes?.trim())fail('Agent source-to-summary review is required.');
 if(n.original.blocks.some(b=>b.kind==='unsupported'))fail('This mode cannot omit unsupported source structures.');
 const ids=new Set(n.original.blocks.map(b=>b.id)),used=new Set();
 for(const s of d.slides)for(const b of s.blocks){
  if(!b.reason?.trim()||!Array.isArray(b.sources)||!b.sources.length||b.sources.some(id=>!ids.has(id)))fail('Every derived block needs valid original refs and an editorial reason.');
  if(b.kind==='figure'&&n.original.webCapture&&!n.original.webCapture.selectedAssets.some(a=>a.localPath===b.asset))fail('Figure is not a selected image from the supplied page.');
  b.sources.forEach(id=>used.add(id));
 }
 // Original structured tables are essential data, not freely rewritten prose.
 for(const original of n.original.blocks.filter(b=>b.kind==='table')){
  const copies=d.slides.flatMap(s=>s.blocks).filter(b=>b.kind==='table'&&b.sources.includes(original.id));
  if(copies.length!==1||digest(parseSource(copies[0].text).blocks[0].table)!==digest(original.table))fail('Preserve each original table exactly once, with identical cells, order and alignment. Revise source explicitly for data changes.');
 }
 // An original figure is essential content: preserve it once, with its own source ref.
 const figures=n.original.blocks.filter(b=>b.kind==='figure'),all=d.slides.flatMap(s=>s.blocks);
 for(const original of figures){
  const copies=all.filter(b=>b.kind==='figure'&&b.sources.includes(original.id));
  if(copies.length!==1||path.resolve(path.dirname(n.original.origin),copies[0].asset)!==path.resolve(path.dirname(n.original.origin),original.asset))fail('Preserve each original figure exactly once, with its original image and meaningful alt text. A paragraph or omission cannot replace it.');
 }
 if(all.some(b=>b.kind==='figure'&&b.sources.filter(id=>figures.some(f=>f.id===id)).length>1))fail('Do not merge distinct original figure blocks into one image.');
 const omissions=new Set();if(!Array.isArray(d.omissions))fail('Record omissions, even if empty.');
 for(const o of d.omissions){if(!ids.has(o.ref)||omissions.has(o.ref)||used.has(o.ref)||!o.reason?.trim())fail('Invalid, duplicated or conflicting omission.');omissions.add(o.ref)}
 for(const id of ids)if(!used.has(id)&&!omissions.has(id))fail('Unaccounted original block: '+id);
 if(renderDraft(d)!==raw||hash(raw)!==n.derivedHash)fail('Derived wording changed without a new narrative revision.');
 const parsed=parseSource(raw),authored=d.slides.flatMap((s,i)=>s.blocks.map(b=>({kind:b.kind,text:b.text,unit:i})));
 if(parsed.blocks.length!==authored.length||parsed.blocks.some((b,i)=>b.kind!==authored[i].kind||b.text!==authored[i].text||b.unit!==authored[i].unit||(b.kind==='figure'&&b.asset!==d.slides.flatMap(s=>s.blocks)[i].asset)))fail('Derived Markdown changes the intended block structure.');
 if(d.exactSlides!=null&&d.slides.length!==d.exactSlides)fail('Exact slide count conflict.');
 return{valid:true,originalBlocks:ids.size,usedBlocks:used.size,omittedBlocks:omissions.size,slides:d.slides.length,semanticReview:'agent-authored, not independently proven by the checker'};
}
export async function prepareNarrative(input,draftFile,output,sourceFile){
 const original=sourceFile?JSON.parse(await fs.readFile(sourceFile,'utf8')):await snapshot(input);validateSnapshot(original);if(original.raw!==await fs.readFile(input,'utf8'))fail('Original file differs from the supplied snapshot.');const draft=JSON.parse(await fs.readFile(draftFile,'utf8'));
 // Derived Markdown is saved elsewhere; resolve supplied local images from the original input.
 for(const slide of draft.slides||[])for(const block of slide.blocks||[])if(block.kind==='figure'&&typeof block.asset==='string'){
  if(/^[a-z][a-z\d+.-]*:/i.test(block.asset))fail('Use a supplied local figure path, not a URL or data URI.');
  block.asset=path.resolve(path.dirname(original.origin),block.asset);
 }
 const raw=renderDraft(draft),narrative={schemaVersion:1,mode:'narrative',original,draft,derivedHash:hash(raw)};
 const result=validateNarrative(narrative,raw);const dest=path.resolve(output);await fs.mkdir(dest,{recursive:false});
 await fs.writeFile(path.join(dest,'original.md'),original.raw,{flag:'wx'});await fs.writeFile(path.join(dest,'narrative.json'),JSON.stringify(narrative,null,2),{flag:'wx'});await fs.writeFile(path.join(dest,'slides.md'),raw,{flag:'wx'});
 const source=await snapshot(path.join(dest,'slides.md'),{exactSlides:draft.slides.length,allowContinuation:false,preserveBoundaries:true});source.narrative=narrative;delete source.artifactHash;source.artifactHash=digest(source);
 await fs.writeFile(path.join(dest,'source.json'),JSON.stringify(source,null,2),{flag:'wx'});return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const o=args(['input','draft','output','source-snapshot']);if(!o.input||!o.draft||!o.output)fail('Use --input raw.md --draft draft.json --output NEW-folder');console.log(JSON.stringify(await prepareNarrative(o.input,o.draft,o.output,o['source-snapshot']),null,2));}
