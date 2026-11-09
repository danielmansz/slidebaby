/* Resolve a semantic plan to literal source text and prove structural coverage. */
import {validateSnapshot}from'./source.mjs';
import {assertDesign} from './design.mjs';
const fail=message=>{throw new Error(message);};
const visibleOrder=['title','description','takeawayLabel','takeaway','takeawayDescription','actions','sectionNumber','paragraphs','points','cards','columns','steps','milestones','table','items','caption','images','metrics','quote','author','authorRole'];
export function resolvePlan(source,plan,catalog,{allowRetired=false}={}){
  validateSnapshot(source);
  assertDesign(plan.presentation?.visualTemplate);
  if(plan.schemaVersion!==1||plan.sourceHash!==source.artifactHash)fail('Plan must reference this exact source snapshot (sourceHash = artifactHash).');
  if(!Array.isArray(plan.slides)||!plan.slides.length||plan.slides.length>60)fail('Plan needs 1 to 60 slides.');
  const constraints=source.constraints;
  if(constraints.exactSlides!=null&&plan.slides.length!==constraints.exactSlides)fail(`Slide-count conflict: requested ${constraints.exactSlides}; plan contains ${plan.slides.length}.`);
  const unsupported=source.blocks.filter(b=>b.kind==='unsupported');if(unsupported.length)fail(`Unsupported source blocks: ${unsupported.map(b=>`${b.id}: ${b.reason}`).join(' ')} Do not omit or flatten these blocks.`);
  const blocks=new Map(source.blocks.map((block,index)=>[block.id,{...block,index}]));
  const coverage=new Map(source.blocks.map(b=>[b.id,new Uint8Array(b.text.length)])),usedAssets=new Set(),usedTables=new Set(),usedUnits=new Map(),map=[],additions=[];let last=-1;
  const ids=new Set();
  function resolve(value,field,record,collect){
    if(Array.isArray(value))return value.map((v,i)=>resolve(v,`${field}[${i}]`,record,collect));
    if(!value||typeof value!=='object')fail(`Use source references in ${field}; literal content is not accepted.`);
    if('ref'in value){
      if(field==='image'||field==='background')fail('Images and backgrounds require an explicit source asset reference.');
      if(Object.keys(value).some(k=>!['ref','start','end'].includes(k)))fail(`Unknown reference properties in ${field}.`);
      const block=blocks.get(value.ref);if(field==='imageAlt'&&block?.kind!=='figure')fail('Image alt text must describe its source figure, not hide body content.');if(!block||block.kind==='unsupported')fail(`Unknown/unsupported source block: ${value.ref}.`);
      if(block.kind==='figure'&&!['imageAlt','caption'].includes(field))fail(`A figure must be mapped as an image, with optional caption/imageAlt: ${block.id}.`);
      if(block.kind==='table'){
        if(field!=='table'||Object.keys(value).some(k=>k!=='ref'))fail('Map a complete source table to table:{ref}; do not flatten, slice, reorder or hide its cells.');
        if(collect){if(usedTables.has(block.id))fail('A source table cannot be duplicated or arbitrarily split.');const position=block.index*100001;if(position<last)fail('Source table reading order changed.');last=position;usedTables.add(block.id);record.units.add(block.unit);coverage.get(block.id).fill(1);
          block.table.headers.forEach((_,column)=>record.refs.push({block:block.id,row:0,column,field:`table.headers[${column}]`}));block.table.rows.forEach((row,r)=>row.forEach((_,column)=>record.refs.push({block:block.id,row:r+1,column,field:`table.rows[${r}][${column}]`})));
        }return structuredClone(block.table);
      }
      if(field==='table')fail('A native table needs a structured source table block. Keep row/column relationships; use Markdown pipe table input.');
      const start=value.start??0,end=value.end??block.text.length;
      if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end>block.text.length||start>=end)fail(`Invalid range in ${block.id}.`);
      for(const boundary of [start,end])if(boundary>0&&boundary<block.text.length&&!/\s/.test(block.text[boundary-1])&&!/\s/.test(block.text[boundary]))fail(`Split ${block.id} at whitespace, preserving complete words/numbers.`);
      if(collect){
        record.refs.push({block:block.id,start,end,field});record.units.add(block.unit);
        if(block.kind!=='figure'){
          const mask=coverage.get(block.id),already=mask.slice(start,end).some(Boolean);
          if(already&&block.kind!=='heading')fail(`Source text duplicated: ${block.id}. Reuse only headings on continuation slides.`);
          const position=block.index*100001+start;
          if(!already&&position<last)fail(`Source reading order changed at ${block.id}.`);
          if(!already)last=position;
          mask.fill(1,start,end);
        }
      }
      return block.text.slice(start,end).trim();
    }
    if('asset'in value){
      if(field!=='image'||Object.keys(value).some(k=>k!=='asset'))fail('Asset references are supported only in image.');
      const block=blocks.get(value.asset);if(block?.kind!=='figure')fail(`No source image: ${value.asset}.`);
      if(collect){record.refs.push({block:block.id,field:'image',asset:block.asset});record.units.add(block.unit);if(!usedAssets.has(block.id)){const position=block.index*100001;if(position<last)fail(`Source figure reading order changed at ${block.id}.`);last=position;}usedAssets.add(block.id);}
      return block.asset;
    }
    if('label'in value&&typeof value.label==='string'){
      if(field!=='title'||!constraints.allowGeneratedTitles||Object.keys(value).some(k=>k!=='label')||typeof value.label!=='string'||!value.label.trim())fail('Generated titles require explicit --allow-generated-titles authorization and a nonempty title label.');
      if(collect)additions.push({slideId:record.id,field,text:value.label});return value.label;
    }
    if(field==='background'){
      if(Object.keys(value).some(k=>!['image','imageAlt'].includes(k)))fail('Background mappings accept image and imageAlt only.');
      return {src:resolve(value.image,'image',record,collect),alt:resolve(value.imageAlt,'imageAlt',record,collect)};
    }
    if(field.startsWith('images[')){
      if(Object.keys(value).some(k=>!['image','imageAlt','fit'].includes(k)))fail('Gallery mappings accept image, imageAlt and optional fit only.');
      const item={src:resolve(value.image,'image',record,collect),alt:resolve(value.imageAlt,'imageAlt',record,collect)};
      if(value.fit!=null){if(!['cover','contain'].includes(value.fit))fail('Gallery fit must be cover or contain.');item.fit=value.fit;}
      return item;
    }
    if(/^milestones\[\d+\]$/.test(field)){
      if(Object.keys(value).some(k=>!['period','year','title','points'].includes(k)))fail('A roadmap milestone accepts period/year, title and optional points only.');
      const milestone={};if(value.period!=null)milestone.period=resolve(value.period,`${field}.period`,record,collect);if(value.year!=null)milestone.year=resolve(value.year,`${field}.year`,record,collect);milestone.title=resolve(value.title,`${field}.title`,record,collect);if(value.points!=null){if(!Array.isArray(value.points))fail('Roadmap points must be an array of source references.');milestone.points=resolve(value.points,`${field}.points`,record,collect);}return milestone;
    }
    if(/^actions\[\d+\]$/.test(field)){
      if(Object.keys(value).some(k=>!['title','description'].includes(k)))fail('A summary action accepts a title and optional description only.');
      const action={title:resolve(value.title,`${field}.title`,record,collect)};if(value.description!=null)action.description=resolve(value.description,`${field}.description`,record,collect);return action;
    }
    if(/^steps\[\d+\]$/.test(field)){
      if(Object.keys(value).some(k=>!['title','description'].includes(k)))fail('A process step accepts a title and optional description only.');
      const step={title:resolve(value.title,`${field}.title`,record,collect)};if(value.description!=null)step.description=resolve(value.description,`${field}.description`,record,collect);return step;
    }
    if(/^columns\[\d+\]$/.test(field)){
      if(Object.keys(value).some(k=>!['title','items'].includes(k))||!Array.isArray(value.items))fail('A comparison column needs a title and an items array.');
      return {title:resolve(value.title,`${field}.title`,record,collect),items:value.items.map((item,i)=>{if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(k=>!['title','description'].includes(k)))fail('A comparison item accepts title and optional description only.');const resolved={title:resolve(item.title,`${field}.items[${i}].title`,record,collect)};if(item.description!=null)resolved.description=resolve(item.description,`${field}.items[${i}].description`,record,collect);return resolved;})};
    }
    if(field.startsWith('items[')){
      if(Object.keys(value).some(k=>!['title','description','page','target'].includes(k)))fail('An agenda item accepts title, description, page or target only.');
      const item={title:resolve(value.title,`${field}.title`,record,collect)};
      if(value.description!=null)item.description=resolve(value.description,`${field}.description`,record,collect);
      if(value.page!=null){if(!Number.isInteger(value.page)||value.page<1)fail('Agenda page references must be positive integers.');item.page=value.page;}
      if(value.target!=null){if(typeof value.target!=='string'||!plan.slides.some(slide=>slide.id===value.target))fail('Agenda target must identify a planned slide.');item.target=value.target;}
      return item;
    }
    if(field.startsWith('metrics[')){
      if(Object.keys(value).some(k=>!['value','label','description'].includes(k)))fail('A metric accepts value, label and optional description only.');
      const item={value:resolve(value.value,`${field}.value`,record,collect),label:resolve(value.label,`${field}.label`,record,collect)};
      if(value.description!=null)item.description=resolve(value.description,`${field}.description`,record,collect);return item;
    }
    if(field.startsWith('cards[')){
      if(Object.keys(value).some(k=>!['title','description'].includes(k)))fail('A card accepts only title and description.');
      const card={};for(const key of ['title','description'])if(value[key]!=null)card[key]=resolve(value[key],`${field}.${key}`,record,collect);return card;
    }
    fail(`Unsupported mapping in ${field}.`);
  }
  const slides=plan.slides.map(item=>{
    if(typeof item.id!=='string'||!item.id.trim()||ids.has(item.id))fail('Plan slide IDs must be nonempty and unique.');ids.add(item.id);
    if(!Array.isArray(item.candidates)||!item.candidates.length||item.candidates.length>3)fail(`Use 1 to 3 compatible candidates for ${item.id}.`);
    let canonicalContent;
    const candidates=item.candidates.map((candidate,index)=>{
      if(!allowRetired&&!catalog.entries.some(e=>e.id===candidate.template))fail('This template is retired from new compositions; use a current designed template or report a library gap.');
      if(typeof candidate.rationale!=='string'||!candidate.rationale.trim())fail(`Explain the semantic choice for ${item.id}.`);
      const fields=candidate.fields;if(fields&&Object.keys(fields).some(key=>![...visibleOrder,'image','imageAlt','background'].includes(key)))fail('Map source content only to rendered slide fields; metadata cannot carry source coverage.');if(!fields||Array.isArray(fields)||typeof fields!=='object')fail(`Provide mapped fields for ${item.id}.`);
      const record={id:item.id,template:candidate.template,refs:[],units:new Set()},content={};
      for(const field of visibleOrder)if(field in fields)content[field]=resolve(fields[field],field,record,index===0);
      for(const field of Object.keys(fields))if(!visibleOrder.includes(field))content[field]=resolve(fields[field],field,record,index===0);
      const slide=catalog.instantiate(candidate.template,content);slide.id=item.id;if(Object.hasOwn(item,'palette'))slide.palette=item.palette;if(Object.hasOwn(item,'overrides')&&(!item.overrides||typeof item.overrides!=='object'||Array.isArray(item.overrides)))throw Error('Slide overrides must be an object.');if(Object.hasOwn(item,'overrides'))slide.overrides={...slide.overrides,...structuredClone(item.overrides),title:{...slide.overrides?.title,...structuredClone(item.overrides?.title||{})},group:{...slide.overrides?.group,...structuredClone(item.overrides?.group||{})}};if(Object.hasOwn(item,'chrome'))slide.chrome=structuredClone(item.chrome);if(Object.hasOwn(item,'cardNumbers'))slide.cardNumbers=item.cardNumbers;if(Object.hasOwn(item,'cardTypography'))slide.cardTypography=structuredClone(item.cardTypography);
      if(item.cardIds!=null){if(!Array.isArray(slide.cards)||!Array.isArray(item.cardIds)||item.cardIds.length!==slide.cards.length)fail('Card IDs must match the mapped cards.');slide.cards.forEach((card,i)=>card.id=item.cardIds[i]);}
      const issues=catalog.validateContract(slide);if(issues.length)fail(`${item.id}: ${issues.map(issue=>issue.message).join(' ')}`);
      // Alternative candidates must carry the same source references and generated labels.
      const signature=value=>{const out=[];const walk=v=>{if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object'){if(v.ref)out.push(['ref',v.ref,v.start??0,v.end??blocks.get(v.ref)?.text.length]);else if(v.asset)out.push(['asset',v.asset]);else if(typeof v.label==='string')out.push(['label',v.label]);else for(const[key,value]of Object.entries(v)){if(['page','target'].includes(key))out.push([key,value]);else walk(value);}}};walk(value);return JSON.stringify(out);};
      if(index===0){canonicalContent=signature(Object.fromEntries([...visibleOrder,...Object.keys(fields).filter(k=>!visibleOrder.includes(k))].filter(k=>k in fields).map(k=>[k,fields[k]])));map.push({slideId:item.id,refs:record.refs,rationale:candidate.rationale});if(constraints.preserveBoundaries&&record.units.size>1)fail(`Original slide boundaries were merged in ${item.id}.`);for(const unit of record.units){if(!usedUnits.has(unit))usedUnits.set(unit,new Set());usedUnits.get(unit).add(item.id);}}
      else if(signature(Object.fromEntries([...visibleOrder,...Object.keys(fields).filter(k=>!visibleOrder.includes(k))].filter(k=>k in fields).map(k=>[k,fields[k]])))!==canonicalContent)fail(`Alternative candidate in ${item.id} changes source content.`);
      return {template:candidate.template,rationale:candidate.rationale,slide};
    });return {id:item.id,candidates};
  });
  const missing=[];
  for(const block of source.blocks){if(block.kind==='figure'){if(!usedAssets.has(block.id))missing.push(block.id);continue;}const mask=coverage.get(block.id);if([...block.text].length&&Array.from(mask).some((used,i)=>!used&&!/\s/.test(block.text[i])))missing.push(block.id);}
  if(missing.length)fail(`Source coverage incomplete: ${missing.join(', ')}.`);
  if(!constraints.allowContinuation&&[...usedUnits.values()].some(slides=>slides.size>1))fail('Continuation slides are prohibited by the source brief.');
  return {slides,coverage:{complete:true,sourceHash:source.artifactHash,blocks:source.blocks.length,map,additions,constraints}};
}
