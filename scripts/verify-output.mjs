import fs from 'node:fs/promises';
import path from 'node:path';
const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const dir=path.join('public','output',issue.date);
const names=(await fs.readdir(dir)).filter(n=>/^slide-\d{2}\.jpg$/.test(n));
if(names.length!==5) throw new Error(`Expected 5 slides in ${dir}, found ${names.length}`);
for(const name of ['slide-01.jpg','slide-02.jpg','slide-03.jpg','slide-04.jpg','slide-05.jpg']) if(!names.includes(name)) throw new Error(`Missing ${name}`);
console.log(`OK ${dir}: ${names.join(', ')}`);
