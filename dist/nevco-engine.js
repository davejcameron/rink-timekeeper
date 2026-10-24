/* Nevco MPC, hockey overlay/configuration code 871 (135-0066, 2009).
   Wired profile; no auxiliary display. Optional penalty timeout enabled initially. */
class NevcoClock {
 constructor(periodLength=900){this.periodLength=periodLength;this.reset();}
 reset(){Object.assign(this,{time:this.periodLength,period:1,home:0,guest:0,running:false,penRunning:true,penaltyTimeout:true,remote:false,autoHorn:true,view:'game',edit:null,set:false,message:'MAIN TIME · DN',shots:{home:0,guest:0},goal:{home:false,guest:false},pen:{home:[],guest:[]},events:[],timeoutTime:null,timeoutElapsed:0,timeoutWarning:10,warningDone:false});}
 field(type,value=0,max=99,extra={}){this.edit={type,value,max,digits:'',...extra};this.message=({main:'SET MM:SS.s',period:'PERIOD',penTime:'PEN MM:SS',player:'PLAYER # · TWO DIGITS',auto:'AUTO HORN? YES / NO',clearPenalty:'CLEAR PENALTY? YES / NO',editPenalty:'EDIT PENALTY? YES / NO',insertPenalty:'INSERT PENALTY? YES / NO',startup:'START WHERE TURNED OFF LAST?',bookmark:'GO TO A BOOKMARK?',code:'ENTER MODEL CODE',penTimeout:'USE PENALTY TIME OUT? YES / NO',timeoutSelect:'TIMER # (0–9)',score:'SET SCORE',shots:'SET SHOTS'})[type]||type;}
 done(message='MAIN TIME · DN'){this.edit=null;this.set=false;this.message=message;}
 key(k){
  if(k==='power'){this.running=false;this.field('startup');return;}
  if(k==='remote'){this.remote=!this.remote;this.message=this.remote?'HANDHELD CONNECTED · USE REMOTE SWITCH':'HANDHELD DISCONNECTED · TIME ON/OFF ACTIVE';return;}
  if(k==='remoteRun'){if(this.remote)this.run(!this.running);return;}
  if(k==='run'||k==='hold'){if(this.remote){this.message='USE HANDHELD · PANEL TIME KEYS INACTIVE';return;}this.run(k==='run');return;}
  if(k==='set'){this.edit=null;this.set=true;this.message='SET · SELECT FUNCTION';return;}
  if(k==='no'||k==='cancel'){const e=this.edit;if(e?.type==='startup'){this.field('bookmark');return;}if(e?.type==='bookmark'){this.field('code',0,999);return;}if(e?.type==='penTimeout'){const remote=this.remote;this.reset();this.remote=remote;this.penaltyTimeout=false;this.time=0;this.done('HOCKEY CODE 871 · SET TIME');return;}if(e?.type==='auto'){this.autoHorn=false;this.done('AUTO HORN OFF');return;}this.done('ENTRY CANCELLED');return;}
  if(k==='yes'||k==='enter'){this.enter();return;}
  if(/^\d$/.test(k)||k==='blank'){this.digit(k==='blank'?'0':k);return;}
  if(k==='horn'&&this.set){this.field('auto');return;}
  if(k==='time'){if(this.set){if(this.running){this.done('TIME OFF BEFORE SETTING MAIN CLOCK');return;}this.field('main',this.time,59999);}else{this.view='game';this.done();}return;}
  if(k==='chrono'){this.view='time';this.done('CHRONOMETER · LOCAL TIME');return;}
  if(k==='options'){this.done('CODE 871 · AUTO HORN '+(this.autoHorn?'ON':'OFF')+' · PENALTY TIMEOUT '+(this.penaltyTimeout?'ON':'OFF')+' · WIRED TRAINING PROFILE');return;}
  if(k==='penToggle'){if(this.penaltyTimeout){this.penRunning=!this.penRunning;this.done(this.penRunning?'PENALTY TIME ON':'PENALTY TIME OFF');}else this.message='PENALTY TIME OUT NOT ENABLED AT STARTUP';return;}
  if(k.startsWith('goal:')){const side=k.split(':')[1];this.goal[side]=!this.goal[side];this.done(side.toUpperCase()+' GOAL LIGHT '+(this.goal[side]?'ON':'OFF'));return;}
  if(k==='timeoutStart'){this.field('timeoutSelect',0,9);return;}
  if(k==='timeoutClear'){if(this.timeoutTime!==null){if(!this.warningDone&&this.timeoutTime>this.timeoutWarning){this.timeoutTime=this.timeoutWarning;this.warningDone=true;this.events.push('horn');}else this.timeoutTime=0;this.message='TIMEOUT PORTION CLEARED';}return;}
  if(k.startsWith('score:')||k.startsWith('shots:')){const [type,side]=k.split(':');this.field(this.set?type:'add'+type,type==='score'?this[side]:this.shots[side],type==='score'?199:99,{side});return;}
  if(k.startsWith('penalty:')){const side=k.split(':')[1];if(this.set){if(this.pen[side].length>=10){this.done('PENALTY LIST FULL');return;}this.field('penTime',0,1199,{side,slot:this.pen[side].length,mode:'add'});}else{if(!this.pen[side].length){this.done('NO PENALTIES');return;}const slot=this.edit?.type==='review'&&this.edit.side===side?(this.edit.slot+1)%this.pen[side].length:0;this.field('review',0,0,{side,slot});this.message='PENALTY '+(slot+1)+' · SELECT EDIT / CLEAR / INSERT';}return;}
  if(['penClear','penEdit','penInsert'].includes(k)&&this.edit?.type==='review'){const {side,slot}=this.edit;this.field({penClear:'clearPenalty',penEdit:'editPenalty',penInsert:'insertPenalty'}[k],0,0,{side,slot});return;}
 }
 run(on){if(on&&this.time<=0){this.message='SET MAIN TIME FIRST';return;}this.running=on;if(on){this.timeoutTime=null;this.view='game';this.done('TIME ON');}else this.message='TIME OFF';}
 digit(k){const e=this.edit;if(!e)return;if(e.type.startsWith('add')){const n=Math.min(e.max,e.value+Number(k));if(e.type==='addscore')this[e.side]=n;else this.shots[e.side]=n;this.done();return;}if(e.type==='timeoutSelect'){if(k!=='0'){this.message='ONLY TIMER 0 CONFIGURED IN THIS TRAINER';return;}this.running=false;this.timeoutTime=30;this.timeoutElapsed=0;this.warningDone=false;this.view='timeout';this.done('TIME OUT TIMER 0 · RUN');return;}const size=({main:5,penTime:4,player:2,code:3})[e.type]||(e.max>99?3:2);if(e.digits.length<size)e.digits+=k;if(e.type==='player'&&e.digits.length===2)this.enter();if(e.type==='code'&&e.digits.length===3){if(e.digits==='871')this.field('penTimeout');else this.message='USE HOCKEY CODE 871';}if(e.type==='period'&&e.digits.length===1)this.enter();}
 enter(){const e=this.edit;if(!e)return;const raw=e.digits,n=raw===''?e.value:Number(raw);if(e.type==='startup'){this.done('PREVIOUS GAME RESUMED');return;}if(e.type==='bookmark'){this.message='BOOKMARKS OUTSIDE THIS TRAINING PROFILE · NO TO CONTINUE';return;}if(e.type==='penTimeout'){this.penaltyTimeout=true;const remote=this.remote;this.reset();this.remote=remote;this.time=0;this.done('HOCKEY CODE 871 · SET TIME');return;}if(e.type==='auto'){this.autoHorn=true;this.done('AUTO HORN ON');return;}
  if(['clearPenalty','editPenalty','insertPenalty'].includes(e.type)){if(e.type==='clearPenalty'){this.pen[e.side].splice(e.slot,1);this.done('PENALTY CLEARED');}else this.field('penTime',e.type==='editPenalty'?this.pen[e.side][e.slot].remaining:0,1199,{side:e.side,slot:e.slot,mode:e.type==='editPenalty'?'edit':'insert'});return;}
  if(e.type==='review'){this.done();return;}
  if(e.type==='main'){const text=(raw||'00000').padEnd(5,'0');const minutes=Number(text.slice(0,2)),seconds=Number(text.slice(2,4)),tenths=Number(text[4]);if(seconds>59){this.message='INVALID SECONDS · NO AND RETRY';return;}this.time=minutes*60+seconds+tenths/10;this.field('period',this.period,9);return;}
  if(e.type==='penTime'){const text=raw?raw.padEnd(4,'0'):String(Math.floor(e.value/60)).padStart(2,'0')+String(e.value%60).padStart(2,'0');const minutes=Number(text.slice(0,2)),seconds=Number(text.slice(2));if(minutes>19||seconds>59||minutes*60+seconds===0){this.message='PENALTY RANGE 00:01–19:59';return;}const remaining=minutes*60+seconds;if(e.mode==='edit'){this.pen[e.side][e.slot].remaining=remaining;this.done('PENALTY EDITED');}else this.field('player',0,99,{side:e.side,slot:e.slot,mode:e.mode,remaining});return;}
  if(n>e.max){this.message='VALUE OUT OF RANGE';return;}
  if(e.type==='player'){this.pen[e.side].splice(e.slot,0,{player:n,remaining:e.remaining});this.done('PENALTY ENTERED');return;}
  if(e.type==='period'){this.period=n;this.done();return;}
  if(e.type==='score')this[e.side]=n;if(e.type==='shots')this.shots[e.side]=n;this.done();
 }
 tick(dt){if(this.timeoutTime!==null){const old=this.timeoutTime;this.timeoutTime=Math.max(0,old-dt);if(!this.warningDone&&old>this.timeoutWarning&&this.timeoutTime<=this.timeoutWarning){this.warningDone=true;this.events.push('horn');}if(old>0&&this.timeoutTime===0)this.events.push('horn');if(this.timeoutTime===0)this.timeoutElapsed+=Math.max(0,dt-old);return;}if(!this.running)return;const elapsed=Math.min(dt,this.time);let left=elapsed;while(left>1e-9){const active=this.penRunning?Object.values(this.pen).flatMap(ps=>ps.slice(0,2)):[];const step=Math.min(left,...active.map(p=>p.remaining));for(const p of active)p.remaining=Math.max(0,p.remaining-step);for(const side of ['home','guest'])this.pen[side]=this.pen[side].filter(p=>p.remaining>0);left-=step;}this.time=Math.max(0,this.time-elapsed);if(this.time===0){this.running=false;if(this.autoHorn)this.events.push('horn');this.message='PERIOD COMPLETE';}}
}
if(typeof module!=='undefined')module.exports=NevcoClock;
