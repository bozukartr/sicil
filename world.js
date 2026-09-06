/* Roleplay day controller and floating touch movement. Legacy cards are no longer the main loop. */
(function(){
  'use strict';
  const C=window.SicilWorldCore,A=window.SicilWorldArt,D=window.SicilDuty,T=window.SicilTouch,$=id=>document.getElementById(id);
  const app=$('app'),scene=$('worldScene'),player=$('worldPlayer'),stick=$('worldStick'),viewport=$('worldViewport');
  const overlayIds=['start','exam','specialty','transition','end','promo','file'];
  let active=false,state=null,world=null,duty=null,path=[],keys=new Set(),touch=null,inventory=false;
  let overview=false,lastTime=0,lastSave=0,dirty=false,rafId=0,toastUntil=0,lastUI='',lastMarker='',suppressClickUntil=0,lastUniform=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  $('worldTerrain').innerHTML=A.map();
  $('worldNpcs').innerHTML=C.stations.map(s=>`<g transform="translate(${s.x} ${s.y})">${A.sprite(s.color)}<rect x="-49" y="13" width="98" height="19" rx="5" fill="#102d23" opacity=".88"/><text x="0" y="26" text-anchor="middle" fill="#f1ead6" font-family="sans-serif" font-size="10">${s.name}</text></g>`).join('')+
    [0,1,2,3].map((n)=>`<g transform="translate(${412+(n%2)*29} ${407+Math.floor(n/2)*42})">${A.sprite('#7d9567')}</g>`).join('');
  function blocked(){return !active||!S||S.ended||locked||document.hidden||overlayIds.some(id=>!$(id).classList.contains('hide'))}
  function canExplore(){return !blocked()&&!inventory}
  function releaseTouch(id){
    if(!touch||(id!==undefined&&touch.id!==id))return;
    const old=touch.id;touch=null;stick.classList.remove('active');$('stickKnob').style.transform='translate(0,0)';suppressClickUntil=performance.now()+650;
    if(viewport.hasPointerCapture?.(old))viewport.releasePointerCapture(old);
  }
  function resetInput(){keys.clear();releaseTouch();if(path.length){path=[];drawRoute()}player.classList.remove('walking')}
  function notify(text){$('worldToast').textContent=text;$('worldToast').classList.add('on');toastUntil=performance.now()+3600}
  function objective(){return duty?D.target(duty):null}
  function save(){if(!S||blocked())return;persistGame('card','duty-exploration');dirty=false}
  function onCard(){
    if(state!==S){
      state=S;S.world=C.restore(S.world);world=S.world;S.duty=D.restore(S.duty,world);duty=S.duty;
      // Keep old mission checkpoint on migration, then use one authoritative duty state.
      world.mission=null;resetInput();overview=false;inventory=false;$('inventoryPanel').classList.add('hide');$('inventoryBtn').setAttribute('aria-expanded','false');$('worldMapBtn').textContent='Harita';
    }
    world=S.world;duty=S.duty;ev=null;locked=false;active=true;
    app.classList.add('rpg','dutyMode');app.classList.remove('inEncounter');$('world').classList.remove('hide');$('world').inert=false;$('encounter').inert=true;
    resetInput();lastMarker='';lastUI='';draw();updateUI();paintHUD();
    $('worldGuide').textContent='Sol alanda bas ve sürükle · Sağda dokunarak hedef seç';
    if(!world.introduced){notify('Görev günün başladı. Önce koğuşta üniformanı kuşan.');world.introduced=true;dirty=true}
    if(!rafId){lastTime=performance.now();rafId=requestAnimationFrame(frame)}
  }
  function interact(){
    if(!canExplore())return;
    const result=D.act(duty,world);
    if(!result){notify('İşaretli noktaya biraz daha yaklaş.');return}
    resetInput();dirty=true;lastUI='';lastMarker='';updateUI();draw();
    if(result.kind==='report'){
      addJournal('field','Görev günü '+duty.day+' · '+result.grade,C.missions[duty.missionKey].title+' · '+result.score+'/100');
      locked=true;
      // Apply the same career scoring and promotion gates. One duty day advances one calendar day.
      apply({st:result.stats,add:[],del:[],later:[],t:1/30,end:null});
      notify('Rapor kaydedildi · '+result.text+' · Sicil güncellendi');
    }else{
      if(result.kind==='rest')addJournal('rest','Görev günü '+duty.day+' başladı','İstirahat tamamlandı; enerji ve kumanya yenilendi.');
      save();notify(result.text);
    }
  }
  function updateInventory(){
    $('inventoryItems').textContent=(duty.uniform?'✓ Üniforma kuşanıldı':'○ Üniforma dolapta')+'\n'+(duty.radio?'✓ Telsiz':'○ Telsiz teslim alınmadı')+'\n'+(duty.pack?'✓ Saha çantası':'○ Saha çantası teslim alınmadı')+'\nKumanya: '+duty.rations;
    $('useRation').disabled=!duty.rations||duty.energy>=100;
  }
  function updateUI(){
    if(!duty)return;
    const target=objective(),n=C.nearest(world),near=C.distance(world,n)<=64;
    const cargo=duty.phase===4&&duty.missionKey==='supply'&&duty.fieldStep===1;
    $('worldCargo').setAttribute('visibility',cargo?'visible':'hidden');
    if(lastUniform!==duty.uniform){lastUniform=duty.uniform;player.innerHTML=A.sprite(duty.uniform?'#80976c':'#9ca3a1',true)+'<path class="playerPointer" d="M-5-62 0-56 5-62Z" fill="#f2d48d"/>'}
    const dist=Math.round(C.distance(world,target)/10),inRange=C.distance(world,target)<=46;
    const signature=[duty.day,duty.phase,duty.fieldStep,Math.ceil(duty.energy),duty.rations,near?n.id:'',dist,inRange,overview].join('|');
    if(signature===lastUI)return;lastUI=signature;
    $('worldLocation').textContent=near?n.place:target.x===190&&inRange?'Koğuş önü':'Birlik yerleşkesi';
    $('dutyClock').textContent='GÜN '+duty.day+' · '+target.time;
    $('dutyEnergy').textContent='Enerji '+Math.ceil(duty.energy);$('dutyEnergy').classList.toggle('tired',duty.energy<25);
    viewport.dataset.period=duty.phase>=5?'evening':duty.phase<=1?'morning':'day';
    $('questType').textContent='GÖREV GÜNÜ · '+(duty.phase+1)+' / 7'+(duty.phase===4?' · NOKTA '+(duty.fieldStep+1)+' / '+C.missions[duty.missionKey].steps.length:'');
    $('questTitle').textContent=target.title;
    $('questDetail').textContent=target.label+' · '+dist+' m';
    $('worldInteract').textContent=inRange?target.action+' · E':'Hedefe yaklaş';$('worldInteract').disabled=!inRange;
    $('worldMapBtn').setAttribute('aria-pressed',String(overview));updateInventory();
    const markerKey=[target.x,target.y,duty.phase,duty.fieldStep].join(':');
    if(markerKey!==lastMarker){lastMarker=markerKey;const color=duty.phase===4?'#a5d9e4':'#f3d487';
      $('worldMarker').innerHTML=`<g transform="translate(${target.x} ${target.y})"><ellipse cy="4" rx="29" ry="15" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="6 5"/><g class="questBeacon"><path d="M-12-81H12V-59L0-48-12-59Z" fill="${color}" stroke="#263e32" stroke-width="2"/><text y="-61" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#233f35">!</text></g></g>`;
    }
  }
  function drawRoute(){
    $('worldRoute').innerHTML=world&&path.length?`<polyline points="${[{x:world.x,y:world.y},...path].map(p=>p.x+','+p.y).join(' ')}" fill="none" stroke="#f3db9c" stroke-width="3" stroke-dasharray="4 9" opacity=".65"/>`:'';
  }
  function goTo(target){if(!canExplore()||!target)return;releaseTouch();path=C.route(world,target);drawRoute();if(!path.length)notify('Buraya yürünemiyor. Açık bir alan seç.')}
  function draw(){
    if(!world)return;
    const rect=viewport.getBoundingClientRect(),ratio=Math.max(.5,rect.width/Math.max(1,rect.height));
    if(overview)scene.setAttribute('viewBox','0 0 960 800');
    else{const width=Math.min(760,Math.max(430,ratio*430)),height=Math.min(800,width/ratio);scene.setAttribute('viewBox',[C.clamp(world.x-width/2,0,C.WIDTH-width),C.clamp(world.y-height*.56,0,C.HEIGHT-height),width,height].join(' '))}
    player.setAttribute('transform','translate('+world.x.toFixed(2)+' '+world.y.toFixed(2)+')');$('worldCargo').setAttribute('transform',player.getAttribute('transform'));player.dataset.facing=world.facing;
  }
  function frame(time){
    rafId=0;const dt=Math.min(.05,(time-lastTime)/1000);lastTime=time;
    if(active&&S&&!S.ended){
      if(canExplore()){
        let vx=(touch?.vx||0)+(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
        let vy=(touch?.vy||0)+(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
        if(vx||vy){if(path.length){path=[];drawRoute()}}
        else if(!touch&&path.length){const p=path[0],d=C.distance(world,p);if(d<5){path.shift();drawRoute()}else{vx=(p.x-world.x)/d;vy=(p.y-world.y)/d}}
        const next=C.move(world,vx,vy,dt*(duty.energy<25?.65:1)),distance=C.distance(world,next),moved=distance>.01;
        if(moved){world.x=next.x;world.y=next.y;world.facing=Math.abs(vx)>Math.abs(vy)?vx>0?'right':'left':vy>0?'down':'up';D.walk(duty,distance);dirty=true;draw();updateUI()}
        player.classList.toggle('walking',moved&&!reduced.matches);
        if(dirty&&time-lastSave>1800){save();lastSave=time}
      }else resetInput();
      if(toastUntil&&time>=toastUntil){$('worldToast').classList.remove('on');toastUntil=0}
      rafId=requestAnimationFrame(frame);
    }
  }
  // Touch begins anywhere in the left 70% of the playfield, not on a fixed knob.
  function paintTouch(){if(!touch)return;stick.style.left=touch.x+'px';stick.style.top=touch.y+'px';$('stickKnob').style.transform='translate('+(touch.vx*T.RADIUS)+'px,'+(touch.vy*T.RADIUS)+'px)'}
  viewport.addEventListener('pointerdown',e=>{
    if(!canExplore()||overview||touch||e.pointerType==='mouse')return;
    const rect=viewport.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
    if(x>rect.width*.7)return;
    e.preventDefault();resetInput();touch=T.start(e.pointerId,x,y);suppressClickUntil=performance.now()+650;viewport.setPointerCapture(e.pointerId);stick.classList.add('active');paintTouch();
  });
  viewport.addEventListener('pointermove',e=>{
    if(!touch||e.pointerId!==touch.id)return;
    if(!canExplore()){resetInput();return}
    e.preventDefault();const rect=viewport.getBoundingClientRect();touch=T.move(touch,e.pointerId,e.clientX-rect.left,e.clientY-rect.top);suppressClickUntil=performance.now()+650;paintTouch();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(type,e=>releaseTouch(e.pointerId));
  scene.addEventListener('click',e=>{
    if(!canExplore()||touch||performance.now()<suppressClickUntil)return;
    const point=scene.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const matrix=scene.getScreenCTM();if(matrix)goTo(point.matrixTransform(matrix.inverse()));
  });
  function closeInventory(){inventory=false;$('inventoryPanel').classList.add('hide');$('inventoryBtn').setAttribute('aria-expanded','false');$('inventoryBtn').focus({preventScroll:true})}
  window.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if(inventory){if(key==='escape'){e.preventDefault();closeInventory()}return}
    if(!canExplore())return;
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();keys.add(key)}
    if(key==='e'&&!e.repeat){e.preventDefault();interact()}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',resetInput);
  document.addEventListener('visibilitychange',()=>{resetInput();if(document.hidden&&S&&!S.ended&&!locked)persistGame(S.resumeScreen||'card','world-hidden')});
  window.addEventListener('resize',()=>{resetInput();draw()});
  $('worldInteract').onclick=interact;$('worldRouteBtn').onclick=()=>goTo(objective());
  $('worldMapBtn').onclick=()=>{if(!canExplore())return;resetInput();overview=!overview;$('worldMapBtn').textContent=overview?'Yakın görünüm':'Harita';lastUI='';draw();updateUI()};
  $('inventoryBtn').onclick=()=>{if(blocked())return;if(inventory){closeInventory();return}inventory=true;resetInput();updateInventory();$('inventoryPanel').classList.remove('hide');$('inventoryBtn').setAttribute('aria-expanded','true');$('inventoryClose').focus({preventScroll:true})};
  $('inventoryClose').onclick=closeInventory;
  $('useRation').onclick=()=>{if(blocked()||!inventory||!D.eat(duty))return;dirty=true;lastUI='';updateUI();save();notify('Kumanya kullanıldı · Enerji yenilendi')};
  window.SicilWorld={onCard,get active(){return active},get dialogue(){return false}};
})();
