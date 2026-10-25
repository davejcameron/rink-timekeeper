/* Documented Canadian rink profiles. Independent, browser-free state machines.
   Each model implements its own entry order; see SOURCES.md for fixed configurations. */
const CanadianNevcoBase=typeof module!=='undefined'?require('./nevco-engine.js'):NevcoClock;
function readColonTime(raw,{required=false,tenths=false}={}){if(required&&!raw.includes(':'))return null;if(!/^\d{0,2}(:\d{0,3})?$/.test(raw)||!raw)return null;const [m,s='']=raw.split(':');if(Number(s.slice(0,2)||0)>59)return null;return Number(m||0)*60+Number(s.slice(0,2)||0)+(tenths?Number(s[2]||0)/10:0);}
function readMMSS(raw,tenths=false){if(!/^\d{1,5}$/.test(raw))return null;const s=raw.padStart(tenths?5:4,'0'),secs=Number(s.slice(2,4));return secs>59?null:Number(s.slice(0,2))*60+secs+(tenths?Number(s[4])/10:0);}
class RinkFamilyClock {
 constructor(profile,periodLength=900){this.profile=profile;this.periodLength=periodLength;this.reset();}
 reset(){Object.assign(this,{time:this.periodLength,limit:this.periodLength,down:true,period:1,home:0,guest:0,running:false,penRunning:true,view:'game',breakTime:0,timeoutTime:null,edit:null,set:false,autoHorn:true,interval:0,intervalElapsed:0,shots:{home:0,guest:0},saves:{home:0,guest:0},goal:{home:false,guest:false},pen:{home:[],guest:[]},events:[],message:'HOCKEY · CLOCK STOPPED',hornSeconds:3,goalSeconds:{home:0,guest:0}});}
 field(type,value=0,extra={}){this.edit={type,value,digits:'',...extra};this.message=type.toUpperCase().replaceAll('_',' ');}
 done(message='HOCKEY · CLOCK STOPPED'){this.edit=null;this.set=false;this.message=message;}
 horn(seconds=this.hornSeconds){this.events.push({type:'horn',seconds});}
 run(on){if(on&&this.edit){this.message='FINISH ENTRY BEFORE RUN';return;}if(on&&this.view==='game'&&(this.down?this.time<=0:this.time>=this.limit)){this.message='SET GAME TIME FIRST';return;}this.running=on;this.message=on?'CLOCK RUNNING':'CLOCK STOPPED';}
 digit(k,max=7){if(this.edit&&this.edit.digits.length<max)this.edit.digits+=k;}
 queueTick(dt){let left=dt;while(left>1e-8){const active=[];for(const side of ['home','guest']){const players=new Set();for(const p of this.pen[side]){if(active.filter(a=>a.side===side).length>=2)break;if(p.remaining>0&&!players.has(p.player)){active.push({side,p});if(this.profile==='nevco7')players.add(p.player);}}}if(!active.length)break;const step=Math.min(left,...active.map(a=>a.p.remaining));for(const {p}of active)p.remaining=Math.max(0,p.remaining-step);for(const side of ['home','guest'])this.pen[side]=this.pen[side].filter(p=>p.remaining>1e-8);left-=step;}}
 tick(dt){if(!(dt>0))return;for(const side of ['home','guest'])if(this.goalSeconds[side]>0){this.goalSeconds[side]=Math.max(0,this.goalSeconds[side]-dt);if(!this.goalSeconds[side])this.goal[side]=false;}if(!this.running)return;
 if(this.view==='break'||this.view==='timeout'){const prop=this.view==='break'?'breakTime':'timeoutTime',old=this[prop];this[prop]=Math.max(0,old-dt);if(old>0&&this[prop]===0){this.running=false;this.horn();this.message='TIMER COMPLETE';}return;}
 const elapsed=Math.min(dt,this.down?this.time:Math.max(0,this.limit-this.time));this.time=Math.max(0,this.time+(this.down?-elapsed:elapsed));if(this.penRunning)this.queueTick(elapsed);const ended=this.down?this.time===0:this.time>=this.limit;
 if(this.interval>0){this.intervalElapsed+=elapsed;const crossed=this.intervalElapsed>=this.interval;this.intervalElapsed%=this.interval;if(crossed&&!ended)this.horn(1);}
 if(ended){this.running=false;if(this.autoHorn)this.horn();this.message='PERIOD COMPLETE';}
 }
}
class Nevco4Clock extends CanadianNevcoBase {
 constructor(length=900){super(length);this.profile='nevco4';this.hornSeconds=2;}
 key(k){if(k==='time'&&['score','shots'].includes(this.edit?.type))this.done();if(k==='rocker'){this.key(this.running?'hold':'run');return;}if(k===':'){this.digit(':');return;}if(k==='power'){this.running=false;this.field('startup');return;}
 if(k==='no'&&this.edit?.type==='bookmark'){this.field('code',0,9999999);return;}
 if(k==='no'&&this.edit?.type==='shotClock'){this.field('penTimeout');return;}
 if(k==='yes'&&this.edit?.type==='shotClock'){this.message='SHOT CLOCKS OUTSIDE THIS HOCKEY PROFILE · NO';return;}
 if(k==='yes'&&['main','penTime'].includes(this.edit?.type)){const e=this.edit,t=readColonTime(e.digits,{required:true,tenths:e.type==='main'});if(t===null||t>(e.type==='main'?5999.9:1199)||e.type==='penTime'&&t<=0){this.message='USE COLON · VALID MM:SS';return;}if(e.type==='main'){this.time=t;this.field('period',this.period,9);}else if(e.mode==='edit'){this.pen[e.side][e.slot].remaining=t;this.done('PENALTY EDITED');}else this.field('player',0,99,{side:e.side,slot:e.slot,mode:e.mode,remaining:t});return;}
 super.key(k);
 }
 digit(k){const e=this.edit;if(!e)return;if(['main','penTime'].includes(e.type)){if((/^\d$/.test(k)||k===':'&&!e.digits.includes(':'))&&e.digits.length<7)e.digits+=k;return;}if(e.type==='code'){if(e.digits.length<7)e.digits+=k;if(e.digits.length===7){if(e.digits==='0083261')this.field('shotClock');else this.message='USE MODEL CODE 0083261';}return;}
 if(e.type==='score'||e.type==='shots'){e.digits=(e.digits+k).slice(-2);const value=Number(e.digits);if(e.type==='score')this[e.side]=value;else this.shots[e.side]=value;this.message='SCORE SET · TIME RETURNS TO CLOCK';return;}
 super.digit(k);}
 reset(){super.reset();this.hornSeconds=2;}
}
class Nevco7Clock extends RinkFamilyClock {
 constructor(length=900){super('nevco7',length);this.hornSeconds=4;}
 reset(){super.reset();this.hornSeconds=4;}
 key(k){if(k==='set'){this.done('SET · SELECT FUNCTION');this.set=true;return;}if(k==='no'||k==='cancel'){if(this.edit?.type==='auto'){this.autoHorn=false;this.done('AUTO HORN OFF');}else this.done('ENTRY CANCELLED');return;}
 if(k==='run'||k==='hold'){this.run(k==='run');return;}if(k==='horn'){if(this.set)this.field('auto');else this.horn(.65);return;}if(k==='yes'||k==='enter'){this.enter();return;}
 if(/^\d$/.test(k)){const e=this.edit;if(!e)return;this.digit(k,e.type==='main'?5:e.type==='penTime'?3:e.type==='period'?1:2);if(e.type==='main'&&e.digits.length===5||e.type==='period'||e.type==='player'&&e.digits.length===2||['score','shots','saves'].includes(e.type)&&!e.setting||['score','shots','saves'].includes(e.type)&&e.digits.length===2||e.type==='penTime'&&e.digits.length===3)this.enter();return;}
 if(k==='time'){if(this.set){if(this.running){this.done('TIME OFF BEFORE SETTING');return;}this.field('main',this.time);}else{this.view='game';this.done();}return;}
 if(k==='period'){this.field('period',this.period);return;}
 if(k==='penToggle'){this.penRunning=!this.penRunning;this.done(this.penRunning?'PENALTY TIME ON':'PENALTY TIME OFF');return;}
 if(k==='chrono'){this.view='time';this.running=false;this.done('TIME OF DAY · TORONTO');return;}
 if(k==='timeout'){if(this.running){this.message='TIME OFF FIRST';return;}this.field('timeoutSelect');return;}
 if(k==='options'){this.done('HOCKEY · MINOR 2:00 · MAJOR 5:00 · PENALTY ON/OFF ENABLED');return;}
 if(k==='goal'){const side=this.lastSide||'home';this.goal[side]=!this.goal[side];this.done('GOAL LIGHT '+side.toUpperCase());return;}
 if(/^(score|shots|saves):/.test(k)){const [type,side]=k.split(':');this.lastSide=side;this.field(type,type==='score'?this[side]:this[type][side],{side,setting:this.set});return;}
 if(/^(minor|major):/.test(k)){const [kind,side]=k.split(':');if(this.pen[side].length>=26){this.message='TRAINER PENALTY CAPACITY';return;}this.field('player',0,{side,remaining:kind==='minor'?120:300,mode:'add'});return;}
 if(k.startsWith('view:')){const side=k.split(':')[1];if(!this.pen[side].length){this.done('NO PENALTIES');return;}const slot=this.edit?.type==='review'&&this.edit.side===side?(this.edit.slot+1)%this.pen[side].length:0;this.field('review',0,{side,slot});return;}
 if(['penClear','penEdit','penInsert'].includes(k)&&this.edit?.type==='review'){const e=this.edit;if(k==='penClear'){this.pen[e.side].splice(e.slot,1);this.done('PENALTY CLEARED');}else{const p=this.pen[e.side][e.slot];this.field('player',k==='penEdit'?p.player:0,{side:e.side,slot:e.slot,mode:k==='penEdit'?'edit':'insert',remaining:k==='penEdit'?p.remaining:120});}return;}
 }
 enter(){const e=this.edit;if(!e)return;const n=e.digits===''?e.value:Number(e.digits);if(e.type==='auto'){this.autoHorn=true;this.done('AUTO HORN ON');return;}
 if(e.type==='main'){const t=readMMSS(e.digits.padEnd(5,'0'),true);if(t===null){this.message='INVALID TIME · NO TO RETRY';return;}this.time=t;this.done('MAIN TIME SET');return;}
 if(e.type==='period'){this.period=n;this.done();return;}
 if(['score','shots','saves'].includes(e.type)){const value=Math.min(199,e.setting?n:e.value+n);if(e.type==='score'){this[e.side]=value;if(!e.setting){this.goal[e.side]=true;this.goalSeconds[e.side]=15;}}else this[e.type][e.side]=value;this.done();return;}
 if(e.type==='player'){if(n>99)return;this.field('penTime',e.remaining,{...e,type:'penTime',value:e.remaining,digits:'',player:n});return;}
 if(e.type==='penTime'){const text=e.digits.padEnd(3,'0'),t=e.digits?(Number(text.slice(1))>59?null:Number(text[0])*60+Number(text.slice(1))):e.value;if(t===null||t<=0){this.message='INVALID PENALTY TIME';return;}const p={player:e.player,remaining:t};if(e.mode==='edit')this.pen[e.side][e.slot]=p;else if(e.mode==='insert')this.pen[e.side].splice(e.slot,0,p);else this.pen[e.side].push(p);this.done('PENALTY ENTERED');return;}
 if(e.type==='timeoutSelect'){if(n!==1){this.message='TIMER 1 ONLY IN TRAINER';return;}this.view='timeout';this.timeoutTime=30;this.done('TIMEOUT 1 · PRESS TIME ON');return;}
 this.done();}
}
class FairPlayClock extends RinkFamilyClock {
 constructor(length=900){super('fairplay',length);this.hornSeconds=5;}
 reset(){super.reset();this.hornSeconds=5;this.shift=false;this.clockSelection=0;this.clockReset=this.periodLength;}
 key(k){if(k==='run'||k==='hold'){this.run(k==='run');return;}if(k==='horn'){this.horn(.65);return;}if(k==='auto'){this.autoHorn=!this.autoHorn;this.message='AUTO HORN '+(this.autoHorn?'ON':'OFF');return;}
 if(k==='cancel'){this.done('ENTRY CANCELLED');this.shift=false;return;}if(k==='clear'){if(this.edit?.type==='penSelect'){this.edit.digits='';this.edit.correct=true;this.message='PLAYER NUMBER TO CLEAR / EDIT';}else if(this.edit)this.edit.digits='';return;}
 if(k==='shift'){this.shift=!this.shift;this.message=this.shift?'SHIFT · SELECT FUNCTION':'HK · READY';return;}
 if(k==='new'){if(this.shift){this.field('new');this.shift=false;this.message='NEW GAME? YES / NO';}return;}
 if(k==='yes'&&this.edit?.type==='new'){this.reset();this.time=0;this.message='NEW GAME · SET CLOCK';return;}if(k==='no'){this.done('CANCELLED');this.shift=false;return;}
 if(k==='time'){if(this.shift){this.view='time';this.running=false;this.shift=false;this.done('TIME OF DAY');return;}if(this.running){this.message='TIME OUT BEFORE CLOCK SET';return;}const select=this.edit?.type==='main'?(this.edit.selection+1)%3:0;this.field('main',select===0?this.periodLength:select===1?900:300,{selection:select});this.message=['SET CLOCK MMSS','SET BREAK MMSS','SET OVERTIME MMSS'][select];return;}
 if(k==='enter'){this.enter();return;}if(/^\d$/.test(k)){this.digit(k,4);return;}
 if(['plus1','plus2','plus3','minus1'].includes(k)){const e=this.edit;if(!e)return;const amount={plus1:1,plus2:2,plus3:3,minus1:-1}[k];if(['score','shots','period'].includes(e.type)){const n=Math.max(0,Math.min(e.type==='period'?9:199,e.value+amount));if(e.type==='period')this.period=n;else if(e.type==='score'){this[e.side]=n;if(amount===1){this.goal[e.side]=true;this.goalSeconds[e.side]=15;}}else this.shots[e.side]=n;this.done();}else if(['penSelect','player'].includes(e.type)&&amount>0){const t={1:120,2:300,3:600}[amount];if(e.type==='player')e.remaining+=t;else this.field('player',0,{side:e.side,remaining:t});this.message='ENTER PLAYER NUMBER';}else if(e.type==='penSelect'&&amount===-1)this.message='OTHER PENALTY COMBINATIONS OUTSIDE THIS PROFILE';return;}
 if(/^(score|shots|goal|penalty):/.test(k)){const [type,side]=k.split(':');if(type==='goal'){this.goal[side]=!this.goal[side];this.done('GOAL LIGHT');}else if(type==='penalty'){this.field('penSelect',0,{side});this.message='PENALTY: +1=2m +2=5m +3=10m OR PLAYER TO EDIT';}else this.field(type,type==='score'?this[side]:this.shots[side],{side});return;}
 if(k==='period'){this.field('period',this.period);return;}
 }
 enter(){const e=this.edit;if(!e)return;const n=e.digits===''?e.value:Number(e.digits);if(e.type==='main'){const t=e.digits?readMMSS(e.digits):e.value;if(t===null){this.message='INVALID SECONDS · CLR';return;}this.view=e.selection===1?'break':'game';if(this.view==='break')this.breakTime=t;else{this.time=t;this.clockReset=t;}this.done('CLOCK SET');return;}
 if(['score','shots','period'].includes(e.type)){if(n>(e.type==='period'?9:199)){this.message='VALUE OUT OF RANGE';return;}if(e.type==='period')this.period=n;else if(e.type==='score')this[e.side]=n;else this.shots[e.side]=n;this.done();return;}
 if(e.type==='player'){if(!e.digits){this.done('NO PENALTY FOUND');return;}if(n>99||this.pen[e.side].length>=5){this.message='PENALTY CAPACITY / PLAYER RANGE';return;}this.pen[e.side].push({player:n,remaining:e.remaining});this.done('PENALTY ENTERED');return;}
 if(e.type==='penSelect'){const slot=this.pen[e.side].findIndex(p=>p.player===n);if(slot<0){this.done('NO PENALTY FOUND');return;}this.field('penCorrect',this.pen[e.side][slot].remaining,{side:e.side,slot});this.message='ENTER CANCELS · MMSS ENTER EDITS';return;}
 if(e.type==='penCorrect'){if(!e.digits)this.pen[e.side].splice(e.slot,1);else{const t=readMMSS(e.digits);if(t===null||t<=0){this.message='INVALID PENALTY TIME';return;}this.pen[e.side][e.slot].remaining=t;}this.done('PENALTY UPDATED');return;}
 this.done();}
}
class ScoretecClock extends RinkFamilyClock {
 constructor(length=900){super('scoretec',length);}
 reset(){super.reset();this.selected={home:0,guest:0};this.independentPen=false;this.intervalMode=null;}
 key(k){if(k==='run'||k==='hold'){this.run(k==='run');return;}if(k==='horn'){this.horn(.65);return;}if(k==='clear'||k==='cancel'){this.done('STAGING CLEARED');return;}if(k==='resetHeld'){if(!this.running)this.reset();return;}
 if(k==='penHeld'){if(this.running){this.message='STOP FIRST';return;}this.independentPen=!this.independentPen;this.penRunning=true;this.message='INDEPENDENT PENALTY '+(this.independentPen?'ENABLED':'DISABLED');return;}if(k==='penToggle'){if(this.independentPen)this.penRunning=!this.penRunning;else this.message='HOLD STOP/GO PENALTIES 5 SECONDS TO ENABLE';return;}
 if(k==='enter'||k==='plus'||k==='minus'){this.field('staging',0,{operation:k});return;}if(/^\d$/.test(k)||[':', '/'].includes(k)){if(this.edit?.type==='intervalSelect'&&/^\d$/.test(k)){this.intervalMode=Number(k);this.done('INTERVAL MODE '+k+' · ENTER DURATION');return;}this.digit(k,8);return;}
 if(k==='game'){this.view='game';this.done();return;}if(k==='tod'){this.view='time';this.running=false;this.done('TIME OF DAY');return;}if(k==='elapsed'){this.message='ELAPSED '+Math.floor((this.down?this.periodLength-this.time:this.time)/60)+':'+String(Math.floor((this.down?this.periodLength-this.time:this.time)%60)).padStart(2,'0');return;}
 if(k==='direction'){if(!this.running){this.down=!this.down;this.message=this.down?'DOWN COUNT':'UP COUNT · SET UPPER LIMIT';}return;}
 const e=this.edit,staged=e?.type==='staging',raw=staged?e.digits:'',op=staged?e.operation:'increment';
 if(k==='interval'){if(staged){const t=readColonTime(raw);if(t===null){this.message='INVALID TIME';return;}if(this.intervalMode===2){this.limit=t;this.time=0;}else{this.interval=t;this.intervalElapsed=0;}this.done('INTERVAL SETTINGS SAVED');}else this.field('intervalSelect');return;}
 if(k==='time'){if(this.running){this.message='STOP BEFORE CLOCK SET';return;}if(!staged){this.message='ENTER → TIME → CLOCK SET';return;}const t=readColonTime(raw);if(t===null){this.message='INVALID TIME';return;}this.time=t;this.periodLength=t;this.limit=t;this.view='game';this.intervalElapsed=0;this.done('GAME CLOCK SET');return;}
 if(k==='intermission'){if(this.view==='break'){this.view='game';this.running=false;this.done('GAME MODE');return;}if(this.running){this.message='STOP GAME FIRST';return;}const t=staged?readColonTime(raw):900;if(t===null){this.message='INVALID TIME';return;}this.breakTime=t;this.view='break';this.done('INTERMISSION RUNNING');this.running=true;return;}
 if(k==='period'||/^(score|shots):/.test(k)){const [type,side]=k.split(':'),old=k==='period'?this.period:type==='score'?this[side]:this.shots[side],value=staged?Number(raw):1;if(!/^\d*$/.test(raw)||!Number.isFinite(value)){this.message='INVALID VALUE';return;}const n=op==='enter'?value:op==='minus'?old-value:old+value;if(n<0||n>(k==='period'?9:99)){this.message='VALUE OUT OF RANGE';return;}if(k==='period')this.period=n;else if(type==='score')this[side]=n;else this.shots[side]=n;this.done();return;}
 if(k.startsWith('penalty:')){const side=k.split(':')[1];if(this.running&&!this.independentPen){this.message='STOP BEFORE PENALTY ENTRY';return;}if(!staged){this.selected[side]=(this.selected[side]+1)%5;this.message=side.toUpperCase()+' PEN '+(this.selected[side]+1);return;}const [time,player='0']=raw.split('/'),t=readColonTime(time);if(t===null||!/^\d{1,2}$/.test(player)){this.message='USE TIME / PLAYER';return;}const slot=Math.min(this.selected[side],this.pen[side].length);if(t===0)this.pen[side].splice(slot,1);else{const p={player:Number(player),remaining:t};if(slot<this.pen[side].length)this.pen[side][slot]=p;else if(slot<5)this.pen[side].push(p);}this.done('PENALTY SAVED');return;}
 }
}
class HarrisClock extends RinkFamilyClock {
 constructor(length=900){super('harris',length);}
 reset(){super.reset();this.hornSeconds=3;this.periodLength=this.time;}
 key(k){if(k==='toggle'){this.run(!this.running);return;}if(k==='clear'||k==='cancel'){this.done('ENTRY CLEARED');return;}if(k==='timeoff'){this.message='TIME OFF: '+Math.floor(this.time/60)+':'+String(Math.floor(this.time%60)).padStart(2,'0');return;}
 if(/^\d$/.test(k)){this.digit(k,4);return;}if(k==='enter'){this.enter();return;}
 if(['time','period','intermission','horn','score:home','score:guest','penalty:home','penalty:guest','indicator:home','indicator:guest'].includes(k)){this.field(k);this.message=k==='horn'?'HORN 0 # · INTERVAL 2 OR 3 #':k.startsWith('penalty')?'PENALTY SLOT 1–5 · #':k.toUpperCase()+' · VALUE THEN #';return;}
 }
 enter(){const e=this.edit;if(!e)return;const n=Number(e.digits);if(!e.digits){this.message='ENTER A VALUE BEFORE #';return;}
 if(e.type==='time'||e.type==='intermission'){const t=readMMSS(e.digits);if(t===null||t>1200||this.running){this.message='STOP FIRST · TIME RANGE 0–20:00';return;}if(e.type==='time'){this.time=t;this.periodLength=t;this.intervalElapsed=0;this.view='game';}else{this.breakTime=t;this.view='break';}this.done();return;}
 if(e.type==='period'){if(n>4){this.message='PERIOD 0–4';return;}this.period=n;this.interval=0;this.intervalElapsed=0;this.done();return;}
 if(e.type.startsWith('score:')){if(n>99)return;this[e.type.split(':')[1]]=n;this.done();return;}
 if(e.type.startsWith('indicator:')){if(n===99){this.view='time';this.running=false;this.done('TIME OF DAY');}else this.done('INDICATOR OPTIONS OUTSIDE THIS PROFILE');return;}
 if(e.type==='horn'){if(n===0){this.horn(.65);this.done('MANUAL HORN');}else if([2,3].includes(n)){this.interval=n*60;this.intervalElapsed=0;this.done('REPEATING HORN '+n+' MIN · REENTER EACH PERIOD');}else this.message='USE 0, 2 OR 3';return;}
 if(e.type.startsWith('penalty:')){if(n<1||n>5){this.message='SLOT 1–5';return;}this.field('penTime',0,{side:e.type.split(':')[1],slot:n-1});this.message='PENALTY MMSS · #';return;}
 if(e.type==='penTime'){const t=readMMSS(e.digits);if(t===null||t>600){this.message='PENALTY 0–10:00';return;}const a=this.pen[e.side];if(!t){a.splice(e.slot,1);}else{if(e.slot>a.length){this.message='FILL NEXT AVAILABLE PENALTY SLOT';return;}a[e.slot]={player:e.slot+1,remaining:t};}this.done('PENALTY UPDATED');return;}
 }
}
class RotomaticClock extends RinkFamilyClock {
 constructor(length=900){super('rotomatic',length);}
 static formatTime(t){const seconds=Math.floor(Math.max(0,t));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
 loadPracticePeriod(length=this.periodLength){this.periodLength=length;this.reset();this.time=length;this.message='PRACTICE TIME LOADED · MAIN TIME ON, THEN MAIN START';}
 reset(){super.reset();this.time=0;this.mainSwitch=false;this.mainArmed=false;this.penSwitch=true;this.penArmed={home:[false,false],guest:[false,false]};this.pen={home:[],guest:[]};this.hornSeconds=5;this.repeatEnabled=false;this.repeatMinutes=2;this.autoHorn=true;}
 key(k){if(k==='mainToggle'){this.mainSwitch=!this.mainSwitch;this.running=this.mainSwitch&&this.mainArmed&&this.time>0;this.message='MAIN TIME '+(this.mainSwitch?'ON':'OFF');return;}if(k==='penToggle'){this.penSwitch=!this.penSwitch;this.penRunning=this.penSwitch;return;}
 if(k==='start'){this.mainArmed=true;this.running=this.mainSwitch&&this.time>0;this.message=this.time<=0?'SET TIME WITH MAIN MINUTE ADVANCE FIRST':!this.mainSwitch?'START ARMED · SWITCH MAIN TIME ON':'MAIN TIMER RUNNING';return;}if(k==='minute'){if(this.running){this.message='MAIN TIME OFF BEFORE ADVANCING';return;}this.time=(Math.floor(this.time/60)+1)%100*60;this.periodLength=this.time;return;}if(k==='timeReset'){this.time=0;this.running=false;this.mainArmed=false;this.horn(5);return;}
 if(k==='period'){this.period=(this.period+1)%5;return;}if(k==='horn'){this.horn(.65);return;}if(k==='auto'){this.repeatEnabled=!this.repeatEnabled;this.interval=this.repeatEnabled?this.repeatMinutes*60:0;this.intervalElapsed=0;this.message='INTERVAL HORN '+(this.repeatEnabled?'ON':'OFF')+' · END HORN ALWAYS ON';return;}if(k==='intervalSelect'){this.repeatMinutes=this.repeatMinutes===2?3:2;this.interval=this.repeatEnabled?this.repeatMinutes*60:0;return;}
 if(k.startsWith('score:')){const [,side,place]=k.split(':'),old=this[side],tens=Math.floor(old/10),units=old%10;this[side]=place==='tens'?((tens+1)%10)*10+units:tens*10+(units+1)%10;return;}
 if(k.startsWith('pen:')){const [,side,slotText,operation]=k.split(':'),slot=Number(slotText),p=this.pen[side][slot]||{player:slot+1,remaining:0};if(operation==='minute'){p.remaining=(Math.floor(p.remaining/60)+1)%11*60;this.pen[side][slot]=p;}if(operation==='start')this.penArmed[side][slot]=true;if(operation==='reset'){this.pen[side][slot]=null;this.penArmed[side][slot]=false;}return;}
 }
 queueTick(dt){for(const side of ['home','guest'])for(const [slot,p]of this.pen[side].entries())if(p&&this.penArmed[side][slot]){p.remaining=Math.max(0,p.remaining-dt);if(!p.remaining){this.pen[side][slot]=null;this.penArmed[side][slot]=false;}}}
}
const CanadianClocks={nevco4:Nevco4Clock,nevco7:Nevco7Clock,fairplay:FairPlayClock,scoretec:ScoretecClock,harris:HarrisClock,rotomatic:RotomaticClock};
if(typeof module!=='undefined')module.exports={CanadianClocks,readColonTime,readMMSS};
