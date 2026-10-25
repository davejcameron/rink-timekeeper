/* Evidence-backed arena lookup and a human-guided photo comparison. No uploads. */
const finderRegions=['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories','Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon'];
const featureGroups=[{id:'telephone',name:'Telephone keypad · A/B/C/D keys',ids:['vision']},{id:'calculator',name:'Calculator keypad · Hamilton label',ids:['2000']},{id:'metal',name:'Metal panel · round black buttons / levers',ids:['rotomatic']},{id:'blue',name:'Blue panel · HP / VP / # keys',ids:['harris']},{id:'oes',name:'OES label · coloured hockey keys',ids:['isc9000','isc85x']},{id:'nevco',name:'Nevco label · SET / YES / NO',ids:['nevco','nevco4','nevco7']},{id:'dak',name:'Daktronics · wide All Sport console',ids:['dak']},{id:'fair',name:'Fair-Play · TIME IN rocker',ids:['fairplay']},{id:'scoretec',name:'Scoretec · colon / slash keys',ids:['scoretec']},{id:'all',name:'Not sure · show all reference panels',ids:rinkControllers.map(c=>c.id)}];
function finderCard(controller){const a=document.createElement('a');a.className='controller-card';a.href=controller.url;const visual=document.createElement('div');visual.className='controller-card-visual';const img=document.createElement('img');img.src=controller.photo;img.alt=controller.name+' · '+(controller.kind||'reference photograph');img.loading='lazy';visual.append(img);const copy=document.createElement('div');copy.className='controller-card-copy';const title=document.createElement('h3');title.textContent=controller.name;const note=document.createElement('p');note.textContent=controller.note;const kind=document.createElement('small');kind.className='reference-kind';kind.textContent=controller.kind||'Reference photograph';const link=document.createElement('span');link.textContent='Compare & practise →';copy.append(title,note,kind,link);a.append(visual,copy);return a;}
function setFinderMode(mode){for(const value of ['arena','visual','model'])document.getElementById('finder-'+value).hidden=value!==mode;for(const b of document.querySelectorAll('[data-finder]'))b.setAttribute('aria-pressed',String(b.dataset.finder===mode));}
for(const button of document.querySelectorAll('[data-finder]'))button.addEventListener('click',()=>setFinderMode(button.dataset.finder));
const choices=document.getElementById('visual-choices');for(const group of featureGroups){const b=document.createElement('button');b.textContent=group.name;b.setAttribute('aria-pressed','false');b.onclick=()=>{for(const button of choices.children)button.setAttribute('aria-pressed',String(button===b));const matches=rinkControllers.filter(c=>group.ids.includes(c.id));document.getElementById('visual-results').replaceChildren(...matches.map(finderCard));document.getElementById('visual-status').textContent=matches.length+' reference '+(matches.length===1?'profile':'profiles')+' to compare · This identifies a panel family, not an exact model. Check the model label and hockey insert.';};choices.append(b);}
const modelInput=document.getElementById('model-search');function filterModels(){const term=modelInput.value.trim().toLocaleLowerCase();const matches=rinkControllers.filter(c=>[c.name,c.short,c.note,c.family,c.id==='vision'?'PR04200 PR04203':c.id==='2000'?'PR95019 PR95022':''].join(' ').toLocaleLowerCase().includes(term));document.getElementById('model-results').replaceChildren(...matches.map(finderCard));document.getElementById('model-count').textContent=matches.length+' playable profiles'+(matches.length?'':' · No verified simulator match. Use Contact to suggest this model.');}modelInput.oninput=filterModels;filterModels();
const regionSelect=document.getElementById('arena-region');for(const region of finderRegions){const option=document.createElement('option');option.value=region;option.textContent=region;regionSelect.append(option);}
function arenaMatches(arena,query,region,grade){return (!region||arena.region===region)&&(!grade||arena.grade===grade)&&[arena.arena,arena.city,arena.region,arena.controller,arena.scoreboard,arena.notes,arena.grade,arena.sport].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());}
function initializeArenaFinder(data){
 const input=document.getElementById('arena-search'),results=document.getElementById('arena-results'),grade=document.getElementById('arena-grade');
 function filter(){
  const matches=data.arenas.filter(a=>arenaMatches(a,input.value,regionSelect.value,grade.value));results.replaceChildren();
  for(const arena of matches){
   const card=document.createElement('article');card.className='arena-card';
   const location=document.createElement('small');location.textContent=arena.city+', '+arena.region;
   const name=document.createElement('h3');name.textContent=arena.arena;
   const badge=document.createElement('span');badge.className='evidence-grade';badge.textContent=arena.grade;
   const match=document.createElement('p');match.className='match';match.textContent=arena.controller;
   const date=document.createElement('small');date.textContent='Source date: '+arena.date;
   const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Evidence, equipment & limits';
   const board=document.createElement('p');board.textContent='Board / video system: '+arena.scoreboard;
   const notes=document.createElement('p');notes.textContent=arena.notes;
   const review=document.createElement('p');review.className='source-note';review.textContent=arena.source_review+' · '+(arena.sport||'Hockey');
   const sources=document.createElement('p');
   if(!arena.sources.length)sources.textContent='No source URL supplied';
   arena.sources.forEach((url,index)=>{if(index)sources.append(document.createTextNode(' · '));const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noreferrer';link.textContent='Source '+(index+1)+' ↗';sources.append(link);});
   details.append(summary,board,notes,review,sources);
   const links=document.createElement('p'),c=arena.grade==='Controller confirmed'&&rinkControllers.find(c=>c.id===arena.profile),link=document.createElement('a');
   link.href=c?c.url:'contact.html';link.textContent=c?'Compare '+c.short+' family →':'Help identify this controller';links.append(link);
   card.append(location,name,badge,match,date,details,links);results.append(card);
  }
  document.getElementById('arena-count').textContent=matches.length+' arena reports'+(matches.length?' · Verify current equipment and review status.':' · No report in this selection. This does not mean these controllers are absent from the region.');
 }
 input.oninput=filter;regionSelect.onchange=filter;grade.onchange=filter;filter();
}

try{initializeArenaFinder(JSON.parse(document.getElementById('arena-data').textContent));}catch{document.getElementById('arena-count').textContent='Showing the built-in arena reports. Interactive filtering is unavailable; use the appearance or model finder.';}

