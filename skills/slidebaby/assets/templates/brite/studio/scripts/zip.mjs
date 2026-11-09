/* Small dependency-free ZIP writer for portable projects. No ZIP64 or filesystem writes. */
import {deflateRawSync} from 'node:zlib';
const table=Uint32Array.from({length:256},(_,i)=>{let n=i;for(let k=0;k<8;k++)n=(n>>>1)^((n&1)?0xedb88320:0);return n>>>0;});
function crc32(bytes){let n=0xffffffff;for(const b of bytes)n=(n>>>8)^table[(n^b)&255];return(n^0xffffffff)>>>0;}
export function makeZip(files){
 if(!Array.isArray(files)||files.length>60000)throw Error('Too many archive files.');
 const names=new Set(),locals=[],directory=[];let offset=0,total=0;
 for(const {name,bytes:input} of files){
  if(typeof name!=='string'||!name||/^[a-z]:/i.test(name)||/[\\\x00-\x1f]/.test(name)||name.split('/').some(p=>!p||p==='.'||p==='..')||names.has(name))throw Error('Archive paths must be distinct safe relative filenames.');
  names.add(name);const filename=Buffer.from(name,'utf8'),bytes=Buffer.from(input);total+=bytes.length;
  if(filename.length>65535||total>512*1024*1024)throw Error('Portable archive exceeds the supported 512 MB input limit.');
  const compressed=deflateRawSync(bytes,{level:9}),body=compressed.length<bytes.length?compressed:bytes,method=body===bytes?0:8,crc=crc32(bytes);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(method,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(body.length,18);local.writeUInt32LE(bytes.length,22);local.writeUInt16LE(filename.length,26);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(0x0314,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(method,10);central.writeUInt16LE(33,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(body.length,20);central.writeUInt32LE(bytes.length,24);central.writeUInt16LE(filename.length,28);central.writeUInt32LE((0o100644<<16)>>>0,38);central.writeUInt32LE(offset,42);
  locals.push(local,filename,body);directory.push(central,filename);offset+=local.length+filename.length+body.length;
 }
 const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...locals,central,end]);
}
