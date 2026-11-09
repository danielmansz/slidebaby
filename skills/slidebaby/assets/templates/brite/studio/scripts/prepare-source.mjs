#!/usr/bin/env node
import fs from 'node:fs/promises';
import {args,snapshot}from'./source.mjs';
const options=args(['input','output','exact-slides','no-continuations','allow-generated-titles'],['no-continuations','allow-generated-titles']);
if(!options.input||!options.output)throw new Error('Use --input source.md --output NEW-source.json [--exact-slides N] [--no-continuations] [--allow-generated-titles].');
const source=await snapshot(options.input,{exactSlides:options['exact-slides']==null?null:Number(options['exact-slides']),allowContinuation:!options['no-continuations'],allowGeneratedTitles:!!options['allow-generated-titles']});
await fs.writeFile(options.output,JSON.stringify(source,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({saved:options.output,artifactHash:source.artifactHash,blocks:source.blocks.length,gaps:source.blocks.filter(block=>block.kind==='unsupported').map(({id,reason})=>({id,reason}))},null,2));
