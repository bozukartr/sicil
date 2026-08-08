"use strict";

/* ---- rütbe işareti (SVG) ---- */
function starPath(cx,cy,rr){
  let p="";
  for(let i=0;i<10;i++){
    const a=-Math.PI/2+i*Math.PI/5,R=i%2?rr*.42:rr;
    p+=(i?"L":"M")+(cx+Math.cos(a)*R).toFixed(2)+" "+(cy+Math.sin(a)*R).toFixed(2);
  }
  return '<path d="'+p+'Z" fill="#e0bd63"/>';
}
function insSVG(r,f){
  const c=RANKS[r].ins,W=34,H=44,id="b"+r+f,g=[];
  g.push('<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+
    BOARD[f]+'"/><stop offset="1" stop-color="#0d1006"/></linearGradient></defs>');
  g.push('<rect x="1.5" y="1.5" width="31" height="41" rx="3.5" fill="url(#'+id+')" stroke="#c9a349" stroke-width="1.1"/>');
  g.push('<path d="M4.5 6 Q17 2.8 29.5 6" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="1"/>');
  if(c.cadet){
    g.push('<rect x="14.4" y="8" width="5.2" height="28" rx="1.2" fill="#a83c29" stroke="rgba(224,189,99,.55)" stroke-width=".7"/>');
  }
  if(c.chev){
    const n=c.chev,y0=18-(n-1)*6;
    for(let i=0;i<n;i++){
      const y=y0+i*7;
      g.push('<path d="M7 '+y+' L17 '+(y+5)+' L27 '+y+'" fill="none" stroke="#e0bd63" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');
    }
  }
  if(c.bar){
    const n=c.bar,gap=5.7,y0=36-(n-1)*gap;
    for(let i=0;i<n;i++) g.push('<rect x="6.5" y="'+(y0+i*gap-1.6).toFixed(1)+'" width="21" height="3.1" rx="1.1" fill="#e0bd63"/>');
  }
  if(c.laurel){
    g.push('<path d="M9.5 36.5 Q17 31.4 24.5 36.5" fill="none" stroke="#e0bd63" stroke-width="1.1"/>');
    for(let i=0;i<4;i++){
      const t=.18+i*.21,x=9.5+15*t,y=36.5-Math.sin(Math.PI*t)*4.6;
      g.push('<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="1.5" ry="2.4" fill="#c9a349" transform="rotate('+(t<.5?-32:32)+' '+x.toFixed(1)+' '+y.toFixed(1)+')"/>');
    }
  }
  if(c.gen){
    g.push('<g stroke="#c9a349" stroke-width="1.2" fill="none"><path d="M8.5 38 L25.5 26"/><path d="M25.5 38 L8.5 26"/></g>');
    g.push('<circle cx="17" cy="32" r="2.1" fill="#0d1006" stroke="#e0bd63" stroke-width=".9"/>');
  }
  if(c.star){
    const n=c.star,rr=4.3;
    const pos=n===1?[[17,15]]:n===2?[[17,11],[17,20]]:n===3?[[17,9],[11.5,19],[22.5,19]]:[[17,7.5],[11,15],[23,15],[17,22.5]];
    pos.forEach(p=>g.push(starPath(p[0],p[1],rr)));
  }
  return '<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">'+g.join("")+'</svg>';
}

/* ---- durum ---- */
let S,ev,dragging=false,x0=0,y0=0,dx=0,raf=0,locked=true,POOL=[];
const HIDDEN_FLOOR=11;
function addJournal(kind,title,detail){
  if(!S)return;
  S.journal=S.journal||[];
  const rank=RANKS[S.r]&&RANKS[S.r].n[S.f]||"Aday";
  S.journal.push({kind,title,detail:detail||"",month:S.months||0,age:S.age||18,rank,at:new Date().toISOString()});
  if(S.journal.length>180)S.journal=S.journal.slice(-180);
}
function persistGame(screen,reason){
  if(!S||S.ended)return false;
  S.resumeScreen=screen||S.resumeScreen||"card";
  S.pendingEvent=S.resumeScreen==="card"&&ev?{...ev}:null;
  return saveActiveState(S,reason||S.resumeScreen);
}
function initialStats(career,profile,specialty){
  const stats={dis:56,sic:50,ast:50,fiz:62,ruh:60,tek:48,ope:45,lid:45,loj:45,kar:career==="nco"?32:38,iti:46,ail:62};
  if(profile&&profile.modifiers)for(const k in profile.modifiers)
    if(k in stats)stats[k]=Math.max(0,Math.min(100,stats[k]+profile.modifiers[k]));
  if(specialty&&specialty.modifiers)for(const k in specialty.modifiers)
    if(k in stats)stats[k]=Math.max(0,Math.min(100,stats[k]+specialty.modifiers[k]));
  return stats;
}
function newGame(force,career,examProfile,specialtyId){
  const profile=examProfile&&typeof examProfile==="object"
    ?examProfile:{total:Number(examProfile)||0,reaction:0,memory:0,logic:0,grade:"legacy",modifiers:{}};
  career=career||profile.career||"officer";
  RANKS=career==="nco"?NCO_RANKS:OFFICER_RANKS;
  const specialty=typeof getSpecialty==="function"?getSpecialty(force,specialtyId):null;
  const flags=new Set();
  if(profile.grade&&profile.grade!=="legacy")flags.add("sinav_"+profile.grade);
  if(specialty)flags.add("uz_"+specialty.id);
  S={f:force,career,specialty:specialty?specialty.id:null,track:"command",transitionAttempts:{},transitionQuestionHistory:{},exam:profile,examScore:profile.total||0,r:0,cards:0,totalDecisions:0,months:0,age:18,flags,hist:[],eventCounts:{},pendingConsequences:[],traits:{},traitMilestones:{},journal:[],grace:0,ended:false,
     warnCd:{},seen:new Set(RANKS[0].vis),
     st:initialStats(career,profile,specialty)};
  const grade=({ustun:"Üstün başarı",basarili:"Başarılı",sinirda:"Sınırda kabul",saha:"Saha ataması"}[profile.grade]||"Aday değerlendirmesi");
  addJournal("exam","Aday sınavı tamamlandı",grade+" · "+(profile.total||0)+" puan");
  addJournal("career",career==="nco"?"Saha kariyeri başladı":"Harp Okulu kariyeri başladı",(specialty?specialty.name+" · ":"")+FORCE[force]);
  document.getElementById("exam").classList.add("hide");
  document.getElementById("specialty").classList.add("hide");
  document.getElementById("start").classList.add("hide");
  buildGauges();paintHUD();nextCard();
}
function E(tags,force,who,role,place,text,lt,la,rt,ra,opt){
  POOL.push({tg:tags.split(" "),fo:force,who,role,place,text,lt,la,rt,ra,
    req:opt&&opt.req,no:opt&&opt.no,lreq:opt&&opt.lreq,rreq:opt&&opt.rreq,
    lneed:opt&&opt.lneed,rneed:opt&&opt.rneed,w:(opt&&opt.w)||1,pri:(opt&&opt.pri)||0});
}

