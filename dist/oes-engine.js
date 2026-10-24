/* OES hockey operations: ISC9000 J12 manual and ISC85X hockey sheet.
   Fixed training configuration: 4 penalties/team, 2 active, optional shift enabled. */
class OESClock {
 constructor(profile='isc9000',periodLength=900){this.profile=profile;this.periodLength=periodLength;this.reset();}
 reset(){Object.assign(this,{time:this.periodLength,lastSet:this.periodLength,limit:this.periodLength,down:true,period:1,home:0,guest:0,running:false,penRunning:true,holdQueue:false,view:'game',breakTime:180,breakSet:180,shiftSet:0,shiftTime:0,edit:null,message:'GAME TIME · STOP',events:[],names:{home:'HOME',guest:this.profile==='isc85x'?'VISITOR':'GUEST'},shots:{home:0,guest:0},pen:{home:[],guest:[]},saved:null,goal:{home:false,guest:false}});}
 field(type,value,max=99,extra={}){this.edit={type,value,max,digits:'',...extra};this.message=({minutes:'GAME TIME · MINUTES',seconds:'GAME TIME · SECONDS',fraction:'GAME TIME · HUNDREDTHS',breakMinutes:'INT MODE · MINUTES',breakSeconds:'INT MODE · SECONDS',period:'PERIOD',player:'PENALTY · PLAYER',penMinutes:'PENALTY · MINUTES',penSeconds:'PENALTY · SECONDS',score:'TEAM SCORE',shots:'SHOTS ON GOAL',shiftMinutes:'SHIFT SET · MINUTES',shiftSeconds:'SHIFT SET · SECONDS',direction:'COUNT UP · ENTER TO SET LIMIT',limit:'COUNT UP · LIMIT MINUTES'})[type]||type;}
 done(message='GAME TIME · STOP'){this.edit=null;this.message=message;}
 key(k){
  const legacy=this.profile==='isc85x';
  if(k==='hold'){this.running=false;this.saved={time:this.time,pen:JSON.parse(JSON.stringify(this.pen))};this.message='CLOCK STOPPED';return;}
  if(k==='run'){if(this.edit){this.done('ENTRY ABANDONED · CLOCK RUNNING');}if(this.view==='game'&&(this.down?this.time<=0:this.time>=this.limit))return;this.compact();this.running=true;this.message='CLOCK RUNNING';return;}
  if(k==='cancel'){this.done('ENTRY CANCELLED');return;}
  if(/^\d$/.test(k)){if(this.edit?.type==='name'){this.nameDigit(k);return;}if(this.edit?.replaceOnDigit){this.edit.digits='';this.edit.replaceOnDigit=false;}if(this.edit&&this.edit.digits.length<(this.edit.max>=100?3:2))this.edit.digits+=k;return;}
  if(k==='enter'){this.enter();return;}
  if(k==='clear'){const e=this.edit;if(!e)return;if(e.type==='name'){e.chars=e.chars.slice(0,-1);e.lastKey=null;return;}if(['player','penMinutes','penSeconds'].includes(e.type)){if(!legacy){this.pen[e.side].splice(e.slot,1);this.compact();this.done('PENALTY CLEARED');}else if(!e.clearOnce){e.clearOnce=true;e.digits='0';e.player=0;e.working=0;this.message='CLEAR AGAIN TO REMOVE PENALTY';}else{this.pen[e.side].splice(e.slot,1);this.done('PENALTY CLEARED · QUEUE ADVANCES ON RUN');}return;}e.digits='0';e.replaceOnDigit=true;return;}
  if(k==='increment'){const e=this.edit;if(e&&['score','shots','period'].includes(e.type)){const n=Math.min(e.max,(e.digits===''?e.value:Number(e.digits))+1);this.writeTotal(e,n);this.done();}return;}
  if(k.startsWith('preset:')){const e=this.edit;if(e&&['minutes','breakMinutes'].includes(e.type)){e.digits=String(Math.min(99,(e.digits===''?e.value:Number(e.digits))+Number(k.split(':')[1])));}return;}
  if(k.startsWith('goal:')){const side=k.split(':')[1];this.goal[side]=!this.goal[side];return;}
  if(k==='penrun'){this.penRunning=!this.penRunning;this.message=this.penRunning?'PENALTIES RUN':'PENALTIES STOP';return;}
  if(k==='penhold'){this.holdQueue=!this.holdQueue;this.message=this.holdQueue?'QUEUED PENALTIES HELD':'QUEUED PENALTIES RELEASED';if(!this.holdQueue)this.compact();return;}
  if(k==='saved'){if(this.running){this.message='STOP BEFORE RECALLING SAVED TIME';return;}if(this.saved){this.time=this.saved.time;this.pen=JSON.parse(JSON.stringify(this.saved.pen));this.done('LAST STOPPAGE TIMES RESTORED');}else this.message='NO SAVED STOPPAGE';return;}
  if(k==='status'){this.message='HOCKEY · 4 PENALTIES / TEAM · 2 ACTIVE · SHIFT ENABLED';return;}
  if(k.startsWith('scoreAdd:')){const side=k.split(':')[1];this[side]=Math.min(199,this[side]+1);this.done();return;}
  if(k.startsWith('shotsAdd:')){const side=k.split(':')[1];this.shots[side]=Math.min(99,this.shots[side]+1);this.done();return;}
  if(k.startsWith('score:')||k.startsWith('shots:')){const [type,side]=k.split(':');if(type==='shots'&&(legacy&&this.running||!legacy&&this.edit?.type==='shots'&&this.edit.side===side)){this.shots[side]=Math.min(99,this.shots[side]+1);this.done();return;}this.field(type,type==='score'?this[side]:this.shots[side],type==='score'?199:99,{side});return;}
  if(k.startsWith('penalty:')){const side=k.split(':')[1],old=this.edit;let slot=old?.side===side&&['player','penMinutes','penSeconds'].includes(old.type)?(old.slot+1)%4:this.pen[side].findIndex(p=>!p||p.remaining<=0);if(slot<0)slot=Math.min(this.pen[side].length,3);const p=this.pen[side][slot]||{player:0,remaining:0};this.field('player',p.player,99,{side,slot});return;}
  if(k==='names'){if(this.running){this.message='STOP BEFORE NAME ENTRY';return;}this.edit={type:'name',teamIndex:0,chars:[],lastKey:null,index:0,idle:0};this.message='HOME FULL NAME · KEYPAD LETTERS · ENTER NEXT';return;}
  if(this.running){this.message='STOP CLOCK BEFORE EDITING';return;}
  if(k==='set'){this.view='game';if(this.time===0&&this.down){this.time=this.lastSet;this.period=Math.min(9,this.period+1);}this.field('minutes',Math.floor(this.time/60));return;}
  if(k==='period'){if(!legacy&&this.edit?.type==='period'){this.period=Math.min(9,this.period+1);this.done();}else this.field('period',this.period,9);return;}
  if(k==='intermission'){if(this.view==='break'){this.view='game';this.done();}else{this.view='break';this.field('breakMinutes',Math.floor(this.breakSet/60));}return;}
  if(k==='shift'){const current=this.edit?.type==='shiftMinutes';this.field('shiftMinutes',Math.floor((current?this.shiftTime:this.shiftSet)/60),9,{current});return;}
  if(k==='direction'&&legacy){this.down=!this.down;if(!this.down)this.field('direction',0,0);else this.done('CLOCK DIRECTION · DOWN');return;}
 }
 writeTotal(e,n){if(e.type==='period')this.period=n;else if(e.type==='score')this[e.side]=n;else if(e.type==='shots')this.shots[e.side]=n;}
 enter(){const e=this.edit;if(!e)return;const n=e.digits===''?e.value:Number(e.digits);if(e.type==='name'){const full=e.chars.join('').trim();if(e.teamIndex===0)this.names.home=full||'HOME';if(e.teamIndex===2)this.names.guest=full||'GUEST';e.teamIndex++;if(e.teamIndex===4){this.done('TEAM NAMES SAVED');return;}e.chars=[];e.lastKey=null;this.message=['HOME FULL','HOME SHORT','GUEST FULL','GUEST SHORT'][e.teamIndex]+' NAME · ENTER NEXT';return;}if(n>e.max||n<0){this.message='OUT OF RANGE · CLEAR AND RETRY';return;}
  switch(e.type){
   case 'minutes':this.field('seconds',Math.floor(this.time%60),59,{working:n*60});break;
   case 'seconds':this.field('fraction',Math.round(this.time%1*100),99,{working:e.working+n});break;
   case 'fraction':this.time=e.working+n/100;this.lastSet=this.time;if(this.down)this.limit=this.time;this.done();break;
   case 'breakMinutes':this.field('breakSeconds',this.breakSet%60,59,{working:n*60});break;
   case 'breakSeconds':this.breakSet=this.breakTime=e.working+n;this.done('INT MODE · STOP');break;
   case 'score':case 'shots':case 'period':this.writeTotal(e,n);this.done();break;
   case 'player':this.field('penMinutes',Math.floor((this.pen[e.side][e.slot]?.remaining||0)/60),99,{side:e.side,slot:e.slot,player:n});break;
   case 'penMinutes':this.field('penSeconds',Math.floor((this.pen[e.side][e.slot]?.remaining||0)%60),59,{side:e.side,slot:e.slot,player:e.player,working:n*60});break;
   case 'penSeconds':{const p={player:e.player,remaining:e.working+n};if(p.remaining===0){this.pen[e.side].splice(e.slot,1);}else this.pen[e.side][e.slot]=p;this.done('PENALTY SAVED');break;}
   case 'shiftMinutes':if(this.profile==='isc85x'&&!e.current){this.shiftSet=this.shiftTime=n*60;this.done('SHIFT SET');}else this.field('shiftSeconds',(e.current?this.shiftTime:this.shiftSet)%60,59,{working:n*60,current:e.current});break;
   case 'shiftSeconds':if(!e.current)this.shiftSet=e.working+n;this.shiftTime=e.working+n;this.done('SHIFT SET');break;
   case 'direction':this.field('limit',Math.floor(this.limit/60),99);break;
   case 'limit':this.limit=n*60;this.time=0;this.done('COUNT UP · READY');break;
  }
 }
 nameDigit(k){const e=this.edit,map=['0 ','1','ABC2','DEF3','GHI4','JKL5','MNO6','PQRS7','TUV8','WXYZ9'];if(e.lastKey===k){e.index=(e.index+1)%map[+k].length;e.chars[e.chars.length-1]=map[+k][e.index];}else{if(e.chars.length>=(e.teamIndex%2?5:16))return;e.index=0;e.chars.push(map[+k][0]);}e.lastKey=k;e.idle=0;}
 compact(){for(const side of ['home','guest']){if(this.holdQueue){for(let i=0;i<2;i++)if(this.pen[side][i]?.remaining<=0)this.pen[side][i]=null;}else this.pen[side]=this.pen[side].filter(p=>p&&p.remaining>0);}}
 tick(dt){if(this.edit?.type==='name'){this.edit.idle+=dt;if(this.edit.idle>=1)this.edit.lastKey=null;}if(!this.running)return;if(this.view==='break'){this.breakTime=Math.max(0,this.breakTime-dt);if(this.breakTime===0){this.running=false;this.events.push('horn');this.message='INTERMISSION COMPLETE · INT MODE TO RETURN';}return;}let left=Math.min(dt,this.down?this.time:Math.max(0,this.limit-this.time));const elapsed=left;while(left>1e-9){this.compact();const active=this.penRunning?Object.values(this.pen).flatMap(ps=>ps.slice(0,2)).filter(p=>p&&p.remaining>0):[];const step=Math.min(left,...active.map(p=>p.remaining));for(const p of active)p.remaining=Math.max(0,p.remaining-step);left-=step;this.compact();}this.time+=this.down?-elapsed:elapsed;if(this.shiftSet>0&&this.shiftTime>0){this.shiftTime-=elapsed;while(this.shiftTime<=0){this.events.push('horn');this.shiftTime+=this.shiftSet;}}if(this.down?this.time<=0:this.time>=this.limit){this.running=false;this.events.push('horn');this.message='PERIOD COMPLETE';}}
}
if(typeof module!=='undefined')module.exports=OESClock;
