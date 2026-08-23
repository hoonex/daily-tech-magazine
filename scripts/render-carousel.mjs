import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const W=1080,H=1350;
const outDir=path.join('public','output',issue.date);
await fs.mkdir(outDir,{recursive:true});

const palettes=[['#7655ff','#050b1c','#1b0f42'],['#ff7147','#1d0905','#45130b'],['#00a98a','#061b18','#0b3b33'],['#d9a228','#211504','#543b08'],['#3c72ff','#06142d','#0d2d6f'],['#bd55ff','#1c0627','#4e1466'],['#32a6e8','#061824','#103b52']];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const chars=(text,max)=>{const arr=[...String(text??'')],lines=[];let line='';for(const ch of arr){if(ch==='\n'||[...line].length>=max){lines.push(line.trim());line=ch==='\n'?'':ch}else line+=ch}if(line.trim())lines.push(line.trim());return lines};
const tspans=(text,x,y,max,size,lh,weight=700)=>chars(text,max).map((l,i)=>`<tspan x="${x}" y="${y+i*lh}" font-size="${size}" font-weight="${weight}">${esc(l)}</tspan>`).join('');
const base=(idx,content,photo=false)=>{const [a,b,c]=palettes[idx%palettes.length];return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><radialGradient id="orb"><stop offset="0" stop-color="${a}" stop-opacity=".95"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030711" stop-opacity=".18"/><stop offset=".45" stop-color="#030711" stop-opacity=".28"/><stop offset=".68" stop-color="#030711" stop-opacity=".82"/><stop offset="1" stop-color="#030711" stop-opacity=".98"/></linearGradient></defs>${photo?'<rect width="1080" height="1350" fill="url(#shade)"/>':`<rect width="1080" height="1350" fill="url(#bg)"/><circle cx="910" cy="180" r="500" fill="url(#orb)"/><circle cx="120" cy="1250" r="400" fill="url(#orb)" opacity=".38"/>`}<rect x="1" y="1" width="1078" height="1348" rx="34" fill="none" stroke="#ffffff" stroke-opacity=".1"/><g font-family="Noto Sans CJK KR, Noto Sans KR, sans-serif" fill="#f6f7fb">${content}</g></svg>`};

const loadVisual=async visual=>{
  if(!visual?.reuseAllowed||!/^https:\/\//.test(visual.url||'')) return null;
  try{
    const res=await fetch(visual.url,{redirect:'follow',headers:{'user-agent':'DailyTechMagazine/1.0 (+https://github.com/hoonex/daily-tech-magazine)'}});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const type=res.headers.get('content-type')||'';
    if(!type.startsWith('image/')) throw new Error(`not image: ${type}`);
    const raw=Buffer.from(await res.arrayBuffer());
    return await sharp(raw).resize(W,H,{fit:'cover',position:'attention'}).modulate({brightness:.88,saturation:.88}).toBuffer();
  }catch(err){console.warn(`visual fallback: ${visual.url}: ${err.message}`);return null}
};

const save=async(i,svg,visual=null)=>{
  const file=path.join(outDir,`slide-${String(i).padStart(2,'0')}.jpg`);
  const bg=await loadVisual(visual);
  if(bg) await sharp(bg).composite([{input:Buffer.from(svg)}]).jpeg({quality:92,mozjpeg:true}).toFile(file);
  else await sharp(Buffer.from(svg)).jpeg({quality:92,mozjpeg:true}).toFile(file);
  console.log(file);
};
const label=(left,right)=>`<text x="70" y="86" font-size="24" font-weight="700" letter-spacing="3">${esc(left)}</text><text x="1010" y="86" font-size="20" text-anchor="end" fill="#c8cbd4">${esc(right)}</text>`;
const credit=v=>v?.reuseAllowed?`<text x="1010" y="1300" font-size="15" text-anchor="end" fill="#d2d5dc" fill-opacity=".82">${esc(v.credit)} · ${esc(v.license)}${v.modified?' · '+esc(v.modified):''}</text>`:'';

const topStories=issue.top3.map(id=>issue.stories.find(s=>s.id===id));
const coverVisual=topStories[0]?.visual;
await save(1,base(0,`${label(issue.brand||'DAILY TECH',issue.date)}<text x="70" y="650" font-size="24" fill="#d8dbe2" letter-spacing="2">TODAY / TOP 3</text><text>${tspans(issue.deckTitle,70,750,13,84,96,800)}</text>${topStories.map((s,i)=>`<g transform="translate(70 ${1015+i*82})"><text y="0" font-size="19" fill="#b6bbc6">0${i+1}</text><text x="52" y="0" font-size="27" font-weight="700">${esc(s.headline.slice(0,31))}</text></g>`).join('')}<text x="70" y="1300" font-size="18" fill="#c3c7d0">${esc(issue.deckSubtitle||'')}</text>${credit(coverVisual)}`,Boolean(coverVisual?.reuseAllowed)),coverVisual);

for(let i=0;i<3;i++){
  const s=topStories[i],v=s.visual;
  const photo=Boolean(v?.reuseAllowed);
  const body=photo
    ? `${label(`TOP 0${i+1} / ${s.category}`,issue.date)}<text>${tspans(s.headline,70,620,13,68,80,800)}</text><text x="70" y="815" font-size="20" fill="#c5cad4" letter-spacing="2">WHAT HAPPENED</text><text>${tspans(s.facts,70,860,35,29,43,500)}</text><text x="70" y="1110" font-size="20" fill="#c5cad4" letter-spacing="2">WHY IT MATTERS</text><text>${tspans(s.whyItMatters,70,1155,35,28,42,650)}</text><rect x="70" y="1260" width="${s.status==='unconfirmed'?120:96}" height="38" rx="19" fill="#ffffff" fill-opacity=".12"/><text x="90" y="1286" font-size="17">${s.status==='unconfirmed'?'미확정':'확정'}</text>${credit(v)}`
    : `${label(`TOP 0${i+1} / ${s.category}`,issue.date)}<text>${tspans(s.headline,70,260,13,78,90,800)}</text><text x="70" y="660" font-size="22" fill="#aeb4c1" letter-spacing="2">WHAT HAPPENED</text><text>${tspans(s.facts,70,715,34,31,47,500)}</text><text x="70" y="1005" font-size="22" fill="#aeb4c1" letter-spacing="2">WHY IT MATTERS</text><text>${tspans(s.whyItMatters,70,1060,34,31,47,650)}</text><rect x="70" y="1220" width="${s.status==='unconfirmed'?120:96}" height="42" rx="21" fill="#ffffff" fill-opacity=".10"/><text x="90" y="1249" font-size="18">${s.status==='unconfirmed'?'미확정':'확정'}</text><text x="1010" y="1250" font-size="18" text-anchor="end" fill="#b8bdc7">${esc(s.sources[0].name)}</text>`;
  await save(i+2,base(i+1,body,photo),v);
}

const rest=issue.stories.filter(s=>!issue.top3.includes(s.id));
await save(5,base(5,`${label('7 MORE / QUICK READ',issue.date)}<text x="70" y="190" font-size="60" font-weight="800">놓치기 아까운 7개</text>${rest.map((s,i)=>{const y=310+i*125;return `<text x="70" y="${y}" font-size="20" fill="#aeb4c1">${String(i+4).padStart(2,'0')} / ${esc(s.category)}</text><text x="70" y="${y+42}" font-size="30" font-weight="700">${esc(s.headline.slice(0,34))}</text>`}).join('')}`));

await save(6,base(6,`${label('EDITORIAL / ANALYSIS',issue.date)}<text x="70" y="230" font-size="24" fill="#aeb4c1" letter-spacing="2">WHAT TODAY MEANS</text><text>${tspans(issue.dailyAnalysis,70,330,18,58,76,750)}</text><text x="70" y="1040" font-size="22" fill="#aeb4c1" letter-spacing="2">NEXT 6–24 MONTHS</text><text>${tspans(topStories.map(s=>s.outlook).join('  '),70,1100,36,28,43,500)}</text>`));

const sources=[...new Map(issue.stories.flatMap(s=>s.sources).map(s=>[s.url,s])).values()].slice(0,9);
const visuals=topStories.filter(s=>s.visual?.reuseAllowed).map(s=>s.visual).slice(0,3);
await save(7,base(0,`${label('SOURCES / END',issue.date)}<text x="70" y="220" font-size="68" font-weight="800">출처와 이미지 권리까지</text><text x="70" y="300" font-size="68" font-weight="800">확인하는 기술 뉴스.</text><text x="70" y="410" font-size="25" fill="#b9bec8">확정 사실과 분석을 분리하고, 미확정은 표시합니다.</text>${sources.map((s,i)=>`<text x="70" y="${525+i*48}" font-size="21" fill="#d9dce3">${String(i+1).padStart(2,'0')}  ${esc(s.name)}  ·  ${esc(new URL(s.url).hostname.replace(/^www\./,''))}</text>`).join('')}<text x="70" y="1020" font-size="19" fill="#aeb4c1" letter-spacing="2">VISUAL CREDITS</text>${visuals.map((v,i)=>`<text x="70" y="${1070+i*48}" font-size="20" fill="#d9dce3">${esc(v.credit)} · ${esc(v.license)}</text>`).join('')}<text x="70" y="1280" font-size="22" fill="#a8adb8">DAILY TECH · ${issue.stories.length} stories</text>`));

const visualCredits=visuals.map(v=>`${v.credit} (${v.license}) ${v.sourceUrl}`).join('\n');
const caption=[`[${issue.date}] ${issue.deckTitle}`,'',...topStories.map((s,i)=>`${i+1}. ${s.headline}`),'',issue.dailyAnalysis,'',`출처: ${[...new Set(issue.stories.flatMap(s=>s.sources.map(x=>x.name)))].join(', ')}`,visualCredits?`\n이미지: ${visualCredits}`:''].join('\n');
await fs.writeFile(path.join(outDir,'caption.txt'),caption+'\n','utf8');
