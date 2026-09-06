const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../duty-core.js'),C=require('../world-core.js'),T=require('../touch-control.js');
const {boot}=require('./game-harness.cjs');
function atObjective(h){h.run('Object.assign(S.world, {x:window.SicilDuty.target(S.duty).x,y:window.SicilDuty.target(S.duty).y})');h.nodes.get('worldInteract').onclick()}
function completeToReport(h){let guard=0;while(h.run('S.duty.phase')!==6&&guard++<20)atObjective(h);assert.ok(guard<20)}
const pointer=(id,x,y,type='touch')=>({pointerId:id,clientX:x,clientY:y,pointerType:type,preventDefault(){}});
test('floating stick has a dead zone, analog strength, normalized diagonal and trailing center',()=>{
  let s=T.start(4,70,200);assert.equal(T.move(s,4,74,202).vx,0);
  s=T.move(s,4,90,200);assert.ok(s.vx>0&&s.vx<1);
  assert.equal(T.move(s,8,150,200),s);
  s=T.move(s,4,220,260);assert.ok(s.x>70);assert.ok(s.y>200);assert.ok(Math.abs(Math.hypot(s.vx,s.vy)-1)<1e-9);
});
test('floating touch starts at different positions; unrelated fingers cannot take or release it',()=>{
  const h=boot(true);h.run("newGame('k')");const area=h.nodes.get('worldViewport'),stick=h.nodes.get('worldStick');
  const x=h.run('S.world.x');area.events.pointerdown(pointer(1,45,160));h.tick(50);assert.equal(h.run('S.world.x'),x);
  assert.equal(stick.style.left,'45px');assert.ok(stick.classList.contains('active'));
  area.events.pointermove(pointer(1,80,160));h.tick(50);assert.ok(h.run('S.world.x')>x);
  area.events.pointerdown(pointer(2,200,200));area.events.pointerup(pointer(2,200,200));assert.equal(area.captured,1);assert.ok(stick.classList.contains('active'));
  area.events.pointermove(pointer(1,220,160));assert.ok(parseFloat(stick.style.left)>45);
  area.events.pointerup(pointer(1,220,160));const stopped=h.run('S.world.x');h.tick(50);assert.equal(h.run('S.world.x'),stopped);assert.equal(area.captured,null);
  area.events.pointerdown(pointer(3,180,260));assert.equal(stick.style.left,'180px');assert.equal(stick.style.top,'260px');
});
test('cancel, capture loss, blur, resize and overlays stop touch; generated click never routes',()=>{
  for(const kind of ['pointercancel','lostpointercapture','blur','resize','file']){
    const h=boot(true);h.run("newGame('d')");const area=h.nodes.get('worldViewport');
    area.events.pointerdown(pointer(1,80,210));area.events.pointermove(pointer(1,125,210));h.tick(50);
    if(kind==='file'){h.run('openFile()');h.tick(50)}else if(kind==='pointercancel'||kind==='lostpointercapture')area.events[kind](pointer(1,125,210));else h.listeners[kind]();
    const stopped=h.run('S.world.x');h.tick(50);assert.equal(h.run('S.world.x'),stopped,kind);
    assert.equal(area.captured,null,kind);
    // A compatibility click must be swallowed before any SVG point/route lookup.
    h.nodes.get('worldScene').events.click({clientX:125,clientY:210});
  }
});
test('right-side touches and mouse do not spawn a stick; overview disables stick input',()=>{
  const h=boot(true);h.run("newGame('h')");const area=h.nodes.get('worldViewport'),stick=h.nodes.get('worldStick');
  area.events.pointerdown(pointer(1,350,200));assert.equal(stick.classList.contains('active'),false);
  area.events.pointerdown(pointer(1,80,200,'mouse'));assert.equal(stick.classList.contains('active'),false);
  h.nodes.get('worldMapBtn').onclick();area.events.pointerdown(pointer(1,80,200));assert.equal(stick.classList.contains('active'),false);
});
test('duty loop advances only through nearby world actions, never card choices',()=>{
  for(const force of ['k','d','h'])for(const career of ['officer','nco']){
    const h=boot(true);h.run(`newGame('${force}','${career}')`);assert.equal(h.run('ev'),null);
    h.run('decide(true)');assert.equal(h.run('S.cards'),0);h.nodes.get('worldInteract').onclick();assert.equal(h.run('S.duty.phase'),0);
    atObjective(h);assert.equal(h.run('S.duty.uniform'),true);assert.equal(h.run('S.duty.phase'),1);
    completeToReport(h);assert.equal(h.run('S.cards'),1);assert.equal(h.run('S.duty.completedDays'),1);assert.equal(h.run('locked'),true);
    atObjective(h);assert.equal(h.run('S.duty.day'),1);
    h.timers.shift()();atObjective(h);assert.equal(h.run('S.duty.day'),2);assert.equal(h.run('S.duty.energy'),100);assert.equal(h.run('S.duty.missionKey'),'supply');
    assert.equal(h.run('S.cards'),1);assert.equal(h.run('S.duty.radio'),false);
  }
});
test('all stages in all three duty assignments are reachable',()=>{
  for(const missionKey of ['training','supply','patrol']){
    const d=D.restore({missionKey}),pos={x:480,y:430};let guard=0;
    while(d.day===1&&guard++<20){const goal=D.target(d);assert.ok(C.route(pos,goal).length,goal.title);Object.assign(pos,{x:goal.x,y:goal.y});assert.ok(D.act(d,pos))}
    assert.equal(d.day,2);
  }
});
test('mid-task, equipment, rations and report resume without duplicate rewards',()=>{
  const h=boot(true);h.run("newGame('k')");for(let i=0;i<5;i++)atObjective(h);
  assert.equal(h.run('S.duty.fieldStep'),1);h.run('S.duty.energy=45');h.nodes.get('inventoryBtn').onclick();h.nodes.get('useRation').onclick();
  assert.equal(h.run('S.duty.energy'),70);assert.equal(h.run('S.duty.rations'),0);h.nodes.get('useRation').onclick();assert.equal(h.run('S.duty.energy'),70);
  h.nodes.get('inventoryClose').onclick();h.run('persistGame("card","test");S=null;resumeSavedGame()');
  assert.equal(h.run('S.duty.fieldStep'),1);assert.equal(h.run('S.duty.radio'),true);assert.equal(h.run('S.duty.rations'),0);
  completeToReport(h);const sic=h.run('S.st.sic');h.run('S=null;resumeSavedGame()');assert.equal(h.run('S.cards'),1);assert.equal(h.run('S.st.sic'),sic);assert.equal(h.run('S.duty.phase'),6);
});
test('report interrupted at a promotion boundary still promotes on resume',()=>{
  const h=boot(true);h.run("newGame('k');S.r=1;S.cards=RANKS[1].cards-1;Object.keys(S.st).forEach(k=>S.st[k]=70)");completeToReport(h);
  h.run('S=null;resumeSavedGame()');assert.equal(h.run('S.r'),2);assert.equal(h.run('locked'),true);assert.equal(h.nodes.get('promo').classList.contains('hide'),false);
  h.nodes.get('promoBtn').onclick();assert.equal(h.run('S.duty.phase'),6);assert.equal(h.run('S.cards'),0);
});
test('legacy field mission migrates once and malformed duty state recovers',()=>{
  const h=boot(true);h.run("newGame('k');delete S.duty;S.world.mission={id:'supply',step:1};persistGame('card','old');S=null;resumeSavedGame()");
  assert.equal(h.run('S.duty.phase'),4);assert.equal(h.run('S.duty.missionKey'),'supply');assert.equal(h.run('S.duty.fieldStep'),1);assert.equal(h.run('S.world.mission'),null);
  const restored=D.restore({phase:100,fieldStep:-10,energy:NaN,day:-8});assert.equal(restored.phase,0);assert.equal(restored.day,1);assert.equal(restored.energy,100);
});
test('energy is bounded and fatigue never prevents reaching rest',()=>{
  const d=D.restore(null);D.walk(d,100000);assert.equal(d.energy,0);assert.equal(D.eat(d),true);assert.equal(d.energy,25);assert.equal(D.eat(d),false);
  const h=boot(true);h.run("newGame('k');S.duty.energy=0");const x=h.run('S.world.x');h.listeners.keydown({key:'d',preventDefault(){}});h.tick(50);assert.ok(h.run('S.world.x')>x);
});
