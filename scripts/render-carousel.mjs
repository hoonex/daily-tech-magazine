import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const input=process.argv[2]||'content/latest.json';
const issue=JSON.parse(await fs.readFile(input,'utf8'));
const W=1080,H=1350;
const outDir=path.join('public','output',issue.date);
await fs.mkdir(outDir,{recursive:true});

const COLORS={AI:'#7d5cff','AI AGENT':'#7d5cff','DEV TOOLS':'#7d5cff','CODING':'#7d5cff','HARDWARE':'#2f79ff','ROBOTICS':'#ff784b','GAME':'#ff4d5f','GAME AI':'#ff4d5f','VALORANT':'#ff4d5f','SCIENCE':'#2fc98f','CLOUD':'#39a6ff','AI SEARCH':'#8a67ff'};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const clip=(s,n)=>[...String(s??'')].slice(0,n).join('');
const split=(text,max)=>{const chars=[...String(text??'')],lines=[];let line='';for(const ch of chars){if(ch==='\n'||[...line].length>=max){if(line.trim())lines.push(line.trim());line=ch==='\n'?'':ch}else line+=ch}if(line.trim())lines.push(line.trim());return lines};
const tspans=(text,x,y,max,size,lh,weight=700)=>split(text,max).map((l,i)=>`<tspan x="${x}" y="${y+i*lh}" font-size="${size}" font-weight="${weight}">${esc(l)}</tspan>`).join('');
const sent=(text,n=130)=>{const s=String(text??'').replace(/\s+/g,' ').trim();return clip(s,n)+(s.length>n?'…':'')};
const accent=s=>COLORS[s?.category]||'#7d5cff';
const handle=issue.handle||'@daily_tech_magazine';

const card=s=>({
  stat:s.card?.stat||s.card?.keyword||s.category,
  headline:s.card?.headline||s.headline,
  what:s.card?.what||sent(s.facts,145),
  why:s.card?.why||sent(s.whyItMatters,105),
  next:s.card?.next||sent(s.outlook,110),
  hook:s.card?.hook||s.card?.headline||s.headline
});

const defs=`<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a" stop-opacity=".08"/><stop offset=".42" stop-color="#05060a" stop-opacity=".18"/><stop offset=".63" stop-color="#05060a" stop-opacity=".78"/><stop offset="1" stop-color="#05060a" stop-opacity=".985"/></linearGradient><linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080a10" stop-opacity=".22"/><stop offset=".5" stop-color="#080a10" stop-opacity=".68"/><stop offset="1" stop-color="#080a10" stop-opacity=".99"/></linearGradient></defs>`;
const wm=()=>`<text x="1010" y="88" text-anchor="end" font-size="17" font-weight="700" fill="#fff" fill-opacity=".76">${esc(handle)}</text><g transform="translate(1055 820) rotate(90)" opacity=".13"><text font-size="21" font-weight="800" letter-spacing="5" fill="#fff">DAILY TECH · ${esc(handle)}</text></g>`;
const photoCredit=v=>v?.reuseAllowed?`<text x="1010" y="1322" text-anchor="end" font-size="10" fill="#fff" fill-opacity=".44">Photo: ${esc(v.credit)} · ${esc(v.license)}</text>`:'';
const frame=body=>`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}<g font-family="Noto Sans CJK KR, Noto Sans KR, sans-serif" fill="#f7f7fb">${body}</g></svg>`;

