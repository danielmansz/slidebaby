/* Pure layout projections and range-based continuations. No rewriting or sample data. */
import {digest} from './source.mjs';
const own=(o,k)=>Object.hasOwn(o,k),text=v=>typeof v==='string'&&v.trim().length>0;
const fail=m=>{throw Error(m);};
export const defaultCardId=(slideId,index)=>{const plain=`${slideId}-card-${index+1}`;return /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(plain)?plain:`card-${digest({slideId,index}).slice(0,24)}`;};
const join=(...values)=>values.filter(text).join('\n\n');
const shared=['id','label','title','logo','section','chrome','overrides','palette','image','imageAlt','background','layoutState'];
const pairs=new Set(['split:cards','cards:split','cards:process','process:cards','cover:divider','divider:cover']);
export const migrationSupported=(from,to)=>pairs.has(`${from}:${to}`);
function stateOf(slide){return structuredClone(slide.layoutState||{version:1});}
function common(slide){return Object.fromEntries(shared.filter(k=>own(slide,k)).map(k=>[k,structuredClone(slide[k])]));}
function rememberCards(slide,state){
 state.cards={...(state.cards||{}),items:slide.cards.map((c,i)=>({id:c.id||defaultCardId(slide.id,i),titleLength:text(c.title)?c.title.length:null,descriptionLength:text(c.description)?c.description.length:null,hash:digest(join(c.title,c.description))}))};
 for(const key of ['cardNumbers','cardTypography'])if(own(slide,key))state.cards[key]=structuredClone(slide[key]);
}
function restoreCardsSettings(output,state){for(const key of ['cardNumbers','cardTypography'])if(own(state.cards||{},key))output[key]=structuredClone(state.cards[key]);}
export function bodyUnits(slide){
 const units=[],push=(key,kind,value)=>{if(text(value))units.push({key,kind,text:value});};
 if(slide.layout==='split'){(slide.paragraphs||[]).forEach((s,i)=>push(`paragraph:${i}`,'paragraph',s));(slide.points||[]).forEach((s,i)=>push(`point:${i}`,'point',s));}
 else if(slide.layout==='cards'){push('description','paragraph',slide.description);slide.cards.forEach((c,i)=>push(`card:${c.id||defaultCardId(slide.id,i)}`,'point',join(c.title,c.description)));}
 else if(slide.layout==='process'){push('description','paragraph',slide.description);slide.steps.forEach((s,i)=>push(`step:${i}`,'point',join(s.title,s.description)));}
 else if(['cover','divider'].includes(slide.layout))push('description','paragraph',slide.description);
 return units;
}
const visibleBody=slide=>bodyUnits(slide).map(u=>u.text).join('\n\n');
export function migrateSlide(before,template,catalog){
 const sourceIssues=catalog.validateContract(before);if(sourceIssues.length)fail('Validate the source composition before migration: '+sourceIssues.map(i=>i.message).join(' '));
 const target=catalog.entries.find(e=>e.id===template);if(!target||!migrationSupported(before.layout,target.family))fail('Supported cross-family changes are Content↔Cards, Cards↔Process and Cover↔Section opener. Preserve unsupported content and choose a compatible layout.');
 const state=stateOf(before),output={...structuredClone(target.contract.instanceDefaults||{}),...common(before),layout:target.family,template:{id:target.id,version:target.version},layoutState:state};
 if(before.layout==='cards')rememberCards(before,state);
 if(before.layout==='split'){
  if(!before.points||before.points.length<2||before.points.length>4)fail('Content→Cards requires two to four real list items; do not invent or drop items.');
  const intro=join(...(before.paragraphs||[]));state.split={paragraphLengths:(before.paragraphs||[]).map(p=>p.length),hash:digest(intro)};
  if(text(intro))output.description=intro;
  const remembered=state.cards?.items?.length===before.points.length?state.cards.items:[];
  output.cards=before.points.map((point,i)=>{
   const saved=remembered[i],card={id:saved?.id||defaultCardId(before.id,i)};
   if(saved&&saved.hash===digest(point)){
    let offset=0;if(saved.titleLength!==null){card.title=point.slice(0,saved.titleLength);offset=saved.titleLength;}
    if(saved.descriptionLength!==null){if(saved.titleLength!==null)offset+=2;card.description=point.slice(offset,offset+saved.descriptionLength);}
   }else card.description=point;
   return card;
  });restoreCardsSettings(output,state);
 }else if(before.layout==='cards'&&target.family==='split'){
  if(text(before.description)){
   const saved=state.split;
   if(saved?.hash===digest(before.description)&&saved.paragraphLengths.length){let offset=0;output.paragraphs=saved.paragraphLengths.map(length=>{const value=before.description.slice(offset,offset+length);offset+=length+2;return value;});}
   else output.paragraphs=[before.description];
  }
  output.points=before.cards.map(c=>join(c.title,c.description));
 }else if(before.layout==='cards'&&target.family==='process'){
  if(before.cards.some(c=>!text(c.title)))fail('Cards→Process needs actual step titles. Body-only cards cannot invent headings; supply them explicitly or keep Content/Cards.');
  if(own(before,'description'))output.description=before.description;
  output.steps=before.cards.map(c=>({title:c.title,...(own(c,'description')?{description:c.description}:{})}));
 }else if(before.layout==='process'){
  if(own(before,'description'))output.description=before.description;
  const saved=state.cards?.items?.length===before.steps.length?state.cards.items:[];
  output.cards=before.steps.map((s,i)=>({id:saved[i]?.id||defaultCardId(before.id,i),title:s.title,...(own(s,'description')?{description:s.description}:{})}));restoreCardsSettings(output,state);
 }else{
  if(text(before.sectionNumber))fail('The section number has no Cover slot. Explicitly remove it or keep Section opener; it cannot be hidden or discarded.');
  if(own(before,'description'))output.description=before.description;
 }
 if(before.layout==='cover'&&own(output.overrides?.title||{},'textTransform')){state.cover={textTransform:output.overrides.title.textTransform};delete output.overrides.title.textTransform;}
 if(target.family==='cover'&&state.cover?.textTransform){output.overrides??={};output.overrides.title??={};output.overrides.title.textTransform=state.cover.textTransform;}
 if(visibleBody(output)!==visibleBody(before))fail('The projection would change or reorder existing wording.');
 for(const key of ['id','title','palette','image','imageAlt','background','chrome','logo','section'])if(digest(output[key]??null)!==digest(before[key]??null))fail('The projection would change existing '+key+'.');
 const issues=catalog.validateContract(output);if(issues.length)fail('Incompatible target layout: '+issues.map(i=>i.message).join(' '));
 return{slide:output,report:{migration:true,from:before.template,to:output.template,sourceFamily:before.layout,targetFamily:target.family,existingTextPreserved:true,bodyHash:digest(visibleBody(before)),imagesPreserved:true,restorableLayoutSettings:true,typography:'Target authored roles; no overflow font fallback enabled.'}};
}
function boundary(value,i){return i===0||i===value.length||/\s/.test(value[i-1])||/\s/.test(value[i]);}
export function splitSlide(before,request,catalog){
 const sourceIssues=catalog.validateContract(before);if(sourceIssues.length)fail('Validate the source structure before creating continuations: '+sourceIssues.map(i=>i.message).join(' '));
 if(!request||Object.keys(request).some(k=>!['id','parts'].includes(k))||request.id!==before.id||!Array.isArray(request.parts)||request.parts.length<2||request.parts.length>4)fail('A continuation request needs the source ID and two to four explicit parts.');
 if(!['split','cards','process'].includes(before.layout))fail('Automatic continuations support Content, Cards and Process; tables, quotes and essential figures need a deliberate source decision.');
 const units=bodyUnits(before);if(!units.length)fail('There is no body text to split. Keep the title or request a deliberate wording change.');
 let unitIndex=0,offset=0;const ids=new Set();
 const parts=request.parts.map((part,index)=>{
  if(!part||Object.keys(part).some(k=>!['id','fragments'].includes(k))||typeof part.id!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/.test(part.id)||ids.has(part.id)||(index===0&&part.id!==before.id)||!Array.isArray(part.fragments)||!part.fragments.length)fail('Continuation parts need unique IDs, complete ordered fragments, and the original ID on the first part.');ids.add(part.id);
  const grouped=[];
  for(const fragment of part.fragments){
   const unit=units[unitIndex];
   if(!fragment||Object.keys(fragment).some(k=>!['unit','start','end'].includes(k))||!unit||fragment.unit!==unit.key||fragment.start!==offset||!Number.isInteger(fragment.end)||fragment.end<=offset||fragment.end>unit.text.length||!boundary(unit.text,offset)||!boundary(unit.text,fragment.end))fail('Continuation fragments must cover every body character exactly once, in order, at word boundaries.');
   if(fragment.end<unit.text.length&&/\d\s*$/.test(unit.text.slice(0,fragment.end))&&/^\s*\d/.test(unit.text.slice(fragment.end)))fail('Do not split a grouped numeric value.');
   const value=unit.text.slice(offset,fragment.end),last=grouped.at(-1);if(last?.unit===unit.key)last.text+=value;else grouped.push({unit:unit.key,kind:unit.kind,text:value});
   offset=fragment.end;if(offset===unit.text.length){unitIndex++;offset=0;}
  }
  if(!grouped.some(g=>text(g.text)))fail('Do not create an empty continuation.');
  const hasPoints=grouped.some(g=>g.kind==='point'),photo=text(before.image),template=hasPoints?(photo?'split-default':'split-no-image'):(photo?'split-paragraphs':'split-paragraphs-no-image');
  const entry=catalog.entries.find(e=>e.id===template),value={...common(before),id:part.id,layout:'split',template:{id:entry.id,version:entry.version}};
  const state=stateOf(before);if(before.layout==='cards')rememberCards(before,state);if(state.cards)delete state.cards.items;value.layoutState=state;
  const paragraphs=grouped.filter(g=>g.kind==='paragraph').map(g=>g.text),points=grouped.filter(g=>g.kind==='point').map(g=>g.text);if(paragraphs.length)value.paragraphs=paragraphs;if(points.length)value.points=points;
  const issues=catalog.validateContract(value);if(issues.length)fail('Continuation does not match its designed Content layout: '+issues.map(i=>i.message).join(' '));
  return value;
 });
 if(unitIndex!==units.length||offset)fail('Continuation source coverage is incomplete.');
 return{slides:parts,report:{split:true,slideId:before.id,parts:parts.map(s=>s.id),existingTextPreserved:true,bodyHash:digest(units),titlesRepeatedVerbatim:true,imagesPreserved:true}};
}
// A measured proposer can try several nearby cuts; these are only candidates.
export function partitionBody(slide,count,bias=0,wholeUnits=false){
 const units=bodyUnits(slide),total=units.reduce((n,u)=>n+u.text.length,0);if(!total||count<2||count>4)return null;
 if(wholeUnits&&units.length>=count){
  const parts=[];let start=0,consumed=0;
  for(let i=0;i<count-1;i++){
   const choices=[];let prefix=consumed;for(let end=start+1;end<=units.length-(count-i-1);end++){prefix+=units[end-1].text.length;choices.push({end,distance:Math.abs(prefix-total*(i+1)/count)});}
   const end=choices.sort((a,b)=>a.distance-b.distance)[0].end;parts.push(units.slice(start,end).map(u=>({unit:u.key,start:0,end:u.text.length})));consumed+=units.slice(start,end).reduce((n,u)=>n+u.text.length,0);start=end;
  }parts.push(units.slice(start).map(u=>({unit:u.key,start:0,end:u.text.length})));return parts;
 }
 const fragments=[];let consumed=0,part=[],partIndex=0;
 for(const unit of units){let start=0;while(start<unit.text.length){
  if(partIndex>=count-1){part.push({unit:unit.key,start,end:unit.text.length});consumed+=unit.text.length-start;start=unit.text.length;continue;}
  const threshold=total*((partIndex+1)/count+bias),remaining=threshold-consumed;
  if(remaining>=unit.text.length-start){part.push({unit:unit.key,start,end:unit.text.length});consumed+=unit.text.length-start;start=unit.text.length;if(consumed>=threshold&&partIndex<count-1){fragments.push(part);part=[];partIndex++;}continue;}
  const wanted=start+Math.max(1,remaining),candidates=[];
  for(let i=start+1;i<unit.text.length;i++)if(/\s/.test(unit.text[i-1])&&text(unit.text.slice(start,i))&&text(unit.text.slice(i))&&!(/\d\s*$/.test(unit.text.slice(0,i))&&/^\s*\d/.test(unit.text.slice(i))))candidates.push(i);
  const nearbySentences=candidates.filter(i=>/[.!?…][\"'’”)]*$/.test(unit.text.slice(0,i).trimEnd())&&Math.abs(i-wanted)<=Math.max(80,total/count*.2));
  const cut=(nearbySentences.length?nearbySentences:candidates).sort((a,b)=>Math.abs(a-wanted)-Math.abs(b-wanted))[0];
  if(cut==null){if(part.length){fragments.push(part);part=[];partIndex++;continue;}part.push({unit:unit.key,start,end:unit.text.length});consumed+=unit.text.length-start;start=unit.text.length;fragments.push(part);part=[];partIndex++;continue;}
  part.push({unit:unit.key,start,end:cut});consumed+=cut-start;start=cut;fragments.push(part);part=[];partIndex++;
 }}
 if(part.length)fragments.push(part);return fragments.length===count?fragments:null;
}
