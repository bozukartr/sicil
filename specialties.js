"use strict";

/* Kuvvet sınıfları: başlangıç profili, terfi ağırlığı ve özel kariyer olayları. */
const SPECIALTIES={
  k:{
    piyade:{name:"Piyade",glyph:"▲",desc:"Arazi, birlik sevk ve yakın harekât",modifiers:{fiz:5,ope:3,loj:-3,ail:-2},weights:{fiz:.35,ope:.35,lid:.2,ruh:.1},ending:["Arazinin Komutanı","Piyade sınıfında başlayan kariyerin boyunca harita üzerindeki çizgileri arazide gerçeğe çevirdin. Yetiştirdiğin birlikler senden sonra da aynı disiplinle yürüdü."],terms:["sisli sırt geçişi","devriye teçhizatı","meskûn mahal eğitimi","çöken vadi patikası","nöbet kayıtları","ileri üs mühimmatı","başarılı baskın planı","uzun sınır görevi"]},
    topcu:{name:"Topçu",glyph:"✦",desc:"Ateş desteği, hesap ve hedef koordinasyonu",modifiers:{tek:5,loj:3,fiz:-3,ast:-2},weights:{tek:.4,loj:.25,ope:.25,dis:.1},ending:["Ateşin Matematiği","Topçu sınıfında tek bir koordinatın bedelini hiç unutmadın. Kurduğun ateş disiplini, birliklerin en zor anlarda güvenebildiği görünmez kalkan oldu."],terms:["çelişen hedef koordinatları","namlu ömrü","hesap ekibi eğitimi","plan dışı ateş isteği","mühimmat lot kaydı","hassas mühimmat ihtiyatı","yeni atış tablosu","gece atış programı"]},
    tank:{name:"Tank",glyph:"▰",desc:"Zırhlı manevra, mürettebat ve yüksek tempo",modifiers:{ope:5,tek:4,loj:-4,ail:-2},weights:{ope:.4,tek:.3,lid:.2,loj:.1},ending:["Zırhlı İz","Tank sınıfında hızın yalnız motor gücü olmadığını, mürettebat güveni olduğunu gösterdin. Arkanda bıraktığın palet izleri bir doktrine dönüştü."],terms:["taşıma sınırındaki köprü","çatlak palet pimi","termal nişangâh eğitimi","piyadeyle müşterek ilerleme","motor arıza raporu","zırhlı grup yakıtı","yarma harekâtı planı","ani zırhlı intikal"]},
    ikmal:{name:"İkmal",glyph:"▦",desc:"Tedarik, stok ve harekât sürekliliği",modifiers:{loj:6,tek:2,ope:-3,fiz:-2},weights:{loj:.45,tek:.25,dis:.2,sic:.1},ending:["Kesintisiz Hat","Kara ikmalinde hiçbir başarının görünmeyen emeğini küçümsemedin. Kurduğun sistem sayesinde birlikler, en uzak hatta bile ihtiyaç duyduğunu zamanında buldu."],terms:["soğuk hava deposu","dağ yolu konvoyu","manuel sayım eğitimi","plan dışı yakıt talebi","envanter farkları","acil taşıma kapasitesi","yeni dağıtım modeli","yıl sonu sayımı"]}
  },
  d:{
    guverte:{name:"Güverte",glyph:"⌁",desc:"Seyir, gemi idaresi ve deniz görevi",modifiers:{lid:4,ope:4,ail:-4,ruh:-2},weights:{lid:.35,ope:.3,ruh:.2,tek:.15},ending:["Ufuk Nöbeti","Güverte sınıfında denizin değişkenliğini insanlarına güvenerek yönettin. Son vardiyada bıraktığın seyir usulü, senden sonra da köprüüstünde yaşadı."],terms:["fırtınalı seyir rotası","dümen sistemi ikazı","klasik seyir eğitimi","yoğun boğaz trafiği","seyir jurnali","emniyetli dönüş yakıtı","başarılı liman manevrası","uzayan deniz görevi"]},
    makine:{name:"Makine",glyph:"⚙",desc:"Tahrik, bakım ve gemi sistemleri",modifiers:{tek:6,ruh:2,iti:-2,ail:-3},weights:{tek:.45,ruh:.2,loj:.2,dis:.15},ending:["Makine Dairesinin Sesi","Gemi sustuğunda herkes sana baktı; sen sistemi yeniden çalıştırdın. Kurduğun bakım kültürü filonun görünmeyen gücü oldu."],terms:["yüksek türbin sıcaklığı","sintine sızıntısı","elle müdahale eğitimi","sessiz seyir düzeni","sertifikasız yedek parça","kısıtlı bakım saati","yakıt tasarruf sistemi","kuru havuz mesaisi"]},
    deniz_piyadesi:{name:"Deniz Piyadesi",glyph:"⚓",desc:"Çıkarma, kıyı harekâtı ve müşterek görev",modifiers:{fiz:5,lid:3,loj:-3,ruh:-2},weights:{fiz:.3,lid:.3,ope:.3,ruh:.1},ending:["İlk Dalgada","Deniz piyadesi olarak kıyı ile deniz arasındaki en zor çizgide görev yaptın. İlk dalgada kurduğun güven, arkadan gelen birliklere yol açtı."],terms:["yüksek dalgada çıkarma","tahliye pompası arızası","gece çıkarma eğitimi","plan dışı kıyı başı","yaralı kayıtları","son çıkarma botu","başarılı kıyı planı","uzayan amfibi eğitim"]},
    ikmal:{name:"İkmal",glyph:"▦",desc:"Filo tedariki, liman ve denizde ikmal",modifiers:{loj:6,dis:2,ope:-3,ail:-2},weights:{loj:.45,dis:.25,tek:.2,ope:.1},ending:["Filonun Damarı","Deniz ikmalinde liman ile açık deniz arasındaki zinciri hiç koparmadın. Gemiler görevde kalabildiyse, bunda kurduğun görünmez hattın payı vardı."],terms:["dalgalı denizde yakıt aktarımı","liman soğuk zinciri","denizde ikmal eğitimi","uzak liman parça talebi","gemi dönüş stokları","filo yakıt ihtiyatı","yeni yükleme planı","bayram ikmal nöbeti"]}
  },
  h:{
    pilotaj:{name:"Pilotaj",glyph:"✈",desc:"Uçuş, görev liderliği ve anlık karar",modifiers:{ope:5,ruh:3,loj:-3,ail:-3},weights:{ope:.4,ruh:.25,tek:.2,lid:.15},ending:["Gökyüzünde İz","Pilotaj kariyerinde hız ile muhakeme arasındaki ince çizgiyi korudun. Son uçuşundan sonra bile brifinglerde kararların örnek gösterildi."],terms:["limit bulut tabanı","aralıklı sensör ikazı","elle uçuş eğitimi","kanat arkadaşının yakıtı","sert iniş kaydı","kalan son sorti","kritik kaçış rotası","alarm nöbeti"]},
    hava_savunma:{name:"Hava Savunma",glyph:"◎",desc:"Radar, tehdit değerlendirme ve angajman",modifiers:{tek:5,dis:3,ruh:-2,ail:-2},weights:{tek:.4,dis:.25,ope:.25,ruh:.1},ending:["Görünmeyen Kalkan","Hava savunmada çoğu başarının sesi çıkmadı; çünkü tehditler hedefe ulaşamadı. Kurduğun ağ yıllarca gökyüzünün görünmeyen kalkanı oldu."],terms:["kimliği belirsiz radar izi","sınırdaki arayıcı başlık","yoğun iz eğitimi","karıştırma altında mevzi","yanlış alarm kaydı","kalan hazır füze","iz sınıflandırma modeli","kesintisiz alarm haftası"]},
    teknik:{name:"Teknik",glyph:"⌬",desc:"Uçak sistemleri, bakım ve uçuş emniyeti",modifiers:{tek:6,loj:2,kar:-2,ail:-3},weights:{tek:.45,loj:.25,dis:.2,sic:.1},ending:["Uçuşa Elverişli","Hava teknik sınıfında attığın her imzanın bir uçağı ve mürettebatı taşıdığını bildin. Kurduğun bakım disiplini filonun güven standardına dönüştü."],terms:["kanat bağlantısı izi","sertifika zinciri eksik parça","temel arıza eğitimi","uçaklar arası parça aktarımı","sonradan atılan bakım imzaları","son bakım ekibi","arıza süresi projesi","gece hangar vardiyası"]},
    lojistik:{name:"Lojistik",glyph:"▤",desc:"Hava ulaştırma, yakıt ve üs sürekliliği",modifiers:{loj:6,sic:2,ope:-3,fiz:-2},weights:{loj:.45,sic:.2,tek:.2,ope:.15},ending:["Havanın İkmal Köprüsü","Hava lojistiğinde pist ile uzak üsler arasındaki köprüyü ayakta tuttun. Doğru yük, doğru zamanda ulaştığı için sayısız görev başlayabildi."],terms:["limit yakıt numunesi","arızalı kargo paleti","tehlikeli madde eğitimi","plan dışı tıbbi tahliye","sayaç kayıt farkı","son nakliye uçağı","yeni yükleme çizelgesi","acil hava köprüsü"]}
  }
};

