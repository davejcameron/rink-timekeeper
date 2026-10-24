/* HDD 2000-series hockey operating profile, manual 90-19-009, sections 3.4–3.7. */
const BaseHamilton=typeof module!=='undefined'?require('./hamilton-engine.js'):HamiltonClock;
class Hamilton2000Clock extends BaseHamilton {
 reset(){super.reset();this.shots={home:0,guest:0};this.autoHorn=0;this.autoElapsed=0;this.timeoutTime=0;this.breakDefault=3;this.warmupDefault=3;this.nextPenalty=1;this.hornSeconds=2;this.openEnded=false;}
 label(type){return ({kind:'ENTER = NORM RUN · HOLD PEN MEM CHANGES TYPE',autoHorn:'AUTO HORN SECONDS · CLEAR = ALL OFF',timeout:'TIME OUT SECONDS',shots:'SHOTS ON GOAL',todConfirm:'SET TIME OF DAY? 1 = YES',todHours:'TIME OF DAY HOURS',todMinutes:'TIME OF DAY MINUTES',todSeconds:'TIME OF DAY SECONDS'})[type]||super.label(type);}
 done(message){const inspecting=['penRecall','editPenPlayer','editPenMinutes','editPenSeconds'].includes(this.edit?.type);super.done(message);if(inspecting){this.processExpired();this.sortPenalties();}}
 field(type,value,max=99,extra={}){super.field(type,value,max,extra);}
 sortPenalties(){const rank={normal:0,delayed:1,misconduct:2,delayedMisconduct:3};for(const side of ['home','guest'])this.pen[side].sort((a,b)=>rank[a.kind]-rank[b.kind]||(['normal','misconduct'].includes(a.kind)?a.remaining-b.remaining:a.id-b.id));}
 release(side,player){const list=this.pen[side];const next=list.filter(p=>p.kind==='delayed'&&!(p.player&&list.some(q=>q!==p&&q.player===p.player&&['normal','misconduct'].includes(q.kind)))).sort((a,b)=>a.id-b.id)[0];if(next){next.kind='normal';this.event('released');}const misconduct=list.find(p=>p.kind==='delayedMisconduct'&&p.player===player&&player!==0&&!list.some(q=>q!==p&&q.player===player&&['normal','delayed'].includes(q.kind)));if(misconduct){misconduct.kind='misconduct';this.event('released');}}
 processExpired(){for(const side of ['home','guest']){const expired=this.pen[side].filter(p=>p.remaining<=1e-8&&['normal','misconduct'].includes(p.kind));for(const p of expired){this.pen[side]=this.pen[side].filter(q=>q!==p);if(p.kind==='normal')this.release(side,p.player);this.event('expired');}}}
 addPenalty(side,player,remaining,kind){if(this.pen[side].length>=15){this.invalid('TOO MANY PENALTIES · LIMIT 15');return;}const same=player!==0&&this.pen[side].some(p=>p.player===player);if(kind==='normal'&&(same||this.pen[side].filter(p=>p.kind==='normal').length>=2))kind='delayed';if(kind==='misconduct'&&same)kind='delayedMisconduct';this.pen[side].push({id:this.nextPenalty++,player,remaining,kind});this.sortPenalties();this.done('PENALTY ENTERED');this.event('penalty');}
 key(k){
  if(k==='new'){this.done();this.field('new',0);return;}
  if(k==='clear'&&this.edit?.type==='new'){const length=this.periodLength,down=this.down,names=this.savedNames,auto=this.autoHorn;this.reset();this.periodLength=length;this.down=down;this.savedNames=names;this.autoHorn=auto;this.period=0;this.time=0;this.field('direction',down?1:0,1);return;}
  if(k==='recall'&&this.edit?.type==='new'){this.done('DISPLAY TEST · ANY FUNCTION EXITS');this.testDisplay=true;return;}
  if(this.testDisplay){if(/^\d$/.test(k))return;this.testDisplay=false;}
  if(k==='cancel'){this.done('FUNCTION ABORTED');return;}
  if(k==='recall'&&this.edit){if(this.edit.type==='kind'){const side=this.edit.side;this.done();this.key('recall');this.key('penalty:'+side);return;}if(this.edit.type==='penRecall'){this.edit.cursor=this.edit.cursor==='time'?'player':'time';this.edit.remove=false;this.message='EDIT '+this.edit.cursor.toUpperCase()+' · DIGITS THEN ENTER';return;}this.edit.digits='';this.message=this.label(this.edit.type);return;}
  if(k==='run'||k==='hold'||k==='penrun'||k==='penhold'){if(k==='run'){if(this.view==='game'&&this.down&&this.time===0){this.invalid('TIMER IS ZERO');return;}this.running=true;this.event('run');}else if(k==='hold'){this.running=false;this.event('hold');}else{this.penRunning=k==='penrun';this.event(k);}if(!this.edit)this.message=(this.running?'TIMER RUN':'TIMER HOLD')+' · '+(this.penRunning?'P-RUN':'P-HLD');return;}
  if(k==='alt'&&this.edit&&['kind','penRecall'].includes(this.edit.type)){const kinds=['normal','delayed','misconduct','delayedMisconduct'];const e=this.edit;if(e.type==='kind')e.kind=kinds[(kinds.indexOf(e.kind)+1)%4];else {const current=e.newKind||this.pen[e.side][e.slot].kind;e.newKind=kinds[(kinds.indexOf(current)+1)%4];}this.message='TYPE · '+(e.kind||e.newKind).toUpperCase();return;}
  if((k==='+'||k==='-')&&this.edit){const e=this.edit;if(e.type==='penRecall'){e.newKind=null;return super.key(k);}if(!['new','kind','direction'].includes(e.type)){e.digits=String(Math.max(0,Math.min(e.max,(e.digits===''?e.value:Number(e.digits))+(k==='+'?1:-1))));return;}}
  if(k==='clear'&&this.edit?.type==='penRecall'){super.key(k);return;}
  if(k==='clear'&&this.edit&&!['new','penRecall'].includes(this.edit.type)){this.edit.digits='0';if(this.edit.type==='autoHorn')this.edit.disableAll=true;return;}
  if(/^\d$/.test(k)){if(this.edit?.type==='kind'){const {side,kind}=this.edit;this.field('penMinutes',0,99,{side,kind,player:0});}if(this.edit?.type==='penRecall'){const e=this.edit,p=this.pen[e.side][e.slot];this.field(e.cursor==='time'?'editPenMinutes':'editPenPlayer',e.cursor==='time'?Math.floor(p.remaining/60):p.player,99,{side:e.side,id:p.id});}if(this.edit&&!['direction','new','kind'].includes(this.edit.type)){const e=this.edit;if(e.digits==='0')e.digits=k;else if(e.digits.length<String(e.max).length)e.digits+=k;if(e.type==='autoHorn')e.disableAll=false;return;}return super.key(k);}
  if(k==='enter')return this.enter();
  if(k==='recall')return super.key(k);
  const recalled=this.recall;
  if(this.edit)this.done();
  if(k==='auto'){this.recall=false;this.field('autoHorn',this.autoHorn??0,240);return;}
  if(k.startsWith('shots:')){const side=k.split(':')[1];this.recall=false;if(recalled)this.field('shots',this.shots[side],99,{side});else{this.shots[side]=Math.min(99,this.shots[side]+1);this.event('shots');}return;}
  if(k.startsWith('timeout:')){this.recall=false;this.running=false;this.field('timeout',30,99,{side:k.split(':')[1]});return;}
  if(k==='time'&&!recalled){this.field('todConfirm',0,1);return;}
  if(k==='set'&&!recalled){this.running=false;this.view='game';}
  if(k==='period'){this.running=false;}
  if(k==='intermission'){this.recall=false;this.running=false;this.field('breakMinutes',this.period===0?this.warmupDefault:this.breakDefault,99);return;}
  if(k.startsWith('penalty:')){const side=k.split(':')[1];this.recall=false;if(recalled){if(!this.pen[side].length){this.invalid('NO PENALTIES');return;}this.field('penRecall',0,15,{side,slot:0,cursor:'player',remove:false});}else if(this.pen[side].length>=15)this.invalid('TOO MANY PENALTIES · LIMIT 15');else this.field('kind',0,0,{side,kind:this.pen[side].filter(p=>p.kind==='normal').length>=2?'delayed':'normal'});return;}
  if(k.startsWith('score:')){const side=k.split(':')[1];this.recall=false;if(recalled)this.field('score',this[side],199,{side});else{this[side]=Math.min(199,this[side]+1);this.event('score');}return;}
  return super.key(k);
 }
 enter(){const e=this.edit;if(!e)return;const value=e.digits===''?e.value:Number(e.digits);if(value<0||value>e.max){this.invalid('VALUE OUT OF RANGE · CLEAR & RETRY');return;}
  if(e.type==='seconds'){this.finishPeriod(e,e.working+value);return;}
  if(e.type==='period'&&value===0){this.period=0;this.field('breakMinutes',this.warmupDefault,99);return;}
  if(e.type==='minutes'){this.field('seconds',0,59,{newGame:e.newGame,pendingPeriod:e.pendingPeriod,working:value*60});return;}
  if(e.type==='breakMinutes'){this.breakTime=value*60;if(this.period===0)this.warmupDefault=value;else if(value>0)this.breakDefault=value;this.view=value===0?'game':'break';this.running=value>0;this.done(value===0?'GAME TIMER · HOLD':this.period===0?'WARM-UP · RUN':'INTERMISSION · RUN');this.event(value===0?'breakend':'break');return;}
  if(e.type==='player'){this.field('penMinutes',0,99,{side:e.side,kind:e.kind,player:value});return;}
  if(e.type==='penSeconds'){if(e.working+value===0){this.invalid('PENALTY MUST BE GREATER THAN ZERO');return;}this.addPenalty(e.side,e.player,e.working+value,e.kind);return;}
  if(e.type==='penRecall'){const p=this.pen[e.side][e.slot];if(e.newKind)p.kind=e.newKind;if(e.remove){this.pen[e.side]=this.pen[e.side].filter(q=>q!==p);if(p.kind==='normal')this.release(e.side,p.player);this.event('delete');}this.done();this.sortPenalties();return;}
  if(e.type==='editPenPlayer'){this.pen[e.side].find(p=>p.id===e.id).player=value;this.done();return;}
  if(e.type==='editPenMinutes'){const p=this.pen[e.side].find(p=>p.id===e.id);this.field('editPenSeconds',Math.floor(p.remaining%60),59,{side:e.side,id:e.id,working:value*60});return;}
  if(e.type==='editPenSeconds'){this.pen[e.side].find(p=>p.id===e.id).remaining=e.working+value;this.done();this.processExpired();this.sortPenalties();return;}
  if(e.type==='autoHorn'){this.autoHorn=e.disableAll?null:value;this.autoElapsed=0;this.done('AUTO HORN '+(this.autoHorn===null?'ALL OFF':value+' SEC'));this.event('auto');return;}
  if(e.type==='shots'){this.shots[e.side]=value;this.done();this.event('shots');return;}
  if(e.type==='timeout'){this.timeoutTime=value;this.timeoutSide=e.side;this.view=value===0?'game':'timeout';this.running=value>0;this.done(value===0?'GAME TIMER · HOLD':'TIME OUT · RUN');this.event(value===0?'timeoutend':'timeout');return;}
  if(e.type==='todConfirm'){if(value===1){this.field('todHours',12,23);}else{this.view='time';this.done();}return;}
  if(e.type==='todHours'){this.field('todMinutes',0,59,{hours:value});return;}
  if(e.type==='todMinutes'){this.field('todSeconds',20,59,{hours:e.hours,minutes:value});return;}
  if(e.type==='todSeconds'){this.todSeconds=e.hours*3600+e.minutes*60+value;this.view='time';this.done();return;}
  return super.enter();
 }
 finishPeriod(e,length){this.period=e.pendingPeriod;this.periodLength=length;this.limit=length;this.openEnded=length===0;if(this.openEnded)this.down=false;this.time=this.down?length:0;this.view='game';this.running=false;this.autoElapsed=0;this.done();this.event(e.newGame?'newgame':'period');}
 tick(dt){if(this.todSeconds!==undefined)this.todSeconds=(this.todSeconds+dt)%86400;if(!this.running)return;if(this.view==='timeout'){this.timeoutTime=Math.max(0,this.timeoutTime-dt);if(this.timeoutTime===0){this.running=false;this.view='game';this.hornSeconds=2;if(this.autoHorn!==null)this.event('horn');this.event('timeoutend');}return;}if(this.view==='break'){this.breakTime=Math.max(0,this.breakTime-dt);if(this.breakTime===0){this.running=false;if(this.period===0&&this.autoHorn!==null){this.hornSeconds=2;this.event('horn');}this.event('breakfinished');}return;}
  const elapsed=this.openEnded?dt:Math.min(dt,this.down?this.time:Math.max(0,this.limit-this.time));this.time+=this.down?-elapsed:elapsed;
  if(this.penRunning){let left=elapsed;while(left>1e-9){const active=['home','guest'].flatMap(s=>this.pen[s]).filter(p=>['normal','misconduct'].includes(p.kind)&&p.remaining>1e-8);if(!active.length)break;const step=Math.min(left,...active.map(p=>p.remaining));active.forEach(p=>p.remaining=Math.max(0,p.remaining-step));left-=step;if(['penRecall','editPenPlayer','editPenMinutes','editPenSeconds'].includes(this.edit?.type))continue;this.processExpired();this.sortPenalties();}}
  this.autoElapsed+=elapsed;if(this.autoHorn>0&&this.autoElapsed>=this.autoHorn){this.autoElapsed%=this.autoHorn;this.hornSeconds=2;this.event('horn');}
  if(!this.openEnded&&(this.down?this.time<=0:this.time>=this.limit)){this.running=false;this.hornSeconds=5;if(this.autoHorn!==null)this.event('horn');this.event('end');}
 }
}
if(typeof module!=='undefined')module.exports=Hamilton2000Clock;
