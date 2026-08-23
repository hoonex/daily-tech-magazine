import fs from 'node:fs/promises';
import path from 'node:path';

const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const dir=path.join('public','output',issue.date);
await fs.rm(dir,{recursive:true,force:true});
console.log(`Cleaned ${dir}`);
