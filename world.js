/* Interactive barracks: exploration -> encounter -> career consequence. */
(function(){
  'use strict';
  const C=window.SicilWorldCore,A=window.SicilWorldArt,$=id=>document.getElementById(id);
  const app=$('app'),scene=$('worldScene'),player=$('worldPlayer'),stick=$('worldStick');
  const overlayIds=['start','exam','specialty','transition','end','promo','file'];
  let active=false,dialogue=false,state=null,world=null,goal=null,path=[],keys=new Set(),joystick={x:0,y:0},stickId=null;
  let overview=false,lastTime=0,lastSave=0,dirty=false,rafId=0,toastUntil=0,lastUI='',lastMarker='';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('worldTerrain').innerHTML=A.map();
  player.innerHTML=A.sprite('#80976c',true)+'<path class="playerPointer" d="M-5-62 0-56 5-62Z" fill="#f2d48d"/>';
  $('worldNpcs').innerHTML=C.stations.map(s=>`<g transform="translate(${s.x} ${s.y})">${A.sprite(s.color)}<rect x="-49" y="13" width="98" height="19" rx="5" fill="#102d23" opacity=".88"/><text x="0" y="26" text-anchor="middle" fill="#f1ead6" font-family="sans-serif" font-size="10">${escape(s.name)}</text></g>`).join('');
  function blocked(){return !active||!S||S.ended||locked||document.hidden||overlayIds.some(id=>!$(id).classList.contains('hide'))}
  function canExplore(){return !blocked()&&!dialogue}
  function resetInput(){keys.clear();joystick={x:0,y:0};path=[];stickId=null;$('stickKnob').style.transform='translate(0,0)';player.classList.remove('walking');drawRoute()}
  function notify(text){$('worldToast').textContent=text;$('worldToast').classList.add('on');toastUntil=performance.now()+3200}
  function objective(){return world&&world.mission?C.missions[world.mission.id].steps[world.mission.step]:goal}
  function save(){if(!S||blocked()||dialogue)return;persistGame('card','world-exploration');dirty=false}
  function onCard(){
    if(state!==S){state=S;S.world=C.restore(S.world);world=S.world;resetInput();overview=false;$('worldMapBtn').textContent='Harita'}
    world=S.world;active=true;goal=C.stationFor(ev);dialogue=false;
    app.classList.add('rpg');app.classList.remove('inEncounter');$('world').classList.remove('hide');$('world').inert=false;$('encounter').inert=true;
    resetInput();lastMarker='';lastUI='';draw();updateUI();
    if(!world.introduced){notify('Birliğine hoş geldin. Altın işaret görevini gösterir.');world.introduced=true;dirty=true}
    $('worldGuide').textContent='Haritaya dokun · Yürü · Yaklaşınca etkileşime gir';
    if(!rafId){lastTime=performance.now();rafId=requestAnimationFrame(frame)}
  }
  function onDecision(){closeDialogue(false);notify('Kararın sicile işlendi. Birlikte yeni bir görev seni bekliyor.')}
  function openDialogue(){
    if(!canExplore()||world.mission||C.distance(world,goal)>64)return;
    dialogue=true;resetInput();app.classList.add('inEncounter');$('world').inert=true;$('encounter').inert=false;
    requestAnimationFrame(fitText);$('leaveEncounter').focus({preventScroll:true});
  }
  function closeDialogue(focus=true){
    dialogue=false;app.classList.remove('inEncounter');$('world').inert=false;$('encounter').inert=true;resetInput();
    if(focus){$('worldInteract').focus({preventScroll:true});save()}
  }
  function startTask(){
    if(!canExplore()||world.mission)return;
    const n=C.nearest(world);
    if(C.distance(world,n)>64||!C.missions[n.id])return;
    if(world.activityUsed===S.totalDecisions){notify('Bu görev dönemindeki saha çalışmanı tamamladın. Ana göreve dön.');return}
    world.activityUsed=S.totalDecisions;world.mission={id:n.id,step:0};dirty=true;resetInput();lastMarker='';updateUI();save();
    notify(C.missions[n.id].title+' başladı. Mavi işarete ilerle.');
  }
  function interact(){
    if(!canExplore())return;
    if(world.mission){
      const id=world.mission.id,result=C.checkpoint(world);
      if(!result){notify('İşaretli noktaya biraz daha yaklaş.');return}
      path=[];dirty=true;
      if(result==='complete'){
        const mission=C.missions[id];world.mission=null;world.completed++;
        const rewards=[];
        for(const [key,amount] of Object.entries(mission.reward)){
          const before=S.st[key];S.st[key]=Math.min(100,before+amount);rewards.push(STATS[key].n+' +'+Math.round(S.st[key]-before));
        }
        addJournal('field',mission.title+' tamamlandı',rewards.join(' · '));paintGauges();paintHUD();
        notify(mission.title+' tamamlandı · '+rewards.join(' · '));
      }else notify('Kontrol noktası tamamlandı. Sıradaki işarete ilerle.');
      lastMarker='';updateUI();drawRoute();save();return;
    }
    if(C.distance(world,goal)<=64){openDialogue();return}
    const n=C.nearest(world);
    if(C.distance(world,n)>64){notify('Önce bir kişiye veya görev noktasına yaklaş.');return}
    if(C.missions[n.id])startTask();else notify(n.id==='medic'?'Sağlık astsubayı: Hazır olduğunda ana görev için işaretli kişiye uğra.':'Komutan: Birlikteki görevin altın işaretle gösteriliyor.');
  }
  function updateUI(){
    if(!world)return;
    const target=objective(),n=C.nearest(world),near=C.distance(world,n)<=64;
    const mission=world.mission&&C.missions[world.mission.id];
    $('worldCargo').setAttribute('visibility',world.mission?.id==='supply'&&world.mission.step===1?'visible':'hidden');
    const dist=Math.round(C.distance(world,target)/10);
    const signature=[target.x,target.y,near?n.id:'',world.mission?.step,world.activityUsed,S.totalDecisions,dist,dialogue].join('|');
    if(signature===lastUI)return;lastUI=signature;
    $('worldLocation').textContent=near?n.place:'İçtima meydanı';
    $('questType').textContent=mission?'SAHA GÖREVİ · '+(world.mission.step+1)+' / '+mission.steps.length:'ANA GÖREV · '+String(S.totalDecisions+1).padStart(2,'0');
    $('questTitle').textContent=mission?mission.title:goal.place+' · '+ev.who;
    $('questDetail').textContent=mission?target.label+' · '+dist+' m':(S.f==='d'?'Deniz birliği':S.f==='h'?'Hava birliği':'Kara birliği')+' · Görüşmeye git · '+dist+' m';
    const inRange=C.distance(world,target)<=(mission?46:64);
    $('worldInteract').textContent=mission?(inRange?'Tamamla · E':'Noktaya yaklaş'):inRange?'Konuş · E':near&&C.missions[n.id]?'Görev al · E':near?'Konuş · E':'Yaklaş · E';
    $('worldInteract').disabled=!inRange&&!near;
    const showSide=!mission&&near&&C.missions[n.id]&&world.activityUsed!==S.totalDecisions;
    $('worldSideTask').classList.toggle('hide',!showSide);
    if(showSide)$('worldSideTask').textContent=C.missions[n.id].title+' başlat';
    $('worldCancelTask').classList.toggle('hide',!mission);
    $('worldMapBtn').setAttribute('aria-pressed',String(overview));
    const markerKey=[target.x,target.y,mission?'side':'main'].join(':');
    if(markerKey!==lastMarker){lastMarker=markerKey;
      const color=mission?'#a5d9e4':'#f3d487';
      $('worldMarker').innerHTML=`<g transform="translate(${target.x} ${target.y})"><ellipse cy="4" rx="29" ry="15" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="6 5"/><g class="questBeacon"><path d="M-12-81H12V-59L0-48-12-59Z" fill="${color}" stroke="#263e32" stroke-width="2"/><text y="-61" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#233f35">${mission?'•':'!'}</text></g></g>`;
    }
  }
  function drawRoute(){
    $('worldRoute').innerHTML=world&&path.length?`<polyline points="${[{x:world.x,y:world.y},...path].map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="#f3db9c" stroke-width="3" stroke-dasharray="4 9" opacity=".65"/>`:'';
  }
  function goTo(target){
    if(!canExplore()||!target)return;
    path=C.route(world,target);drawRoute();
    if(!path.length)notify('Buraya yürünemiyor. Açık bir alan seç.');
  }
  function draw(){
    if(!world)return;
    const rect=$('worldViewport').getBoundingClientRect(),ratio=Math.max(.5,rect.width/Math.max(1,rect.height));
    if(overview)scene.setAttribute('viewBox','0 0 960 800');
    else{
      const width=Math.min(760,Math.max(430,ratio*430)),height=Math.min(800,width/ratio);
      const x=C.clamp(world.x-width/2,0,C.WIDTH-width),y=C.clamp(world.y-height*.56,0,C.HEIGHT-height);
      scene.setAttribute('viewBox',[x,y,width,height].join(' '));
    }
    player.setAttribute('transform','translate('+world.x.toFixed(2)+' '+world.y.toFixed(2)+')');
    $('worldCargo').setAttribute('transform',player.getAttribute('transform'));
    player.dataset.facing=world.facing;
  }
  function frame(time){
    rafId=0;const dt=Math.min(.05,(time-lastTime)/1000);lastTime=time;
    if(active&&S&&!S.ended){
      if(canExplore()){
        let vx=joystick.x+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
        let vy=joystick.y+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
        if(vx||vy){if(path.length){path=[];drawRoute()}}
        else if(path.length){const p=path[0],d=C.distance(world,p);if(d<5){path.shift();drawRoute()}else{vx=(p.x-world.x)/d;vy=(p.y-world.y)/d}}
        const next=C.move(world,vx,vy,dt),moved=C.distance(world,next)>.01;
        if(moved){world.x=next.x;world.y=next.y;world.facing=Math.abs(vx)>Math.abs(vy)?vx>0?'right':'left':vy>0?'down':'up';dirty=true;draw();updateUI()}
        player.classList.toggle('walking',moved&&!reduced.matches);
        if(dirty&&time-lastSave>1800){save();lastSave=time}
      }else resetInput();
      if(toastUntil&&time>=toastUntil){$('worldToast').classList.remove('on');toastUntil=0}
      rafId=requestAnimationFrame(frame);
    }
  }
  scene.addEventListener('click',e=>{
    if(!canExplore())return;
    const point=scene.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
    const matrix=scene.getScreenCTM();if(!matrix)return;
    const p=point.matrixTransform(matrix.inverse());goTo(p);
  });
  function stickMove(e){
    if(e.pointerId!==stickId)return;
    const rect=stick.getBoundingClientRect(),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2;
    const length=Math.hypot(dx,dy),limit=27,scale=Math.max(limit,length);
    joystick={x:length<5?0:dx/scale,y:length<5?0:dy/scale};
    $('stickKnob').style.transform='translate('+(joystick.x*limit)+'px,'+(joystick.y*limit)+'px)';
  }
  stick.addEventListener('pointerdown',e=>{if(!canExplore())return;e.preventDefault();stickId=e.pointerId;stick.setPointerCapture(e.pointerId);stickMove(e)});
  stick.addEventListener('pointermove',stickMove);
  for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,()=>{joystick={x:0,y:0};stickId=null;$('stickKnob').style.transform='translate(0,0)'});
  window.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if(dialogue&&!blocked()){
      if(key==='escape'){e.preventDefault();closeDialogue()}
      if(key==='tab'){
        const controls=[$('leaveEncounter'),$('chL'),$('chR')].filter(el=>!el.disabled),first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
      return;
    }
    if(!canExplore())return;
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();keys.add(key)}
    if(key==='e'&&!e.repeat){e.preventDefault();interact()}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',resetInput);
  document.addEventListener('visibilitychange',()=>{resetInput();if(document.hidden&&S&&!S.ended&&!locked)persistGame(S.resumeScreen||'card','world-hidden')});
  window.addEventListener('resize',()=>{draw();if(dialogue)requestAnimationFrame(fitText)});
  $('worldInteract').onclick=interact;$('worldSideTask').onclick=startTask;
  $('worldCancelTask').onclick=()=>{if(!canExplore()||!world.mission)return;world.mission=null;resetInput();dirty=true;lastMarker='';updateUI();save();notify('Saha görevi bırakıldı. Bu dönem yeniden ödül alınamaz.')};
  $('worldRouteBtn').onclick=()=>goTo(objective());
  $('worldMapBtn').onclick=()=>{if(!canExplore())return;overview=!overview;$('worldMapBtn').textContent=overview?'Yakın görünüm':'Harita';lastUI='';draw();updateUI()};
  $('leaveEncounter').onclick=()=>{if(!locked)closeDialogue()};
  window.SicilWorld={onCard,onDecision,get active(){return active},get dialogue(){return dialogue}};
})();
