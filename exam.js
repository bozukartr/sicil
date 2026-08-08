"use strict";

const examEl=document.getElementById("exam"),examBody=document.getElementById("examBody"),
      examStep=document.getElementById("examStep"),examScore=document.getElementById("examScore"),
      examTrack=document.getElementById("examTrack");
let EXAM=null;
const EXAM_LABELS=["01 · Tepki","02 · Hafıza","03 · Muhakeme","Sonuç"];
const REACTION_VARIANTS={signal:"Sinyal Tepkisi",identify:"Dost–Tehdit Ayrımı",hold:"Süre Kontrolü"};
const MEMORY_VARIANTS={symbols:"İşaret Dizisi",grid:"Rota Hafızası",code:"Kod Hafızası",positions:"Mevzi Hafızası"};
const MINI_GAME_POOL=[
  ...Object.entries(REACTION_VARIANTS).map(([id,name])=>({id:"reaction_"+id,name,stage:"reaction"})),
  ...Object.entries(MEMORY_VARIANTS).map(([id,name])=>({id:"memory_"+id,name,stage:"memory"})),
  {id:"logic_mixed",name:"Karma Muhakeme",stage:"logic"}
];
function shuffledExam(items){
  const out=items.slice();
  for(let i=out.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[out[i],out[j]]=[out[j],out[i]]}
  return out;
}
function sampleQuestions(items,count){return shuffledExam(items).slice(0,count)}
function examMeta(stage){
  examStep.textContent=EXAM_LABELS[stage];
  examScore.textContent=Math.round(EXAM.score)+" PUAN";
  examTrack.innerHTML=[0,1,2].map(i=>'<i class="'+(stage>i?"done":stage===i?"now":"")+'"></i>').join("");
}
function examIntro(kicker,glyph,title,copy,button,action){
  examMeta(EXAM.stage);
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">'+kicker+'</div><div class="examGlyph">'+glyph+'</div>'+ 
    '<h2 class="examTitle">'+title+'</h2><p class="examCopy">'+copy+'</p><button class="examAction" id="examAction">'+button+'</button></div>';
  document.getElementById("examAction").onclick=action;
}
function beginExam(force){
  locked=true;
  const reactionModes=Object.keys(REACTION_VARIANTS),memoryModes=Object.keys(MEMORY_VARIANTS);
  const reactionMode=reactionModes[(Math.random()*reactionModes.length)|0];
  const memoryMode=memoryModes[(Math.random()*memoryModes.length)|0];
  EXAM={force,stage:0,score:0,timer:0,reactionRound:0,reactionPoints:0,memoryCorrect:0,logicCorrect:0,
    reactionMode,memoryMode,logicQuestions:sampleQuestions(LOGIC_Q,5),variants:{reaction:REACTION_VARIANTS[reactionMode],memory:MEMORY_VARIANTS[memoryMode],logic:"Karma Muhakeme"}};
  examEl.classList.remove("hide");
  showReactionIntro();
}
function showReactionIntro(){
  const mode=EXAM.reactionMode;
  const copy=mode==="identify"?"Üç taramada yalnızca HEDEF koduna dokun. DOST kodunda bekle; erken veya yanlış temas puan kaybettirir."
    :mode==="hold"?"Gösterilen süreyi zihninden say. Düğmeye basılı tut ve hedef süreye ulaştığını düşündüğün anda bırak; üç turun toplamı değerlendirilir."
    :"Sinyal yeşile döndüğü anda dokun. Erken dokunuş puan kaybettirir; üç turun ortalaması siciline işlenir.";
  examIntro("Aday Seçmeleri · 1/3",mode==="identify"?"◉":mode==="hold"?"◌":"◎",REACTION_VARIANTS[mode],copy,"Testi başlat",startReactionRound);
}
function startReactionRound(){
  if(EXAM.reactionRound>=3){
    EXAM.score+=EXAM.reactionPoints;EXAM.stage=1;showMemoryIntro();return;
  }
  if(EXAM.reactionMode==="hold"){startHoldReactionRound();return}
  if(EXAM.reactionMode==="identify"){startIdentifyReactionRound();return}
  startSignalReactionRound();
}
function startSignalReactionRound(){
  examMeta(0);
  const round=EXAM.reactionRound+1;
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Tepki · Tur '+round+'/3</div>'+ 
    '<div class="roundLabel">Sinyali bekle</div><button class="reactionPad" id="reactionPad">BEKLE</button></div>';
  const pad=document.getElementById("reactionPad");let armed=false,done=false,started=0;
  EXAM.timer=setTimeout(()=>{if(done)return;armed=true;started=performance.now();pad.classList.add("ready");pad.textContent="ŞİMDİ"},750+Math.random()*1100);
  pad.onclick=()=>{
    if(done)return;done=true;clearTimeout(EXAM.timer);
    if(!armed){pad.classList.add("early");pad.textContent="ERKEN";EXAM.reactionPoints+=2}
    else{
      const ms=performance.now()-started;
      EXAM.reactionPoints+=Math.max(2,Math.min(12,Math.round(12-Math.max(0,ms-220)/70)));
      pad.textContent=Math.round(ms)+" MS";
    }
    EXAM.reactionRound++;examScore.textContent=Math.round(EXAM.score+EXAM.reactionPoints)+" PUAN";
    setTimeout(startReactionRound,620);
  };
}
function startIdentifyReactionRound(){
  examMeta(0);const round=EXAM.reactionRound+1;
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Ayrım · Tur '+round+'/3</div>'+ 
    '<div class="roundLabel">Yalnızca HEDEF koduna dokun</div><button class="reactionPad identify" id="reactionPad">TARAMA</button></div>';
  const pad=document.getElementById("reactionPad");let armed=false,done=false,started=0,signal="";
  const finish=(points,label)=>{
    if(done)return;done=true;clearTimeout(EXAM.timer);EXAM.reactionPoints+=points;EXAM.reactionRound++;
    pad.textContent=label;examScore.textContent=Math.round(EXAM.score+EXAM.reactionPoints)+" PUAN";setTimeout(startReactionRound,620);
  };
  EXAM.timer=setTimeout(()=>{
    if(done)return;armed=true;started=performance.now();signal=Math.random()<.65?"HEDEF":"DOST";EXAM.identifySignal=signal;
    pad.textContent=signal;pad.classList.add(signal==="HEDEF"?"target":"friend");
    EXAM.timer=setTimeout(()=>finish(signal==="DOST"?12:2,signal==="DOST"?"DOĞRU":"GEÇ KALDIN"),850);
  },650+Math.random()*700);
  pad.onclick=()=>{
    if(done)return;
    if(!armed){pad.classList.add("early");finish(2,"ERKEN");return}
    if(signal==="DOST"){pad.classList.add("early");finish(0,"YANLIŞ");return}
    const ms=performance.now()-started;
    finish(Math.max(2,Math.min(12,Math.round(12-Math.max(0,ms-220)/70))),Math.round(ms)+" MS");
  };
}
function startHoldReactionRound(){
  examMeta(0);const round=EXAM.reactionRound+1,target=Math.round((650+Math.random()*500)/50)*50;
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Süre · Tur '+round+'/3</div>'+ 
    '<div class="roundLabel">Hedef · '+(target/1000).toFixed(2)+' saniye</div><button class="reactionPad hold" id="reactionPad"><span>BASILI TUT</span></button></div>';
  const pad=document.getElementById("reactionPad"),label=pad.querySelector("span");let holding=false,done=false,started=0;
  pad.style.setProperty("--hold-duration",target+"ms");EXAM.holdTarget=target;
  const finish=duration=>{
    if(done)return;done=true;holding=false;clearTimeout(EXAM.timer);pad.classList.remove("holding");
    const diff=Math.abs(duration-target),points=diff<=100?12:diff<=200?10:diff<=320?7:diff<=450?4:2;
    EXAM.reactionPoints+=points;EXAM.reactionRound++;label.textContent=Math.round(duration)+" MS";
    examScore.textContent=Math.round(EXAM.score+EXAM.reactionPoints)+" PUAN";setTimeout(startReactionRound,720);
  };
  pad.onpointerdown=e=>{
    if(done||holding)return;e.preventDefault();if(e.pointerId!=null&&pad.setPointerCapture)pad.setPointerCapture(e.pointerId);
    holding=true;started=performance.now();pad.classList.add("holding");label.textContent="BIRAK";
    EXAM.timer=setTimeout(()=>finish(performance.now()-started),2200);
  };
  pad.onpointerup=e=>{if(!holding||done)return;e.preventDefault();finish(performance.now()-started)};
  pad.onpointercancel=()=>{if(holding&&!done)finish(performance.now()-started)};
}
function showMemoryIntro(){
  const mode=EXAM.memoryMode,title=MEMORY_VARIANTS[mode];
  const copy=mode==="grid"?"Beş hücre sırayla aydınlanacak. Rota bittikten sonra aynı hücreleri aynı sırayla seç."
    :mode==="code"?"Beş haneli görev kodunu aklında tut. Kod kapandıktan sonra rakamları aynı sırayla gir."
    :mode==="positions"?"On altı hücreden beşi aynı anda işaretlenecek. Görüntü kapandıktan sonra beş mevziyi sırasız olarak seç."
    :"Beş işaret sırayla gösterilecek. Dizi bittikten sonra aynı sırayı dokunarak tekrar et.";
  examIntro("Aday Seçmeleri · 2/3",mode==="grid"?"▦":mode==="code"?"#":mode==="positions"?"⊞":"◇",title,copy,mode==="code"?"Kodu göster":mode==="positions"?"Mevzileri göster":"Diziyi göster",startMemory);
}
function startMemory(){
  if(EXAM.memoryMode==="positions"){startPositionMemory();return}
  if(EXAM.memoryMode==="grid"){startGridMemory();return}
  if(EXAM.memoryMode==="code"){startCodeMemory();return}
  startSymbolMemory();
}
function startSymbolMemory(){
  const symbols=["▲","■","●","◆"],seq=Array.from({length:5},()=>symbols[(Math.random()*symbols.length)|0]);
  EXAM.memorySeq=seq;EXAM.memoryInput=0;EXAM.memoryCorrect=0;examMeta(1);
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Hafıza Dizisi</div><div class="memoryDisplay" id="memoryDisplay">•</div>'+ 
    '<p class="examCopy">İşaretleri sırasıyla aklında tut.</p></div>';
  const display=document.getElementById("memoryDisplay");let i=0;
  const reveal=()=>{
    if(i>=seq.length){display.textContent="?";setTimeout(renderMemoryInput,420);return}
    display.textContent=seq[i++];EXAM.timer=setTimeout(()=>{display.textContent="·";EXAM.timer=setTimeout(reveal,190)},620);
  };
  EXAM.timer=setTimeout(reveal,450);
}
function finishMemoryStage(){
  EXAM.score+=EXAM.memoryCorrect*7;examScore.textContent=EXAM.score+" PUAN";EXAM.stage=2;setTimeout(showLogicIntro,380);
}
function acceptMemory(value,renderNext){
  if(value===EXAM.memorySeq[EXAM.memoryInput])EXAM.memoryCorrect++;
  EXAM.memoryInput++;
  if(EXAM.memoryInput>=EXAM.memorySeq.length)finishMemoryStage();else setTimeout(renderNext,170);
}
function renderMemoryInput(){
  const symbols=["▲","■","●","◆"];
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Hafıza · '+(EXAM.memoryInput+1)+'/5</div>'+ 
    '<div class="memoryDisplay" id="memoryDisplay">?</div><div class="memoryGrid">'+symbols.map(s=>'<button class="memoryBtn">'+s+'</button>').join("")+'</div></div>';
  examBody.querySelectorAll(".memoryBtn").forEach(btn=>btn.onclick=()=>{
    document.getElementById("memoryDisplay").textContent=btn.textContent;EXAM.memoryInput++;
    if(btn.textContent===EXAM.memorySeq[EXAM.memoryInput-1])EXAM.memoryCorrect++;
    if(EXAM.memoryInput>=EXAM.memorySeq.length)finishMemoryStage();else setTimeout(renderMemoryInput,170);
  });
}
function startGridMemory(){
  EXAM.memorySeq=shuffledExam([0,1,2,3,4,5,6,7,8]).slice(0,5);EXAM.memoryInput=0;EXAM.memoryCorrect=0;examMeta(1);
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Rota Hafızası</div><div class="memoryRoute" id="memoryRoute">'+Array.from({length:9},(_,i)=>'<i data-cell="'+i+'"></i>').join("")+'</div><p class="examCopy">Aydınlanan rotayı sırayla izle.</p></div>';
  let i=0,cells=examBody.querySelectorAll("[data-cell]");
  const reveal=()=>{
    cells.forEach(x=>x.classList.remove("on"));
    if(i>=EXAM.memorySeq.length){setTimeout(renderGridMemoryInput,350);return}
    cells[EXAM.memorySeq[i++]].classList.add("on");EXAM.timer=setTimeout(reveal,570);
  };
  EXAM.timer=setTimeout(reveal,420);
}
function renderGridMemoryInput(){
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Rota · '+(EXAM.memoryInput+1)+'/5</div><div class="memoryRoute input">'+Array.from({length:9},(_,i)=>'<button data-cell="'+i+'"></button>').join("")+'</div></div>';
  examBody.querySelectorAll("[data-cell]").forEach(btn=>btn.onclick=()=>acceptMemory(+btn.dataset.cell,renderGridMemoryInput));
}
function startCodeMemory(){
  EXAM.memorySeq=Array.from({length:5},()=>Math.floor(Math.random()*10));EXAM.memoryInput=0;EXAM.memoryCorrect=0;examMeta(1);
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Görev Kodu</div><div class="codeDisplay" id="codeDisplay">'+EXAM.memorySeq.join(" ")+'</div><p class="examCopy">Beş haneli kodu aklında tut.</p></div>';
  EXAM.timer=setTimeout(()=>{document.getElementById("codeDisplay").textContent="• • • • •";setTimeout(renderCodeMemoryInput,320)},2300);
}
function renderCodeMemoryInput(){
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Kod · '+(EXAM.memoryInput+1)+'/5</div><div class="codeDisplay compact">'+"• ".repeat(EXAM.memoryInput)+"_"+'</div><div class="numberGrid">'+Array.from({length:10},(_,i)=>'<button data-number="'+i+'">'+i+'</button>').join("")+'</div></div>';
  examBody.querySelectorAll("[data-number]").forEach(btn=>btn.onclick=()=>acceptMemory(+btn.dataset.number,renderCodeMemoryInput));
}
function startPositionMemory(){
  EXAM.memorySeq=shuffledExam(Array.from({length:16},(_,i)=>i)).slice(0,5);EXAM.memorySelections=[];EXAM.memoryInput=0;EXAM.memoryCorrect=0;examMeta(1);
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Mevzi Hafızası</div><div class="positionGrid preview">'+Array.from({length:16},(_,i)=>'<i class="'+(EXAM.memorySeq.indexOf(i)>=0?"on":"")+'"></i>').join("")+'</div><p class="examCopy">İşaretli beş mevziyi aklında tut.</p></div>';
  EXAM.timer=setTimeout(renderPositionMemoryInput,2300);
}
function renderPositionMemoryInput(){
  examBody.innerHTML='<div class="examPanel"><div class="examKicker" id="positionKicker">Mevzi · 0/5</div><div class="positionGrid input">'+Array.from({length:16},(_,i)=>'<button data-position="'+i+'"></button>').join("")+'</div></div>';
  examBody.querySelectorAll("[data-position]").forEach(btn=>btn.onclick=()=>{
    const value=+btn.dataset.position;if(EXAM.memorySelections.indexOf(value)>=0)return;
    EXAM.memorySelections.push(value);EXAM.memoryInput++;btn.classList.add("selected");
    if(EXAM.memorySeq.indexOf(value)>=0)EXAM.memoryCorrect++;
    document.getElementById("positionKicker").textContent="Mevzi · "+EXAM.memoryInput+"/5";
    if(EXAM.memoryInput>=5)finishMemoryStage();
  });
}
const LOGIC_Q=[
 {id:"buyuk_1",c:"Sayısal",q:"Hangisi daha büyüktür?",o:["17 + 8","4 × 6"],a:0},
 {id:"hedef_1",c:"Yaklaşım",q:"65 hedefine hangisi daha yakındır?",o:["100 − 37","8 × 8"],a:1},
 {id:"kucuk_1",c:"Sayısal",q:"Hangisi daha küçüktür?",o:["7 × 7","60 − 8"],a:0},
 {id:"buyuk_2",c:"Sayısal",q:"Hangisi daha büyüktür?",o:["36 ÷ 3","5 + 8"],a:1},
 {id:"kucuk_2",c:"Sayısal",q:"Hangisi daha küçüktür?",o:["9 × 4","50 − 11"],a:0},
 {id:"dizi_1",c:"Örüntü",q:"2 · 4 · 8 · ? dizisini tamamla.",o:["16","12"],a:0},
 {id:"dizi_2",c:"Örüntü",q:"3 · 6 · 9 · ? dizisini tamamla.",o:["12","18"],a:0},
 {id:"dizi_3",c:"Örüntü",q:"1 · 1 · 2 · 3 · 5 · ? dizisini tamamla.",o:["7","8"],a:1},
 {id:"yon_1",c:"Yön",q:"Kuzeye bakarken sağa dönersen hangi yöne bakarsın?",o:["Doğu","Batı"],a:0},
 {id:"yon_2",c:"Yön",q:"Doğuya bakarken iki kez sola dönersen yönün nedir?",o:["Batı","Kuzey"],a:0},
 {id:"harita_1",c:"Harita",q:"3 km kuzey, 1 km güney ilerledin. Başlangıca uzaklığın?",o:["2 km","4 km"],a:0},
 {id:"harita_2",c:"Harita",q:"2 km doğu, 2 km batı ilerledin. Net yer değiştirmen?",o:["0 km","4 km"],a:0},
 {id:"kod_1",c:"Kod",q:"A · C · E · ? dizisinde sıradaki harf nedir?",o:["F","G"],a:1},
 {id:"oran_1",c:"Oran",q:"Dört ekip işi 8 saatte bitiriyor. Sekiz eş ekip kaç saatte bitirir?",o:["4 saat","16 saat"],a:0},
 {id:"mantik_1",c:"Mantık",q:"Bütün timler birliktir; bazı birlikler nöbettedir. Kesin olan?",o:["Bütün timler birliktir","Bütün timler nöbettedir"],a:0},
 {id:"zaman_1",c:"Zaman",q:"Görev 22.30'da başlayıp 2 saat sürerse ne zaman biter?",o:["00.30","24.00"],a:0},
 {id:"sirala_1",c:"Sıralama",q:"A, B'den hızlı; B, C'den hızlı. En hızlı kimdir?",o:["A","C"],a:0},
 {id:"kod_2",c:"Kod",q:"Her harf bir ileri kayarsa KOD ne olur?",o:["LPE","JNC"],a:0}
];
function showLogicIntro(){
  examIntro("Aday Seçmeleri · 3/3","∴","Karma Muhakeme","Geniş soru havuzundan seçilen beş sayısal, yön, örüntü ve mantık sorusunu tamamla.","Soruları başlat",()=>{EXAM.logicIndex=0;EXAM.logicCorrect=0;EXAM.logicQuestions=EXAM.logicQuestions||sampleQuestions(LOGIC_Q,5);renderLogic()});
}
function renderLogic(){
  if(EXAM.logicIndex>=EXAM.logicQuestions.length){EXAM.score+=EXAM.logicCorrect*6;showExamResult();return}
  examMeta(2);const q=EXAM.logicQuestions[EXAM.logicIndex];
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">'+q.c+' · '+(EXAM.logicIndex+1)+'/5</div>'+ 
    '<div class="examGlyph">?</div><h2 class="examTitle">'+q.q+'</h2><div class="logicGrid">'+q.o.map((x,i)=>'<button class="logicBtn" data-answer="'+i+'">'+x+'</button>').join("")+'</div></div>';
  examBody.querySelectorAll(".logicBtn").forEach(btn=>btn.onclick=()=>{
    if(+btn.dataset.answer===q.a)EXAM.logicCorrect++;
    EXAM.logicIndex++;setTimeout(renderLogic,220);
  });
}
function buildExamProfile(exam){
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,Math.round(v||0)));
  const scaled=(value,max,delta)=>Math.round((value/max-.5)*delta*2);
  const reaction=clamp(exam.reactionPoints,0,36);
  const memory=clamp(exam.memoryCorrect*7,0,35);
  const logic=clamp(exam.logicCorrect*6,0,30);
  const total=reaction+memory+logic;
  const grade=total>=85?"ustun":total>=70?"basarili":total>=60?"sinirda":"saha";
  const modifiers={
    fiz:scaled(reaction,36,6),ruh:scaled(reaction,36,4),ope:scaled(reaction,36,3),
    tek:scaled(memory,35,6),dis:scaled(memory,35,4),
    lid:scaled(logic,30,6),sic:scaled(logic,30,4)
  };
  if(grade==="ustun"){
    modifiers.sic+=2;modifiers.ruh+=2;modifiers.tek+=2;
  }
  return {reaction,memory,logic,total,grade,career:total>=60?"officer":"nco",modifiers,variants:exam.variants||null};
}
function showExamResult(){
  const profile=buildExamProfile(EXAM);EXAM.profile=profile;EXAM.score=profile.total;EXAM.stage=3;examMeta(3);
  const pass=profile.career==="officer";
  const title=profile.grade==="ustun"?"Üstün Başarıyla Kabul":profile.grade==="sinirda"?"Sınırda Kabul":pass?"Harp Okuluna Kabul":"Saha Birliğine Atama";
  const copy=profile.grade==="ustun"
    ?"Aday sınavında üstün başarı gösterdin. Harbiyeli kariyerine güçlü bir başlangıç profiliyle giriyorsun."
    :profile.grade==="sinirda"
      ?"Barajı sınırlı farkla geçtin. Harbiyeli olarak başlayacaksın; sınavdaki güçlü ve zayıf yönlerin ilk siciline yansıyacak."
      :pass
        ?"Aday sınavını geçtin. Kariyerin Harbiyeli olarak başlayacak ve bölüm sonuçların ilk sicil değerlerini belirleyecek."
        :"Aday sınavı barajını geçemedin. Kariyerin Er olarak başlayacak; sınavdaki güçlü yönlerin saha siciline aktarılacak.";
  const variants=profile.variants||{};
  const rows=[
    [variants.reaction||"Tepki",profile.reaction,36],[variants.memory||"Hafıza",profile.memory,35],[variants.logic||"Muhakeme",profile.logic,30]
  ].map(x=>'<div class="examMetric"><span>'+x[0]+'</span><b>'+x[1]+' / '+x[2]+'</b><i><em style="width:'+Math.round(x[1]/x[2]*100)+'%"></em></i></div>').join("");
  const mods=Object.entries(profile.modifiers).filter(x=>x[1]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6)
    .map(x=>'<span class="'+(x[1]>0?"up":"down")+'">'+STATS[x[0]].s+' '+(x[1]>0?"+":"")+x[1]+'</span>').join("");
  examTrack.querySelectorAll("i").forEach(i=>i.className="done");
  examBody.innerHTML='<div class="examPanel resultPanel"><div class="examResult '+(pass?"pass":"fail")+' '+profile.grade+'"><div class="scoreRing">'+profile.total+'</div>'+ 
    '<h2>'+title+'</h2><p>'+copy+'</p><div class="examBreakdown">'+rows+'</div><div class="examMods"><small>Başlangıç sicili</small>'+mods+'</div></div>'+ 
    '<button class="examAction" id="examAction">Uzmanlık seç</button></div>';
  document.getElementById("examAction").onclick=()=>showSpecialtySelect(EXAM.force,profile);
}
(function(){
  const list=document.getElementById("forceList");
  const nm={k:"Kara Harp Okulu",d:"Deniz Harp Okulu",h:"Hava Harp Okulu"};
  const desc={k:"Piyade · Topçu · Tank · İkmal",d:"Güverte · Makine · Deniz Piyadesi · İkmal",h:"Pilotaj · Hava Savunma · Teknik · Lojistik"};
  ["k","d","h"].forEach(f=>{
    const b=document.createElement("button");b.className="fbtn";
    b.innerHTML=insSVG(3,f)+'<div><b>'+nm[f]+'</b><i>'+desc[f]+'</i></div>';
    b.onclick=()=>{document.getElementById("start").classList.add("hide");beginExam(f)};
    list.appendChild(b);
  });
})();