const SPECIALTY_SCENARIOS=[
  {who:"Harekât Subayı",place:"Görev Hattı",text:t=>t+" için emniyet limiti aşıldı; görev penceresi hızla kapanıyor.",left:"Emniyet payını korudum",right:"Görevi sürdürdüm",fx:(a,b,c)=>["dis+5 "+a+"+2 ruh+2 ope-4","ope+6 "+c+"+2 dis-4 ruh-3"]},
  {who:"Bakım Astsubayı",place:"Teknik Alan",text:t=>t+" üzerinde aralıklı bir kusur bulundu; yedek kapasite yok.",left:"Bakım kaydı açtım",right:"Geçici çözümle devam ettim",fx:(a,b)=>["tek+6 "+b+"+3 ope-3","ope+5 "+a+"+3 tek-4 loj-2"]},
  {who:"Eğitim Subayı",place:"Eğitim Merkezi",text:t=>"Yeni personel "+t+" konusunda hız kazanıyor ama temel usulleri atlıyor.",left:"Eğitimi baştan aldım",right:"Program temposunu korudum",fx:(a,b)=>["ast+5 lid+4 "+b+"+2 t6",a+"+5 ope+3 ast-4"]},
  {who:"Birlik Komutanı",place:"Müşterek Karargâh",text:t=>t+" için plan dışı karar gerekiyor; üst makamdan yanıt gelmedi.",left:"Onay sürecini bekledim",right:"İnisiyatif aldım",fx:(a,b)=>["dis+4 sic+3 "+a+"-2","lid+5 "+b+"+4 dis-4"]},
  {who:"Denetleme Heyeti",place:"Sicil Bürosu",text:t=>t+" ile ilgili kayıtların gerçeği tam yansıtmadığı ortaya çıktı.",left:"Açık biçimde raporladım",right:"Birlik içinde düzelttim",fx:()=>["iti+5 dis+4 sic-2","sic+4 iti-6 dis-4"]},
  {who:"Harekât Merkezi",place:"İleri Üs",text:t=>t+" yalnız bir kritik ihtiyaca yetecek; iki görev aynı anda bekliyor.",left:"İhtiyatı korudum",right:"Anlık görevde kullandım",fx:a=>["loj+5 ruh+2 ope-3","ope+6 "+a+"+3 loj-5"]},
  {who:"Kuvvet Komutanı",place:"Değerlendirme Salonu",text:t=>t+" başarısını genç ekibin kararı sağladı; raporu sen sunacaksın.",left:"Ekibi öne çıkardım",right:"Komuta başarısı yazdım",fx:()=>["ast+6 lid+3 sic-2","sic+5 kar+4 ast-5"]},
  {who:"Ailen",place:"Garnizon",text:t=>t+" aile için ayırdığın son izin günüyle çakıştı.",left:"Vardiyayı paylaştırdım",right:"Görevin başında kaldım",fx:a=>["ail+7 ruh+5 "+a+"-3",a+"+6 sic+3 ail-7 ruh-3"]}
];

