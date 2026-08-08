"use strict";

const examEl=document.getElementById("exam"),examBody=document.getElementById("examBody"),
      examStep=document.getElementById("examStep"),examScore=document.getElementById("examScore"),
      examTrack=document.getElementById("examTrack");
let EXAM=null;
const EXAM_LABELS=["01 · Tepki","02 · Hafıza","03 · Muhakeme","Sonuç"];
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
  EXAM={force,stage:0,score:0,timer:0,reactionRound:0,reactionPoints:0,memoryCorrect:0,logicCorrect:0};
  examEl.classList.remove("hide");
  examIntro("Aday Seçmeleri · 1/3","◎","Tepki Kontrolü","Sinyal yeşile döndüğü anda dokun. Erken dokunuş puan kaybettirir; üç turun ortalaması siciline işlenir.","Testi başlat",startReactionRound);
}
function startReactionRound(){
  if(EXAM.reactionRound>=3){
    EXAM.score+=EXAM.reactionPoints;EXAM.stage=1;showMemoryIntro();return;
  }
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
function showMemoryIntro(){
  examIntro("Aday Seçmeleri · 2/3","◇","Kısa Süreli Hafıza","Beş işaret sırayla gösterilecek. Dizi bittikten sonra aynı sırayı dokunarak tekrar et.","Diziyi göster",startMemory);
}
function startMemory(){
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
function renderMemoryInput(){
  const symbols=["▲","■","●","◆"];
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Hafıza · '+(EXAM.memoryInput+1)+'/5</div>'+ 
    '<div class="memoryDisplay" id="memoryDisplay">?</div><div class="memoryGrid">'+symbols.map(s=>'<button class="memoryBtn">'+s+'</button>').join("")+'</div></div>';
  examBody.querySelectorAll(".memoryBtn").forEach(btn=>btn.onclick=()=>{
    if(btn.textContent===EXAM.memorySeq[EXAM.memoryInput])EXAM.memoryCorrect++;
    document.getElementById("memoryDisplay").textContent=btn.textContent;EXAM.memoryInput++;
    if(EXAM.memoryInput>=EXAM.memorySeq.length){
      EXAM.score+=EXAM.memoryCorrect*7;examScore.textContent=EXAM.score+" PUAN";EXAM.stage=2;setTimeout(showLogicIntro,380);
    }else setTimeout(renderMemoryInput,170);
  });
}
const LOGIC_Q=[
 {q:"Hangisi daha büyük?",a:"17 + 8",av:25,b:"4 × 6",bv:24},
 {q:"Hangisi hedefe daha yakın?",a:"100 − 37",av:63,b:"8 × 8",bv:64,target:65},
 {q:"Hangisi daha küçüktür?",a:"7 × 7",av:49,b:"60 − 8",bv:52,small:1},
 {q:"Hangisi daha büyük?",a:"36 ÷ 3",av:12,b:"5 + 8",bv:13},
 {q:"Hangisi daha küçüktür?",a:"9 × 4",av:36,b:"50 − 11",bv:39,small:1}
];
function showLogicIntro(){
  examIntro("Aday Seçmeleri · 3/3","∴","Muhakeme","Beş kısa karşılaştırmayı mümkün olduğunca doğru tamamla. Süreden önce doğruluk değerlendirilecek.","Soruları başlat",()=>{EXAM.logicIndex=0;EXAM.logicCorrect=0;renderLogic()});
}
function renderLogic(){
  if(EXAM.logicIndex>=LOGIC_Q.length){EXAM.score+=EXAM.logicCorrect*6;showExamResult();return}
  examMeta(2);const q=LOGIC_Q[EXAM.logicIndex];
  examBody.innerHTML='<div class="examPanel"><div class="examKicker">Muhakeme · '+(EXAM.logicIndex+1)+'/5</div>'+ 
    '<div class="examGlyph">?</div><h2 class="examTitle">'+q.q+'</h2><div class="logicGrid"><button class="logicBtn" data-side="a">'+q.a+'</button>'+ 
    '<button class="logicBtn" data-side="b">'+q.b+'</button></div></div>';
  examBody.querySelectorAll(".logicBtn").forEach(btn=>btn.onclick=()=>{
    const correct=q.target!=null
      ?(Math.abs(q.av-q.target)<Math.abs(q.bv-q.target)?"a":"b")
      :q.small?(q.av<q.bv?"a":"b"):(q.av>q.bv?"a":"b");
    if(btn.dataset.side===correct)EXAM.logicCorrect++;
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
  return {reaction,memory,logic,total,grade,career:total>=60?"officer":"nco",modifiers};
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
  const rows=[
    ["Tepki",profile.reaction,36],["Hafıza",profile.memory,35],["Muhakeme",profile.logic,30]
  ].map(x=>'<div class="examMetric"><span>'+x[0]+'</span><b>'+x[1]+' / '+x[2]+'</b><i><em style="width:'+Math.round(x[1]/x[2]*100)+'%"></em></i></div>').join("");
  const mods=Object.entries(profile.modifiers).filter(x=>x[1]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,6)
    .map(x=>'<span class="'+(x[1]>0?"up":"down")+'">'+STATS[x[0]].s+' '+(x[1]>0?"+":"")+x[1]+'</span>').join("");
  examTrack.querySelectorAll("i").forEach(i=>i.className="done");
  examBody.innerHTML='<div class="examPanel resultPanel"><div class="examResult '+(pass?"pass":"fail")+' '+profile.grade+'"><div class="scoreRing">'+profile.total+'</div>'+ 
    '<h2>'+title+'</h2><p>'+copy+'</p><div class="examBreakdown">'+rows+'</div><div class="examMods"><small>Başlangıç sicili</small>'+mods+'</div></div>'+ 
    '<button class="examAction" id="examAction">Kariyere başla</button></div>';
  document.getElementById("examAction").onclick=()=>newGame(EXAM.force,profile.career,profile);
}
(function(){
  const list=document.getElementById("forceList");
  const nm={k:"Kara Harp Okulu",d:"Deniz Harp Okulu",h:"Hava Harp Okulu"};
  const desc={k:"Piyade · sınır · manevra",d:"Güverte · seyir · filo",h:"Pilotaj · üs · hava savunma"};
  ["k","d","h"].forEach(f=>{
    const b=document.createElement("button");b.className="fbtn";
    b.innerHTML=insSVG(3,f)+'<div><b>'+nm[f]+'</b><i>'+desc[f]+'</i></div>';
    b.onclick=()=>{document.getElementById("start").classList.add("hide");beginExam(f)};
    list.appendChild(b);
  });
})();

