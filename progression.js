"use strict";

const TRAIT_AXES={
  integrity:{positive:"Dürüst",negative:"Pragmatik",positiveFlag:"trait_durust",negativeFlag:"trait_pragmatik",positiveTags:["dogruluk","durust","seffaf","kural"],negativeTags:["ortbas","yolsuz","sakla","kapali"]},
  leadership:{positive:"Koruyucu",negative:"Sert",positiveFlag:"trait_koruyucu",negativeFlag:"trait_sert",positiveTags:["koruma","mentor","moral","yumusak","sahiplen"],negativeTags:["sertlik","harcama","yikma"]},
  courage:{positive:"Atılgan",negative:"Temkinli",positiveFlag:"trait_atilgan",negativeFlag:"trait_temkinli",positiveTags:["risk","insiyatif","direnc"],negativeTags:["ihtiyat","pasif","itaat"]},
  ambition:{positive:"Kariyerci",negative:"Mütevazı",positiveFlag:"trait_kariyerci",negativeFlag:"trait_mutevazi",positiveTags:["menfaat","iliski","gorunur"],negativeTags:["feragat","geriplan","sahiplen"]},
  balance:{positive:"Aile Odaklı",negative:"Görev Odaklı",positiveFlag:"trait_aile",negativeFlag:"trait_gorev",positiveTags:["aile","dinlenme","destek"],negativeTags:["gorev","ozveri","tempo"]}
};
const TRAIT_THRESHOLD=18;

function ensureTraitProfile(state){
  state.traits=state.traits||{};state.traitMilestones=state.traitMilestones||{};
  Object.keys(TRAIT_AXES).forEach(key=>{if(typeof state.traits[key]!=="number")state.traits[key]=0});
  return state.traits;
}
function traitDirection(key,score){
  const axis=TRAIT_AXES[key];
  return score>=0?{label:axis.positive,flag:axis.positiveFlag}:{label:axis.negative,flag:axis.negativeFlag};
}
function syncTraitFlags(state){
  const traits=ensureTraitProfile(state);
  Object.entries(TRAIT_AXES).forEach(([key,axis])=>{
    state.flags.delete(axis.positiveFlag);state.flags.delete(axis.negativeFlag);
    if(traits[key]>=TRAIT_THRESHOLD)state.flags.add(axis.positiveFlag);
    else if(traits[key]<=-TRAIT_THRESHOLD)state.flags.add(axis.negativeFlag);
  });
}
function updateTraitProfile(rawEffect){
  if(!S)return;
  const traits=ensureTraitProfile(S),tokens=new Set((rawEffect||"").split(/\s+/));
  Object.entries(TRAIT_AXES).forEach(([key,axis])=>{
    let delta=0;
    axis.positiveTags.forEach(tag=>{if(tokens.has(tag))delta+=6});
    axis.negativeTags.forEach(tag=>{if(tokens.has(tag))delta-=6});
    if(!delta)return;
    const before=traits[key];traits[key]=Math.max(-100,Math.min(100,before+delta));
    if(Math.abs(traits[key])>=TRAIT_THRESHOLD){
      const direction=traitDirection(key,traits[key]),milestone=key+":"+direction.flag;
      if(!S.traitMilestones[milestone]){
        S.traitMilestones[milestone]=true;
        addJournal("profile",direction.label+" profil belirginleşti","Kararların artık yeni olay ve seçenekleri etkileyebilir.");
      }
    }
  });
  syncTraitFlags(S);renderTraitStrip();
}
function getTraitBadges(state,limit){
  const traits=ensureTraitProfile(state);
  return Object.keys(TRAIT_AXES).map(key=>({key,score:traits[key],...traitDirection(key,traits[key])}))
    .filter(item=>Math.abs(item.score)>=12).sort((a,b)=>Math.abs(b.score)-Math.abs(a.score)).slice(0,limit||3);
}
function renderTraitStrip(){
  const el=document.getElementById("traitStrip");if(!el||!S)return;
  const badges=getTraitBadges(S,3);
  el.innerHTML=badges.map(item=>'<span>'+item.label+' <b>'+Math.abs(item.score)+'</b></span>').join("");
  el.classList.toggle("hide",!badges.length);
}
function renderTraitFile(){
  const el=document.getElementById("fileTraits");if(!el||!S)return;
  const traits=ensureTraitProfile(S);
  el.innerHTML='<div class="traitFileTitle">Karar Profili</div>'+Object.keys(TRAIT_AXES).map(key=>{
    const score=traits[key],direction=traitDirection(key,score),width=Math.min(100,Math.abs(score));
    return '<div class="traitRow"><span>'+(score?direction.label:"Nötr")+'</span><i><b style="width:'+width+'%"></b></i><em>'+Math.abs(score)+'</em></div>';
  }).join("");
}
function renderEndTraits(){
  const el=document.getElementById("endTraits");if(!el||!S)return;
  const badges=getTraitBadges(S,4);
  el.innerHTML=badges.length?'<small>KARAR PROFİLİ</small>'+badges.map(item=>'<span>'+item.label+'</span>').join(""):"";
}
function finishTraitCareer(state){
  const t=ensureTraitProfile(state);
  if(state.career==="nco"){
    if(t.leadership>=55&&t.integrity>=20){finish("usta_yetistirici","Usta Yetiştirici","Astsubay Kıdemli Başçavuş olarak bıraktığın en güçlü miras, senden sonra sorumluluk alabilen personel oldu. Birlikte adın bir rütbeden çok güven ölçüsü olarak kaldı.");return true}
    if(t.courage>=52&&state.st.ope>=66){finish("onsaf_hafiza","Ön Safın Hafızası","Kritik anlarda geri çekilmedin; yıllar sonra bile genç personel sahada senin kararlarını örnek verdi.");return true}
    if(t.integrity>=58){finish("sozu_senet","Sözüne Güvenilen Astsubay","Dosyan her zaman kusursuz değildi ama söylediğin sözün arkasında durduğun hiç tartışılmadı.");return true}
    if(t.balance>=52){finish("eve_donen","Eve Dönen Başçavuş","Mesleğini tamamladın ve üniformayı astığında hâlâ seni tanıyan, yanında kalan bir ailen vardı.");return true}
  }else{
    if(t.integrity>=55&&t.leadership>=25){finish("emanet","Emanet Bırakan Komutan","Makamdan ayrıldığında arkanda yalnız başarı raporları değil, sana güvenmiş insanlar ve işleyen bir düzen bıraktın.");return true}
    if(t.ambition>=55&&t.integrity<=-20){finish("zirve_bedel","Zirvenin Bedeli","Terfi listelerinde hep yukarı çıktın. Son makamında geriye baktığında kazandığın nüfuzun yanında kaybettiğin güven de dosyadaydı.");return true}
    if(t.courage>=52&&state.st.ope>=68){finish("onhat_komutan","Ön Hattın Komutanı","Haritadan emir vermekle yetinmedin. En zor görevlerde varlığın birliklerin hafızasına kazındı.");return true}
    if(t.balance>=52){finish("uniforma_disi","Üniformanın Dışındaki Hayat","Kariyerin sona erdiğinde seni bekleyen hayatı kaybetmemiştin. Üniformayı çıkardın ama kimliğin eksilmedi.");return true}
  }
  return false;
}
