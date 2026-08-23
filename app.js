const palettes=[['#5d3eff','#071024'],['#ff6534','#361108'],['#06a887','#071c18'],['#d79b22','#2a1b05'],['#356bff','#061633'],['#b748ff','#23082f']];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
async function boot(){
  const res=await fetch('./content/latest.json',{cache:'no-store'});
  if(!res.ok) throw new Error(`content load failed: ${res.status}`);
  const issue=await res.json();
  $('#issueMeta').innerHTML=`<span>${esc(issue.date)} · ISSUE ${String(issue.edition??1).padStart(3,'0')}</span><span>${issue.stories.length} STORIES</span>`;
  const top=new Set(issue.top3);
  $('#cards').innerHTML=issue.stories.map((story,i)=>{
    const [a,b]=palettes[i%palettes.length];
    return `<article class="card" style="--a:${a};--b:${b}"><div class="card-inner"><div class="rank">${top.has(story.id)?`TOP ${issue.top3.indexOf(story.id)+1}`:'BRIEF'} / ${esc(story.category)}</div><h2>${esc(story.headline)}</h2><p>${esc(story.whyItMatters)}</p><span class="status">${story.status==='unconfirmed'?'미확정':'확정'}</span><small>${esc(story.sources?.[0]?.name??'Source')}</small></div></article>`;
  }).join('');
}
boot().catch(err=>{$('#cards').innerHTML=`<p>Issue를 불러오지 못했습니다. ${esc(err.message)}</p>`;console.error(err)});
