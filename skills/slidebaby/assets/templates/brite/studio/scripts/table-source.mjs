/* Bounded plain-text pipe tables. Values are strings; no arithmetic or HTML. */
export function splitTableRow(line){
 const value=line.trim(),cells=[];let cell='',ended=false;
 for(let i=0;i<value.length;i++){
  const c=value[i];ended=false;
  if(c==='\\'&&['|','\\'].includes(value[i+1])){cell+=value[++i];continue;}
  if(c==='|'){cells.push(cell.trim());cell='';ended=true;}else cell+=c;
 }
 cells.push(cell.trim());if(value.startsWith('|'))cells.shift();if(ended)cells.pop();return cells;
}
export const isTableDivider=line=>typeof line==='string'&&line.includes('|')&&splitTableRow(line).length>=2&&splitTableRow(line).every(cell=>/^:?-{3,}:?$/.test(cell));
export function parsePipeTable(lines){
 if(lines.length<3||!isTableDivider(lines[1]))return{reason:'Use a plain pipe table with a header, a --- separator row and at least one body row.'};
 const headers=splitTableRow(lines[0]),separators=splitTableRow(lines[1]),rows=lines.slice(2).map(splitTableRow);
 if(headers.length<2||headers.length!==separators.length||!headers.some(v=>v.trim())||rows.some(row=>row.length!==headers.length))return{reason:'Table rows must retain the same number of cells as the headers, including empty cells.'};
 if([...headers,...rows.flat()].some(cell=>/!\[|<\/?[a-z][^>]*>|\[[^\]]+\]\([^)]+\)/i.test(cell)))return{reason:'This native table supports plain text cells, not embedded images, links, HTML or multiline cell markup.'};
 return{table:{headers,rows,alignments:separators.map(cell=>cell.startsWith(':')&&cell.endsWith(':')?'center':cell.endsWith(':')?'right':cell.startsWith(':')?'left':null)}};
}
