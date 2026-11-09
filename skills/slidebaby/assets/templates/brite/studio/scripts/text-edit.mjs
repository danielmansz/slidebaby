/* Explicit supplied text changes, not a layout-driven rewrite or unrestricted JSON patch. */
import {digest} from './source.mjs';
const own=(o,k)=>Object.hasOwn(o,k);
const index='(?:0|[1-9]\\d*)';
const paths=[
 /^\/(title|description|caption|sectionNumber|takeaway|takeawayLabel|takeawayDescription|quote|author|authorRole|imageAlt)$/,
 new RegExp(`^/(paragraphs|points)/${index}$`),
 new RegExp(`^/(actions|steps)/${index}/(title|description)$`),
 new RegExp(`^/milestones/${index}/(period|year|title)$`),
 new RegExp(`^/milestones/${index}/points/${index}$`),
 new RegExp(`^/columns/${index}/title$`),
 new RegExp(`^/columns/${index}/items/${index}/(title|description)$`),
 new RegExp(`^/metrics/${index}/(value|label|description)$`),
 new RegExp(`^/items/${index}/(title|description)$`),
 new RegExp(`^/images/${index}/alt$`),
 new RegExp(`^/table/headers/${index}$`),
 new RegExp(`^/table/rows/${index}/${index}$`)
];
export function applyTextEdits(slide,changes,catalog){
 if(!Array.isArray(changes)||!changes.length||changes.length>100)throw Error('setText needs 1–100 explicit text changes.');
 const seen=new Set(),contract=catalog.contractFor(slide);
 for(const change of changes){
  if(!change||typeof change!=='object'||Array.isArray(change)||Object.keys(change).some(k=>!['path','before','value'].includes(k))||!own(change,'before')||!own(change,'value')||typeof change.path!=='string'||!paths.some(p=>p.test(change.path)))throw Error('Use a supported text path, its exact before value (null when absent), and the supplied new value. Card text uses updateCards with stable IDs.');
  if(seen.has(change.path))throw Error('A text path can be changed only once per request.');seen.add(change.path);
  const parts=change.path.slice(1).split('/'),field=parts[0];
  if(![...contract.required,...contract.optional,...(contract.omitted||[])].includes(field))throw Error(`This layout has no text field ${field}.`);
  let parent=slide;
  for(const part of parts.slice(0,-1)){
   if(parent==null||typeof parent!=='object'||!own(parent,part))throw Error(`Text target does not exist: ${change.path}.`);
   parent=parent[part];
  }
  const key=parts.at(-1),has=own(parent,key),previous=has?parent[key]:null;
  if(Array.isArray(parent)&&(!has||Number(key)>=parent.length))throw Error('Text edits cannot add, remove or reorder list items.');
  const titleArray=value=>field==='title'&&parts.length===1&&Array.isArray(value)&&value.length>0&&value.every(v=>typeof v==='string'&&v.trim());
  if(previous!==null&&typeof previous!=='string'&&!titleArray(previous))throw Error('This target is not a text value or an explicit title-line array.');
  if(digest(change.before)!==digest(previous))throw Error(`Text target changed since it was read: ${change.path}. Read the current revision before editing.`);
  const value=change.value,table=field==='table',optional=parts.length===1?contract.optional.includes(field):['description','period','year'].includes(key);
  if(value===null){
   if(!optional||table)throw Error(`Required text cannot be removed: ${change.path}.`);
   delete parent[key];
  }else{
   if(!titleArray(value)&&(typeof value!=='string'||(!table&&!value.trim())))throw Error('Supply replacement text (or explicit title lines); table cells may be blank and optional text can be removed with null.');
   parent[key]=structuredClone(value);
  }
 }
 return changes.map(({path,before,value})=>({path,before,after:value}));
}