async function loadVisual(v,width=W,height=H){
  if(!v?.reuseAllowed||!/^https:\/\//.test(v.url||'')) return null;
  try{
    const res=await fetch(v.url,{redirect:'follow',headers:{'user-agent':'DailyTechMagazine/2.0 (+https://github.com/hoonex/daily-tech-magazine)'}});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const type=res.headers.get('content-type')||'';
    if(!type.startsWith('image/')) throw new Error(`not image: ${type}`);
    return await sharp(Buffer.from(await res.arrayBuffer())).resize(width,height,{fit:'cover',position:'attention'}).modulate({brightness:.9,saturation:.9}).toBuffer();
  }catch(err){console.warn(`visual fallback: ${v.url}: ${err.message}`);return null}
}

async function save(i,svg,visual=null){
  const file=path.join(outDir,`slide-${String(i).padStart(2,'0')}.jpg`);
  const bg=await loadVisual(visual);
  if(bg) await sharp(bg).composite([{input:Buffer.from(svg)}]).jpeg({quality:93,mozjpeg:true}).toFile(file);
  else {
    const fallback=await sharp({create:{width:W,height:H,channels:3,background:'#090b12'}}).png().toBuffer();
    await sharp(fallback).composite([{input:Buffer.from(svg)}]).jpeg({quality:93,mozjpeg:true}).toFile(file);
  }
  console.log(file);
}

const topStories=issue.top3.map(id=>issue.stories.find(s=>s.id===id)).filter(Boolean);
if(topStories.length!==3) throw new Error('top3 must resolve to exactly 3 stories');

// 1 — hook-first cover
{
  const s=topStories[0], c=card(s), a=accent(s), cover=issue.cover||{};
  const title=cover.title||c.hook;
  const stat=cover.stat||c.stat;
  const subtitle=cover.subtitle||'오늘 가장 볼 만한 AI · 게임 · 하드웨어 뉴스 TOP 3';
  const body=`<rect width="1080" height="1350" fill="url(#shade)"/><rect x="52" y="62" width="164" height="42" rx="21" fill="${a}"/><text x="134" y="90" text-anchor="middle" font-size="17" font-weight="800" letter-spacing="2">DAILY TECH</text>${wm()}<text x="70" y="730" font-size="21" font-weight="700" fill="#fff" fill-opacity=".78" letter-spacing="2">TODAY · TOP 3</text><text x="70" y="850" font-size="${[...String(stat)].length>11?76:106}" font-weight="900" fill="${a}">${esc(stat)}</text><text>${tspans(title,70,965,13,72,82,900)}</text><text x="70" y="1195" font-size="24" font-weight="600" fill="#fff" fill-opacity=".82">${esc(subtitle)}</text><text x="70" y="1270" font-size="17" font-weight="800" fill="#fff" fill-opacity=".7" letter-spacing="2">SWIPE →</text>${photoCredit(s.visual)}`;
  await save(1,frame(body),s.visual);
}

// 2–4 — visual story cards with three short blocks
for(let i=0;i<3;i++){
  const s=topStories[i],c=card(s),a=accent(s),v=s.visual;
  const status=s.status==='unconfirmed'?'미확정':'확정';
  const body=`<rect width="1080" height="1350" fill="url(#shade)"/><rect x="0" y="590" width="1080" height="760" fill="#07080d" fill-opacity=".84"/><rect x="70" y="74" width="8" height="46" rx="4" fill="${a}"/><text x="98" y="105" font-size="18" font-weight="800" letter-spacing="2">TOP 0${i+1} · ${esc(s.category)}</text>${wm()}<text x="70" y="660" font-size="${[...String(c.stat)].length>11?62:90}" font-weight="900" fill="${a}">${esc(c.stat)}</text><text>${tspans(c.headline,70,755,17,48,58,900)}</text><text x="70" y="895" font-size="15" font-weight="900" letter-spacing="2" fill="${a}">무슨 일?</text><text>${tspans(c.what,70,938,39,25,36,600)}</text><text x="70" y="1048" font-size="15" font-weight="900" letter-spacing="2" fill="${a}">왜 중요?</text><text>${tspans(c.why,70,1091,39,25,36,700)}</text><text x="70" y="1198" font-size="15" font-weight="900" letter-spacing="2" fill="${a}">다음엔?</text><text>${tspans(c.next,70,1241,39,23,33,600)}</text><rect x="70" y="1292" width="68" height="27" rx="13.5" fill="#fff" fill-opacity=".1"/><text x="104" y="1311" text-anchor="middle" font-size="12" fill="#fff" fill-opacity=".74">${status}</text>${photoCredit(v)}`;
  await save(i+2,frame(body),v);
}

// 5 — visual recap, no source wall
{
  const thumbW=360,thumbH=540;
  const base=sharp({create:{width:W,height:H,channels:3,background:'#080a10'}});
  const comps=[];
  for(let i=0;i<3;i++){
    const img=await loadVisual(topStories[i].visual,thumbW,thumbH);
    if(img) comps.push({input:img,left:i*thumbW,top:0});
  }
  const montage=await base.composite(comps).png().toBuffer();
  const body=frame(`<rect width="1080" height="1350" fill="url(#deep)"/><rect x="0" y="500" width="1080" height="850" fill="#07080d" fill-opacity=".88"/><text x="70" y="640" font-size="18" font-weight="800" fill="#fff" fill-opacity=".66" letter-spacing="3">TODAY IN ONE LINE</text><text>${tspans(issue.dailyAnalysis,70,760,18,55,68,900)}</text><line x1="70" y1="1115" x2="1010" y2="1115" stroke="#fff" stroke-opacity=".14"/><text x="70" y="1190" font-size="21" font-weight="700" fill="#fff" fill-opacity=".72">저장해두고 내일도 보기</text><text x="70" y="1262" font-size="38" font-weight="900">${esc(handle)}</text><text x="1010" y="1262" text-anchor="end" font-size="15" fill="#fff" fill-opacity=".45">상세 출처 · 이미지 라이선스는 캡션</text>${wm()}`);
  const file=path.join(outDir,'slide-05.jpg');
  await sharp(montage).composite([{input:Buffer.from(body)}]).jpeg({quality:93,mozjpeg:true}).toFile(file);
  console.log(file);
}

const sourceLines=issue.stories.flatMap(s=>s.sources.map(src=>`- ${src.name}: ${src.url}`));
const visualLines=topStories.filter(s=>s.visual?.reuseAllowed).map((s,i)=>`- Slide ${i+1}/${i+2}: ${s.visual.credit} · ${s.visual.license} · ${s.visual.sourceUrl}${s.visual.modified?` · ${s.visual.modified}`:''}`);
const caption=[
  `[${issue.date}] 오늘 볼 만한 AI·테크 뉴스 TOP 3`,
  '',
  ...topStories.flatMap((s,i)=>{const c=card(s);return [`${i+1}. ${c.headline}`,`무슨 일? ${c.what}`,`왜 중요? ${c.why}`,`다음엔? ${c.next}`,''];}),
  `오늘 한 줄: ${issue.dailyAnalysis}`,
  '',
  '출처',...sourceLines,
  ...(visualLines.length?['','이미지 출처',...visualLines]:[]),
  '',
  `${handle} · 무단 재업로드/재배포 금지`
].join('\n');
await fs.writeFile(path.join(outDir,'caption.txt'),caption+'\n','utf8');
