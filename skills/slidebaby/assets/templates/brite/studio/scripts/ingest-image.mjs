/* Local raster derivatives using the Chromium runtime already needed for export. */
import fs from'node:fs/promises';import path from'node:path';import{fileURLToPath,pathToFileURL}from'node:url';import{hash,args}from'./source.mjs';
export async function ingestImage({original,root,chromium,executablePath}){
 original=path.resolve(original);const bytes=await fs.readFile(original),ext=path.extname(original).toLowerCase();if(bytes.length>100*1024*1024)throw new Error('Image exceeds the 100 MB input limit.');
 const svg=ext==='.svg'&&/<svg\b/i.test(bytes.toString('utf8'));
 const type=ext==='.png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':['.jpg','.jpeg'].includes(ext)&&bytes[0]===255&&bytes[1]===216?'image/jpeg':ext==='.webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'image/webp':null;
 if(!svg&&!type)throw new Error('Supply a real PNG/JPEG/WebP or self-contained SVG.');
 if(svg&&/<(?:script|foreignObject)\b|(?:href|src)\s*=\s*["'](?!#)|<!ENTITY|@import|url\(\s*["']?(?!#)/i.test(bytes.toString('utf8')))throw new Error('SVG contains active/external content.');
 if(type==='image/webp'){for(let i=12;i+8<=bytes.length;){const tag=bytes.toString('ascii',i,i+4),n=bytes.readUInt32LE(i+4);if(tag==='ANIM'||tag==='ANMF')throw new Error('Animated WebP needs separate handling.');i+=8+n+(n%2);}}
 if(type==='image/png'){for(let i=8;i+12<=bytes.length;){const n=bytes.readUInt32BE(i),tag=bytes.toString('ascii',i+4,i+8);if(tag==='acTL')throw new Error('Animated PNG needs separate handling.');i+=12+n;}}
 let output=bytes,dimensions=null,quality=null;
 if(!svg){
  if(!chromium||!executablePath)throw new Error('Automatic image optimization requires the existing Playwright module and Chromium executable. Nothing was installed.');
  const browser=await chromium.launch({headless:true,executablePath});try{
   const page=await browser.newPage();await page.route(/^https?:/,r=>r.abort());
   const result=await page.evaluate(async({data,type,sourceBytes})=>{const img=new Image();img.src=data;await img.decode();const width=img.naturalWidth,height=img.naturalHeight;if(width*height>40000000)throw new Error('Image exceeds 40 megapixels.');
    const scale=Math.min(1,1080/height),w=Math.max(1,Math.round(width*scale)),h=Math.min(1080,height);
    if(type==='image/webp'&&scale===1)return{width,height,w,h,unchanged:true};
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);
    // Chromium's quality=1 may greatly inflate UI screenshots. Keep a high quality
    // floor and try at most three encodings, preferring the first within input size.
    const qualities=type==='image/jpeg'?[0.85]:[0.98,0.95,0.9];let selected;
    for(const quality of qualities){const url=canvas.toDataURL('image/webp',quality);if(!url.startsWith('data:image/webp;base64,'))throw new Error('WebP encoder unavailable.');const data=url.split(',')[1],size=atob(data).length,candidate={quality,data,size};if(!selected||size<selected.size)selected=candidate;if(size<=sourceBytes){selected=candidate;break;}}
    return{width,height,w,h,quality:selected.quality,data:selected.data};
   },{data:`data:${type};base64,${bytes.toString('base64')}`,type,sourceBytes:bytes.length});
   dimensions={original:[result.width,result.height],output:[result.w,result.h]};quality=result.quality??null;if(!result.unchanged)output=Buffer.from(result.data,'base64');
  }finally{await browser.close()}
 }
 if(output.length>20*1024*1024)throw new Error('Optimized image still exceeds 20 MB.');
 const sha256=hash(output),relative=`assets/user/${sha256}${svg?'.svg':'.webp'}`;await fs.mkdir(path.join(root,'assets/user'),{recursive:true});try{await fs.writeFile(path.join(root,relative),output,{flag:'wx'})}catch(e){if(e.code!=='EEXIST')throw e;if(hash(await fs.readFile(path.join(root,relative)))!==sha256)throw new Error('Existing asset content differs.');}
 return{path:relative,sha256,source:{path:original,sha256:hash(bytes),bytes:bytes.length},optimization:{version:1,engine:svg?'vector-preserved':'chromium-webp',maxHeight:1080,quality,dimensions,bytes:output.length}};
}
export function validateAssetRecord(asset){
 if(!asset.optimization)return; // Legacy exact-copy records stay valid.
 const o=asset.optimization;if(o.version!==1||!['vector-preserved','chromium-webp'].includes(o.engine)||o.maxHeight!==1080||!/^[a-f\d]{64}$/.test(asset.source?.sha256??''))throw new Error('Invalid image provenance.');
 if(asset.path!==`assets/user/${asset.sha256}${o.engine==='vector-preserved'?'.svg':'.webp'}`)throw new Error('Optimized image path/hash mismatch.');
 if(o.engine==='vector-preserved'){if(asset.source.sha256!==asset.sha256)throw new Error('Vector source changed.');return;}
 const d=o.dimensions;if(!d||![...d.original,...d.output].every(n=>Number.isInteger(n)&&n>0)||d.output[1]>1080||d.output[1]>d.original[1]||d.output[0]!==Math.max(1,Math.round(d.original[0]*d.output[1]/d.original[1])))throw new Error('Invalid image resize record.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const o=args(['input','project','playwright-module','browser-executable']);if(!o.input||!o.project)throw new Error('Use --input file --project folder --playwright-module path --browser-executable path.');let chromium=null;if(o['playwright-module']){const playwright=await import(pathToFileURL(path.resolve(o['playwright-module'])).href);chromium=playwright.chromium||playwright.default?.chromium;if(!chromium?.launch)throw new Error('The supplied Playwright module does not expose Chromium.');}console.log(JSON.stringify(await ingestImage({original:o.input,root:path.resolve(o.project),chromium,executablePath:o['browser-executable']}),null,2));}