let gEls=[];
function buildGauges(){
  const box=document.getElementById("gauges");box.innerHTML="";gEls=[];
  for(let i=0;i<4;i++){
    const g=document.createElement("div");g.className="g";
    g.innerHTML='<div class="gd"></div><div class="grow"><div class="gname"></div><div class="gval"></div></div><div class="gbar"><div class="gfill"></div></div>';
    box.appendChild(g);
    gEls.push({root:g,name:g.querySelector(".gname"),val:g.querySelector(".gval"),
      fill:g.querySelector(".gfill"),d:g.querySelector(".gd")});
  }
  paintGauges();
}
function paintGauges(){
  RANKS[S.r].vis.forEach((k,i)=>{
    const g=gEls[i],v=Math.round(S.st[k]);
    g.name.textContent=STATS[k].s;g.val.textContent=v;
    g.fill.style.transform="scaleX("+Math.max(0,Math.min(100,v))/100+")";
    g.root.classList.toggle("low",v<25);g.root.classList.toggle("high",v>85);
    g.root.setAttribute("aria-label",STATS[k].n+" "+v+(v<25?" kritik":v>85?" üstün":""));
  });
}
function preview(fx){
  const eff=fx?effective(fx):null;
  RANKS[S.r].vis.forEach((k,i)=>{
    const g=gEls[i],d=eff?eff[k]:0;
    if(!d){g.d.className="gd";g.d.textContent="";return}
    g.d.textContent=(d>0?"▲ +":"▼ ")+d;
    g.d.className="gd on "+(d>0?"up":"dn");
  });
}
function clearPreview(){gEls.forEach(g=>{g.d.className="gd";g.d.textContent=""})}

function paintHUD(){
  const R=RANKS[S.r];
  const specialty=typeof getSpecialty==="function"?getSpecialty(S.f,S.specialty):null;
  document.getElementById("careerBadge").textContent=S.track==="admin"?"İdari Görev":S.career==="nco"?"Saha Kariyeri":"Subay Kariyeri";
  document.getElementById("rankName").textContent=R.n[S.f];
  document.getElementById("forceName").textContent=FORCE[S.f];
  const specialtyBadge=document.getElementById("specialtyBadge");
  specialtyBadge.textContent=S.track==="admin"?"▤ Karargâh":specialty?specialty.glyph+" "+specialty.name:"";
  specialtyBadge.classList.toggle("hide",!specialty&&S.track!=="admin");
  document.getElementById("insBox").innerHTML=insSVG(S.r,S.f);
  document.getElementById("mAge").textContent=S.age+" yaş";
  document.getElementById("mSrv").innerHTML="<b>"+(Math.floor(S.months/12)+1)+".</b> hizmet yılı";
  const pips=document.getElementById("pips");pips.innerHTML="";
  const n=Math.min(R.cards,16),done=Math.round(S.cards/R.cards*n);
  for(let i=0;i<n;i++){
    const el=document.createElement("i");
    if(i<done)el.className="on";else if(i===done)el.className="now";
    pips.appendChild(el);
  }
  const sp=document.createElement("span"),remaining=Math.max(0,R.cards-S.cards);
  sp.textContent=S.r>=RANKS.length-1
    ?S.cards+"/"+R.cards+" · görev"
    :remaining?S.cards+"/"+R.cards+" · terfiye "+remaining:S.cards+"/"+R.cards+" · değerlendirme";
  pips.setAttribute("aria-label",sp.textContent);
  pips.appendChild(sp);
  if(typeof renderTraitStrip==="function")renderTraitStrip();
}

function pick(){
  const t=RANKS[S.r].t;
  const fit=i=>{const e=POOL[i];
    return (e.tg.indexOf(t)>=0||e.tg.indexOf("*")>=0)&&(e.fo==="*"||e.fo.indexOf(S.f)>=0)
      &&(!e.req||e.req.split(",").every(f=>S.flags.has(f)))
      &&(!e.no||!e.no.split(",").some(f=>S.flags.has(f)))};
  const candidates=()=>{
    let best=[],bp=-1;
    for(let i=0;i<POOL.length;i++){
      if(!fit(i)||S.hist.indexOf(i)>=0)continue;
      const e=POOL[i];
      if(e.pri>bp){bp=e.pri;best=[]}
      if(e.pri===bp)best.push(i);
    }
    return best;
  };
  let best=candidates();
  if(!best.length){S.hist.length=0;best=candidates()}
  if(!best.length)return null;
  S.eventCounts=S.eventCounts||{};
  const weights=best.map(id=>(POOL[id].w||1)/(1+(S.eventCounts[id]||0)*.65));
  let roll=Math.random()*weights.reduce((a,b)=>a+b,0),id=best[best.length-1];
  for(let i=0;i<best.length;i++){roll-=weights[i];if(roll<=0){id=best[i];break}}
  S.eventCounts[id]=(S.eventCounts[id]||0)+1;
  S.hist.push(id);if(S.hist.length>80)S.hist.shift();
  return POOL[id];
}

const cardA=document.getElementById("cardA"),
      stampL=document.getElementById("stampL"),stampR=document.getElementById("stampR"),
      chL=document.getElementById("chL"),chR=document.getElementById("chR"),
      txtEl=document.getElementById("text"),decisionFeedback=document.getElementById("decisionFeedback");
