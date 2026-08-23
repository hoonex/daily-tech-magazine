import fs from 'node:fs';
const file=process.argv[2]||'content/latest.json';
const issue=JSON.parse(fs.readFileSync(file,'utf8'));
const fail=m=>{throw new Error(m)};
if(!/^\d{4}-\d{2}-\d{2}$/.test(issue.date||'')) fail('date must be YYYY-MM-DD');
if(!Array.isArray(issue.stories)||issue.stories.length!==10) fail('stories must contain exactly 10 items');
if(!Array.isArray(issue.top3)||issue.top3.length!==3||new Set(issue.top3).size!==3) fail('top3 must contain 3 unique IDs');
const ids=new Set();
for(const [i,s] of issue.stories.entries()){
  for(const key of ['id','category','headline','facts','whyItMatters','analysis','outlook','status']) if(!String(s[key]??'').trim()) fail(`stories[${i}].${key} is required`);
  if(ids.has(s.id)) fail(`duplicate id: ${s.id}`); ids.add(s.id);
  if(!['confirmed','unconfirmed'].includes(s.status)) fail(`invalid status for ${s.id}`);
  if(!Array.isArray(s.sources)||s.sources.length<1) fail(`${s.id} needs at least one source`);
  for(const src of s.sources){if(!src.name||!/^https:\/\//.test(src.url||'')) fail(`${s.id} has invalid source`)}
  if(s.visual!==undefined){
    const v=s.visual;
    if(v===null||typeof v!=='object') fail(`${s.id}.visual must be an object`);
    for(const key of ['url','credit','license','sourceUrl']) if(!String(v[key]??'').trim()) fail(`${s.id}.visual.${key} is required`);
    if(!/^https:\/\//.test(v.url)||!/^https:\/\//.test(v.sourceUrl)) fail(`${s.id} visual URLs must be HTTPS`);
    if(v.reuseAllowed!==true) fail(`${s.id}.visual.reuseAllowed must be true; otherwise omit visual`);
  }
}
for(const id of issue.top3) if(!ids.has(id)) fail(`top3 id not found: ${id}`);
if(!String(issue.dailyAnalysis??'').trim()) fail('dailyAnalysis is required');
console.log(`OK ${issue.date}: ${issue.stories.length} stories, top3=${issue.top3.join(',')}`);
