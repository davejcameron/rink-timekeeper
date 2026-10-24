/* Shared tutorial navigation. Every lesson loads an independent practice game. */
class RinkTutorials {
 constructor(options){
  Object.assign(this,options);this.lessons=buildCurriculum(this.profile);this.index=-1;this.completed=new Set();this.history=[];this.passed=false;
  const coach=document.querySelector('.coach'),label=document.createElement('label');label.className='lesson-picker';label.textContent='Choose a tutorial';
  this.topic=document.createElement('select');this.topic.className='lesson-topic';this.topic.setAttribute('aria-label','Tutorial topic');
  for(const topic of ['All topics',...new Set(this.lessons.map(l=>l.group))]){const option=document.createElement('option');option.value=topic;option.textContent=topic;this.topic.append(option);}
  this.select=document.createElement('select');this.select.setAttribute('aria-label','Choose a tutorial');label.append(this.topic,this.select);coach.prepend(label);
  this.topic.onchange=()=>this.fillLessons(this.topic.value);
  this.select.onchange=()=>{if(this.select.value!=='')this.start(Number(this.select.value));};
  this.progress=document.createElement('small');this.progress.className='lesson-progress';coach.append(this.progress);
  this.restart=document.createElement('button');this.restart.className='lesson-restart';this.restart.textContent='↻ Restart lesson';this.restart.onclick=()=>this.start(this.index);coach.append(this.restart);
  this.el('next').onclick=()=>this.next();this.el('guided').onclick=()=>{if(this.index<0)this.start(0);};this.el('free').onclick=()=>this.free();
  for(const details of document.querySelectorAll('details'))details.addEventListener('toggle',()=>{if(details.open)this.observe(details.querySelector('#log')?'ui:log':details.querySelector('.reference')?'ui:reference':'ui:drawer');});
  this.el('task').setAttribute('aria-live','polite');this.free();
 }
 el(id){return document.getElementById(id);}
 fillLessons(topic){
  this.select.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=topic==='All topics'?`Explore ${this.lessons.length} lessons`:'Choose a lesson';this.select.append(placeholder);
  const groups=new Map();for(const [i,lesson]of this.lessons.entries()){if(topic!=='All topics'&&lesson.group!==topic)continue;let group=groups.get(lesson.group);if(!group){group=document.createElement('optgroup');group.label=lesson.group;groups.set(lesson.group,group);this.select.append(group);}const option=document.createElement('option');option.value=String(i);option.textContent=lesson.title;group.append(option);}
 }
 free(){this.index=-1;this.topic.value='All topics';this.fillLessons('All topics');this.el('free').classList.add('selected');this.el('guided').classList.remove('selected');this.el('tag').textContent='FREE PRACTICE';this.el('drilltitle').textContent='Find your rhythm.';this.el('drilltext').textContent='Explore the console, or choose a topic above. Each lesson loads a prepared practice game.';this.el('task').textContent='Tutorials cover every enabled control in this profile.';this.el('next').disabled=false;this.el('next').textContent='Start guided tutorials ↗';this.restart.hidden=true;this.updateProgress();}
 updateProgress(){this.progress.textContent=`${this.completed.size} / ${this.lessons.length} completed · this session`;}
 start(index){this.index=-1;this.resetScenario();const lesson=this.lessons[index];lesson.setup(this.getState());this.index=index;this.history=[];this.passed=false;this.topic.value=lesson.group;this.fillLessons(lesson.group);this.select.value=String(index);this.el('free').classList.remove('selected');this.el('guided').classList.add('selected');this.el('tag').textContent=`LESSON ${index+1} / ${this.lessons.length} · ${lesson.group.toUpperCase()}`;this.el('drilltitle').textContent=lesson.title;this.el('drilltext').textContent=lesson.text;this.el('task').textContent=lesson.task;this.el('next').disabled=true;this.el('next').textContent='Complete the task to continue';this.restart.hidden=false;this.log('Tutorial: '+lesson.title);this.onRender();this.updateProgress();}
 next(){this.start(this.index<0?0:(this.index+1)%this.lessons.length);}
 observe(event){if(this.index<0||this.passed)return;this.history.push(event);const lesson=this.lessons[this.index];if(lesson.check(this.getState(),event,this.history)){this.passed=true;this.completed.add(lesson.id);this.el('task').textContent='✓ Complete. '+lesson.task;this.el('next').disabled=false;this.el('next').textContent=this.index===this.lessons.length-1?'Start again ↻':'Next lesson →';this.log('Tutorial complete: '+lesson.title);this.updateProgress();}}
}