function fitText(){
  txtEl.style.fontSize="";txtEl.style.lineHeight="";
  const box=txtEl.parentElement;let s=16,guard=0;
  while(txtEl.scrollHeight>box.clientHeight-1&&s>12.4&&guard++<32){
    s-=.4;txtEl.style.fontSize=s.toFixed(2)+"px";
    txtEl.style.lineHeight=s<13.4?"1.42":"1.52";
  }
}
function renderCard(event){
  ev=event;
  document.getElementById("who").textContent=ev.who;
  document.getElementById("role").textContent=ev.role;
  document.getElementById("place").textContent=ev.place||"";
  txtEl.textContent=ev.text;
  document.getElementById("chLt").textContent=ev.lt;
  document.getElementById("chRt").textContent=ev.rt;
  stampL.textContent=ev.lt;stampR.textContent=ev.rt;
  cardA.classList.toggle("warn",!!ev.warn);
  cardA.classList.remove("fly");cardA.style.opacity="1";cardA.style.transform="translate3d(0,0,0)";
  stampL.style.opacity=0;stampR.style.opacity=0;
  chL.classList.remove("hot");chR.classList.remove("hot");
  const leftOpen=choiceAvailable("left",ev),rightOpen=choiceAvailable("right",ev);
  chL.disabled=!leftOpen;chR.disabled=!rightOpen;
  chL.dataset.locked=leftOpen?"":(ev.lneed||"Karar profili gerekli");
  chR.dataset.locked=rightOpen?"":(ev.rneed||"Karar profili gerekli");
  decisionFeedback.classList.remove("on");
  clearPreview();locked=false;
  requestAnimationFrame(fitText);
}
function nextCard(){
  const src=warnPick()||pick();
  if(!src){finish("bos","Dosya tamamlandı","Kayıtlar burada sona eriyor.");return}
  const event=Math.random()<.5?src:{...src,lt:src.rt,la:src.ra,rt:src.lt,ra:src.la,
    lreq:src.rreq,rreq:src.lreq,lneed:src.rneed,rneed:src.lneed};
  renderCard(event);persistGame("card","new-card");
}
function choiceAvailable(side,event){
  const req=side==="left"?event.lreq:event.rreq;
  return !req||req.split(",").every(flag=>S.flags.has(flag));
}
function decide(right){
  if(locked||!choiceAvailable(right?"right":"left",ev))return;locked=true;
  const rawEffect=right?ev.ra:ev.la,fx=resolve(rawEffect,S.r);
  addJournal(ev.warn?"critical":"decision",right?ev.rt:ev.lt,ev.who+" · "+ev.role);
  if(typeof updateTraitProfile==="function")updateTraitProfile(rawEffect);
  S.pendingEvent=null;
  decisionFeedback.textContent=ev.warn?"Geçmiş kayıt güncellendi":"Karar dosyaya işlendi";
  decisionFeedback.classList.remove("on");void decisionFeedback.offsetWidth;decisionFeedback.classList.add("on");
  cardA.classList.add("fly");
  cardA.style.transform="translate3d("+(right?1:-1)*(window.innerWidth*1.2)+"px,"+(dx*.1)+"px,0) rotate("+(right?24:-24)+"deg)";
  cardA.style.opacity="0";
  if(navigator.vibrate)navigator.vibrate(10);
  apply(fx);
}
/* azalan verim: 90'dan 95'e çıkmak, 40'tan 45'e çıkmaktan çok daha zor */
function gainScale(v){return Math.max(.18,Math.min(1,(100-v)/74))}
/* bir kararın gerçekte uygulanacak değeri */
function effective(fx){
  const out={},vis=RANKS[S.r].vis;
  for(const k in fx.st){
    let d=fx.st[k];
    if(d>0)d*=gainScale(S.st[k]);
    const floor=vis.indexOf(k)>=0?0:HIDDEN_FLOOR;
    const nv=Math.max(floor,Math.min(100,S.st[k]+d));
    const r=Math.round(nv-S.st[k]);
    if(r)out[k]=r;
  }
  return out;
}
function apply(fx){
  const vis=RANKS[S.r].vis;
  for(const k in fx.st){
    let d=fx.st[k];
    if(d>0)d*=gainScale(S.st[k]);
    const floor=vis.indexOf(k)>=0?0:HIDDEN_FLOOR;
    S.st[k]=Math.max(floor,Math.min(100,S.st[k]+d));
  }
  /* ihmal sürüklenmesi: ölçülmeyen unsurdaki üstünlük zamanla vasata iner,
     ama sırf ilgilenmedin diye sıfıra düşmez — oraya ancak kararlarınla inersin */
  const DRIFT_TO=40;
  for(const k of KEYS)
    if(vis.indexOf(k)<0 && !(k in fx.st) && S.st[k]>DRIFT_TO)
      S.st[k]=Math.max(DRIFT_TO,S.st[k]-.3);
  for(const k in S.warnCd)if(S.warnCd[k]>0)S.warnCd[k]--;
  fx.add.forEach(f=>S.flags.add(f));fx.del.forEach(f=>S.flags.delete(f));
  S.months+=fx.t||4;S.age=18+Math.floor(S.months/12);S.cards++;S.totalDecisions=(S.totalDecisions||0)+1;
  scheduleConsequences(fx.later||[]);activateDueConsequences();
  paintGauges();paintHUD();
  persistGame("resolving","decision-applied");
  vis.forEach((k,i)=>{if(fx.st[k]){gEls[i].root.classList.remove("bump");void gEls[i].root.offsetWidth;gEls[i].root.classList.add("bump")}});
  setTimeout(()=>{
    clearPreview();decisionFeedback.classList.remove("on");
    if(fx.end){const m=ENDINGS[fx.end];finish(fx.end,m?m[0]:"Dosya kapandı",m?m[1]:"");return}
    if(checkExtremes())return;
    if(S.cards>=RANKS[S.r].cards){tryPromote();return}
    nextCard();
  },520);
}
function scheduleConsequences(items){
  S.pendingConsequences=S.pendingConsequences||[];
  items.forEach(item=>{
    if(!item||!item.flag||S.pendingConsequences.some(x=>x.flag===item.flag)||S.flags.has(item.flag))return;
    S.pendingConsequences.push({flag:item.flag,dueDecision:S.totalDecisions+Math.max(1,item.delay||1)});
  });
}
function activateDueConsequences(){
  S.pendingConsequences=S.pendingConsequences||[];
  const waiting=[];
  S.pendingConsequences.forEach(item=>{
    if(item.dueDecision<=S.totalDecisions){
      S.flags.add(item.flag);
      const label=typeof CHAIN_LABELS!=="undefined"&&CHAIN_LABELS[item.flag]||"Geçmiş karar yeniden gündemde";
      addJournal("consequence",label,"Daha önce verdiğin bir karar yeni bir dosya olarak geri döndü.");
    }else waiting.push(item);
  });
  S.pendingConsequences=waiting;
}
const EXTREME={
 dis:"Yüksek Disiplin Kurulu hakkındaki tutanakları bir bütün olarak değerlendirdi. TSK ile ilişiğin kesildi.",
 sic:"Üst üste olumsuz kanaat aldın. Kadrosuzluk gerekçesiyle emekliye sevk edildin.",
 ast:"Birliğin senden koptu. İki personelin firarının ardından açılan soruşturmada görevden alındın.",
 fiz:"Sağlık kurulu raporu geldi: önce sınıf değişikliği, ardından malulen emeklilik.",
 ruh:"Yıllardır taşıdığın yükü artık taşıyamadın. Sağlık gerekçesiyle görevden ayrıldın.",
 tek:"Mesleki yeterlilik değerlendirmelerini geçemedin. Sınıf değişikliğiyle idari kadroya alındın.",
 ope:"Sorumluluğundaki harekâtta ağır kayıp verildi. Sorumluluk sende bırakıldı, görevden alındın.",
 lid:"Kimse seni takip etmedi. Komuta görevlerinden alınıp kadro dışı bir masaya verildin.",
 loj:"Tedarik ve envanter dosyalarında usulsüzlük tespit edildi. Askerî yargı süreci başladı.",
 kar:"Karargâhta hiçbir kapı açılmadı. Taşra garnizonunda, kimsenin haberi olmadan emekli oldun.",
 iti:"Basına yansıyan olay kurumu zor durumda bıraktı. İstifan istendi.",
 ail:"Otuz yıl sonra eve döndüğünde ev yoktu. Boşanma ve çocuklarınla kopan bağ, dosyaya yazılmayan kayıptı."
};
function checkExtremes(){
  for(const k of KEYS)if(S.st[k]<=0){finish(k,"Dosya kapandı — "+STATS[k].n,EXTREME[k]);return true}
  return false;
}
const ENDINGS={};
const PROMO={
 tg:"Harp okulu bitti. Artık emrinde insanlar var ve hepsi seni izliyor.",
 ut:"Takım komutanlığında pişme dönemi. Astların seni artık tanıyor, kolay kandıramazsın.",
 yz:"Bölük/batarya komutanlığı. İlk kez karar defterini tek başına sen tutuyorsun.",
 bb:"Karargâh yılları başlıyor. Artık sadece insan değil, bütçe ve kaynak da yönetiyorsun.",
 yb:"Kritik eşik. Buradan sonrası hem yeterlilik hem de kimin masasında durduğun meselesi.",
 al:"Alay/tugay komutanlığı. Bulunduğun garnizonda kurumun yüzü artık sensin.",
 g1:"Generalliğe/amiralliğe yükseldin. Kararların artık binlerce kişiyi ilgilendiriyor.",
 g2:"Tümen/donanma seviyesi. Hata payı iyice daraldı, tanıklar çoğaldı.",
 g3:"Ordu/kuvvet komutanlığı yolundasın. Her cümlen tutanağa geçiyor.",
 g4:"En üst rütbe. Bundan sonrası kariyer değil, geride bırakacağın iz meselesi.",
 ob:"Takımın seni artık yalnız bir er olarak görmüyor; sorumluluk almaya başladın.",
 cv:"Emir almak kadar emir vermenin de ağırlığını taşıyacağın dönem.",
 uo:"Mesleği seçtin. Geçici görev değil, profesyonel askerlik yılları başlıyor.",
 uc:"Tim tecrüben arttı; yeni gelen personelin ilk baktığı kişi artık sensin.",
 ac:"Astsubay sınıfına geçtin. Sahadaki tecrübeyi kurumun hafızasına taşıyacaksın.",
 akc:"Kıdemin arttıkça hatalar yalnız sana değil, yetiştirdiğin personele de yazılıyor.",
 au:"Birliğin günlük düzeninde subaylarla personel arasındaki ana bağlardan birisin.",
 aku:"Tecrüben karar masasında daha fazla ağırlık taşıyor; sessiz kalman da bir karar.",
 ab:"Birliğin en deneyimli isimlerindensin. Genç personel senden meslek kadar karakter öğreniyor.",
 akb:"Astsubaylığın en üst kıdemi. Bundan sonrası bıraktığın usul, yetiştirdiğin insan ve kurumsal hafıza."
};
function tryPromote(){
  const R=RANKS[S.r];
  if(S.track==="admin"&&S.transitionCeiling===S.r){finishAdminCareer();return}
  if(S.r>=RANKS.length-1){retire();return}
  const vAvg=R.vis.reduce((a,k)=>a+S.st[k],0)/4;
  const aAvg=KEYS.reduce((a,k)=>a+S.st[k],0)/KEYS.length;
  const sAvg=typeof specialtyScore==="function"?specialtyScore(S):vAvg;
  if(vAvg*.65+aAvg*.1+sAvg*.25>=R.need&&S.st.dis>=18&&S.st.sic>=18){
    if(typeof shouldRunTransition==="function"&&shouldRunTransition(S)){beginTransitionExam();return}
    completePromotion();
  }else if(S.grace<1){
    S.grace++;S.cards=Math.max(0,R.cards-4);
    showPromo("Bekleme",R.n[S.f],"Terfi listesine giremedin. Bir devre daha bekleyeceksin; bu kez değerlendirme daha sert olacak.");
  }else ceiling(R);
}
function completePromotion(top,note){
  S.r++;S.cards=0;S.grace=0;
  RANKS[S.r].vis.forEach(k=>S.seen.add(k));
  showPromo(top||"Terfi",RANKS[S.r].n[S.f],note||PROMO[RANKS[S.r].t]);
}
function ceiling(R){
  let weak=R.vis[0];R.vis.forEach(k=>{if(S.st[k]<S.st[weak])weak=k});
  const sebep={
   dis:"Disiplin kalemin dosyanı yıllarca aşağı çekti.",
   sic:"Sicil ortalaman hiçbir dönem listeye yetecek düzeye çıkmadı.",
   ast:"Emrindekilerle kuramadığın bağ kâğıda 'sevk ve idarede zayıf' diye geçti.",
   fiz:"Sağlık ve fiziki yeterlilik notların önünü tıkadı.",
   ruh:"Yıllarca taşıdığın yük değerlendirmelerde 'yüksek tempoda zorlanır' olarak okundu.",
   tek:"Mesleki yeterlilik alanında hep bir adım geride kaldın.",
   ope:"Harekât değerlendirmelerin, seninle yarışanların gerisinde kaldı.",
   lid:"Sevk ve idare notların komuta kademesini ikna etmedi.",
   loj:"Kaynak yönetimi kalemi dosyanın en zayıf halkası oldu.",
   kar:"Yeterliydin, ama senin için masaya vuran kimse yoktu.",
   iti:"Kurumsal itibar hanesindeki gölge hiçbir zaman dağılmadı.",
   ail:"Özel hayatındaki dağınıklık dosyada bir istikrar sorunu olarak göründü."
  }[weak];
  const son=S.st.ail>=65?"Üniformayı astığın akşam sofrada seni bekleyenler vardı; bu da bir tür terfidir."
   :S.st.ast>=65?"Nizamiyeden çıkarken arkanda duran kalabalık, hiçbir şûra kararının silemeyeceği bir kayıttı."
   :"Nizamiyeden çıktığında seni kimse uğurlamadı. Otuz yıl, bir tebliğ yazısıyla kapandı.";
  if(R.t==="hb"){
    finish("iliksik","Harp Okulu'ndan ilişik kesme",
      "Mezun olamadın. "+sebep+" Kılıcını almadan, sivil bir otobüsle ayrıldın okuldan; "+
      "kimse arkandan bakmadı çünkü herkes kendi devresiyle meşguldü.");
    return;
  }
  finish("kadrosuz",R.n[S.f]+" olarak emeklilik","Üst rütbeye seçilemedin. "+sebep+" "+son);
}
function showPromo(top,rank,note){
  const restoring=arguments[3]===true;
  if(!restoring)addJournal(top==="Bekleme"?"review":"promotion",top+" · "+rank,note);
  S.resumeData={top,rank,note};
  document.getElementById("promoTop").textContent=top;
  document.getElementById("promoRank").textContent=rank;
  document.getElementById("promoNote").textContent=note;
  const nv=RANKS[S.r].vis, old=document.getElementById("promoNext");
  old.innerHTML='<div class="lbl">Bu rütbede sicilinde ölçülecek unsurlar</div>'+
    nv.map(k=>{
      const v=Math.round(S.st[k]);
      const cls=v<28?"bad":v<48?"mid":"ok";
      return '<span class="nx '+cls+'">'+STATS[k].s+'</span>';
    }).join("");
  document.getElementById("promoIns").innerHTML=insSVG(S.r,S.f);
  buildGauges();paintHUD();
  document.getElementById("promo").classList.remove("hide");
  persistGame("promo",restoring?"resume-promotion":"promotion");
}
document.getElementById("promoBtn").onclick=()=>{
  document.getElementById("promo").classList.add("hide");S.resumeData=null;nextCard();
};
function retire(){
  const s=S.st;
  if(typeof finishTraitCareer==="function"&&finishTraitCareer(S))return;
  if(typeof finishSpecialtyCareer==="function"&&finishSpecialtyCareer(S))return;
  if(S.career==="nco"){
    if(s.ast>=75&&s.lid>=68&&s.iti>=65)
      finish("usta","Birliğin Hafızası","Astsubay Kıdemli Başçavuş olarak emekli oldun. Yetiştirdiğin personel farklı birliklere dağıldı; usulün ve sözlerin senden sonra da yaşamaya devam etti.");
    else if(s.ope>=72&&s.tek>=68)
      finish("sahausta","Sahanın Ustası","Son içtimada adın rütbenden önce tecrübenle anıldı. Üniformayı bıraktın, anlattığın dersler birliklerde kaldı.");
    else if(s.ail>=72)
      finish("ncohuzur","Onurlu Emeklilik","Astsubay Kıdemli Başçavuş olarak görevini tamamladın. Nizamiyeden çıktığında bu kez evde seni bekleyen hayatı ertelemedin.");
    else finish("ncoemekli","Astsubay Kıdemli Başçavuş","Uzun bir saha kariyerinin ardından üniformanı astın. Sicil dosyan kapandı; yetiştirdiğin insanlar görevde kaldı.");
    return;
  }
  if(s.iti>=75&&s.kar>=70&&s.sic>=65)
    finish("gnkur","Genelkurmay Başkanı","En üst makama kadar geldin. Otuz beş yılın sonunda devir teslim konuşmanda sesin bir an titredi; kimse fark etmedi.");
  else if(s.ope>=75&&s.lid>=65)
    finish("harekat","Harekât efsanesi","Kuvvet komutanlığından emekli oldun. Adın karargâh masalarında değil, arazide anıldı.");
  else if(s.ail>=75)
    finish("huzur","Şerefle emeklilik","Zirveyi görmedin ama kaybetmedin de. Torunun omuzundaki yıldızları sayarken gülümsedin.");
  else finish("emekli","Emeklilik","Otuz beş yıl. Üniformayı astın, nizamiyede nöbetçi son kez selam durdu.");
}
function finish(id,title,text){
  if(S.ended)return;
  S.ended=true;locked=true;
  addJournal("ending",title,text);
  document.getElementById("endTitle").textContent=title;
  document.getElementById("endText").textContent=text;
  document.getElementById("endTop").textContent=RANKS[S.r].n[S.f]+" · "+S.age+" yaş · "+FORCE[S.f];
  const box=document.getElementById("endStats");box.innerHTML="";
  KEYS.forEach(k=>{
    const v=Math.round(S.st[k]),d=document.createElement("div");
    d.innerHTML='<span>'+STATS[k].s+'</span><b style="font-weight:600;color:'+
      (v>=85?"var(--brass)":v<=22?"var(--oxide)":"var(--paper-2)")+'">'+v+'</b>';
    box.appendChild(d);
  });
  const hon=KEYS.filter(k=>S.st[k]>=88);
  document.getElementById("endNote").textContent=hon.length?"Dosyaya işlenen üstünlük — "+hon.map(k=>STATS[k].n).join(" · "):"";
  document.getElementById("end").classList.remove("hide");
  if(typeof renderEndTraits==="function")renderEndTraits();
  archiveCareer(S,{id,title,text});
}
function renderJournal(){
  const rows=document.getElementById("journalRows");rows.innerHTML="";
  const entries=(S.journal||[]).slice().reverse();
  if(!entries.length){rows.innerHTML='<div class="journalEmpty">Henüz günlük kaydı yok.</div>';return}
  entries.forEach(entry=>{
    const row=document.createElement("article");row.className="journalEntry "+(entry.kind||"");
    const meta=document.createElement("div");meta.className="journalMeta";
    meta.textContent=(Math.floor((entry.month||0)/12)+1)+". hizmet yılı · "+entry.age+" yaş · "+entry.rank;
    const title=document.createElement("h3");title.textContent=entry.title;
    const detail=document.createElement("p");detail.textContent=entry.detail||"";
    row.append(meta,title);if(entry.detail)row.append(detail);rows.appendChild(row);
  });
}
function setFileTab(tab){
  const journal=tab==="journal";
  document.getElementById("fileStatsPanel").classList.toggle("hide",journal);
  document.getElementById("fileJournalPanel").classList.toggle("hide",!journal);
  document.getElementById("fileStatsTab").classList.toggle("on",!journal);
  document.getElementById("fileJournalTab").classList.toggle("on",journal);
  document.getElementById("fileStatsTab").setAttribute("aria-selected",String(!journal));
  document.getElementById("fileJournalTab").setAttribute("aria-selected",String(journal));
  if(journal)renderJournal();
}
function openFile(){
  const vis=RANKS[S.r].vis,rows=document.getElementById("fileRows");rows.innerHTML="";
  KEYS.forEach(k=>{
    const act=vis.indexOf(k)>=0,seen=S.seen.has(k),v=Math.round(S.st[k]);
    const d=document.createElement("div");
    d.className="frow "+(act?"act":seen?"dimd":"unk");
    const txt=act?v:seen?(v>=70?"iyi":v>=45?"orta":v>=25?"zayıf":"kritik"):"—";
    d.innerHTML='<div class="n">'+STATS[k].n+'</div>'+(act?'<span class="ftag">ölçülüyor</span>':'')+
      '<div class="b"><i style="width:'+(seen?Math.max(2,v):0)+'%"></i></div><div class="v">'+txt+'</div>';
    rows.appendChild(d);
  });
  const grade=S.exam?({ustun:"üstün başarı",basarili:"başarılı",sinirda:"sınırda kabul",saha:"saha ataması"}[S.exam.grade]||S.exam.grade):"kayıt yok";
  const specialty=typeof getSpecialty==="function"?getSpecialty(S.f,S.specialty):null;
  document.getElementById("fileNote").textContent=
    "Aday sınavı: "+(S.exam?S.exam.total:"—")+" puan · "+grade+". Uzmanlık: "+(specialty?specialty.name:"kayıt yok")+". Kariyer yolu: "+(S.track==="admin"?"idari görev":"aktif komuta")+". Bu rütbede sicilinde yalnızca dört unsur ölçülüyor. Daha önce ölçüldüğün unsurlar için yaklaşık bir kanaatin var; hiç ölçülmediklerin hakkında hiçbir fikrin yok — ama onlar işlemeye devam ediyor.";
  if(typeof renderTraitFile==="function")renderTraitFile();
  document.getElementById("file").classList.remove("hide");
  setFileTab("stats");
}
document.getElementById("fileBtn").onclick=openFile;
document.getElementById("fileClose").onclick=()=>document.getElementById("file").classList.add("hide");
document.getElementById("fileStatsTab").onclick=()=>setFileTab("stats");
document.getElementById("fileJournalTab").onclick=()=>setFileTab("journal");

