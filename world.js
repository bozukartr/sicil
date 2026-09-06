/* Roleplay day controller and floating touch movement. Legacy cards are no longer the main loop. */
(function(){
  'use strict';
  const C=window.SicilWorldCore,A=window.SicilWorldArt,D=window.SicilDuty,T=window.SicilTouch,R=window.SicilRelations,$=id=>document.getElementById(id);
  const app=$('app'),scene=$('worldScene'),player=$('worldPlayer'),stick=$('worldStick'),viewport=$('worldViewport');
  const overlayIds=['start','exam','specialty','transition','end','promo','file'];
  let active=false,state=null,world=null,duty=null,path=[],keys=new Set(),touch=null,inventory=false,social=null;
  let overview=false,lastTime=0,lastSave=0,dirty=false,rafId=0,toastUntil=0,lastUI='',lastMarker='',suppressClickUntil=0,lastUniform=null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function renderScene(){
    const area=C.areaOf(world);
    $('worldTerrain').innerHTML=area==='yard'?A.map():A.room(area);
    $('worldNpcs').innerHTML=C.stations.filter(n=>C.areaOf(n)===area).map(s=>`<g transform="translate(${s.x} ${s.y})">${A.sprite(s.color)}<rect x="-51" y="13" width="102" height="19" rx="5" fill="#102d23" opacity=".88"/><text x="0" y="26" text-anchor="middle" fill="#f1ead6" font-family="sans-serif" font-size="10">${s.name}</text></g>`).join('')+
      (area==='yard'?[0,1,2,3].map(n=>`<g transform="translate(${412+(n%2)*29} ${407+Math.floor(n/2)*42})">${A.sprite('#7d9567')}</g>`).join(''):'');
    overview=false;$('worldMapBtn').textContent=area==='yard'?'Harita':'Oda planı';viewport.dataset.area=area;lastMarker='';lastUI='';
    scene.setAttribute('aria-label',C.geometry(area).name+'; karakterin, kişiler ve görev işaretleri');
  }
  function blocked(){return !active||!S||S.ended||locked||document.hidden||overlayIds.some(id=>!$(id).classList.contains('hide'))}
  function canExplore(){return !blocked()&&!inventory&&!social}
  function releaseTouch(id){
    if(!touch||(id!==undefined&&touch.id!==id))return;
    const old=touch.id;touch=null;stick.classList.remove('active');$('stickKnob').style.transform='translate(0,0)';suppressClickUntil=performance.now()+650;
    if(viewport.hasPointerCapture?.(old))viewport.releasePointerCapture(old);
  }
  function resetInput(){keys.clear();releaseTouch();if(path.length){path=[];drawRoute()}player.classList.remove('walking')}
  function notify(text){$('worldToast').textContent=text;$('worldToast').classList.add('on');toastUntil=performance.now()+3600}
  function objective(){return duty?C.waypoint(world,D.target(duty)):null}
  function save(){if(!S||blocked())return;persistGame('card','duty-exploration');dirty=false}
  function onCard(){
    if(state!==S){
      state=S;S.world=C.restore(S.world);world=S.world;S.duty=D.restore(S.duty,world);duty=S.duty;S.contacts=R.restore(S.contacts);social=null;$('socialPanel').classList.add('hide');viewport.inert=false;
      // Keep old mission checkpoint on migration, then use one authoritative duty state.
      world.mission=null;resetInput();overview=false;inventory=false;$('inventoryPanel').classList.add('hide');$('inventoryBtn').setAttribute('aria-expanded','false');$('worldMapBtn').textContent='Harita';
    }
    world=S.world;duty=S.duty;ev=null;locked=false;active=true;
    app.classList.add('rpg','dutyMode');app.classList.remove('inEncounter');$('world').classList.remove('hide');$('world').inert=false;$('encounter').inert=true;
    resetInput();renderScene();draw();updateUI();paintHUD();
    $('worldGuide').textContent='Sol alanda bas ve sürükle · Sağda dokunarak hedef seç';
    if(!world.introduced){notify('Görev günün başladı. Önce koğuşta üniformanı kuşan.');world.introduced=true;dirty=true}
    if(!rafId){lastTime=performance.now();rafId=requestAnimationFrame(frame)}
  }
  function changeRoom(to){
    if(!canExplore())return;
    const destination=C.travel(world,to);if(!destination)return;
    resetInput();Object.assign(world,destination);dirty=true;renderScene();draw();updateUI();save();notify(C.geometry(world.area).name);
  }
  function interact(){
    if(!canExplore())return;
    const target=objective();if(target.portal){changeRoom(target.portal);return}
    const result=D.act(duty,world);
    if(!result){notify('İşaretli noktaya biraz daha yaklaş.');return}
    resetInput();dirty=true;lastUI='';lastMarker='';updateUI();draw();
    if(result.kind==='report'){
      const changes=R.report(S.contacts,duty,result.score);
      changes.forEach(c=>addJournal('relationship',C.stations.find(n=>n.id===c.id).name+' · Güven '+(c.delta>=0?'+':'')+c.delta,'Görev performansın ilişkiyi etkiledi.'));
      addJournal('field','Görev günü '+duty.day+' · '+result.grade,C.missions[duty.missionKey].title+' · '+result.score+'/100');
      locked=true;
      // Apply the same career scoring and promotion gates. One duty day advances one calendar day.
      apply({st:result.stats,add:[],del:[],later:[],t:1/30,end:null});
      notify('Rapor kaydedildi · '+result.text+' · Komutan güveni '+(changes[0]?.delta>=0?'+':'')+(changes[0]?.delta||0));
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
    const target=objective(),n=C.nearest(world),near=!!n&&C.distance(world,n)<=64,door=C.portalAt(world);
    const cargo=duty.phase===4&&duty.missionKey==='supply'&&duty.fieldStep===1;
    $('worldCargo').setAttribute('visibility',cargo?'visible':'hidden');
    if(lastUniform!==duty.uniform){lastUniform=duty.uniform;player.innerHTML=A.sprite(duty.uniform?'#80976c':'#9ca3a1',true)+'<path class="playerPointer" d="M-5-62 0-56 5-62Z" fill="#f2d48d"/>'}
    const dist=Math.round(C.distance(world,target)/10),inRange=C.distance(world,target)<=(target.portal?40:46);
    const signature=[duty.day,duty.phase,duty.fieldStep,Math.ceil(duty.energy),duty.rations,near?n.id:'',dist,inRange,overview,world.area,door].join('|');
    if(signature===lastUI)return;lastUI=signature;
    $('worldLocation').textContent=C.areaOf(world)==='yard'?(near?n.place:'Birlik yerleşkesi'):C.geometry(world.area).name;
    $('worldDoorBtn').classList.toggle('hide',!door);$('worldDoorBtn').textContent=door==='yard'?'Kışlaya çık':door?C.rooms[door].name+' · Gir':'';
    $('worldTalkBtn').classList.toggle('hide',!near);if(near)$('worldTalkBtn').textContent=n.name+' · Konuş';
    $('dutyClock').textContent='GÜN '+duty.day+' · '+target.time;
    $('dutyEnergy').textContent='Enerji '+Math.ceil(duty.energy);$('dutyEnergy').classList.toggle('tired',duty.energy<25);
    viewport.dataset.period=duty.phase>=5?'evening':duty.phase<=1?'morning':'day';
    $('questType').textContent='GÖREV GÜNÜ · '+(duty.phase+1)+' / 7'+(duty.phase===4?' · NOKTA '+(duty.fieldStep+1)+' / '+C.missions[duty.missionKey].steps.length:'');
    $('questTitle').textContent=target.title;
    $('questDetail').textContent=target.label+' · '+dist+' m';
    $('worldInteract').textContent=inRange?target.action+' · E':'Hedefe yaklaş';$('worldInteract').disabled=!inRange;
    $('worldMapBtn').setAttribute('aria-pressed',String(overview));updateInventory();
    const markerKey=[target.x,target.y,duty.phase,duty.fieldStep,world.area].join(':');
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
    const space=C.geometry(C.areaOf(world)),rect=viewport.getBoundingClientRect(),ratio=Math.max(.5,rect.width/Math.max(1,rect.height));
    if(overview)scene.setAttribute('viewBox','0 0 '+space.width+' '+space.height);
    else{const width=Math.min(space.width,760,Math.max(430,ratio*430)),height=Math.min(space.height,width/ratio);scene.setAttribute('viewBox',[C.clamp(world.x-width/2,0,space.width-width),C.clamp(world.y-height*.56,0,space.height-height),width,height].join(' '))}
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
    if(social){
      if(blocked())return;
      if(key==='escape'){e.preventDefault();closeSocial()}
      if(key==='tab'){const controls=[$('socialHelp'),$('socialClose')].filter(el=>!el.disabled),first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
      return;
    }
    if(inventory){if(key==='escape'){e.preventDefault();closeInventory()}return}
    if(!canExplore())return;
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){e.preventDefault();keys.add(key)}
    if(key==='e'&&!e.repeat){e.preventDefault();interact()}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',resetInput);
  document.addEventListener('visibilitychange',()=>{resetInput();if(document.hidden&&S&&!S.ended&&!locked)persistGame(S.resumeScreen||'card','world-hidden')});
  window.addEventListener('resize',()=>{resetInput();draw()});
  $('worldInteract').onclick=interact;$('worldRouteBtn').onclick=()=>goTo(objective());
  $('worldMapBtn').onclick=()=>{if(!canExplore())return;resetInput();overview=!overview;$('worldMapBtn').textContent=overview?'Yakın görünüm':C.areaOf(world)==='yard'?'Harita':'Oda planı';lastUI='';draw();updateUI()};
  $('inventoryBtn').onclick=()=>{if(blocked()||social)return;if(inventory){closeInventory();return}inventory=true;resetInput();updateInventory();$('inventoryPanel').classList.remove('hide');$('inventoryBtn').setAttribute('aria-expanded','true');$('inventoryClose').focus({preventScroll:true})};
  $('inventoryClose').onclick=closeInventory;
  $('useRation').onclick=()=>{if(blocked()||!inventory||!D.eat(duty))return;dirty=true;lastUI='';updateUI();save();notify('Kumanya kullanıldı · Enerji yenilendi')};
  function renderContacts(){
    if(!S?.contacts)return;
    $('fileContacts').innerHTML='<h3>Birlikteki ilişkiler</h3>'+C.stations.map(n=>'<div class="contactRow"><span><b>'+n.name+'</b><small>'+n.role+'</small></span><span>'+R.tier(S.contacts[n.id].trust)+' · '+S.contacts[n.id].trust+'/100</span></div>').join('');
  }
  function refreshSocial(){
    if(!social)return;const contact=S.contacts[social.id];
    $('socialName').textContent=social.name;$('socialRole').textContent=social.role;
    $('socialTrustLabel').textContent=R.tier(contact.trust)+' · Güven '+contact.trust+'/100';$('socialTrustMeter').value=contact.trust;
    $('socialLine').textContent=R.line(social.id,duty,contact.trust);
    $('socialHelp').disabled=contact.trust<60||contact.helpDay===duty.day||duty.energy>=100;
    $('socialHelp').textContent=contact.trust<60?'Destek için 60 güven gerekli':contact.helpDay===duty.day?'Bugünkü destek alındı':duty.energy>=100?'Enerjin zaten dolu':'Destek iste · +10 enerji';
  }
  function closeSocial(){social=null;$('socialPanel').classList.add('hide');viewport.inert=false;resetInput();$('worldTalkBtn').focus({preventScroll:true})}
  $('worldDoorBtn').onclick=()=>{if(canExplore()){const to=C.portalAt(world);if(to)changeRoom(to)}};
  $('worldTalkBtn').onclick=()=>{
    if(!canExplore())return;const n=C.nearest(world);if(!n||C.distance(world,n)>64)return;
    social=n;resetInput();viewport.inert=true;
    if(R.greet(S.contacts,n.id,duty.day)){addJournal('relationship',n.name+' ile sohbet','Güven +2');dirty=true;save()}
    refreshSocial();$('socialPanel').classList.remove('hide');$('socialClose').focus({preventScroll:true});
  };
  $('socialClose').onclick=closeSocial;
  $('socialHelp').onclick=()=>{
    if(blocked()||!social||!R.help(S.contacts,social.id,duty))return;
    addJournal('relationship',social.name+' destek verdi','Enerji +10');dirty=true;lastUI='';updateUI();refreshSocial();save();
    $('socialLine').textContent='Kısa bir mola ve destek iyi geldi. Enerjin 10 puan yenilendi.';
  };
  window.SicilWorld={renderContacts,onCard,get active(){return active},get dialogue(){return false}};
})();
