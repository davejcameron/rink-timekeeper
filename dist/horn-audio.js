/* Audio starts inside a user gesture; a quick release still gives a short blast. */
class RinkHorn {
 constructor(onError=()=>{},createContext=()=>new(window.AudioContext||window.webkitAudioContext)()) {this.onError=onError;this.createContext=createContext;this.context=null;this.muted=false;this.voices=new Set();}
 async unlock(){try{this.context??=this.createContext();if(this.context.state!=='running')await this.context.resume();if(this.context.state!=='running')throw Error('Audio did not start');return this.context;}catch(error){this.onError(error);throw error;}}
 setMuted(muted){this.muted=muted;if(muted)for(const voice of this.voices){voice.cancelled=true;this.stop(voice,0);}}
 hold(){const voice={released:false,cancelled:false,nodes:[],started:null};this.voices.add(voice);this.start(voice).catch(()=>this.voices.delete(voice));return voice;}
 async start(voice){if(this.muted){this.voices.delete(voice);return false;}const ctx=await this.unlock();if(this.muted||voice.cancelled){this.voices.delete(voice);return false;}voice.started=ctx.currentTime;const gain=ctx.createGain();gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.11,ctx.currentTime+.015);gain.connect(ctx.destination);voice.gain=gain;
 for(const frequency of [180,225]){const oscillator=ctx.createOscillator();oscillator.type='sawtooth';oscillator.frequency.value=frequency;oscillator.connect(gain);oscillator.start();voice.nodes.push(oscillator);}voice.nodes[0].onended=()=>{gain.disconnect();this.voices.delete(voice);};if(voice.released)this.stop(voice,.3);return true;}
 release(voice){if(!voice)return;voice.released=true;if(voice.started!==null)this.stop(voice,Math.max(0,.3-(this.context.currentTime-voice.started)));}
 stop(voice,delay){if(!voice.nodes.length)return;const at=this.context.currentTime+delay;voice.gain.gain.cancelScheduledValues(at);voice.gain.gain.setValueAtTime(.11,at);voice.gain.gain.linearRampToValueAtTime(0,at+.025);for(const node of voice.nodes)try{node.stop(at+.03);}catch{}}
 async pulse(duration=.65){const voice={released:false,cancelled:false,nodes:[],started:null};this.voices.add(voice);try{if(await this.start(voice))this.stop(voice,duration);}catch{this.voices.delete(voice);}}
}
if(typeof module!=='undefined')module.exports=RinkHorn;
