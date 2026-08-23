import fs from 'node:fs/promises';
import path from 'node:path';
const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const dir=path.join('public','output',issue.date);
const names=(await fs.readdir(dir)).filter(n=>/^slide-\d{2}\.jpg$/.test(n));
if(names.length!==7) throw new Error(`Expected 7 slides in ${dir}, found ${names.length}`);
console.log(`OK ${dir}: ${names.join(', ')}`);
