const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../world-core.js'),D=require('../duty-core.js'),R=require('../relationships.js');
const {boot}=require('./game-harness.cjs');
function enter(h,id){const p=C.rooms[id].entry;h.run(`Object.assign(S.world,{x:${p.x},y:${p.y},area:'yard'})`);h.nodes.get('worldDoorBtn').onclick()}
test('portals require proximity, scene changes do not advance duty, doors remain usable after equipment',()=>{
  const h=boot(true);h.run("newGame('k')");h.nodes.get('worldDoorBtn').onclick();assert.equal(h.run('S.world.area'),'yard');
  enter(h,'barracks');assert.equal(h.run('S.world.area'),'barracks');assert.equal(h.run('S.duty.phase'),0);
  assert.match(h.nodes.get('worldTerrain').innerHTML,/YATAĞIN/);
  h.run("Object.assign(S.world,{x:430,y:160})");h.nodes.get('worldInteract').onclick();assert.equal(h.run('S.duty.phase'),1);
  // The next outdoor task must point to the exit, not to outdoor coordinates inside the room.
  assert.match(h.nodes.get('questDetail').textContent,/Çıkış/);
  h.run('S.world.x=320;S.world.y=470');h.nodes.get('worldInteract').onclick();assert.equal(h.run('S.world.area'),'yard');assert.equal(h.run('S.duty.phase'),1);
  assert.equal(C.travel({x:480,y:430},'supply'),null);assert.equal(C.travel({x:480,y:430},null),null);
});
test('same coordinates in the wrong area cannot equip or rest',()=>{
  const d=D.restore(null),target=D.target(d);assert.equal(D.act(d,{x:target.x,y:target.y,area:'yard'}),null);assert.equal(d.phase,0);
  assert.ok(D.act(d,target));assert.equal(d.phase,1);
});
test('furniture collisions, bounds and malformed room saves recover safely',()=>{
  for(const area of Object.keys(C.rooms)){
    const room=C.rooms[area];for(const box of room.obstacles)assert.equal(C.walkable(box.x+20,box.y+20,area),false);
    assert.equal(C.walkable(850,430,area),false);const restored=C.restore({area,x:0,y:0});assert.equal(restored.area,area);assert.equal(restored.x,room.spawn.x);
  }
  for(const area of ['broken','__proto__','constructor'])assert.equal(C.restore({area,x:480,y:430}).area,'yard');
  assert.equal(C.restore({mission:{id:'__proto__',step:0}}).mission,null);
});
test('interior position, equipment and scene survive reload',()=>{
  const h=boot(true);h.run("newGame('d')");enter(h,'supply');h.run('S.world.x=370;S.world.y=305;S.duty.phase=3');h.nodes.get('worldInteract').onclick();
  assert.equal(h.run('S.duty.radio'),true);h.run('persistGame("card","interior");S=null;resumeSavedGame()');
  assert.equal(h.run('S.world.area'),'supply');assert.equal(h.run('S.world.x'),370);assert.equal(h.run('S.duty.phase'),4);assert.match(h.nodes.get('worldTerrain').innerHTML,/TESLİM ALANI/);
  assert.match(h.nodes.get('questDetail').textContent,/Çıkış/);
});
test('floating input is released at a door and works inside the new room',()=>{
  const h=boot(true);h.run("newGame('h');S.world.x=190;S.world.y=315");const area=h.nodes.get('worldViewport');
  const e=(x)=>({pointerId:3,pointerType:'touch',clientX:x,clientY:200,preventDefault(){}});
  area.events.pointerdown(e(40));area.events.pointermove(e(80));h.nodes.get('worldDoorBtn').onclick();assert.equal(area.captured,null);assert.equal(h.run('S.world.area'),'barracks');
  const x=h.run('S.world.x');h.tick(50);assert.equal(h.run('S.world.x'),x);
  area.events.pointerdown(e(100));area.events.pointermove(e(135));h.tick(50);assert.ok(h.run('S.world.x')>x);
});
test('NPCs are scene-specific and support/greetings are limited to the day',()=>{
  const h=boot(true);h.run("newGame('k')");enter(h,'barracks');h.run('S.world.x=240;S.world.y=365');
  h.nodes.get('worldTalkBtn').onclick();assert.equal(h.nodes.get('socialName').textContent,'Mert Aydın');assert.equal(h.run('S.contacts.roommate.trust'),42);
  h.nodes.get('socialClose').onclick();h.nodes.get('worldTalkBtn').onclick();assert.equal(h.run('S.contacts.roommate.trust'),42);
  h.nodes.get('socialHelp').onclick();assert.equal(h.run('S.duty.energy'),100);
  h.nodes.get('socialClose').onclick();h.run('S.contacts.roommate.trust=60;S.duty.energy=50');h.nodes.get('worldTalkBtn').onclick();h.nodes.get('socialHelp').onclick();assert.equal(h.run('S.duty.energy'),60);
  h.nodes.get('socialHelp').onclick();assert.equal(h.run('S.duty.energy'),60);
  h.nodes.get('socialClose').onclick();h.run('persistGame("card","relationship");S=null;resumeSavedGame()');
  assert.equal(h.run('S.contacts.roommate.helpDay'),1);h.nodes.get('worldTalkBtn').onclick();h.nodes.get('socialHelp').onclick();assert.equal(h.run('S.duty.energy'),60);
  assert.equal(C.nearest({area:'supply',x:430,y:305}).id,'supply');
});
test('conversation blocks movement, traps focus and cannot complete a task',()=>{
  const h=boot(true);h.run("newGame('k');S.world.x=488;S.world.y=268");h.nodes.get('worldTalkBtn').onclick();
  assert.equal(h.nodes.get('worldViewport').inert,true);const x=h.run('S.world.x');h.listeners.keydown({key:'d',preventDefault(){}});h.tick(50);assert.equal(h.run('S.world.x'),x);
  h.nodes.get('worldInteract').onclick();assert.equal(h.run('S.duty.phase'),0);
  let trapped=false;h.listeners.keydown({key:'Tab',preventDefault(){trapped=true}});assert.ok(trapped);
  h.listeners.keydown({key:'Escape',preventDefault(){}});assert.equal(h.nodes.get('socialPanel').classList.contains('hide'),true);assert.equal(h.nodes.get('worldViewport').inert,false);
});
test('report performance changes command and relevant mentor trust once; values remain bounded',()=>{
  const contacts=R.restore(null),d=D.restore({missionKey:'training'});
  R.report(contacts,d,95);assert.equal(contacts.command.trust,44);assert.equal(contacts.training.trust,43);assert.equal(contacts.supply.trust,40);
  assert.deepEqual(R.report(contacts,d,95),[]);d.day++;R.report(contacts,d,65);assert.equal(contacts.command.trust,42);
  contacts.command.trust=99;d.day++;R.report(contacts,d,95);assert.equal(contacts.command.trust,100);
  assert.equal(R.restore({command:{trust:NaN}}).command.trust,40);
});
