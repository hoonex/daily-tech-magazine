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
const base=(idx,content)=>{const [a,b,c]=palettes[idx%palettes.length];return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><radialGradient id="orb"><stop offset="0" stop-color="${a}" stop-opacity=".95"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1350" fill="url(#bg)"/><circle cx="910" cy="180" r="500" fill="url(#orb)"/><circle cx="120" cy="1250" r="400" fill="url(#orb)" opacity=".38"/><rect x="1" y="1" width="1078" height="1348" rx="34" fill="none" stroke="#ffffff" stroke-opacity=".1"/><g font-family="Noto Sans CJK KR, Noto Sans KR, sans-serif" fill="#f6f7fb">${content}</g></svg>`};
const save=async(i,svg)=>{const file=path.join(outDir,`slide-${String(i).padStart(2,'0')}.jpg`);await sharp(Buffer.from(svg)).jpeg({quality:92,mozjpeg:true}).toFile(file);console.log(file)};
const label=(left,right)=>`<text x="70" y="86" font-size="24" font-weight="700" letter-spacing="3">${esc(left)}</text><text x="1010" y="86" font-size="20" text-anchor="end" fill="#c8cbd4">${esc(right)}</text>`;

const topStories=issue.top3.map(id=>issue.stories.find(s=>s.id===id));
await save(1,base(0,`${label(issue.brand||'DAILY TECH',issue.date)}<text x="70" y="220" font-size="24" fill="#c8cbd4" letter-spacing="2">TODAY / TOP 3</text><text>${tspans(issue.deckTitle,70,340,14,84,96,800)}</text>${topStories.map((s,i)=>`<g transform="translate(70 ${760+i*145})"><text y="0" font-size="24" fill="#aeb4c1">0${i+1}</text><text x="64" y="0" font-size="32" font-weight="700">${esc(s.headline.slice(0,32))}</text></g>`).join('')}<text x="70" y="1280" font-size="20" fill="#9da2ae">${esc(issue.deckSubtitle||'')}</text>`));

for(let i=0;i<3;i++){
  const s=topStories[i];
  await save(i+2,base(i+1,`${label(`TOP 0${i+1} / ${s.category}`,issue.date)}<text>${tspans(s.headline,70,260,13,78,90,800)}</text><text x="70" y="660" font-size="22" fill="#aeb4c1" letter-spacing="2">WHAT HAPPENED</text><text>${tspans(s.facts,70,715,34,31,47,500)}</text><text x="70" y="1005" font-size="22" fill="#aeb4c1" letter-spacing="2">WHY IT MATTERS</text><text>${tspans(s.whyItMatters,70,1060,34,31,47,650)}</text><rect x="70" y="1220" width="${s.status==='unconfirmed'?120:96}" height="42" rx="21" fill="#ffffff" fill-opacity=".10"/><text x="90" y="1249" font-size="18">${s.status==='unconfirmed'?'미확정':'확정'}</text><text x="1010" y="1250" font-size="18" text-anchor="end" fill="#b8bdc7">${esc(s.sources[0].name)}</text>`));
}

const rest=issue.stories.filter(s=>!issue.top3.includes(s.id));
await save(5,base(5,`${label('7 MORE / QUICK READ',issue.date)}<text x="70" y="190" font-size="60" font-weight="800">놓치기 아까운 7개</text>${rest.map((s,i)=>{const y=310+i*125;return `<text x="70" y="${y}" font-size="20" fill="#aeb4c1">${String(i+4).padStart(2,'0')} / ${esc(s.category)}</text><text x="70" y="${y+42}" font-size="30" font-weight="700">${esc(s.headline.slice(0,34))}</text>`}).join('')}`));

await save(6,base(6,`${label('EDITORIAL / ANALYSIS',issue.date)}<text x="70" y="230" font-size="24" fill="#aeb4c1" letter-spacing="2">WHAT TODAY MEANS</text><text>${tspans(issue.dailyAnalysis,70,330,18,58,76,750)}</text><text x="70" y="1040" font-size="22" fill="#aeb4c1" letter-spacing="2">NEXT 6–24 MONTHS</text><text>${tspans(topStories.map(s=>s.outlook).join('  '),70,1100,36,28,43,500)}</text>`));

const sources=[...new Map(issue.stories.flatMap(s=>s.sources).map(s=>[s.url,s])).values()].slice(0,12);
await save(7,base(0,`${label('SOURCES / END',issue.date)}<text x="70" y="240" font-size="72" font-weight="800">출처까지 남기는</text><text x="70" y="325" font-size="72" font-weight="800">기술 뉴스.</text><text x="70" y="440" font-size="26" fill="#b9bec8">확정 사실과 분석을 분리하고, 미확정은 표시합니다.</text>${sources.map((s,i)=>`<text x="70" y="${570+i*52}" font-size="23" fill="#d9dce3">${String(i+1).padStart(2,'0')}  ${esc(s.name)}  ·  ${esc(new URL(s.url).hostname.replace(/^www\./,''))}</text>`).join('')}<text x="70" y="1280" font-size="22" fill="#a8adb8">DAILY TECH · ${issue.stories.length} stories</text>`));

const caption=[`[${issue.date}] ${issue.deckTitle}`,'',...topStories.map((s,i)=>`${i+1}. ${s.headline}`),'',issue.dailyAnalysis,'',`출처: ${[...new Set(issue.stories.flatMap(s=>s.sources.map(x=>x.name)))].join(', ')}`].join('\n');
await fs.writeFile(path.join(outDir,'caption.txt'),caption+'\n','utf8');
