/* Hamilton quick-start training state machine. No browser dependencies. */
class HamiltonClock {
  constructor(periodLength=900){this.periodLength=periodLength;this.reset();}
  reset(){this.time=this.periodLength;this.limit=this.periodLength;this.down=true;this.period=1;this.home=0;this.guest=0;this.pen={home:[],guest:[]};this.names={home:'HOME',guest:'GUEST'};this.savedNames={...this.names};this.running=false;this.penRunning=true;this.view='game';this.breakTime=180;this.edit=null;this.recall=false;this.message='GAME TIMER · HOLD';this.events=[];}
  event(type){this.events.push(type);}
  done(message='GAME TIMER · HOLD'){this.edit=null;this.recall=false;this.message=message;}
  field(type,value,max=99,extra={}){this.edit={type,value,digits:'',max,...extra};this.message=this.label(type);}
  label(t){return {new:'NEW GAME · PRESS CLEAR',direction:'TIMER DIRECTION · 0 UP / 1 DOWN',period:'PERIOD #',minutes:'PERIOD MINUTES',seconds:'PERIOD SECONDS',hundredths:'PERIOD HUNDREDTHS',setMinutes:'GAME TIMER MINUTES',setSeconds:'GAME TIMER SECONDS',setHundredths:'GAME TIMER HUNDREDTHS',breakMinutes:'INTERMISSION MINUTES',breakSeconds:'INTERMISSION SECONDS',score:'CORRECT SCORE',kind:'ENTER = NORMAL · ALT PEN = OTHER',player:'PLAYER NUMBER',penMinutes:'PENALTY MINUTES',penSeconds:'PENALTY SECONDS',penRecall:'PENALTY LINE · + / − SELECT · CLEAR TO REMOVE',name:'TEAM NAME · DIGIT CYCLES · + NEXT · − BACK'}[t]||t;}
  invalid(message){this.message=message;}
  key(key){
    if(key==='cancel'){this.done('ENTRY CANCELLED');return;}
    if(key==='recall'){if(this.edit){this.invalid('FINISH ENTRY OR ESC TO CANCEL');return;}this.recall=!this.recall;this.message=this.recall?'RECALL · SELECT A FUNCTION':'GAME TIMER · HOLD';return;}
    if(key==='hold'){this.running=false;this.event('hold');if(!this.edit)this.message='GAME TIMER · HOLD';return;}
    if(key==='run'){if(this.edit||this.recall){this.invalid('COMPLETE ENTRY BEFORE RUN');return;}if(this.view==='time'){this.invalid('RECALL → SET TIMER TO RETURN');return;}if(this.view==='game'&&(this.down?this.time<=0:this.time>=this.limit)){this.invalid('SET TIMER BEFORE RUN');return;}this.running=true;this.message=this.view==='break'?'INTERMISSION · RUN':'GAME TIMER · RUN';this.event('run');return;}
    if(/^\d$/.test(key)){this.digit(key);return;}
    if(key==='clear'){if(this.edit?.type==='new'){this.running=false;this.field('direction',1,1);return;}if(this.edit?.type==='penRecall'){this.edit.remove=true;this.message='REMOVE SELECTED PENALTY? ENTER';return;}if(this.edit?.type==='name'){this.edit.chars=[' '];this.edit.pos=0;return;}if(this.edit)this.edit.digits='';else this.done();return;}
    if(key==='enter'){this.enter();return;}
    if(key==='+'||key==='-'){const e=this.edit;if(e?.type==='name'){e.pos=Math.max(0,Math.min(11,e.pos+(key==='+'?1:-1)));e.chars[e.pos]??=' ';e.lastKey=null;}else if(e?.type==='penRecall'){e.slot=(e.slot+(key==='+'?1:-1)+this.pen[e.side].length)%this.pen[e.side].length;e.remove=false;}return;}
    if(key==='alt'){if(this.edit?.type==='kind'){this.edit.kind=this.edit.kind==='delayed'?'misconduct':this.edit.kind==='misconduct'?'normal':'delayed';this.message='PENALTY TYPE · '+this.edit.kind.toUpperCase();}else this.invalid('SELECT PENALTY FIRST');return;}
    if(key==='penrun'||key==='penhold'){this.penRunning=key==='penrun';this.event(key);this.message=this.penRunning?'PENALTIES RUN':'PENALTIES HOLD';return;}
    if(this.edit){this.invalid('FINISH ENTRY OR ESC TO CANCEL');return;}
    const recalled=this.recall;this.recall=false;
    if(key==='new'){this.field('new',0);return;}
    if(key==='time'){if(recalled){this.view='time';this.running=false;this.message='TIME OF DAY · TORONTO';this.event('time');}else this.invalid('PRESS RECALL FIRST');return;}
    if(key==='set'&&recalled){this.view='game';this.message='GAME TIMER · HOLD';this.event('return');return;}
    if(key.startsWith('score:')){const side=key.split(':')[1];if(recalled)this.field('score',this[side],99,{side});else{this[side]=Math.min(99,this[side]+1);this.event('score');this.message=side.toUpperCase()+' SCORE '+this[side];}return;}
    if(key.startsWith('name:')){const side=key.split(':')[1];if(recalled){this.names[side]=this.savedNames[side];this.event('name');this.message='TEAM NAME RESTORED';}else this.field('name',0,99,{side,chars:[' '],pos:0,lastKey:null,index:0});return;}
    if(this.running){this.invalid('HOLD GAME TIMER FIRST');return;}
    if(key==='set'){this.view='game';this.field('setMinutes',Math.floor(this.time/60),99,{working:Math.floor(this.time/60)*60});return;}
    if(key==='period'){this.field('period',Math.min(9,this.period+1),9,{newGame:false});return;}
    if(key==='intermission'){if(recalled){this.field('breakMinutes',Math.floor(this.breakTime/60),99,{working:0});}else{this.view='break';if(this.breakTime===0)this.breakTime=180;this.message='INTERMISSION · HOLD';this.event('break');}return;}
    if(key.startsWith('penalty:')){const side=key.split(':')[1];if(recalled){if(!this.pen[side].length){this.invalid('NO PENALTIES FOR '+side.toUpperCase());return;}this.field('penRecall',0,2,{side,slot:0,remove:false});}else{if(this.pen[side].length>=2){this.invalid('TWO LINES FULL · NO QUEUE IN TRAINER');return;}this.field('kind',0,0,{side,kind:'normal'});}return;}
  }
  digit(n){const e=this.edit;if(!e)return;if(e.type==='direction'){this.down=n==='1';if(n!=='0'&&n!=='1'){this.invalid('USE 0 OR 1');return;}this.field('period',1,9,{newGame:true});return;}if(e.type==='name'){const map=[' ','ABC','DEF','GHI','JKL','MNO','PQR','STU','VWX','YZ'];if(e.lastKey===n)e.index=(e.index+1)%map[Number(n)].length;else{e.index=0;e.lastKey=n;}e.chars[e.pos]=map[Number(n)][e.index];return;}if(['kind','new','penRecall'].includes(e.type))return;if(e.digits.length<2)e.digits+=n;}
  enter(){const e=this.edit;if(!e)return;const value=e.digits===''?e.value:Number(e.digits);if(value>e.max||value<0){this.invalid('VALUE OUT OF RANGE · CLEAR & RETRY');return;}
    switch(e.type){
      case 'new':this.invalid('PRESS CLEAR TO BEGIN NEW GAME');break;
      case 'direction':this.digit(String(value));break;
      case 'period':if(value<1){this.invalid('PERIOD MUST BE 1–9');return;}this.field('minutes',Math.floor(this.periodLength/60),99,{newGame:e.newGame,pendingPeriod:value});break;
      case 'minutes':this.field('seconds',this.periodLength%60,59,{...e,type:'seconds',value:this.periodLength%60,digits:'',max:59,working:value*60});break;
      case 'seconds':this.field('hundredths',0,99,{newGame:e.newGame,pendingPeriod:e.pendingPeriod,working:e.working+value});break;
      case 'hundredths':{const names={...this.names},down=this.down;if(e.newGame){this.reset();this.down=down;this.names=names;this.savedNames={...names};}this.period=e.pendingPeriod;this.periodLength=e.working+value/100;this.limit=this.periodLength;this.time=this.down?this.periodLength:0;this.view='game';this.done();this.event(e.newGame?'newgame':'period');break;}
      case 'setMinutes':this.field('setSeconds',Math.floor(this.time%60),59,{working:value*60});break;
      case 'setSeconds':this.field('setHundredths',Math.round((this.time%1)*100)%100,99,{working:e.working+value});break;
      case 'setHundredths':this.time=e.working+value/100;this.done();this.event('set');break;
      case 'breakMinutes':this.field('breakSeconds',Math.floor(this.breakTime%60),59,{working:value*60});break;
      case 'breakSeconds':this.breakTime=e.working+value;this.view=this.breakTime===0?'game':'break';this.done(this.view==='game'?'GAME TIMER · HOLD':'INTERMISSION · HOLD');this.event(this.view==='game'?'breakend':'breakset');break;
      case 'score':this[e.side]=value;this.done();this.event('correction');break;
      case 'kind':this.field('player',0,99,{side:e.side,kind:e.kind});break;
      case 'player':this.field('penMinutes',2,99,{side:e.side,kind:e.kind,player:value});break;
      case 'penMinutes':this.field('penSeconds',0,59,{side:e.side,kind:e.kind,player:e.player,working:value*60});break;
      case 'penSeconds':if(e.working+value===0){this.invalid('PENALTY MUST BE GREATER THAN ZERO');return;}this.pen[e.side].push({player:e.player,remaining:e.working+value,kind:e.kind});this.done(e.kind==='normal'?'PENALTY ENTERED':'HELD PENALTY PREVIEW · SEE LIMITS');this.event('penalty');break;
      case 'penRecall':if(e.remove){this.pen[e.side].splice(e.slot,1);this.event('delete');}this.done();break;
      case 'name':this.names[e.side]=e.chars.join('').trim()||e.side.toUpperCase();this.savedNames[e.side]=this.names[e.side];this.done();this.event('name');break;
    }
  }
  tick(dt){if(!this.running)return;if(this.view==='break'){this.breakTime=Math.max(0,this.breakTime-dt);if(this.breakTime===0){this.running=false;this.view='game';this.event('horn');this.event('breakend');}return;}if(this.view!=='game')return;const elapsed=Math.min(dt,this.down?this.time:Math.max(0,this.limit-this.time));this.time+=this.down?-elapsed:elapsed;if(this.penRunning)for(const side of ['home','guest'])this.pen[side]=this.pen[side].filter(p=>{if(p.kind!=='normal')return true;p.remaining=Math.max(0,p.remaining-elapsed);if(p.remaining===0)this.event('expired');return p.remaining>0;});if(this.down?this.time<=0:this.time>=this.limit){this.running=false;this.event('horn');this.event('end');}}
}
if(typeof module!=='undefined')module.exports=HamiltonClock;
