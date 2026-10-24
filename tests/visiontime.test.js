const test=require('node:test'),assert=require('node:assert/strict'),Clock=require('../dist/visiontime-engine.js');
const keys=(c,...ks)=>ks.forEach(k=>c.key(k));
test('VisionTime shots increment and recalled correction',()=>{const c=new Clock();keys(c,'shots:home','recall','shots:home','5','enter');assert.equal(c.shots.home,5);});
test('VisionTime team timeout pauses game and returns on hold',()=>{const c=new Clock();keys(c,'run');c.tick(3);keys(c,'timeout:home','enter');c.tick(30);assert.equal(c.view,'game');assert.equal(c.time,897);assert.equal(c.running,false);});
test('VisionTime telephone letters match panel and numeric correction can abort',()=>{const c=new Clock();keys(c,'name:home','2','2','+','3','enter');assert.equal(c.names.home,'BD');keys(c,'recall','score:home','9','cancel');assert.equal(c.home,0);});
test('VisionTime auto-horn clear suppresses end signals',()=>{const c=new Clock(1);keys(c,'auto','clear','enter','run');c.tick(2);assert.equal(c.events.includes('horn'),false);});
