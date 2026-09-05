const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../world-core.js');
const {boot}=require('./game-harness.cjs');
test('buildings block movement and diagonal speed is normalized',()=>{
  assert.equal(C.walkable(400,130),false);assert.equal(C.walkable(-3,200),false);
  const blocked=C.move({x:340,y:150},1,0,.05);assert.ok(blocked.x<348);
  const straight=C.move({x:480,y:430},1,0,.05),diagonal=C.move({x:480,y:430},1,1,.05);
  assert.ok(Math.abs(C.distance(straight,{x:480,y:430})-C.distance(diagonal,{x:480,y:430}))<.00001);
  assert.ok(C.distance(C.move({x:480,y:430},1,0,10),{x:480,y:430})<8);
});
test('every NPC and mission checkpoint has a navigable collision-free route',()=>{
  const targets=[...C.stations,...Object.values(C.missions).flatMap(m=>m.steps)];
  for(const from of [{x:480,y:430},...C.stations])for(const target of targets){
    const route=C.route(from,target);assert.ok(route.length,JSON.stringify({from,target}));
    for(const point of route)assert.ok(C.walkable(point.x,point.y));
    let p={...from};for(const point of route){let guard=0;while(C.distance(p,point)>4&&guard++<500){const d=C.distance(p,point);p=C.move(p,(point.x-p.x)/d,(point.y-p.y)/d,1/60)}assert.ok(guard<500,'route stuck near '+JSON.stringify(point))}
    assert.ok(C.distance(p,target)<5);
  }
});
test('legacy and malformed world saves recover safely',()=>{
  assert.deepEqual(C.restore(null).mission,null);assert.equal(C.restore(null).x,480);
  assert.equal(C.restore({x:400,y:130,mission:{id:'bad',step:8}}).mission,null);
  assert.equal(C.restore({x:400,y:130}).x,480);
  assert.deepEqual(C.restore({x:500,y:500,mission:{id:'supply',step:1}}).mission,{id:'supply',step:1});
});
test('checkpoints cannot complete from a distance or out of order',()=>{
  const w=C.restore(null);w.mission={id:'training',step:0};assert.equal(C.checkpoint(w),false);
  for(const [i,p] of C.missions.training.steps.entries()){Object.assign(w,{x:p.x,y:p.y});assert.equal(C.checkpoint(w),i===3?'complete':'step')}
});
test('walking and route following never submit career decisions; arrival enables conversation',()=>{
  const {run,nodes,tick,listeners}=boot(true);run("newGame('k');renderCard({...ev,place:'Karargâh',role:'Komutan'})");
  assert.equal(run('window.SicilWorld.active'),true);assert.equal(run('window.SicilWorld.dialogue'),false);
  run('decide(true)');assert.equal(run('S.cards'),0);
  listeners.keydown({key:'ArrowRight',preventDefault(){}});tick(50);listeners.keyup({key:'ArrowRight'});
  assert.ok(run('S.world.x')>480);assert.equal(run('S.cards'),0);
  nodes.get('worldRouteBtn').onclick();for(let i=0;i<240;i++)tick(16);
  assert.ok(run('Math.hypot(S.world.x-488,S.world.y-268)')<8);
  nodes.get('worldInteract').onclick();assert.equal(run('window.SicilWorld.dialogue'),true);
  run('decide(true)');assert.equal(run('S.cards'),1);assert.equal(run('window.SicilWorld.dialogue'),false);
});
test('overlays and window blur pause walking; conversation can close without a decision',()=>{
  const {run,nodes,tick,listeners}=boot(true);run("newGame('d');renderCard({...ev,place:'Karargâh',role:'Komutan'})");
  const before=run('S.world.x');listeners.keydown({key:'d',preventDefault(){}});run('openFile()');tick(50);
  assert.equal(run('S.world.x'),before);run('closeFile()');tick(50);assert.equal(run('S.world.x'),before);
  listeners.keydown({key:'d',preventDefault(){}});listeners.blur();tick(50);assert.equal(run('S.world.x'),before);
  run('S.world.x=488;S.world.y=268');nodes.get('worldInteract').onclick();assert.equal(run('window.SicilWorld.dialogue'),true);
  nodes.get('leaveEncounter').onclick();assert.equal(run('S.cards'),0);assert.equal(run('window.SicilWorld.dialogue'),false);
});
test('field task gives one reward per period and resumes position and checkpoint',()=>{
  const {run,nodes}=boot(true);run("newGame('h');S.world.x=775;S.world.y=657");
  nodes.get('worldSideTask').onclick();assert.equal(run('S.world.mission.id'),'supply');
  run('S.world.x=647;S.world.y=438');nodes.get('worldInteract').onclick();assert.equal(run('S.world.mission.step'),1);
  run('persistGame("card","test");S=null;resumeSavedGame()');assert.equal(run('S.world.x'),647);assert.equal(run('S.world.mission.step'),1);
  const before=run('S.st.loj');run('S.world.x=775;S.world.y=657');nodes.get('worldInteract').onclick();
  assert.equal(run('S.world.mission'),null);assert.equal(run('S.st.loj'),before+3);assert.equal(run('S.world.completed'),1);
  assert.equal(run('S.cards'),0);nodes.get('worldSideTask').onclick();assert.equal(run('S.world.mission'),null);
  run('S.totalDecisions++');nodes.get('worldSideTask').onclick();assert.equal(run('S.world.mission.id'),'supply');
});
test('abandoned task has no reward and cannot be farmed in the same period',()=>{
  const {run,nodes}=boot(true);run("newGame('k');S.world.x=175;S.world.y=350");const before=run('S.st.fiz');
  nodes.get('worldSideTask').onclick();nodes.get('worldCancelTask').onclick();nodes.get('worldSideTask').onclick();
  assert.equal(run('S.world.mission'),null);assert.equal(run('S.st.fiz'),before);
});
