/* Test prompts describe outcomes only; tutorial copy remains hidden until help. */
function buildTestChallenges(profile,lessons,random=Math.random){
 const prompts={
 'run-hold':'Puck drop: start the game clock. After at least one second, a whistle sounds. Stop the clock.',
 'run-stop':'Start play, let at least one second elapse, then stop the game clock on the whistle.',
 'set-clock':'Prepare a stopped game clock at 15:00.',
 'start-stop':'Start the game clock, let at least one second elapse, then stop it on the whistle.',
 'clock-correction':'Correct the stopped game clock to 14:30.',
 'correct-time':'The referee corrects the game clock to 14:30. Leave it stopped.',
 'set-time':'Prepare a stopped game clock at 15:00 in period 1.',
 'time':profile==='rotomatic'?'Prepare a stopped game clock at 3:00.':'Prepare a stopped game clock at 15:00 in period 1.',
 'period':'Set the displayed period to 2.',
 'next-period':'Prepare period 2 with 15:00. Preserve the home score of 2 and the existing penalty.',
 'fraction':'Set the stopped game clock to 00:45.3.',
 'hundredths':'Set the stopped game clock to 00:45.25.',
 'freeze':'Let game time run for at least one second while the prepared penalty stays at 2:00.',
 'pen-home-0':'Prepare home penalty timer 1 for two minutes and arm it.',
 'pen-guest-0':'Prepare visitors penalty timer 1 for two minutes and arm it.',
 'clear-home-0':'Clear only home penalty timer 1.',
 'clear-guest-0':'Clear only visitors penalty timer 1.'
 };
 for(const side of ['home','guest']){
  prompts['goal-'+side]='Record one goal for '+side+'.';
  prompts['score-correction-'+side]='Correct the '+side+' score from 3 to 2.';
  prompts['correct-'+side]='Correct the '+side+' score from 3 to 2.';
  prompts['score-'+side]='Set the '+side+' score to 2.';
  prompts['shot-'+side]='Record one '+side+' shot without changing the score.';
  prompts['shots-'+side]='Record one '+side+' shot without changing the score.';
  prompts['minor-'+side]=profile==='harris'?'Enter a two-minute '+side+' penalty in slot 1.':'Enter a two-minute '+side+' minor for player 12.';
  prompts['penalty-'+side]='Enter a normal two-minute '+side+' penalty for player 12.';
  for(const id of ['release-','remove-','clear-'])prompts[id+side]='Remove the prepared '+side+' penalty.';
 }
 if(profile==='rotomatic')prompts['run-stop']='Load 1:00, start the game clock, let at least one second elapse, then stop it.';
 if(profile==='dak')prompts['next-period']='Advance the displayed period to 2. Keep 15:00 on the clock.';
 if(['isc9000','isc85x'].includes(profile))prompts['next-period']='The period has ended. Prepare period 2 with 15:00.';
 for(const side of ['home','guest']){prompts['score-correct-'+side]='Correct the '+side+' score from 3 to 2.';prompts['delete-'+side]='Remove the prepared '+side+' penalty.';}
 // Mix clock, score and penalty work before selecting eight independent scenarios.
 const order=['set-clock','start-stop','clock-correction','correct-time','set-time','time','run-hold','run-stop','goal-home','score-home','correct-home','score-correction-home','score-correct-home','penalty-home','minor-home','pen-home-0','release-home','delete-home','remove-home','clear-home','clear-home-0','next-period','period','goal-guest','score-guest','minor-guest','pen-guest-0','shot-home','shots-home','fraction','hundredths','freeze'];
 const pool=order.map(id=>{const lesson=lessons.find(l=>l.id===id);return lesson&&{lesson,prompt:prompts[id]};}).filter(Boolean);
 const integer=(min,max)=>min+Math.floor(random()*(max-min+1));
 for(let i=pool.length-1;i>0;i--){const j=integer(0,i);[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,8).map(challenge=>{
  const original=challenge.lesson,id=original.id,side=id.endsWith('guest')?'guest':'home';let prompt=challenge.prompt,lesson=original;
  if(['time','set-time','set-clock'].includes(id)){
   const minutes=profile==='rotomatic'?integer(1,9):integer(11,20);
   prompt=`Prepare a stopped game clock at ${minutes}:00`+(profile==='rotomatic'?'.':' in period 1.');
   let task=profile==='rotomatic'?`Press main MINUTE ADVANCE ${minutes} times`:original.task.replace(/15000/g,String(minutes).padStart(2,'0')+'000').replace(/1500/g,String(minutes)+'00').replace(/15:00/g,minutes+':00').replace(/\b15\b/g,String(minutes));
   lesson={...original,task,check:(s,e)=>e.startsWith('key:')&&s.model.time===minutes*60&&!s.model.running&&!s.model.edit&&!s.edit&&s.model.period===1};
  }else if(/^(score-|correct-|score-correction-|score-correct-|goal-)/.test(id)){
   const target=integer(2,8),goal=id.startsWith('goal-'),initial=goal?target-1:(profile==='rotomatic'?0:target+1);
   prompt=goal?`A goal is awarded to ${side}. Update their score from ${initial} to ${target}.`:`The ${side} score should be ${target}. Correct the prepared total of ${initial}.`;
   let task=original.task;
   if(!goal){if(profile==='rotomatic')task=side.toUpperCase()+' UNITS '+target+' times';else if(profile!=='dak')task=task.replace(/\b2\b/g,String(target));}
   lesson={...original,task,setup:s=>{original.setup(s);s.model[side]=initial;},check:(s,e)=>e.startsWith('key:')&&s.model[side]===target&&!s.model.edit&&!s.edit};
  }else if(/^(minor-|penalty-)/.test(id)&&profile!=='harris'){
   const player=integer(4,98);
   prompt=prompt.replace('player 12','player '+player);
   lesson={...original,task:original.task.replace(/\b12\b/g,String(player)),check:(s,e)=>e.startsWith('key:')&&!s.model.edit&&!s.edit&&s.model.pen[side].some(p=>p&&p.player===player&&p.remaining===120)};
  }
  return{lesson,prompt};
 });
}
/* Shared tutorial navigation. Every lesson loads an independent practice game. */
class RinkTutorials {
 constructor(options){
  Object.assign(this,options);this.lessons=buildCurriculum(this.profile);this.index=-1;this.completed=new Set();this.history=[];this.passed=false;this.testing=false;this.exam=null;
  const coach=document.querySelector('.coach'),label=document.createElement('label');label.className='lesson-picker';label.textContent='Choose a tutorial';
  this.topic=document.createElement('select');this.topic.className='lesson-topic';this.topic.setAttribute('aria-label','Tutorial topic');
  for(const topic of ['All topics',...new Set(this.lessons.map(l=>l.group))]){const option=document.createElement('option');option.value=topic;option.textContent=topic;this.topic.append(option);}
  this.select=document.createElement('select');this.select.setAttribute('aria-label','Choose a tutorial');label.append(this.topic,this.select);coach.prepend(label);
  this.topic.onchange=()=>this.fillLessons(this.topic.value);
  this.select.onchange=()=>{if(this.select.value!=='')this.start(Number(this.select.value));};
  this.progress=document.createElement('small');this.progress.className='lesson-progress';coach.append(this.progress);
  this.restart=document.createElement('button');this.restart.className='lesson-restart';this.restart.textContent='↻ Restart lesson';this.restart.onclick=()=>this.testing?this.retryTest():this.start(this.index);coach.append(this.restart);
  this.el('next').onclick=()=>this.next();this.el('guided').onclick=()=>{if(this.testing){this.leaveTest();this.index=-1;}if(this.index<0)this.start(0);};this.el('free').onclick=()=>this.free();
  for(const details of document.querySelectorAll('details'))details.addEventListener('toggle',()=>{if(details.open)this.observe(details.querySelector('#log')?'ui:log':details.querySelector('.reference')?'ui:reference':'ui:drawer');});
  this.testButton=document.createElement('button');this.testButton.id='test-mode';this.testButton.textContent='Test yourself';this.testButton.onclick=()=>this.beginTest();document.querySelector('.mode').append(this.testButton);
  this.testActions=document.createElement('div');this.testActions.className='test-actions';this.helpButton=document.createElement('button');this.helpButton.textContent='Reveal solution';this.helpButton.onclick=()=>this.revealTest();this.skipButton=document.createElement('button');this.skipButton.textContent='Skip task';this.skipButton.onclick=()=>this.finishTestTask('skipped');this.testActions.append(this.helpButton,this.skipButton);coach.append(this.testActions);
  this.scenario=document.createElement('section');this.scenario.className='test-scenario';this.scenario.hidden=true;this.scenario.setAttribute('aria-label','Current test scenario');this.scenarioLabel=document.createElement('small');this.scenarioPrompt=document.createElement('p');this.scenarioPrompt.setAttribute('aria-live','polite');this.scenarioCheck=document.createElement('button');this.scenarioCheck.textContent='Check answer';this.scenarioCheck.onclick=()=>this.checkTest();this.scenarioFeedback=document.createElement('small');this.scenarioFeedback.setAttribute('aria-live','polite');this.scenario.append(this.scenarioLabel,this.scenarioPrompt,this.scenarioCheck,this.scenarioFeedback);document.querySelector('.arena-stage').before(this.scenario);
  this.el('task').setAttribute('aria-live','polite');this.free();
 }
 el(id){return document.getElementById(id);}
 fillLessons(topic){
  this.select.replaceChildren();const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=topic==='All topics'?`Explore ${this.lessons.length} lessons`:'Choose a lesson';this.select.append(placeholder);
  const groups=new Map();for(const [i,lesson]of this.lessons.entries()){if(topic!=='All topics'&&lesson.group!==topic)continue;let group=groups.get(lesson.group);if(!group){group=document.createElement('optgroup');group.label=lesson.group;groups.set(lesson.group,group);this.select.append(group);}const option=document.createElement('option');option.value=String(i);option.textContent=lesson.title;group.append(option);}
 }
 free(){this.leaveTest();this.index=-1;this.topic.value='All topics';this.fillLessons('All topics');this.el('free').classList.add('selected');this.el('guided').classList.remove('selected');this.el('tag').textContent='FREE PRACTICE';this.el('drilltitle').textContent='Take the controls.';this.el('drilltext').textContent='Explore freely, or choose a lesson. We’ll load a practice game and guide you through the controls.';this.el('task').textContent='Tutorials cover every enabled control in this profile.';this.el('next').disabled=false;this.el('next').textContent='Start guided tutorials ↗';this.restart.hidden=true;this.updateProgress();}
 updateProgress(){this.progress.textContent=`${this.completed.size} / ${this.lessons.length} completed · this session`;}
 start(index){if(this.testing)this.leaveTest();this.index=-1;this.resetScenario();const lesson=this.lessons[index];lesson.setup(this.getState());this.index=index;this.history=[];this.passed=false;this.topic.value=lesson.group;this.fillLessons(lesson.group);this.select.value=String(index);this.el('free').classList.remove('selected');this.el('guided').classList.add('selected');this.el('tag').textContent=`LESSON ${index+1} / ${this.lessons.length} · ${lesson.group.toUpperCase()}`;this.el('drilltitle').textContent=lesson.title;this.el('drilltext').textContent=lesson.text;this.el('task').textContent=lesson.task;this.el('next').disabled=true;this.el('next').textContent='Complete the task to continue';this.restart.hidden=false;this.restart.textContent='↻ Restart lesson';if(lesson.id.startsWith('remote')||lesson.group.toLowerCase().includes('remote')){const remotePanel=document.getElementById('remote-controls');if(remotePanel){remotePanel.open=true;remotePanel.scrollIntoView({block:'nearest'});}}this.log('Tutorial: '+lesson.title);this.onRender();this.updateProgress();}
 next(){if(this.testing){this.checkTest();return;}this.start(this.index<0?0:(this.index+1)%this.lessons.length);}
 observe(event){if(this.testing){if(this.exam?.active){this.history.push(event);if(this.exam.current.lesson.check(this.getState(),event,this.history))this.exam.successEvent=event;}return;}if(this.index<0||this.passed)return;this.history.push(event);const lesson=this.lessons[this.index];if(lesson.check(this.getState(),event,this.history)){this.passed=true;this.completed.add(lesson.id);this.el('task').textContent='✓ Complete. '+lesson.task;this.el('next').disabled=false;this.el('next').textContent=this.index===this.lessons.length-1?'Start again ↻':'Next lesson →';this.log('Tutorial complete: '+lesson.title);this.updateProgress();}}
 leaveTest(){this.testing=false;if(this.scenario)this.scenario.hidden=true;document.querySelector('.coach')?.classList.remove('is-testing');if(this.testButton)this.testButton.classList.remove('selected');if(this.testActions)this.testActions.hidden=true;if(this.topic)this.topic.disabled=false;if(this.select)this.select.disabled=false;}
 beginTest(){this.testing=true;document.querySelector('.coach').classList.add('is-testing');this.index=-1;this.exam={tasks:buildTestChallenges(this.profile,this.lessons),results:[],active:false};this.el('free').classList.remove('selected');this.el('guided').classList.remove('selected');this.testButton.classList.add('selected');this.topic.disabled=true;this.select.disabled=true;this.loadTestTask();}
 loadTestTask(){const exam=this.exam;if(exam.results.length===exam.tasks.length){this.showTestResults();return;}exam.current=exam.tasks[exam.results.length];exam.active=false;exam.successEvent=null;exam.helped=false;exam.checked=false;this.resetScenario();exam.current.lesson.setup(this.getState());this.history=[];exam.active=true;this.el('tag').textContent=`TEST · ${exam.results.length+1} OF ${exam.tasks.length}`;this.scenario.hidden=false;this.scenarioLabel.textContent=this.el('tag').textContent;this.scenarioPrompt.textContent=exam.current.prompt;this.scenarioFeedback.textContent='';this.scenarioCheck.textContent='Check answer';this.scenarioCheck.onclick=()=>this.checkTest();this.el('drilltitle').textContent='Your call.';this.el('drilltext').textContent=exam.current.prompt;this.el('task').textContent='Use the console, then check your answer. No timer or speed score.';this.el('next').disabled=false;this.el('next').textContent='Check answer';this.restart.hidden=false;this.restart.textContent='↻ Restart task';this.testActions.hidden=false;this.helpButton.disabled=false;this.progress.textContent=`${exam.results.length} / ${exam.tasks.length} assessed · this round`;this.onRender();}
 retryTest(){this.exam.helped=true;this.loadTestTask();this.exam.helped=true;this.el('task').textContent='Task restarted. This task will be marked as assisted.';}
 revealTest(){if(!this.exam?.active)return;this.exam.helped=true;this.helpButton.disabled=true;this.scenarioFeedback.textContent='Solution: '+this.exam.current.lesson.task;this.el('task').textContent='Solution: '+this.exam.current.lesson.task;}
 checkTest(){const exam=this.exam;if(!exam.active){this.beginTest();return;}const ok=exam.successEvent&&exam.current.lesson.check(this.getState(),exam.successEvent,this.history);if(ok){this.finishTestTask(exam.helped?'assisted':'independent');}else{exam.checked=true;if(this.scenarioFeedback)this.scenarioFeedback.textContent='Not complete yet. Check the requested outcome and finish any open entry.';this.el('task').textContent=exam.helped?'Not complete yet. Solution: '+exam.current.lesson.task:'Not complete yet. Check the requested outcome and finish any open entry, then try again.';}}
 finishTestTask(result){const exam=this.exam;if(!exam?.active)return;exam.active=false;exam.results.push({prompt:exam.current.prompt,result,solution:exam.current.lesson.task});this.loadTestTask();}
 showTestResults(){const exam=this.exam;exam.active=false;const independent=exam.results.filter(r=>r.result==='independent').length;this.scenario.hidden=false;this.scenarioLabel.textContent='TEST COMPLETE';this.scenarioPrompt.textContent=`${independent} / ${exam.tasks.length} completed independently.`;this.scenarioFeedback.textContent='';this.scenarioCheck.textContent='Review results';this.scenarioCheck.onclick=()=>document.querySelector('.coach').scrollIntoView({block:'start',behavior:'smooth'});this.el('tag').textContent='TEST COMPLETE';this.el('drilltitle').textContent=`${independent} / ${exam.tasks.length} independently`;this.el('drilltext').textContent='Practice feedback for this controller. This is a simulator assessment, not an official timekeeper qualification.';this.el('task').replaceChildren();for(const result of exam.results){const row=document.createElement('p');row.className='test-result';const label=document.createElement('strong');label.textContent=({independent:'✓ Independent',assisted:'◌ Assisted',skipped:'— Skipped'})[result.result];row.append(label,document.createTextNode(' · '+result.prompt));if(result.result!=='independent'){const answer=document.createElement('small');answer.textContent='Review: '+result.solution;row.append(answer);}this.el('task').append(row);}this.el('next').textContent='Start new round';this.el('next').disabled=false;this.restart.hidden=true;this.testActions.hidden=true;this.progress.textContent='Results stay in this session. Each task used a fresh scenario.';}

}

if(typeof module!=="undefined")module.exports={RinkTutorials,buildTestChallenges};
