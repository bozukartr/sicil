/* Pure world rules, shared by the browser and Node regression tests. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SicilWorldCore=api;
})(typeof window!=='undefined'?window:this,function(){
  'use strict';
  const WIDTH=960,HEIGHT=800,RADIUS=12,SPEED=155;
  const buildings=[
    {x:360,y:80,w:250,h:145,label:'KARARGÂH',roof:'#647a69'},
    {x:100,y:120,w:185,h:160,label:'KOĞUŞ',roof:'#757a5d'},
    {x:710,y:110,w:155,h:120,label:'REVİR',roof:'#6d8580'},
    {x:690,y:490,w:170,h:120,label:'İKMAL',roof:'#967951'}
  ];
  const obstacles=[...buildings,{x:200,y:425,w:95,h:15},{x:100,y:490,w:95,h:15},{x:255,y:545,w:70,h:15},{x:580,y:355,w:62,h:34}];
  const rooms={
    barracks:{name:'Koğuş',width:640,height:520,entry:{x:190,y:315},spawn:{x:320,y:430},exit:{x:320,y:470},obstacles:[{x:80,y:100,w:80,h:115},{x:80,y:285,w:80,h:120},{x:470,y:100,w:90,h:120},{x:245,y:205,w:100,h:85}]},
    supply:{name:'İkmal deposu',width:640,height:520,entry:{x:775,y:657},spawn:{x:320,y:430},exit:{x:320,y:470},obstacles:[{x:65,y:75,w:155,h:65},{x:395,y:75,w:170,h:65},{x:65,y:200,w:90,h:140},{x:460,y:235,w:90,h:100},{x:320,y:200,w:100,h:60}]}
  };
  const areaOf=p=>Object.hasOwn(rooms,p?.area)?p.area:'yard';
  const geometry=area=>(Object.hasOwn(rooms,area)?rooms[area]:null)||{name:'Birlik yerleşkesi',width:WIDTH,height:HEIGHT,obstacles};
  function waypoint(pos,goal){
    if(areaOf(pos)===areaOf(goal))return goal;
    if(areaOf(pos)!=='yard')return {...rooms[pos.area].exit,area:pos.area,portal:'yard',action:'Kışlaya çık',label:'Çıkış kapısına ilerle',title:goal.title,time:goal.time};
    const room=rooms[goal.area];return {...room.entry,area:'yard',portal:goal.area,action:room.name+' içine gir',label:room.name+' kapısına ilerle',title:goal.title,time:goal.time};
  }
  function portalAt(pos){
    if(areaOf(pos)!=='yard')return distance(pos,rooms[pos.area].exit)<=40?'yard':null;
    return Object.keys(rooms).find(id=>distance(pos,rooms[id].entry)<=40)||null;
  }
  function travel(pos,to){
    if((to!=='yard'&&!Object.hasOwn(rooms,to))||portalAt(pos)!==to)return null;
    return to==='yard'?{...rooms[pos.area].entry,area:'yard'}:{...rooms[to].spawn,area:to};
  }
  const stations=[
    {id:'command',x:488,y:268,name:'Kemal Arslan',role:'Komutan',place:'Karargâh',color:'#dfbd78'},
    {id:'training',x:175,y:350,name:'Selim Demir',role:'Eğitmen',place:'Talim alanı',color:'#b8cf8d'},
    {id:'medic',x:785,y:275,name:'Elif Kaya',role:'Sağlık astsubayı',place:'Revir',color:'#d5bda1'},
    {id:'supply',area:'supply',x:430,y:305,name:'Derya Acar',role:'İkmal sorumlusu',place:'İkmal deposu',color:'#c6b28c'},
    {id:'patrol',x:425,y:680,name:'Emre Yıldız',role:'Nöbetçi',place:'Nizamiye',color:'#a7c4c1'},
    {id:'roommate',area:'barracks',x:240,y:365,name:'Mert Aydın',role:'Devre arkadaşın',place:'Koğuş',color:'#879d79'}
  ];
  const missions={
    training:{title:'Talim parkuru',reward:{fiz:3,dis:1},steps:[{x:320,y:365,label:'İlk flama'},{x:335,y:510,label:'Engellerin çevresinden geç'},{x:150,y:565,label:'Son flama'},{x:175,y:350,label:'Eğitmene rapor ver'}]},
    supply:{title:'İkmal teslimatı',reward:{loj:3,tek:1},steps:[{x:647,y:438,label:'Malzeme sandığını al'},{x:210,y:310,area:'supply',label:'Sandığı teslim noktasına bırak'}]},
    patrol:{title:'Çevre devriyesi',reward:{ope:2,dis:2},steps:[{x:100,y:660,label:'Batı kontrol noktası'},{x:525,y:716,label:'Nizamiye kontrolü'},{x:863,y:695,label:'Doğu kontrol noktası'},{x:425,y:680,label:'Devriyeyi raporla'}]}
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function walkable(x,y,area='yard'){const space=geometry(area);return Number.isFinite(x)&&Number.isFinite(y)&&x>=38&&y>=38&&x<=space.width-38&&y<=space.height-38&&!space.obstacles.some(o=>x>o.x-RADIUS&&x<o.x+o.w+RADIUS&&y>o.y-RADIUS&&y<o.y+o.h+RADIUS)}
  function move(p,vx,vy,dt){
    const mag=Math.hypot(vx,vy);if(!mag)return {...p};
    const amount=SPEED*clamp(dt,0,.05)/Math.max(1,mag),out={...p};
    if(walkable(out.x+vx*amount,out.y,p.area))out.x+=vx*amount;
    if(walkable(out.x,out.y+vy*amount,p.area))out.y+=vy*amount;
    return out;
  }
  // Cardinal-grid BFS: never cuts a building corner. Computed only on a tap/route request.
  function route(from,to){
    const area=areaOf(from),space=geometry(area);
    if(to.area&&areaOf(to)!==area)return [];
    const cell=20,cols=space.width/cell,rows=space.height/cell;
    if(!walkable(to.x,to.y,area))return [];
    const key=(x,y)=>y*cols+x,center=k=>({x:(k%cols)*cell+cell/2,y:Math.floor(k/cols)*cell+cell/2});
    const snap=p=>key(clamp(Math.floor(p.x/cell),0,cols-1),clamp(Math.floor(p.y/cell),0,rows-1));
    const start=snap(from),goal=snap(to),queue=[start],prev=new Map([[start,null]]);
    if(!walkable(center(goal).x,center(goal).y,area))return [];
    for(let i=0;i<queue.length&&!prev.has(goal);i++){
      const k=queue[i],x=k%cols,y=Math.floor(k/cols);
      for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){
        if(nx<0||ny<0||nx>=cols||ny>=rows)continue;
        const n=key(nx,ny),p=center(n);if(prev.has(n)||!walkable(p.x,p.y,area))continue;
        prev.set(n,k);queue.push(n);
      }
    }
    if(!prev.has(goal))return [];
    const points=[];let k=goal;while(k!==start){points.push(center(k));k=prev.get(k)}
    points.reverse();points.push({x:to.x,y:to.y});return points;
  }
  function restore(raw){
    const value=raw&&typeof raw==='object'?raw:{};
    const area=areaOf(value),fallback=rooms[area]?.spawn||{x:480,y:430};
    const pos=walkable(value.x,value.y,area)?{x:value.x,y:value.y}:fallback;
    const m=value.mission,valid=m&&Object.hasOwn(missions,m.id)&&Number.isInteger(m.step)&&m.step>=0&&m.step<missions[m.id].steps.length;
    return {...pos,area,facing:['up','down','left','right'].includes(value.facing)?value.facing:'down',mission:valid?{id:m.id,step:m.step}:null,
      activityUsed:Number.isInteger(value.activityUsed)?value.activityUsed:-1,completed:Math.max(0,Math.floor(Number(value.completed)||0)),introduced:!!value.introduced};
  }
  function stationFor(event){
    const text=((event.place||'')+' '+(event.role||'')).toLocaleLowerCase('tr');
    const id=/sağlık|revir|hastane|psik|g ata/.test(text)?'medic':/ikmal|lojistik|depo|tedarik/.test(text)?'supply':/talim|eğitim|spor|ders|okul/.test(text)?'training':/nöbet|devriye|nizamiye|sınır/.test(text)?'patrol':'command';
    return stations.find(s=>s.id===id);
  }
  function nearest(pos){return stations.filter(s=>areaOf(s)===areaOf(pos)).reduce((best,s)=>!best||distance(pos,s)<distance(pos,best)?s:best,null)}
  function checkpoint(world){
    if(!world.mission)return false;
    const m=missions[world.mission.id],step=m.steps[world.mission.step];
    if(!step||areaOf(world)!==areaOf(step)||distance(world,step)>46)return false;
    world.mission.step++;
    return world.mission.step===m.steps.length?'complete':'step';
  }
  return {rooms,areaOf,geometry,waypoint,portalAt,travel,WIDTH,HEIGHT,RADIUS,SPEED,buildings,obstacles,stations,missions,clamp,distance,walkable,move,route,restore,stationFor,nearest,checkpoint};
});
