/* Source snapshots and exact-text references. No dependencies or network. */
import fs from 'node:fs/promises';
import{isTableDivider,parsePipeTable}from'./table-source.mjs';
import {validatePageCapture} from './prepare-page.mjs';
import {validateNarrative} from './narrative.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
export const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
export const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export const digest=value=>hash(JSON.stringify(canonical(value)));
export function parseSource(raw,{version=2}={}){
  if(![1,2].includes(version))throw new Error('Unsupported source parser version.');
  if(raw.length>100000)throw new Error('Source exceeds 100000 characters. Split the source before composing.');
  const lines=raw.replace(/^\uFEFF/,'').split(/\r?\n/),blocks=[];let unit=0,hasSlideBoundaries=false;
  const add=(kind,text,extra={})=>blocks.push({id:`b${String(blocks.length+1).padStart(4,'0')}`,kind,text,unit,...extra});
  for(let i=0;i<lines.length;){
    const line=lines[i];if(!line.trim()){i++;continue;}
    if(/^\s*---+\s*$/.test(line)){unit++;hasSlideBoundaries=true;i++;continue;}
    const fence=line.match(/^\s*(```+|~~~+)/);
    if(fence){const start=i++;while(i<lines.length&&!lines[i].trimStart().startsWith(fence[1]))i++;if(i<lines.length)i++;add('unsupported',lines.slice(start,i).join('\n'),{reason:'Fenced code is not supported by this text-first workflow.'});continue;}
    if(version===2&&(line.includes('|')&&isTableDivider(lines[i+1])||/^\s*\|/.test(line)||/^\s*[-:]+\s*\|/.test(line))){
      const start=i++;while(i<lines.length&&lines[i].trim()&&lines[i].includes('|'))i++;
      const tableLines=lines.slice(start,i),parsed=parsePipeTable(tableLines);if(parsed.table)add('table',tableLines.join('\n'),{table:parsed.table});else add('unsupported',tableLines.join('\n'),{reason:parsed.reason});continue;
    }
    if(version===1&&(/^\s*\|/.test(line)||/^\s*[-:]+\s*\|/.test(line))){const start=i++;while(i<lines.length&&lines[i].trim())i++;add('unsupported',lines.slice(start,i).join('\n'),{reason:'A table needs a verified table composition or a supplied readable figure.'});continue;}
    const heading=line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*$/);
    if(heading){add('heading',heading[2].replace(/\s+#+$/,''),{level:heading[1].length});i++;continue;}
    const figure=line.match(/^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if(figure){add('figure',figure[1],{asset:figure[2].replace(/^<|>$/g,'')});i++;continue;}
    const list=line.match(/^(\s*)([-+*]|\d+[.)])\s+(.+)$/);
    if(list){if(list[1].length)add('unsupported',line,{reason:'Indented/nested lists need a composition that preserves hierarchy.'});else add('list-item',/^[0-9]/.test(list[2])?`${list[2]} ${list[3]}`:list[3]);i++;continue;}
    const start=i++;
    while(i<lines.length&&lines[i].trim()&&!/^\s*(?:#{1,6}\s|[-+*]\s|\d+[.)]\s|!\[|\||```|~~~|---+\s*$)/.test(lines[i])&&!(version===2&&lines[i].includes('|')&&isTableDivider(lines[i+1])))i++;
    const text=lines.slice(start,i).join('\n');
    if(/!\[|<\/?(?:table|script|iframe)\b|\[[^\]]+\]\([^)]+\)/i.test(text))add('unsupported',text,{reason:'Inline images, links, or embedded HTML need explicit handling; keep this source block visible as a gap.'});
    else add('paragraph',text);
  }
  if(!blocks.length)throw new Error('Provide nonempty text or Markdown.');
  return {blocks,hasSlideBoundaries};
}
export async function snapshot(input,constraints={}){
  const absolute=path.resolve(input),raw=await fs.readFile(absolute,'utf8');const parsed=parseSource(raw);
  const source={schemaVersion:1,parserVersion:2,origin:absolute,raw,sourceHash:hash(raw),...parsed,constraints:{exactSlides:null,allowContinuation:true,preserveBoundaries:parsed.hasSlideBoundaries,allowGeneratedTitles:false,...constraints}};
  if(source.constraints.exactSlides!=null&&(!Number.isInteger(source.constraints.exactSlides)||source.constraints.exactSlides<1||source.constraints.exactSlides>60))throw new Error('Exact slide count must be an integer from 1 to 60.');
  source.artifactHash=digest(source);return source;
}
export function validateSnapshot(source){
  if(source.webCapture)validatePageCapture(source.webCapture,source.raw);
  if(source.narrative)validateNarrative(source.narrative,source.raw);
  const {artifactHash,...body}=source;if(digest(body)!==artifactHash||hash(source.raw)!==source.sourceHash)throw new Error('Source snapshot changed. Prepare a new snapshot and plan without overwriting the original.');
  const parsed=parseSource(source.raw,{version:source.parserVersion??1});if(JSON.stringify(parsed.blocks)!==JSON.stringify(source.blocks)||parsed.hasSlideBoundaries!==source.hasSlideBoundaries)throw new Error('Source blocks do not match the original text.');
}
export function args(allowed,booleans=[]){
  const options={};for(let i=2;i<process.argv.length;i++){const key=process.argv[i].replace(/^--/,'');if(!process.argv[i].startsWith('--')||!allowed.includes(key)||key in options)throw new Error(`Unsupported or repeated argument: ${process.argv[i]}`);if(booleans.includes(key))options[key]=true;else{if(!process.argv[i+1]||process.argv[i+1].startsWith('--'))throw new Error(`Missing value: --${key}`);options[key]=process.argv[++i];}}return options;
}
