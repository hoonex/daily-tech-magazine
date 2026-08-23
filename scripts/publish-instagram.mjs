import fs from 'node:fs/promises';
import path from 'node:path';

const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const token=process.env.INSTAGRAM_ACCESS_TOKEN;
const userId=process.env.INSTAGRAM_USER_ID;
const version=process.env.INSTAGRAM_API_VERSION;
const host=process.env.INSTAGRAM_GRAPH_HOST||'graph.instagram.com';
const auto=process.env.INSTAGRAM_AUTO_PUBLISH==='true';
if(!auto){console.log('Instagram publish disabled (INSTAGRAM_AUTO_PUBLISH != true).');process.exit(0)}
if(!token||!userId||!version) throw new Error('Instagram publishing requires INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID and INSTAGRAM_API_VERSION');
const marker=path.join('state','instagram',`${issue.date}.json`);
try{await fs.access(marker);console.log(`Already published: ${issue.date}`);process.exit(0)}catch{}
const repo=process.env.GITHUB_REPOSITORY||'hoonex/daily-tech-magazine';
const branch=process.env.GITHUB_REF_NAME||'main';
const base=`https://raw.githubusercontent.com/${repo}/${branch}/public/output/${issue.date}`;
const api=`https://${host}/${version}`;
const post=async(endpoint,body)=>{const r=await fetch(`${api}/${endpoint}`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({...body,access_token:token})});const j=await r.json();if(!r.ok||j.error)throw new Error(`Instagram API ${endpoint}: ${j.error?.message||r.status}`);return j};
const get=async(endpoint,params={})=>{const q=new URLSearchParams({...params,access_token:token});const r=await fetch(`${api}/${endpoint}?${q}`);const j=await r.json();if(!r.ok||j.error)throw new Error(`Instagram API ${endpoint}: ${j.error?.message||r.status}`);return j};
const waitContainer=async(id)=>{for(let i=0;i<24;i++){const j=await get(id,{fields:'status_code'});if(j.status_code==='FINISHED')return;if(j.status_code==='ERROR'||j.status_code==='EXPIRED')throw new Error(`Instagram container ${id} status ${j.status_code}`);await new Promise(r=>setTimeout(r,5000))}throw new Error(`Instagram container timeout: ${id}`)};
const wait=async(url)=>{for(let i=0;i<18;i++){const r=await fetch(url,{method:'HEAD'});if(r.ok)return;await new Promise(r=>setTimeout(r,5000))}throw new Error(`Image not reachable: ${url}`)};
const children=[];
for(let i=1;i<=7;i++){
  const url=`${base}/slide-${String(i).padStart(2,'0')}.jpg`;
  await wait(url);
  const child=await post(`${userId}/media`,{image_url:url,is_carousel_item:'true'});
  await waitContainer(child.id);
  children.push(child.id);
}
const caption=await fs.readFile(path.join('public','output',issue.date,'caption.txt'),'utf8');
const carousel=await post(`${userId}/media`,{media_type:'CAROUSEL',children:children.join(','),caption:caption.slice(0,2100)});
await waitContainer(carousel.id);
const published=await post(`${userId}/media_publish`,{creation_id:carousel.id});
await fs.mkdir(path.dirname(marker),{recursive:true});
await fs.writeFile(marker,JSON.stringify({date:issue.date,mediaId:published.id,publishedAt:new Date().toISOString(),host},null,2)+'\n');
console.log(`Published Instagram media ${published.id}`);