function specialtyList(force){
  return Object.entries(SPECIALTIES[force]||{}).map(([id,data])=>({id,force,...data}));
}
function getSpecialty(force,id){
  const data=SPECIALTIES[force]&&SPECIALTIES[force][id];
  return data?{id,force,...data}:null;
}
function specialtyScore(state){
  const spec=getSpecialty(state.f,state.specialty);
  if(!spec)return RANKS[state.r].vis.reduce((sum,k)=>sum+state.st[k],0)/4;
  let sum=0,total=0;
  for(const k in spec.weights){sum+=state.st[k]*spec.weights[k];total+=spec.weights[k]}
  return total?sum/total:0;
}
function finishSpecialtyCareer(state){
  const spec=getSpecialty(state.f,state.specialty);
  if(!spec||specialtyScore(state)<72)return false;
  finish("uz_"+spec.id,spec.ending[0],spec.ending[1]);
  return true;
}
function showSpecialtySelect(force,profile){
  const screen=document.getElementById("specialty"),list=document.getElementById("specialtyList");
  document.getElementById("specialtyCareer").textContent=profile.career==="nco"?"Saha Kariyeri":"Subay Kariyeri";
  document.getElementById("specialtyTitle").textContent=profile.career==="nco"?"Branşını Seç":"Sınıfını Seç";
  document.getElementById("specialtyLead").textContent="Uzmanlığın ilk sicilini, özel olaylarını ve terfide ağırlık kazanacak ölçütleri belirler.";
  list.innerHTML="";
  specialtyList(force).forEach(spec=>{
    const b=document.createElement("button");b.className="specialtyCard";
    const focus=Object.keys(spec.weights).slice(0,3).map(k=>STATS[k].s).join(" · ");
    const mods=Object.entries(spec.modifiers).filter(x=>x[1]).map(([k,v])=>'<i class="'+(v>0?"up":"down")+'">'+STATS[k].s+' '+(v>0?"+":"")+v+'</i>').join("");
    b.innerHTML='<span class="specialtyGlyph">'+spec.glyph+'</span><span class="specialtyText"><b>'+spec.name+'</b><em>'+spec.desc+'</em><small>'+focus+'</small><span class="specialtyMods">'+mods+'</span></span>';
    b.setAttribute("aria-label",spec.name+" uzmanlığını seç");
    b.onclick=()=>newGame(force,profile.career,profile,spec.id);
    list.appendChild(b);
  });
  document.getElementById("exam").classList.add("hide");
  screen.classList.remove("hide");
}
function registerSpecialtyEvents(){
  for(const force of Object.keys(SPECIALTIES))for(const spec of specialtyList(force)){
    const focus=Object.keys(spec.weights),req="uz_"+spec.id;
    SPECIALTY_SCENARIOS.forEach((scenario,i)=>{
      const fx=scenario.fx(focus[0],focus[1],focus[2]),term=spec.terms[i];
      E("*",force,scenario.who,spec.name+" · Uzmanlık Olayı",scenario.place,scenario.text(term),scenario.left,fx[0],scenario.right,fx[1],{req,w:2,pri:1});
    });
  }
}
registerSpecialtyEvents();
