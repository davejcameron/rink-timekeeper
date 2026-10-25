/* Names describe the team/timer, not just the repeated physical legend. */
function rinkControlLabel(key,legend,profile=typeof document==='undefined'?'':document.body.dataset.profile){
 const text=legend.replace(/ \(unavailable in this training profile\)$/,'').replace(/\s+/g,' ').trim().replace(/←/g,'left').replace(/→/g,'right').replace(/◀/g,'left').replace(/▶/g,'right');
 if(/^pen:(home|guest):[01]:/.test(key||'')&&!/penalty timer [12]/i.test(text)){const [,side,slot]=key.split(':');return (side==='home'?'Home':'Guest')+' penalty timer '+(+slot+1)+' '+text;}
 if(['start','minute','timeReset'].includes(key)&&profile==='rotomatic'&&!text.startsWith('Main timer '))return 'Main timer '+text;
 const side=key?.split(':').find(part=>part==='home'||part==='guest');return side&&!/\b(home|guest|visitor)\b/i.test(text)?(side==='home'?'Home':'Guest')+' '+text:text;
}
function rinkScopeText(count){return count?'Training configuration · '+count+' hardware '+(count===1?'control is':'controls are')+' unavailable in this profile.':'Training configuration · hardware setup and installation options differ by rink.';}
if(typeof document!=='undefined'){
 const consolePanel=document.querySelector('.console');
 if(consolePanel){
  for(const button of consolePanel.querySelectorAll('button')){
   const text=button.getAttribute('aria-label')||button.textContent;
   if(!text.trim()||button.classList.contains('unused')){button.setAttribute('aria-hidden','true');button.setAttribute('tabindex','-1');continue;}
   const label=rinkControlLabel(button.dataset.key||button.dataset.act,text);button.dataset.controlLabel=label;
   button.setAttribute('aria-label',label+(button.disabled?' (unavailable in this training profile)':''));
   if(button.disabled)button.title=label+' — unavailable in this training profile. See Supported functions & limits.';
  }
  const unavailable=[...consolePanel.querySelectorAll('button:disabled')].filter(b=>b.textContent.trim());const p=document.createElement('p');p.className='profile-scope';p.id='profile-scope';p.textContent=rinkScopeText(unavailable.length);
  const link=document.createElement('a');link.href='#controller-reference';link.textContent='Supported functions & limits ↓';link.onclick=()=>{document.getElementById('controller-reference').open=true;};p.append(link);document.querySelector('.console-viewport').before(p);
 }
}
if(typeof module!=='undefined')module.exports={rinkControlLabel,rinkScopeText};
