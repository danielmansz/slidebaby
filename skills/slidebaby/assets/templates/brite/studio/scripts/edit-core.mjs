/* Pure, replayable edits. Existing body fields never come from preview examples. */
import {digest} from './source.mjs';
import {applyTextEdits} from './text-edit.mjs';
import {migrateSlide,defaultCardId} from './reflow-core.mjs';
import path from 'node:path';
const own=(o,k)=>Object.hasOwn(o,k),text=v=>typeof v==='string'&&v.trim().length>0;
const fail=message=>{throw new Error(message);};
export {defaultCardId} from './reflow-core.mjs';
export const contentOf=slide=>{const value=structuredClone(slide);for(const key of ['overrides','chrome','cardNumbers','cardTypography'])delete value[key];return value;};
export const contentHash=deck=>digest(deck.slides.map(contentOf));
export function applySlideEdit(input,slideId,operation,catalog){
 if(!operation||typeof operation!=='object'||Array.isArray(operation))fail('Provide an edit object.');
 const allowed=['background','palette','template','image','addCards','updateCards','cardOrder','cardNumbers','allowSmallerText','typographyProfile','setText'];
 if(Object.keys(operation).some(k=>!allowed.includes(k)))fail('Unsupported edit field. Existing text cannot be replaced through a layout edit.');
 const deck=structuredClone(input),index=deck.slides.findIndex(s=>s.id===slideId);
 if(index<0)fail(`Unknown slide ID: ${slideId}.`);
 const before=structuredClone(deck.slides[index]),slide=deck.slides[index],family=slide.layout,target=operation.template&&catalog.entries.find(e=>e.id===operation.template),crossFamily=target&&target.family!==family;
 const textChanges=own(operation,'setText')?applyTextEdits(slide,operation.setText,catalog):[];
 const authorized=structuredClone(slide);
 if(own(operation,'palette')){if(!['light','dark'].includes(operation.palette))fail('Slide palette must be light or dark.');slide.palette=operation.palette;}
 if(own(operation,'background')){const b=operation.background;if(b===null)delete slide.background;else{if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!['src','alt'].includes(k))||!text(b.src)||!text(b.alt))fail('Background needs a source and meaningful alt text, with no extra fields.');slide.background=structuredClone(b);}}
 if(operation.addCards!=null||operation.updateCards!=null||operation.cardOrder!=null)if(family!=='cards'||crossFamily)fail('Apply card content/count changes separately from a cross-family projection.');
 if(own(operation,'cardNumbers')||own(operation,'allowSmallerText')||own(operation,'typographyProfile'))if(family!=='cards'&&!(crossFamily&&target.family==='cards'))fail('Card settings require a card source or a projected card target.');
 if(family==='cards'){
  slide.cards.forEach((card,i)=>{card.id??=defaultCardId(slide.id,i);});
  // Keep the previous baseline even when a count change selects a smaller authored default.
  slide.cardTypography={allowSmallerText:false,profile:'auto',...slide.cardTypography,baseSize:slide.cardTypography?.baseSize||(before.cards.length===4?28:30)};
  if(own(operation,'allowSmallerText')){if(typeof operation.allowSmallerText!=='boolean')fail('Smaller-text permission must be a boolean.');slide.cardTypography.allowSmallerText=operation.allowSmallerText;if(!operation.allowSmallerText&&slide.cardTypography.profile==='compact')slide.cardTypography.profile='auto';}
  if(own(operation,'typographyProfile')){if(!['auto','normal','compact'].includes(operation.typographyProfile))fail('Choose auto, normal or compact typography.');slide.cardTypography.profile=operation.typographyProfile;}
  if(operation.addCards!=null){
   if(!Array.isArray(operation.addCards)||!operation.addCards.length)fail('addCards needs a nonempty array.');
   for(const item of operation.addCards){
    if(!item||Object.keys(item).some(k=>!['id','title','description','beforeId'].includes(k))||!text(item.id)||(!text(item.title)&&!text(item.description))||(item.title!=null&&typeof item.title!=='string')||(item.description!=null&&typeof item.description!=='string'))fail('Each added card needs its own ID and actual title or body text.');
    if(slide.cards.some(c=>c.id===item.id))fail('An added card ID already exists.');
    const card={id:item.id,title:item.title,description:item.description};let position=slide.cards.length;
    if(item.beforeId!=null){position=slide.cards.findIndex(c=>c.id===item.beforeId);if(position<0)fail('The insertion target card does not exist.');}
    slide.cards.splice(position,0,card);
   }
  }
  if(operation.updateCards!=null){if(!Array.isArray(operation.updateCards)||!operation.updateCards.length||new Set(operation.updateCards.map(c=>c.id)).size!==operation.updateCards.length)fail('Use distinct existing IDs for card text edits.');for(const item of operation.updateCards){if(!item||Object.keys(item).some(k=>!['id','title','description'].includes(k))||(!own(item,'title')&&!own(item,'description'))||['title','description'].some(key=>own(item,key)&&item[key]!==null&&typeof item[key]!=='string'))fail('A card text edit needs an existing ID and supplied text or null; each resulting card must keep actual content.');const card=slide.cards.find(c=>c.id===item.id);if(!card)fail('The card text edit target does not exist.');for(const key of ['title','description'])if(own(item,key))card[key]=item[key];}}
  if(operation.cardOrder!=null){const order=operation.cardOrder;if(!Array.isArray(order)||order.length!==slide.cards.length||new Set(order).size!==order.length||order.some(id=>!slide.cards.some(c=>c.id===id)))fail('Card order must include every card ID exactly once.');slide.cards=order.map(id=>slide.cards.find(c=>c.id===id));}
  if(own(operation,'cardNumbers')){if(typeof operation.cardNumbers!=='boolean')fail('Card numbers must be true or false.');slide.cardNumbers=operation.cardNumbers;}
 }
 if(own(operation,'image')){
  if(['gallery','figure'].includes(family))fail('Content figures/galleries require an explicit source composition revision; this edit only changes decorative photography.');
  if(operation.image===null){delete slide.image;delete slide.imageAlt;}
  else{const image=operation.image;if(!image||Object.keys(image).some(k=>!['src','alt'].includes(k))||!text(image.src)||!text(image.alt))fail('Supply the photo source and meaningful alt text.');slide.image=image.src;slide.imageAlt=image.alt;}
 }
 const current=catalog.entries.find(e=>e.id===before.template?.id),photo=family==='gallery'?!!slide.images?.length:text(slide.image),styleKey={cards:'cardStyle',comparison:'comparisonStyle',process:'processStyle',roadmap:'roadmapStyle',summary:'summaryStyle'}[family],style=styleKey?catalog.contractFor(before)?.[styleKey]:null;
 if(target&&target.family!==family){
  // An explicitly supplied photo change first needs a valid source-family partner.
  // This branch is new; legacy same-family replay semantics stay unchanged.
  let migrationSource=slide;
  if(own(operation,'image')&&catalog.validateContract(slide).length){
   const compatible=catalog.entries.filter(e=>e.family===family&&!!e.contract.image.required===photo);
   const source=compatible.map(e=>({...structuredClone(slide),template:{id:e.id,version:e.version}})).find(s=>!catalog.validateContract(s).length);
   if(!source)fail('The supplied photo change has no compatible source layout. Preserve the requested content and use separate supported changes.');
   migrationSource=source;
  }
  const result=migrateSlide(migrationSource,operation.template,catalog);result.report.from=before.template;
  if(target.family==='cards'){
   const value=result.slide;
   if(own(operation,'cardNumbers')){if(typeof operation.cardNumbers!=='boolean')fail('Card numbers must be true or false.');value.cardNumbers=operation.cardNumbers;}
   if(own(operation,'allowSmallerText')||own(operation,'typographyProfile')){
    value.cardTypography={allowSmallerText:false,profile:'auto',baseSize:value.cards.length===4?28:30,...value.cardTypography};
    if(own(operation,'allowSmallerText')){if(typeof operation.allowSmallerText!=='boolean')fail('Smaller-text permission must be a boolean.');value.cardTypography.allowSmallerText=operation.allowSmallerText;if(!operation.allowSmallerText&&value.cardTypography.profile==='compact')value.cardTypography.profile='auto';}
    if(own(operation,'typographyProfile')){if(!['auto','normal','compact'].includes(operation.typographyProfile))fail('Choose auto, normal or compact typography.');value.cardTypography.profile=operation.typographyProfile;}
   }
   const issues=catalog.validateContract(value);if(issues.length)fail(issues.map(i=>i.message).join(' '));
  }
  deck.slides[index]=result.slide;
  return{deck,report:{slideId,...result.report,existingTextPreserved:!textChanges.length,explicitTextEdits:textChanges}};
 }
 let candidates;
 if(operation.template!=null){const entry=catalog.entries.find(e=>e.id===operation.template);if(!entry||entry.family!==family)fail('Choose an active, same-family compatible template; cross-family text remapping is not automatic.');candidates=[entry];}
 else{
  candidates=catalog.entries.filter(e=>e.family===family&&(!styleKey||e.contract[styleKey]===style)&&!!e.contract.image.required===photo&&(!e.contract.image.collection||family==='gallery')&&(family!=='cards'||(e.contract.cardStyle===style&&e.contract.itemCounts.cards.min===slide.cards.length)));
  candidates.sort((a,b)=>Number(b.id===current?.id)-Number(a.id===current?.id)||Number(b.id===current?.pairedTemplate)-Number(a.id===current?.pairedTemplate));
 }
 if(!candidates.length)fail('No compatible designed template matches this content/image count. Preserve the source and report a library gap or permitted continuation.');
 let chosen,issues=[];
 for(const entry of candidates){const value=structuredClone(slide);value.template={id:entry.id,version:entry.version};const found=catalog.validateContract(value);if(!found.length){chosen=value;break;}issues=found;}
 if(!chosen)fail(`No lossless compatible variant: ${issues.map(i=>i.message).join(' ')}`);
 // Strong invariants: original cards/text remain, and unrelated slides are byte-for-byte equivalent as data.
 for(const key of ['title','description','takeawayLabel','takeaway','takeawayDescription','actions','paragraphs','points','columns','steps','milestones','table','caption','items','images','metrics','quote','author','authorRole','sectionNumber','logo','section','overrides','chrome'])if(digest(chosen[key]??null)!==digest(authorized[key]??null))fail(`The edit would change existing ${key} beyond the supplied text request.`);
 if(family==='cards')for(const old of before.cards){const id=old.id||defaultCardId(before.id,before.cards.indexOf(old)),card=chosen.cards.find(c=>c.id===id);const explicit=operation.updateCards?.find(c=>c.id===id);if(!card||card.title!==(own(explicit||{},'title')?explicit.title:old.title)||card.description!==(own(explicit||{},'description')?explicit.description:old.description))fail('The edit would remove or rewrite an existing card without a supplied text edit.');}
 deck.slides[index]=chosen;
 return {deck,report:{slideId,from:before.template??null,to:chosen.template,existingTextPreserved:!operation.updateCards?.length&&!textChanges.length,explicitTextEdits:textChanges,explicitCardTextEdits:operation.updateCards?.length||0,existingCardsPreserved:before.cards?.length||0,addedCards:operation.addCards?.length||0,cardIds:chosen.cards?.map(c=>c.id)||[],baseline:chosen.cardTypography?.baseSize??null,smallerTextPermitted:chosen.cardTypography?.allowSmallerText===true}};
}
export function matchesEditedAsset(asset,rawPath,normalizedPath,{requireAssetBinding=false}={}){
 if(asset.path!==normalizedPath)return false;
 if(requireAssetBinding||Object.hasOwn(asset,'inputPath')){
  if(asset.inputPath!==rawPath||typeof asset.inputBase!=='string'||typeof asset.source?.path!=='string')return false;
  const api=/^[a-zA-Z]:[\\/]|^\\\\/.test(asset.inputBase)?path.win32:path.posix;
  return api.isAbsolute(asset.inputBase)&&api.resolve(asset.inputBase,rawPath)===api.normalize(asset.source.path);
 }
 // Old relative-path edit records did not store the raw request path. Keep them readable.
 return !path.isAbsolute(rawPath)||!asset.source?.path||path.normalize(asset.source.path)===path.normalize(rawPath);
}
export function verifyNormalizedInput(raw,operation,assets=[],options={}){
 const expected=structuredClone(raw);
 if(Array.isArray(expected.addCards))expected.addCards.forEach((c,i)=>{if(c.id==null)c.id=operation.addCards?.[i]?.id;});
 if(expected.image&&typeof expected.image==='object'){
  if(expected.image.alt!==operation.image?.alt||!assets.some(a=>matchesEditedAsset(a,expected.image.src,operation.image?.src,options)))fail('Photo normalization does not match the supplied edit/source.');
  expected.image.src=operation.image.src;
 }
 if(expected.background&&typeof expected.background==='object'){if(expected.background.alt!==operation.background?.alt||!assets.some(a=>matchesEditedAsset(a,expected.background.src,operation.background?.src,options)))fail('Background normalization does not match the supplied edit/source.');expected.background.src=operation.background.src;}
 if(digest(expected)!==digest(operation))fail('The normalized operation changes the supplied edit or its font permission.');
}