function refreshResumePanel(){
  const summary=getActiveSaveSummary(),panel=document.getElementById("resumePanel"),forces=document.getElementById("forceList");
  document.getElementById("newCareerConfirm").classList.add("hide");
  if(!summary){panel.classList.add("hide");forces.classList.remove("hide");return}
  const ranks=summary.career==="nco"?NCO_RANKS:OFFICER_RANKS;
  const rank=ranks[summary.r]&&ranks[summary.r].n[summary.f]||"Kayıtlı kariyer";
  const specialty=typeof getSpecialty==="function"?getSpecialty(summary.f,summary.specialty):null;
  document.getElementById("resumeRank").textContent=rank;
  document.getElementById("resumeMeta").textContent=FORCE[summary.f]+" · "+(specialty?specialty.name+" · ":"")+summary.age+" yaş";
  forces.classList.add("hide");panel.classList.remove("hide");
}
function resumeSavedGame(){
  const restored=loadActiveState();if(!restored){refreshResumePanel();return false}
  S=restored;S.ended=false;RANKS=S.career==="nco"?NCO_RANKS:OFFICER_RANKS;
  if(typeof syncTraitFlags==="function")syncTraitFlags(S);
  activateDueConsequences();
  ["start","exam","specialty","transition","end","promo","file"].forEach(id=>document.getElementById(id).classList.add("hide"));
  buildGauges();paintHUD();
  if(S.resumeScreen==="promo"&&S.resumeData){showPromo(S.resumeData.top,S.resumeData.rank,S.resumeData.note,true);return true}
  if(S.resumeScreen==="transition"&&typeof restoreTransitionSession==="function"&&restoreTransitionSession())return true;
  if(S.resumeScreen==="specialtyReassign"&&typeof showTransitionSpecialties==="function"){showTransitionSpecialties(true);return true}
  if(S.resumeScreen==="card"&&S.pendingEvent){renderCard(S.pendingEvent);persistGame("card","resume-card");return true}
  nextCard();return true;
}
document.getElementById("continueBtn").onclick=resumeSavedGame;
document.getElementById("newCareerBtn").onclick=()=>document.getElementById("newCareerConfirm").classList.remove("hide");
document.getElementById("cancelNewCareer").onclick=()=>document.getElementById("newCareerConfirm").classList.add("hide");
document.getElementById("confirmNewCareer").onclick=()=>{clearActiveSave();refreshResumePanel()};

