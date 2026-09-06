/* Floating analog control. Pure math keeps pointer behaviour testable. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SicilTouch=factory()})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  const DEAD=7,RADIUS=34,TRAIL=56;
  function start(id,x,y){return {id,x,y,vx:0,vy:0}}
  function move(state,id,x,y){
    if(!state||id!==state.id)return state;
    let dx=x-state.x,dy=y-state.y,d=Math.hypot(dx,dy),cx=state.x,cy=state.y;
    if(d>TRAIL){cx=x-dx/d*TRAIL;cy=y-dy/d*TRAIL;dx=x-cx;dy=y-cy;d=TRAIL}
    const strength=d<=DEAD?0:Math.min(1,(d-DEAD)/(RADIUS-DEAD));
    return {id,x:cx,y:cy,vx:d?dx/d*strength:0,vy:d?dy/d*strength:0};
  }
  return {start,move,DEAD,RADIUS,TRAIL};
});
