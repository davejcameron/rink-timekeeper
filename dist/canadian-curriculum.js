/* Source-specific, restartable practice tasks for six additional Canadian families. */
function buildCanadianCurriculum(profile){
 const out=[];const add=(group,id,title,text,task,solution,predicate,setup=()=>{})=>out.push({group,id,title,text,task,solution,setup,check:(s,e,h)=>e!=='initial'&&predicate(s.model,e,h,s)});
 const at=(token,pred)=>(m,e)=>e==='key:'+token&&pred(m),done=pred=>(m,e)=>e.startsWith('key:')&&!m.edit&&pred(m),pen=(n,t=120)=>({player:n,remaining:t});
 const n4=profile==='nevco4',n7=profile==='nevco7',fair=profile==='fairplay',score=profile==='scoretec',harris=profile==='harris',roto=profile==='rotomatic';
 if(n4||n7){
  if(n4)add('Clock & startup','startup','Start the MPC-4 hockey profile','008-3261 identifies the hockey configuration; K2-28 is the overlay. This trainer uses no shot clocks.','Power cycle → NO → NO → 0083261 → NO → NO',['power','no','no','0','0','8','3','2','6','1','no','no'],done(m=>m.time===0&&!m.penaltyTimeout));
  add('Clock & startup','time','Set the game clock',n4?'A colon is mandatory. YES then prompts for the period.':'Five MMSSs digits commit automatically. PERIOD is a separate key.',n4?'SET → TIME → 15:00 → YES → 1':'SET → TIME → 15000 → PERIOD → 1',n4?['set','time','1','5',':','0','0','yes','1']:['set','time','1','5','0','0','0','period','1'],done(m=>m.time===900&&m.period===1),s=>{s.model.time=600;});
  add('Clock & startup','fraction','Set tenths of a second','Set 45.3 seconds while stopped.',n4?'SET → TIME → :453 → YES → 1':'SET → TIME → 00453',n4?['set','time',':','4','5','3','yes','1']:['set','time','0','0','4','5','3'],done(m=>m.time===45.3));
  add('Clock & startup','run-stop','Run and stop the main timer',n4?'The alternate toggle works with no handheld connected.':'TIME ON and TIME OFF operate this wired training configuration.',n4?'Alternate time switch ON → wait → OFF':'TIME ON → wait → TIME OFF',n4?['rocker','tick:1','rocker']:['run','tick:1','hold'],at(n4?'rocker':'hold',m=>!m.running&&m.time<900));
  add('Clock & startup','cancel','Cancel a time entry','NO cancels uncommitted time digits.', 'SET → TIME → 9 → NO',['set','time','9','no'],at('no',m=>m.time===900&&!m.edit));
  if(n7)add('Clock & startup','period','Change the period','MPCW-7 has a dedicated PERIOD key.','PERIOD → 2',['period','2'],done(m=>m.period===2));
  for(const side of ['home','guest']){
   add('Scores & statistics','goal-'+side,'Add a '+side+' goal','SCORE followed by a single digit adds that amount.',side.toUpperCase()+' SCORE → 1',['score:'+side,'1'],(m,e)=>e==='key:1'&&m[side]===1);
   add('Scores & statistics','correct-'+side,'Correct the '+side+' total','SET changes the total rather than adding.', 'SET → '+side.toUpperCase()+' SCORE → 2'+(n4?' → TIME':' → YES'),['set','score:'+side,'2',n4?'time':'yes'],done(m=>m[side]===2),s=>{s.model[side]=3;});
   add('Scores & statistics','shots-'+side,'Record a '+side+' shot','SHOTS adds the entered amount.',side.toUpperCase()+' SHOTS → 1',['shots:'+side,'1'],done(m=>m.shots[side]===1));
   if(n7)add('Scores & statistics','saves-'+side,'Record a '+side+' save','GOAL SAVES is independent of the goal score.',side.toUpperCase()+' GOAL SAVES → 1',['saves:'+side,'1'],done(m=>m.saves[side]===1));
   else add('Scores & statistics','light-'+side,'Toggle the '+side+' goal light','GOAL controls an indicator, not a score.',side.toUpperCase()+' GOAL',['goal:'+side],done(m=>m.goal[side]&&m[side]===0));
   add('Penalties','minor-'+side,'Enter a '+side+' minor',n4?'Enter penalty time before the two-digit player number.':'NEW MINOR asks for a two-digit player number, then YES accepts the two-minute preset.',n4?'SET → '+side.toUpperCase()+' PNLTY → 2:00 → YES → 12':side.toUpperCase()+' NEW MINOR → 12 → YES',n4?['set','penalty:'+side,'2',':','0','0','yes','1','2']:['minor:'+side,'1','2','yes'],done(m=>m.pen[side][0]?.player===12&&m.pen[side][0].remaining===120));
   if(n7)add('Penalties','major-'+side,'Enter a '+side+' major','NEW MAJOR uses the five-minute preset.',side.toUpperCase()+' NEW MAJOR → 22 → YES',['major:'+side,'2','2','yes'],done(m=>m.pen[side][0]?.remaining===300));
   add('Penalties','remove-'+side,'Remove a '+side+' penalty',n4?'Review a penalty, then confirm CLEAR.':'VIEW selects the penalty; CLEAR removes it immediately.',n4?side.toUpperCase()+' PNLTY → PNLTY CLEAR → YES':side.toUpperCase()+' VIEW PENALTY → CLEAR PENALTY',n4?['penalty:'+side,'penClear','yes']:['view:'+side,'penClear'],done(m=>m.pen[side].length===0),s=>{s.model.pen[side]=[pen(12)];});
  }
  add('Penalties','edit','Correct a penalty time','Select the prepared penalty before editing.',n4?'HOME PNLTY → PNLTY EDIT → YES → 1:00 → YES':'HOME VIEW → EDIT PENALTY → YES → 100',n4?['penalty:home','penEdit','yes','1',':','0','0','yes']:['view:home','penEdit','yes','1','0','0'],done(m=>m.pen.home[0]?.remaining===60),s=>{s.model.pen.home=[pen(12)];});
  add('Penalties','insert','Insert a missed penalty','Insert ahead of the selected penalty.',n4?'HOME PNLTY → INSERT → YES → 2:00 → YES → 22':'HOME VIEW → INSERT PENALTY → 22 → YES',n4?['penalty:home','penInsert','yes','2',':','0','0','yes','2','2']:['view:home','penInsert','2','2','yes'],done(m=>m.pen.home[0]?.player===22&&m.pen.home[1]?.player===12),s=>{s.model.pen.home=[pen(12)];});
  add('Penalties','freeze','Freeze penalty timing','Penalty time out is enabled for this lesson.',n4?'PNLTY ON/OFF → alternate switch ON → wait':'PENALTY ON/OFF → TIME ON → wait',['penToggle',n4?'rocker':'run','tick:1'],(m,e)=>e==='tick'&&m.time<900&&m.pen.home[0]?.remaining===120,s=>{s.model.pen.home=[pen(12)];s.model.penaltyTimeout=true;});
  add('Sound & timers','auto-off','Turn off the end horn','Auto horn is independent of the browser sound switch.','SET → HORN → NO',['set','horn','no'],done(m=>!m.autoHorn));
  add('Sound & timers','auto-on','Enable the end horn','Restore automatic period-end signalling.','SET → HORN → YES',['set','horn','yes'],done(m=>m.autoHorn),s=>{s.model.autoHorn=false;});
  if(n4){
   add('Sound & timers','remote','Connect the handheld switch','With the handheld connected, the alternate panel toggle is inactive.','Remote controls → Connect accessory → Alternate switch → CLOCK ON',['remote','rocker','remoteRun'],(m,e)=>e==='key:remoteRun'&&m.remote&&m.running);
   add('Sound & timers','timeout','Start timeout timer 0','This profile configures one 30-second timeout timer.','TIME OUT TIMER → 0',['timeoutStart','0'],done(m=>m.view==='timeout'&&m.timeoutTime===30));
  }else{
   add('Sound & timers','timeout','Select timeout timer 1','The trainer configures timer 1 to 30 seconds.','TIME OFF → TIME OUT TIMER → 1 → YES → TIME ON',['hold','timeout','1','yes','run'],at('run',m=>m.view==='timeout'&&m.running&&m.timeoutTime===30));
   add('Sound & timers','goal-light','Toggle the goal indicator','The light follows the last selected team.','HOME SCORE → 1 → GOAL',['score:home','1','goal'],done(m=>!m.goal.home&&m.home===1));
   add('Sound & timers','configuration','Review the training configuration','Options are shown without changing installation hardware settings.','OPTIONS',['options'],at('options',m=>m.message.includes('MINOR')));
  }
  add('Sound & timers','tod','View time of day','Display Toronto local time; return using TIME.',n4?'CLOCK MODES (chronometer)':'TIME OF DAY',['chrono'],at('chrono',m=>m.view==='time'));
 }
 if(fair){
  add('Clock basics','time','Set the game clock','CLOCK SET cycles game, break and overtime. ENTER commits MMSS.','CLOCK SET → 1500 → ENTER',['time','1','5','0','0','enter'],done(m=>m.time===900),s=>{s.model.time=600;});
  add('Clock basics','run-stop','Operate the TIME IN switch','Set TIME IN to ON at puck drop and OFF on the whistle.','TIME IN ON → wait → OFF',['run','tick:1','hold'],at('hold',m=>!m.running&&m.time<900));
  add('Clock basics','period','Advance the period','PERIOD selects the field, +1 changes it.','PERIOD → +1',['period','plus1'],done(m=>m.period===2));
  add('Clock basics','break','Load a break period','The second CLOCK SET press selects break time; penalties freeze in a break.','CLOCK SET twice → 100 → ENTER → TIME IN ON',['time','time','1','0','0','enter','run'],at('run',m=>m.view==='break'&&m.breakTime===60&&m.running));
  add('Clock basics','overtime','Load an overtime clock','The third CLOCK SET press selects overtime.','CLOCK SET three times → 500 → ENTER',['time','time','time','5','0','0','enter'],done(m=>m.view==='game'&&m.time===300));
  add('Clock basics','cancel','Cancel an unfinished entry','ESC leaves the original time unchanged.','CLOCK SET → 9 → ESC',['time','9','cancel'],done(m=>m.time===900));
  for(const side of ['home','guest']){
   add('Scores & shots','goal-'+side,'Add a '+side+' goal','SCORE then +1 adds a goal and lights the configured goal indicator for 15 seconds.',side.toUpperCase()+' SCORE → +1',['score:'+side,'plus1'],done(m=>m[side]===1&&m.goal[side]));
   add('Scores & shots','correct-'+side,'Correct the '+side+' score','A number followed by ENTER replaces the total.',side.toUpperCase()+' SCORE → 2 → ENTER',['score:'+side,'2','enter'],done(m=>m[side]===2),s=>{s.model[side]=3;});
   add('Scores & shots','subtract-'+side,'Remove an extra '+side+' goal','The -1 key subtracts from the selected field.',side.toUpperCase()+' SCORE → -1',['score:'+side,'minus1'],done(m=>m[side]===1),s=>{s.model[side]=2;});
   add('Scores & shots','shots-'+side,'Record '+side+' shots','S.O.G. uses the same numeric and increment controls as score.',side.toUpperCase()+' S.O.G. → +2 → '+side.toUpperCase()+' S.O.G. → +3',['shots:'+side,'plus2','shots:'+side,'plus3'],done(m=>m.shots[side]===5));
   add('Scores & shots','light-'+side,'Toggle the '+side+' goal indicator','GOAL changes the lamp without changing the score.',side.toUpperCase()+' GOAL',['goal:'+side],done(m=>m.goal[side]&&m[side]===0));
   add('Penalties','minor-'+side,'Enter a '+side+' minor','The default hockey presets are +1=2 minutes, +2=5 minutes and +3=10 minutes.',side.toUpperCase()+' PENALTY → +1 → 12 → ENTER',['penalty:'+side,'plus1','1','2','enter'],done(m=>m.pen[side][0]?.player===12&&m.pen[side][0].remaining===120));
   add('Penalties','cancel-'+side,'Cancel a '+side+' penalty','Look up the jersey, then ENTER again cancels its penalty.',side.toUpperCase()+' PENALTY → 12 → ENTER → ENTER',['penalty:'+side,'1','2','enter','enter'],done(m=>m.pen[side].length===0),s=>{s.model.pen[side]=[pen(12)];});
  }
  add('Penalties','major','Enter a five-minute penalty','+2 selects five minutes in this fixed hockey configuration.','HOME PENALTY → +2 → 22 → ENTER',['penalty:home','plus2','2','2','enter'],done(m=>m.pen.home[0]?.remaining===300));
  add('Penalties','ten','Enter a ten-minute timed penalty','This practice configuration uses timed penalties, without optional misconduct indicator spots.','HOME PENALTY → +3 → 33 → ENTER',['penalty:home','plus3','3','3','enter'],done(m=>m.pen.home[0]?.remaining===600));
  add('Penalties','edit','Correct remaining penalty time','CLR selects the player correction workflow.','HOME PENALTY → CLR → 12 → ENTER → 130 → ENTER',['penalty:home','clear','1','2','enter','1','3','0','enter'],done(m=>m.pen.home[0]?.remaining===90),s=>{s.model.pen.home=[pen(12)];});
  add('Sound & setup','auto','Toggle automatic end horn','The indicator shows whether the five-second period-end horn is enabled.','AUTO HORN',['auto'],at('auto',m=>!m.autoHorn));
  add('Sound & setup','new','Start a new game','SHIFT exposes the secondary NEW GAME function.','SHIFT → NEW GAME → YES',['shift','new','yes'],done(m=>m.home===0&&m.time===0),s=>{s.model.home=4;});
  add('Sound & setup','cancel-new','Cancel a new-game request','NO dismisses the request without clearing the current game.','SHIFT → NEW GAME → NO',['shift','new','no'],done(m=>m.home===3),s=>{s.model.home=3;});
  add('Sound & setup','tod','View time of day','SHIFT selects the secondary time-of-day function.','SHIFT → T.O.D.',['shift','time'],done(m=>m.view==='time'));
 }
 if(score){
  add('Clock basics','time','Set a period length','ENTER comes before the value; CLOCK SET commits it. A bare number means minutes.','GAME MODE → ENTER → 15 → CLOCK SET',['game','enter','1','5','time'],done(m=>m.time===900),s=>{s.model.time=600;});
  add('Clock basics','seconds','Set minutes and seconds','Use the colon when the time is not whole minutes.','ENTER → 1:30 → CLOCK SET',['enter','1',':','3','0','time'],done(m=>m.time===90));
  add('Clock basics','run-stop','Run and stop game time','Use the separate RUN and STOP buttons.','RUN → wait → STOP',['run','tick:1','hold'],at('hold',m=>!m.running&&m.time<900));
  add('Clock basics','period','Set the period','ENTER precedes the new period value.','ENTER → 2 → PERIOD',['enter','2','period'],done(m=>m.period===2));
  add('Clock basics','clear','Clear a staging error','CLEAR discards staged digits before they reach the clock.','ENTER → 99 → CLEAR',['enter','9','9','clear'],done(m=>m.time===900));
  add('Clock basics','elapsed','Read elapsed game time','TIME ELAPSED changes the control message while the scoreboard keeps remaining time.','TIME ELAPSED',['elapsed'],at('elapsed',m=>m.message.startsWith('ELAPSED')));
  for(const side of ['home','guest']){
   add('Scores & statistics','goal-'+side,'Add a '+side+' goal','A SCORE function on its own increments by one.',side.toUpperCase()+' SCORE',['score:'+side],done(m=>m[side]===1));
   add('Scores & statistics','correct-'+side,'Set the '+side+' total','ENTER and digits come before SCORE.', 'ENTER → 2 → '+side.toUpperCase()+' SCORE',['enter','2','score:'+side],done(m=>m[side]===2),s=>{s.model[side]=4;});
   add('Scores & statistics','shots-'+side,'Add a '+side+' shot','SHOTS advances by one in this SOG-capable profile.',side.toUpperCase()+' SHOTS',['shots:'+side],done(m=>m.shots[side]===1));
   add('Penalties','minor-'+side,'Enter a '+side+' minor for #12','Use / to separate the duration from the player number.', 'ENTER → 2/12 → '+side.toUpperCase()+' PENALTY',['enter','2','/','1','2','penalty:'+side],done(m=>m.pen[side][0]?.player===12&&m.pen[side][0].remaining===120));
   add('Penalties','cancel-'+side,'Cancel a '+side+' penalty','Select the prepared first slot, then set its duration to zero.','ENTER → 0 → '+side.toUpperCase()+' PENALTY',['enter','0','penalty:'+side],done(m=>m.pen[side].length===0),s=>{s.model.pen[side]=[pen(12)];});
  }
  add('Penalties','second','Select the second penalty slot','PENALTY cycles the selected slot before staging another entry.','HOME PENALTY → ENTER → 2/22 → HOME PENALTY',['penalty:home','enter','2','/','2','2','penalty:home'],done(m=>m.pen.home[1]?.player===22),s=>{s.model.pen.home=[pen(12)];});
  add('Penalties','independent','Enable independent penalty timing','The real console requires a five-second hold while stopped.','Hold STOP/GO PENALTIES for five seconds → tap it → RUN → wait',['penHeld','penToggle','run','tick:1'],(m,e)=>e==='tick'&&m.independentPen&&!m.penRunning&&m.time<900&&m.pen.home[0]?.remaining===120,s=>{s.model.pen.home=[pen(12)];});
  add('Break & interval','break','Start a one-minute intermission','INTERMISSION starts immediately and freezes game penalties.','ENTER → 1 → INTERMISSION',['enter','1','intermission'],done(m=>m.view==='break'&&m.breakTime===60&&m.running));
  add('Break & interval','return','Cancel an intermission','Press INTERMISSION again to return to the held game.','INTERMISSION twice',['intermission','intermission'],done(m=>m.view==='game'&&!m.running&&m.time===900));
  add('Break & interval','interval','Set a 90-second interval horn','Interval mode 1 sets the repeating interval during countdown.','INTERVAL HORN → 1 → ENTER → 1:30 → INTERVAL HORN',['interval','1','enter','1',':','3','0','interval'],done(m=>m.interval===90));
  add('Break & interval','countup','Configure an up-count limit','Mode 2 sets the upper limit separately from interval mode 1.','TIME UP/DOWN → INTERVAL HORN → 2 → ENTER → 20 → INTERVAL HORN → RUN',['direction','interval','2','enter','2','0','interval','run'],at('run',m=>!m.down&&m.limit===1200&&m.time===0&&m.running));
  add('Scores & statistics','add','Add a specified amount','PLUS adds digits to the selected total.','PLUS → 3 → HOME SCORE',['plus','3','score:home'],done(m=>m.home===3));
  add('Scores & statistics','subtract','Subtract a specified amount','MINUS subtracts digits from the selected total.','MINUS → 2 → HOME SCORE',['minus','2','score:home'],done(m=>m.home===1),s=>{s.model.home=3;});
  add('Sound & setup','reset-held','Clear game data with a held key','The real CLEAR key resets game data only after a five-second hold while stopped.','Hold CLEAR for five seconds',['resetHeld'],at('resetHeld',m=>m.home===0&&m.pen.home.length===0),s=>{s.model.home=3;s.model.pen.home=[pen(12)];});
  add('Sound & setup','tod','View time of day','GAME MODE returns to the held game clock.','TIME OF DAY',['tod'],done(m=>m.view==='time'));
 }
 if(harris){
  add('Clock basics','time','Set game time','This is the photographed Cambridge Sportstimer variant, already unlocked for practice. # sends the entry.','TIME → 1500 → #',['time','1','5','0','0','enter'],done(m=>m.time===900),s=>{s.model.time=600;});
  add('Clock basics','period','Set the period','This panel accepts periods 0–4. Set the repeating horn again after each period.','PERIOD → 2 → #',['period','2','enter'],done(m=>m.period===2));
  add('Clock basics','run-stop','Use STOP/GO','The same key alternates between running and held game time.','STOP/GO → wait → STOP/GO',['toggle','tick:1','toggle'],at('toggle',m=>!m.running&&m.time<900));
  add('Clock basics','clear','Clear an entry mistake','The * key clears a command before # sends it.','TIME → 9 → *',['time','9','clear'],done(m=>m.time===900));
  add('Clock basics','timeoff','Read the time at a stoppage','TIME OF shows the time used for recording a goal or penalty. It does not stop the clock.','TIME OF',['timeoff'],at('timeoff',m=>m.message.startsWith('TIME OFF')));
  for(const side of ['home','guest']){
   const S=side==='home'?'HS':'VS',P=side==='home'?'HP':'VP';
   add('Scores','score-'+side,'Set the '+side+' score','Scores are entered as a new total.',S+' → 2 → #',['score:'+side,'2','enter'],done(m=>m[side]===2));
   add('Penalties','minor-'+side,'Enter a '+side+' penalty','First enter a slot number; # then opens the time field.',P+' → 1 → # → 200 → #',['penalty:'+side,'1','enter','2','0','0','enter'],done(m=>m.pen[side][0]?.remaining===120));
   add('Penalties','remove-'+side,'Remove a '+side+' penalty','Set the selected penalty slot to zero.',P+' → 1 → # → 0 → #',['penalty:'+side,'1','enter','0','enter'],done(m=>m.pen[side].length===0),s=>{s.model.pen[side]=[pen(1)];});
  }
  add('Penalties','second','Add another penalty slot','Five entry slots are available per side.','HP → 2 → # → 200 → #',['penalty:home','2','enter','2','0','0','enter'],done(m=>m.pen.home[1]?.remaining===120),s=>{s.model.pen.home=[pen(1)];});
  add('Sound & timers','horn','Sound the horn using a command','HORN selects a command; zero then # sounds it immediately.','HORN → 0 → #',['horn','0','enter'],done(m=>m.events.some(e=>e.type==='horn')));
  add('Sound & timers','interval2','Set two-minute player-change signals','The interval must be entered at the beginning of each period.','HORN → 2 → #',['horn','2','enter'],done(m=>m.interval===120));
  add('Sound & timers','interval3','Set three-minute player-change signals','The horn sounds during play without stopping the timer.','HORN → 3 → #',['horn','3','enter'],done(m=>m.interval===180));
  add('Sound & timers','break','Prepare a warm-up timer','INT selects an independent timer; use STOP/GO to start it.','INT → 300 → # → STOP/GO',['intermission','3','0','0','enter','toggle'],at('toggle',m=>m.view==='break'&&m.breakTime===180&&m.running));
  add('Sound & timers','tod','Display time of day','The Cambridge guide documents VI 99 #.','VI → 99 → #',['indicator:guest','9','9','enter'],done(m=>m.view==='time'));
 }
 if(roto){
  add('Main timer','time','Advance the timer by minutes','This mechanical-style console has no numeric keypad. MAIN TIME must be off before corrections.','Press main MINUTE ADVANCE three times',['minute','minute','minute'],at('minute',m=>m.time===180));
  add('Main timer','run-stop','Arm and run the game timer','Set MAIN TIME ON and press START. The toggle then runs and stops play.','MINUTE ADVANCE → MAIN TIME ON → START → wait → MAIN TIME OFF',['minute','mainToggle','start','tick:1','mainToggle'],at('mainToggle',m=>!m.running&&m.time<60));
  add('Main timer','reset-time','Reset the main timer','RESET returns game time to zero and sounds the horn.','MINUTE ADVANCE → RESET',['minute','timeReset'],at('timeReset',m=>m.time===0&&m.events.some(e=>e.type==='horn')));
  add('Main timer','period','Advance the period','PERIOD cycles the displayed period.','PERIOD',['period'],at('period',m=>m.period===2));
  for(const side of ['home','guest']){
   add('Scores','score-'+side,'Set the '+side+' units digit','Separate TENS and UNITS buttons cycle their digits.',side.toUpperCase()+' UNITS twice',['score:'+side+':units','score:'+side+':units'],at('score:'+side+':units',m=>m[side]===2));
   add('Scores','tens-'+side,'Set the '+side+' tens digit','The tens button leaves units unchanged.',side.toUpperCase()+' TENS',['score:'+side+':tens'],at('score:'+side+':tens',m=>m[side]===10));
   for(const slot of [0,1]){
    add('Penalty timers','pen-'+side+'-'+slot,'Arm '+side+' penalty timer '+(slot+1),'Each physical timer has its own MINUTE ADVANCE, START and RESET controls.',side.toUpperCase()+' PEN '+(slot+1)+' MINUTE ADVANCE twice → START',['pen:'+side+':'+slot+':minute','pen:'+side+':'+slot+':minute','pen:'+side+':'+slot+':start'],at('pen:'+side+':'+slot+':start',m=>m.pen[side][slot]?.remaining===120&&m.penArmed[side][slot]));
    add('Penalty timers','clear-'+side+'-'+slot,'Clear '+side+' penalty timer '+(slot+1),'RESET clears only the selected timer.',side.toUpperCase()+' PEN '+(slot+1)+' RESET',['pen:'+side+':'+slot+':reset'],at('pen:'+side+':'+slot+':reset',m=>!m.pen[side][slot]),s=>{s.model.pen[side][slot]=pen(slot+1);});
   }
  }
  add('Penalty timers','freeze','Stop penalty time separately','The PENALTY TIME toggle freezes both teams while MAIN TIME continues.','MINUTE ADVANCE → MAIN TIME ON → START → PENALTY TIME OFF → wait',['minute','mainToggle','start','penToggle','tick:1'],(m,e)=>e==='tick'&&m.time<60&&m.pen.home[0]?.remaining===120,s=>{s.model.pen.home=[pen(1)];s.model.penArmed.home[0]=true;});
  add('Sound & timers','interval','Enable the interval horn','AUTO HORN on this panel controls the repeating player-change signal. The five-second end horn remains automatic.','AUTO HORN ON',['auto'],at('auto',m=>m.interval===120&&m.repeatEnabled));
  add('Sound & timers','interval3','Select the three-minute interval','The separate 2/3 MIN selector changes the repeating duration.','2/3 MIN toggle → AUTO HORN ON',['intervalSelect','auto'],at('auto',m=>m.interval===180));
 }
 if(!harris)add('Sound & practice','manual-horn','Sound the manual horn','Hold the horn button. The browser sound preference is separate from automatic horn settings.','Press HORN',['horn'],(m,e,h,s)=>e==='key:horn'&&s.sound);
 add('Sound & practice','expiry','Observe the period-end horn','The prepared game has three seconds remaining. The end signal fires once and the main timer stops.',roto?'MAIN TIME ON → START → wait':harris?'STOP/GO → wait':n4?'Alternate time switch ON → wait':'RUN / TIME IN ON → wait',[...(roto?['mainToggle','start']:harris?['toggle']:n4?['rocker']:['run']),'tick:4'],(m,e)=>e==='tick'&&!m.running&&m.time===0,s=>{s.model.time=3;});
 add('Sound & practice','mute','Mute practice audio','Muting does not change the controller auto-horn setting.','Tap Sound on',['ui:sound'],(m,e,h,s)=>e==='ui:sound'&&!s.sound);
 add('Sound & practice','speed','Accelerate a practice scenario','Simulation speed applies to the clock and all active timers.','Practice setup → Simulation speed → 5×',['ui:speed:5'],(m,e,h,s)=>e==='ui:speed'&&s.speed===5);
 add('Sound & practice','reset','Reset browser practice','Reset clears this practice game; it is separate from a hardware power cycle.','Practice setup → Reset game',['ui:reset'],(m,e)=>e==='ui:reset'&&m.home===0,s=>{s.model.home=3;});
 add('Sound & practice','reference','Compare the source panel','Read the profile configuration and compare its photo or manufacturer diagram.','Expand Controller photo & manual',['ui:reference'],(m,e)=>e==='ui:reference');
 return out;
}
if(typeof module!=='undefined')module.exports=buildCanadianCurriculum;
else{const originalCanadianCurriculum=buildCurriculum;buildCurriculum=p=>Object.hasOwn(CanadianClocks,p)?buildCanadianCurriculum(p):originalCanadianCurriculum(p);}