function onDown(e){if(locked)return;dragging=true;x0=e.clientX;y0=e.clientY;dx=0;cardA.classList.remove("snap")}
function onMove(e){
  if(!dragging)return;
  dx=e.clientX-x0;const dy=(e.clientY-y0)*.22;
  if(!raf)raf=requestAnimationFrame(()=>{
    raf=0;
    cardA.style.transform="translate3d("+dx+"px,"+dy+"px,0) rotate("+(dx/17)+"deg)";
    const a=Math.min(1,Math.abs(dx)/90);
    stampL.style.opacity=dx<-8?a:0;stampR.style.opacity=dx>8?a:0;
    chL.classList.toggle("hot",dx<-18);chR.classList.toggle("hot",dx>18);
    if(Math.abs(dx)>20&&choiceAvailable(dx>0?"right":"left",ev))preview(resolve(dx>0?ev.ra:ev.la,S.r));else clearPreview();
  });
}
function onUp(){
  if(!dragging)return;dragging=false;
  if(Math.abs(dx)>Math.min(100,window.innerWidth*.23)&&choiceAvailable(dx>0?"right":"left",ev))decide(dx>0);
  else{
    cardA.classList.add("snap");cardA.style.transform="translate3d(0,0,0)";
    stampL.style.opacity=0;stampR.style.opacity=0;
    chL.classList.remove("hot");chR.classList.remove("hot");clearPreview();
  }
}
cardA.addEventListener("pointerdown",onDown,{passive:true});
window.addEventListener("pointermove",onMove,{passive:true});
window.addEventListener("pointerup",onUp,{passive:true});
window.addEventListener("pointercancel",onUp,{passive:true});
[[chL,false],[chR,true]].forEach(function(a){
  const el=a[0],right=a[1];
  el.addEventListener("pointerdown",()=>{if(!locked&&!el.disabled){el.classList.add("hot");preview(resolve(right?ev.ra:ev.la,S.r))}},{passive:true});
  el.addEventListener("pointerleave",()=>{el.classList.remove("hot");if(!locked)clearPreview()},{passive:true});
  el.addEventListener("click",()=>{dx=right?100:-100;decide(right)});
});
window.addEventListener("keydown",e=>{
  if(locked)return;
  if(e.key==="ArrowLeft"&&!chL.disabled){dx=-100;decide(false)}
  if(e.key==="ArrowRight"&&!chR.disabled){dx=100;decide(true)}
});
window.addEventListener("resize",()=>{if(!locked)requestAnimationFrame(fitText)});
document.addEventListener("touchmove",e=>{
  if(!e.target.closest||!e.target.closest(".screen,#file"))e.preventDefault();
},{passive:false});

