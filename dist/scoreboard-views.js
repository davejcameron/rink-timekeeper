/* Keep live simulator state in the original nodes; only their visual presentation changes. */
(function(){
 const board=document.querySelector('.scoreboard'),stage=document.querySelector('.arena-stage');if(!board||!stage)return;
 const path=location.pathname.split('/').pop().replace(/\.html$/,''),profile=({'daktronics':'dak','hamilton':'vision','hamilton2000':'2000'})[path]||document.body.dataset.profile||path;
 const family=({dak:'dak',isc9000:'oes',isc85x:'oes',nevco:'nevco',nevco4:'nevco',nevco7:'nevco',fairplay:'fairplay',scoretec:'scoretec',vision:'hamilton','2000':'hamilton',harris:'harris',rotomatic:'rotomatic'})[profile]||'generic';
 const familyName=({dak:'Daktronics',oes:'OES',nevco:'Nevco',fairplay:'Fair-Play',scoretec:'Scoretec',hamilton:'Hamilton',harris:'Harris Time',rotomatic:'Rotomatic'})[family]||'Hockey';
 const generic={id:'representative',name:familyName+' hockey · representative',profiles:[profile],family,layout:'standard',penalties:true,shots:true,exactLayout:false,basis:'Representative training layout; no exact installed board or pairing is claimed.',grade:'Representative'};
 const choices=[generic,...rinkBoardViews.filter(v=>v.profiles.includes(profile))],params=new URLSearchParams(location.search),requested=params.get('board');
 const defaultId=profile==='dak'?'daktronics-h-2107':'representative';let current=choices.find(v=>v.id===(requested||defaultId))||generic;
 const tools=document.createElement('div');tools.className='board-view-tools';
 const label=document.createElement('label');label.textContent='Scoreboard view';const select=document.createElement('select');select.id='board-view';for(const v of choices){const option=document.createElement('option');option.value=v.id;option.textContent=v.name;select.append(option);}label.append(select);
 const reference=document.createElement('a');reference.href='scoreboards.html';reference.textContent='Identify my scoreboard ↗';tools.append(label,reference);board.before(tools);
 const note=document.createElement('p');note.className='board-view-note';note.id='board-view-note';note.setAttribute('role','status');tools.after(note);
 const extra=document.createElement('details');extra.className='board-extra-readouts';const extraTitle=document.createElement('summary');extraTitle.textContent='Extra training readouts · not on this board';const extraContent=document.createElement('div');extraContent.className='board-extra-content';extra.append(extraTitle,extraContent);board.after(extra);
 const photoDetails=document.createElement('details');photoDetails.className='board-view-reference';const photoSummary=document.createElement('summary');photoSummary.textContent='Compare scoreboard reference';const photo=document.createElement('img');photo.loading='lazy';const photoCaption=document.createElement('p');const source=document.createElement('a');source.target='_blank';source.rel='noreferrer';source.textContent='Original manufacturer image ↗';photoDetails.append(photoSummary,photo,photoCaption,source);extra.after(photoDetails);
 const periodField=board.querySelector('#period')?.parentElement;if(periodField){periodField.classList.add('board-period');for(const node of [...periodField.childNodes])if(node.nodeType===3&&node.textContent.trim()){const caption=document.createElement('span');caption.className='board-period-label';caption.textContent=node.textContent.trim();node.replaceWith(caption);}}
 const shots=board.querySelector('.shots-display'),penalties=board.querySelector('.penalty-board'),scores=board.querySelector('.scores'),top=board.querySelector('.board-top');
 function apply(view){
  current=view;select.value=view.id;board.dataset.boardFamily=view.family;board.dataset.boardLayout=view.layout;
  board.setAttribute('role','group');board.setAttribute('aria-label',view.name+' · live practice scoreboard');
  // Restore the same nodes before moving optional readouts out of basic physical boards.
  if(shots)board.insertBefore(shots,scores);if(penalties)board.append(penalties);
  if(shots&&!view.shots)extraContent.append(shots);if(penalties&&!view.penalties)extraContent.append(penalties);extra.hidden=!extraContent.children.length;
  top.textContent=view.exactLayout?'DAKTRONICS · '+view.name.replace('Daktronics ',''):familyName.toUpperCase()+' · HOCKEY PRACTICE';
  note.textContent=view.name+' · '+(view.exactLayout?'Layout based on the model rendering. Cabinet colour is an example; installations vary.':view.basis+' Display arrangement is representative.');
  if(requested&&!choices.some(v=>v.id===requested)&&view.id==='representative')note.textContent+=' The requested board pairing is not documented for this controller.';
  photoDetails.hidden=!view.image;if(view.image){photo.src=view.image;photo.alt=view.name+' manufacturer model rendering';photoCaption.textContent='Model rendering used as the visual reference. This is not a photograph of your rink.';source.href=view.imageSource||view.image;}
 }
 select.addEventListener('change',()=>{const view=choices.find(v=>v.id===select.value);apply(view);const url=new URL(location.href);if(view.id==='representative')url.searchParams.delete('board');else url.searchParams.set('board',view.id);history.replaceState(null,'',url);});apply(current);
})();
