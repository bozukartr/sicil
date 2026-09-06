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
test('every NPC and mission checkpoint has a navigable collision-free route across areas',()=>{
  const targets=[...C.stations,...Object.values(C.missions).flatMap(m=>m.steps)];
  for(const from of [{x:480,y:430},...C.stations])for(const target of targets){
    let p={...from},guard=0;
    while(guard++<4){
      const goal=C.waypoint(p,target),route=C.route(p,goal);assert.ok(route.length,JSON.stringify({p,target,goal}));
      for(const point of route){assert.ok(C.walkable(point.x,point.y,p.area));let movement=0;while(C.distance(p,point)>4&&movement++<500){const d=C.distance(p,point);p=C.move(p,(point.x-p.x)/d,(point.y-p.y)/d,1/60)}assert.ok(movement<500,'route stuck '+JSON.stringify({p,point}))}
      if(goal.portal){p=C.travel(p,goal.portal);assert.ok(p)}else break;
    }
    assert.ok(guard<=4);assert.equal(C.areaOf(p),C.areaOf(target));assert.ok(C.distance(p,target)<5);
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