document.getElementById("again").onclick=()=>{
  document.getElementById("end").classList.add("hide");
  document.getElementById("specialty").classList.add("hide");
  document.getElementById("start").classList.remove("hide");
  refreshResumePanel();
};
window.addEventListener("beforeunload",()=>{if(S&&!S.ended)persistGame(S.resumeScreen||"card","page-hidden")});

/* ==========================================================================
   UYUYAN UNSUR — görünmeyen bir unsur kritik seviyeye inerse
   ilerleyen rütbede karşına bir dosya olarak çıkar
========================================================================== */
const WARN={
dis:[["Disiplin Subayı","Geçmişten · Disiplin","Kışla · Personel Şubesi",
 "Kariyerinin ilk yıllarından biriken uyarı yazıları dosyanda bir sayfayı doldurmuş. Üst makam açıklama istiyor.",
 "Eski defter dedim","pasif dis-4","Tek tek yanıt yazdım","duzen dogruluk dis+14"],
 ["Personel Başkanlığı","Geçmişten · Disiplin","Ankara · Personel Başkanlığı",
 "Terfi dosyanda yirmi yıl önceki disiplin notları hâlâ duruyor ve bu dönemki değerlendirmede yeniden okundu.",
 "Önemsemedim","pasif dis-5","Dosyayı temizlettim","duzen dogruluk dis+15 kar-4"]],
sic:[["Sicil Amirin","Geçmişten · Sicil","Kışla · Komutanlık",
 "\"Son üç kanaat notun ortalamanın altında. Bu gidişle listeye giremezsin, farkında mısın?\"",
 "Aldırmadım","pasif sic-4","Toparlanmak için çalıştım","ozveri ogrenme sic+14"],
 ["Personel Sekretaryası","Geçmişten · Sicil","Ankara · Personel",
 "Dosyanın sicil bölümü belirgin şekilde zayıf. Düzeltme için hem çalışma hem birkaç görüşme gerekiyor.",
 "Reddettim","mesafe sic-5","Süreci yürüttüm","iliski ozveri sic+15"]],
ast:[["Bölük Astsubayı","Geçmişten · Ast Bağı","Kışla · Bölük",
 "Emrindeki personel senden uzaklaştı; kapını çalan yok ve sorunları senden sonra öğreniyorsun.",
 "Mesafeyi korudum","mesafe ast-4","Aralarına indim","moral ozveri ast+15"],
 ["Eski Astın","Geçmişten · Ast Bağı","Ankara · Personel",
 "Yıllar önce kırdığın bir astsubay, şimdi senin dosyana bakan makamda oturuyor ve seni hatırlıyor.",
 "Yüzleşmedim","sakla ast-5 kar-4","Karşısına geçip konuştum","dogruluk destek ast+14"]],
fiz:[["Askerî Tabip","Geçmişten · Fizik","Askerî Hastane · Poliklinik",
 "Yıllardır ihmal ettiğin sakatlık büyümüş ve rapor bu kez terfi dosyana işlenecek.",
 "Ertelemeye devam ettim","sakla fiz-4","Tedaviye başladım","destek dinlenme fiz+14"],
 ["Sağlık Kurulu","Geçmişten · Fizik","GATA · Sağlık Kurulu",
 "İlk eğitim yıllarında zorladığın diz artık tören yürüyüşünde bile sorun çıkarıyor ve kurul durumu kayda geçirdi.",
 "Sakladım","sakla fiz-5","Ameliyat oldum","destek dinlenme fiz+15 t6"]],
ruh:[["Eşin","Geçmişten · Dayanım","Lojman · Mutfak",
 "\"Sen artık burada değilsin. Kaç aydır doğru düzgün uyudun, hatırlıyor musun?\"",
 "Konuyu kapattım","sakla ail-4","Yardım aldım","destek aile ruh+14"],
 ["Askerî Psikiyatri","Geçmişten · Dayanım","GATA · Psikiyatri",
 "Yıllardır biriktirdiğin yük kendini gösteriyor. Tedavi kayıt gerektiriyor ve kayıt dosyada görünür.",
 "Gitmedim","sakla ruh-5","Tedaviyi kabul ettim","destek dogruluk ruh+15 kar-4"]],
tek:[["Sınıf Okulu","Geçmişten · Mesleki","Sınıf Okulu · Eğitim",
 "Alanındaki doktrin değişti ve sen eski yöntemle kaldın. Astların bunu fark etti, sana söylemiyorlar.",
 "Böyle devam ettim","ihmal ast-4","Kursa yazıldım","ogrenme tek+14"],
 ["Genç Personel","Geçmişten · Mesleki","Ankara · Toplantı Salonu",
 "Toplantıda bilmediğin bir sistemden söz edildi ve sustuğun herkes tarafından anlaşıldı.",
 "Konuyu geçtim","ihmal iti-4","Öğrenmek için zaman ayırdım","ogrenme tek+15"]],
ope:[["Harekât Başkanlığı","Geçmişten · Harekât","Tugay · Harekât Şubesi",
 "Birliğinin harekât değerlendirmesi bölge sonuncusu çıktı ve bu kayıt üç yıl dosyanda kalacak.",
 "Rapora şerh düştüm","pasif ope-4","Baştan ele aldım","tempo insiyatif ope+14"],
 ["Denetleme Kurulu","Geçmişten · Harekât","Karargâh · Denetim",
 "Sorumluluğundaki birliklerin hazırlık seviyesi kabul edilebilir eşiğin altında ve gerekçe istiyorlar.",
 "Gerekçe yazdım","pasif ope-5","Sahaya indim","tempo ozveri ope+15"]],
lid:[["Emrindeki Personel","Geçmişten · Liderlik","Kışla · Karargâh",
 "Kararlarını kimse sahiplenmiyor; herkes emri alıp uyguluyor ve hiçbir şey söylemiyor.",
 "Emirle yönettim","sertlik lid-4","Onlarla oturdum","mentor moral lid+14"],
 ["Ast Komutanlar","Geçmişten · Liderlik","Karargâh · Toplantı",
 "Toplantıda kimse fikir söylemiyor. Bu sessizlik saygı değil, uzun zamandır kazanılmış bir alışkanlık.",
 "Böyle daha rahat dedim","sertlik lid-5","Sessizliği kırdım","mentor seffaf lid+15"]],
loj:[["İkmal Müdürü","Geçmişten · Lojistik","Garnizon · İkmal",
 "Envanter kayıtların yıllardır sağlıksız ve teftiş altı hafta sonra kapıda.",
 "Riski aldım","savsakla loj-4","Sayımı baştan yaptırdım","duzen ozveri loj+14"],
 ["Teftiş Kurulu","Geçmişten · Lojistik","Ankara · Teftiş",
 "Kaynak yönetimi kalemi dosyanın en zayıf halkası olarak duruyor ve bu rütbede en çok bakılan kalem o.",
 "Öncelik değil dedim","savsakla loj-5","Sistemi kurdum","duzen tasarruf loj+15"]],
kar:[["Devre Arkadaşın","Geçmişten · Nüfuz","Ankara · Kantin",
 "\"Ankara'da seni tanıyan kalmadı. Dosyan iyi ama dosyayı savunacak kimsen yok, bu böyle gitmez.\"",
 "Gerek yok dedim","mesafe kar-4","Bağlantılarımı tazeledim","iliski kar+14"],
 ["Personel Başkanlığı","Geçmişten · Nüfuz","Ankara · Personel Başkanlığı",
 "Yeterliliğin tartışmasız ama masada senin için konuşan kimse yok. Bu rütbede bu da bir eksiklik sayılıyor.",
 "Böyle kalayım dedim","mesafe kar-5","Kapıları çaldım","iliski gorunur kar+15"]],
iti:[["Basın İrtibat","Geçmişten · İtibar","Ankara · Basın",
 "Yıllar önce kapanmış bir olay yeniden gündeme geldi ve kurum sana karşı mesafe koyuyor.",
 "Sessiz kaldım","kapali iti-4","Açıklama yaptım","seffaf temsil iti+14"],
 ["Kuvvet Komutanlığı","Geçmişten · İtibar","Ankara · Makam",
 "Adın geçtiğinde masada kısa bir sessizlik oluyor ve kimse sebebini yüzüne söylemiyor.",
 "Görmezden geldim","kapali iti-5","Yüzleşip düzelttim","seffaf dogruluk iti+15"]],
ail:[["Çocuğun","Geçmişten · Aile","Ev · Telefon",
 "\"Mezuniyetime de gelmeyecek misin?\" Bunu üçüncü kez soruyor ve bu kez sesi kızgın bile değil.",
 "Görevim var dedim","gorev ail-5","Her şeyi iptal ettim","aile ail+14"],
 ["Eşin","Geçmişten · Aile","Ev · Salon",
 "Masanın üstünde imzalanmamış bir boşanma dilekçesi duruyor. İki haftadır orada ve ikiniz de konuşmuyorsunuz.",
 "Konuşmadım","sakla ail-5","Karşısına oturdum","aile destek ail+15"]]
};
function warnPick(){
  const vis=RANKS[S.r].vis,cand=[];
  for(const k of KEYS){
    if(vis.indexOf(k)>=0) continue;
    if(S.st[k]>29) continue;
    if(S.warnCd[k]>0) continue;
    cand.push(k);
  }
  if(!cand.length||Math.random()>0.5) return null;
  const k=cand[(Math.random()*cand.length)|0];
  S.warnCd[k]=5;
  const w=WARN[k][S.r<5?0:1];
  return {who:w[0],role:w[1],place:w[2],text:w[3],lt:w[4],la:w[5],rt:w[6],ra:w[7],warn:k};
}
