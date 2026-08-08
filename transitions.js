"use strict";

const TRANSITION_EXAMS={
  officer:{
    0:{id:"mezuniyet",title:"Harp Okulu Mezuniyet Kurulu",route:"Harbiyeli → Teğmen",stats:["dis","fiz","tek","ruh"],pass:"Mezuniyet yeterliliğini gösterdin; subay nasbın onaylandı.",questions:[
      {q:"Bir eğitim emri personel emniyet limitini aşıyor. İlk hareketin ne olur?",o:["Emri aynen uygularım","Riski raporlayıp emniyet tedbiri alırım","Kayda geçmeden programı kısaltırım"],a:1},
      {q:"Eksik bilgiyle verilen ilk takım emrinde en kritik unsur hangisidir?",o:["Açık görev ve geri bildirim noktası","En uzun emir metni","Bütün kararları tek merkezde tutmak"],a:0},
      {q:"Bir arkadaşının hatası başarı notunu etkiliyor. Sicil yaklaşımın ne olur?",o:["Hatayı saklarım","Kişiyi suçlayıp çekilirim","Gerçeği kayda geçirip düzeltme planı kurarım"],a:2}
    ]},
    3:{id:"kurmaylik",title:"Kurmaylık ve Komuta Değerlendirmesi",route:"Yüzbaşı → Binbaşı",stats:["lid","ope","sic","loj"],pass:"Kurmay muhakemesi ve komuta yeterliliğin kurulca kabul edildi.",questions:[
      {q:"İki birlik aynı sınırlı kaynağı istiyor. Önceliği nasıl belirlersin?",o:["Görev etkisi ve risk karşılaştırmasıyla","İlk talep edene","Rütbesi yüksek olana"],a:0},
      {q:"Harekât planındaki varsayım doğrulanmadı. En doğru yaklaşım hangisi?",o:["Planı değiştirmeden sürdürmek","Alternatif planı tetikleyip üst makamı bilgilendirmek","Sonucu bekleyip raporu sonra yazmak"],a:1},
      {q:"Ast birliğin başarısı değerlendirme raporuna nasıl girer?",o:["Sadece sonuç yazılır","Komutanın kişisel başarısı sayılır","Katkı ve sorumluluklar açıkça ayrıştırılır"],a:2}
    ]},
    6:{id:"yuksek_komuta",title:"Yüksek Komuta Seçmeleri",route:"Albay → General / Amiral",stats:["iti","kar","ope","lid"],pass:"Yüksek komuta sorumluluğu için stratejik yeterliliğin onaylandı.",questions:[
      {q:"Müşterek harekâtta kuvvet öncelikleri çatışıyor. İlk adım nedir?",o:["Ortak hedef ve yetki sınırını yeniden kurmak","Kendi kuvvet planını dayatmak","Kararı alt kademeye bırakmak"],a:0},
      {q:"Stratejik karar kısa vadede başarı, uzun vadede ağır risk taşıyor.",o:["Yalnız kısa vadeyi seçerim","Riskleri seçeneklerle birlikte karar makamına taşırım","Kararı geciktirip kayıt tutmam"],a:1},
      {q:"Kamuya yansıyan kurumsal hata karşısında doğru komuta tavrı nedir?",o:["Sorumluluğu alt birime bırakmak","Tamamen sessiz kalmak","Doğru bilgiyi verip düzeltici süreci sahiplenmek"],a:2}
    ]}
  },
  nco:{
    2:{id:"uzman_secme",title:"Uzman Personel Seçmeleri",route:"Çavuş → Uzman Onbaşı",stats:["dis","fiz","tek","ast"],pass:"Profesyonel saha hizmeti için uzman personel yeterliliğini kazandın.",questions:[
      {q:"Tim görevi öncesi teçhizat sayımında eksik buldun. Ne yaparsın?",o:["Eksikliği bildirip tamamlarım","Görevden sonra bakarım","Başka timin kaydına yazarım"],a:0},
      {q:"Yeni personel emniyet usulünü bilmiyor fakat tempo yüksek.",o:["Sessizce izlerim","Usulü gösterip uygulamasını doğrularım","Sadece yazılı not bırakırım"],a:1},
      {q:"Sahada emir anlaşılmadı. En doğru tekrar yöntemi hangisidir?",o:["Aynı cümleyi daha yüksek sesle söylemek","Emri iptal etmek","Görev, zaman ve geri bildirimi kısa biçimde netleştirmek"],a:2}
    ]},
    4:{id:"astsubay_gecis",title:"Astsubaylığa Geçiş Kurulu",route:"Uzman Çavuş → Astsubay Çavuş",stats:["tek","lid","ast","sic"],pass:"Saha tecrübeni kurumsal liderliğe taşıyacak yeterliliği gösterdin.",questions:[
      {q:"Tecrübeli personel yeni usule direniyor. Nasıl ilerlersin?",o:["Gerekçeyi anlatıp uygulamayı denetlerim","Eski usulü görmezden gelirim","Tartışmayı tamamen kapatırım"],a:0},
      {q:"Astının hatası görevi aksattı. İlk liderlik adımı nedir?",o:["Herkesin önünde cezalandırmak","Etkisini giderip nedenini kişiyle incelemek","Hatayı kendi sicilinden saklamak"],a:1},
      {q:"Teknik bilgin ile verilen emir arasında riskli bir çelişki var.",o:["Hiç uygulamamak","Kayda geçirmeden değiştirmek","Riski ve çözümü komuta zincirine açıkça sunmak"],a:2}
    ]},
    7:{id:"kidemli_liderlik",title:"Kıdemli Liderlik Değerlendirmesi",route:"Astsubay Üstçavuş → Kıdemli Üstçavuş",stats:["lid","ast","iti","ruh"],pass:"Kıdemli liderlik ve birlik hafızası sorumluluğuna hazır bulunduğun kayda geçti.",questions:[
      {q:"Genç komutanın kararı uygulanabilir fakat önemli saha riski taşıyor.",o:["Riski verilerle sunup kararı desteklerim","Emri personelin yanında tartışırım","Sessiz kalıp sonucu beklerim"],a:0},
      {q:"Birlikte iki kuşak arasında usul çatışması büyüyor.",o:["Taraflardan birini seçerim","Ortak standardı kurup tecrübeyi eğitime çeviririm","Konuyu zamanla çözülmeye bırakırım"],a:1},
      {q:"Yıllardır biriken görev yükü kararlarını etkilemeye başladı.",o:["Durumu saklarım","Bütün sorumluluğu devrederim","Destek alıp görev düzenini sürdürülebilir kurarım"],a:2}
    ]}
  }
};

let TRANSITION=null;
function transitionConfig(state){
  return TRANSITION_EXAMS[state.career]&&TRANSITION_EXAMS[state.career][state.r]||null;
}
function shouldRunTransition(state){
  const cfg=transitionConfig(state);
  return !!(cfg&&!state.flags.has("gecis_"+cfg.id));
}
function beginTransitionExam(retry){
  const cfg=transitionConfig(S);
  if(!cfg)return false;
  locked=true;
  S.transitionAttempts=S.transitionAttempts||{};
  S.transitionAttempts[cfg.id]=(S.transitionAttempts[cfg.id]||0)+1;
  TRANSITION={cfg,index:-1,correct:0,answers:[],attempt:S.transitionAttempts[cfg.id]};
  document.getElementById("transition").classList.remove("hide");
  renderTransitionIntro(!!retry);
  return true;
}
function renderTransitionIntro(retry){
  const cfg=TRANSITION.cfg,spec=getSpecialty(S.f,S.specialty);
  document.getElementById("transitionStep").textContent="Kariyer Geçişi · "+TRANSITION.attempt+". Deneme";
  document.getElementById("transitionRoute").textContent=cfg.route;
  const measured=cfg.stats.map(k=>'<span>'+STATS[k].s+' <b>'+Math.round(S.st[k])+'</b></span>').join("");
  document.getElementById("transitionBody").innerHTML='<div class="transitionPanel"><div class="transitionSeal">'+(spec?spec.glyph:"◆")+'</div>'+ 
    '<div class="transitionKicker">'+(retry?"Yeniden değerlendirme":"Kariyer eşiği")+'</div><h2>'+cfg.title+'</h2>'+ 
    '<p>Sicil ölçütlerin ve üç karar sorusu birlikte değerlendirilecek. Başarısızlık dosyayı kapatmaz; kariyer yönünü sen belirlersin.</p>'+ 
    '<div class="transitionStats">'+measured+'</div><button class="transitionAction" id="transitionAction">Değerlendirmeyi başlat</button></div>';
  document.getElementById("transitionAction").onclick=()=>{TRANSITION.index=0;renderTransitionQuestion()};
}
function renderTransitionQuestion(){
  if(TRANSITION.index>=TRANSITION.cfg.questions.length){renderTransitionResult();return}
  const q=TRANSITION.cfg.questions[TRANSITION.index];
  document.getElementById("transitionStep").textContent="Karar "+(TRANSITION.index+1)+" / "+TRANSITION.cfg.questions.length;
  document.getElementById("transitionBody").innerHTML='<div class="transitionPanel question"><div class="transitionKicker">'+TRANSITION.cfg.title+'</div>'+ 
    '<div class="transitionQuestion">'+q.q+'</div><div class="transitionOptions">'+q.o.map((x,i)=>'<button data-answer="'+i+'"><i>'+String.fromCharCode(65+i)+'</i><span>'+x+'</span></button>').join("")+'</div></div>';
  document.querySelectorAll("#transitionBody [data-answer]").forEach(btn=>btn.onclick=()=>answerTransition(+btn.dataset.answer));
}
function answerTransition(answer){
  const q=TRANSITION.cfg.questions[TRANSITION.index],buttons=document.querySelectorAll("#transitionBody [data-answer]");
  buttons.forEach(x=>{x.disabled=true;if(+x.dataset.answer===q.a)x.classList.add("correct")});
  if(answer===q.a)TRANSITION.correct++;else buttons[answer].classList.add("wrong");
  TRANSITION.answers.push(answer);TRANSITION.index++;
  setTimeout(renderTransitionQuestion,360);
}
function transitionScore(){
  const cfg=TRANSITION.cfg;
  const avg=cfg.stats.reduce((n,k)=>n+S.st[k],0)/cfg.stats.length;
  const dossier=Math.round(Math.max(0,Math.min(45,avg*.45)));
  const decisions=TRANSITION.correct*15;
  const background=Math.round(Math.max(0,Math.min(10,(S.exam&&S.exam.total||0)/10)));
  return {dossier,decisions,background,total:dossier+decisions+background};
}
function renderTransitionResult(){
  const score=transitionScore(),pass=score.total>=65;
  TRANSITION.score=score;TRANSITION.pass=pass;
  document.getElementById("transitionStep").textContent=pass?"Yeterli":"Yönlendirme Gerekli";
  const rows=[["Sicil",score.dossier,45],["Karar",score.decisions,45],["Aday geçmişi",score.background,10]]
    .map(x=>'<span><i>'+x[0]+'</i><b>'+x[1]+' / '+x[2]+'</b></span>').join("");
  const actions=pass
    ?'<button class="transitionAction pass" id="transitionPass">Terfiyi onayla</button>'
    :'<div class="transitionPaths"><button data-path="wait">Aynı rütbede bekle</button><button data-path="retry">Sınava yeniden gir</button><button data-path="specialty">Başka uzmanlığa yönel</button><button data-path="admin">İdari göreve geç</button><button class="danger" data-path="retire">Erken emeklilik</button></div>';
  document.getElementById("transitionBody").innerHTML='<div class="transitionPanel result '+(pass?"pass":"fail")+'"><div class="transitionScore">'+score.total+'</div>'+ 
    '<div class="transitionKicker">'+(pass?"Geçiş onayı":"Geçiş barajı: 65")+'</div><h2>'+(pass?"Değerlendirme Başarılı":"Değerlendirme Başarısız")+'</h2>'+ 
    '<p>'+(pass?TRANSITION.cfg.pass:"Dosyan kapanmadı. Bekleyebilir, yeniden deneyebilir veya kariyer yönünü değiştirebilirsin.")+'</p>'+ 
    '<div class="transitionBreakdown">'+rows+'</div>'+actions+'</div>';
  if(pass)document.getElementById("transitionPass").onclick=passTransition;
  else document.querySelectorAll("#transitionBody [data-path]").forEach(btn=>btn.onclick=()=>chooseTransitionPath(btn.dataset.path));
}
function addTransitionTime(months){
  S.months+=months;S.age=18+Math.floor(S.months/12);
}
function passTransition(){
  const cfg=TRANSITION.cfg,score=TRANSITION.score.total;
  S.flags.add("gecis_"+cfg.id);
  S.st.sic=Math.min(100,S.st.sic+(score>=85?4:2));
  if(score>=85)S.st.lid=Math.min(100,S.st.lid+3);
  document.getElementById("transition").classList.add("hide");
  completePromotion("Geçiş Sınavı",cfg.pass+" "+PROMO[RANKS[S.r+1].t]);
}
function chooseTransitionPath(path){
  const cfg=TRANSITION.cfg;
  S.st.sic=Math.max(0,S.st.sic-2);S.st.ruh=Math.max(0,S.st.ruh-2);
  if(path==="retry"){
    addTransitionTime(6);beginTransitionExam(true);return;
  }
  if(path==="wait"){
    S.flags.add("gecis_bekleme_"+cfg.id);addTransitionTime(12);
    S.cards=Math.max(0,RANKS[S.r].cards-4);closeTransitionToGame();return;
  }
  if(path==="specialty"){
    addTransitionTime(6);showTransitionSpecialties();return;
  }
  if(path==="admin"){
    S.track="admin";S.transitionCeiling=S.r;S.flags.add("idari");S.flags.add("gecis_idari_"+cfg.id);
    S.cards=0;addTransitionTime(12);closeTransitionToGame();return;
  }
  if(path==="retire"){
    document.getElementById("transition").classList.add("hide");
    finish("gecis_emekli",RANKS[S.r].n[S.f]+" olarak erken emeklilik",cfg.title+" sonrasında aktif kariyere devam etmemeyi seçtin. Sicil dosyan kendi kararınla kapandı.");
  }
}
function closeTransitionToGame(){
  document.getElementById("transition").classList.add("hide");
  paintHUD();buildGauges();nextCard();
}
function showTransitionSpecialties(){
  document.getElementById("transition").classList.add("hide");
  const screen=document.getElementById("specialty");
  document.getElementById("specialtyCareer").textContent="Kariyer Yönlendirme";
  document.getElementById("specialtyTitle").textContent="Yeni Uzmanlık Seç";
  document.getElementById("specialtyLead").textContent="Yeni uzmanlığın bundan sonraki olay ve terfi ağırlıklarını değiştirir. Geçiş sınavına daha sonra yeniden girebilirsin.";
  renderSpecialtyOptions(S.f,spec=>{
    const old=S.specialty;
    if(old)S.flags.delete("uz_"+old);
    S.specialty=spec.id;S.flags.add("uz_"+spec.id);S.st.tek=Math.min(100,S.st.tek+2);
    S.cards=Math.max(0,RANKS[S.r].cards-3);
    screen.classList.add("hide");paintHUD();nextCard();
  },S.specialty);
  screen.classList.remove("hide");
}
function finishAdminCareer(){
  const title=S.career==="nco"?"İdari Hizmet Ustalığı":"Karargâh Hizmeti";
  const text=S.career==="nco"
    ?"Aktif terfi yolundan ayrıldıktan sonra birliğin personel ve eğitim düzenini taşıdın. Üniformayı astığında arkanda çalışan bir sistem bıraktın."
    :"Komuta hattından ayrılıp karargâh görevine geçtin. Dosyalar, planlar ve yetiştirdiğin personel üzerinden kuruma hizmet etmeyi sürdürdün.";
  finish("idari",title,text);
}

const ADMIN_EVENTS=[
  ["Personel Şube","İdari Görev · Atama","Üç kritik kadroya aynı anda personel isteniyor; eldeki liste yalnız birini karşılıyor.","Kıdem sırasını korudum","Görev ihtiyacına göre dağıttım","dis+5 sic+3 ope-3","loj+4 ope+4 dis-3"],
  ["Eğitim Şube","İdari Görev · Eğitim","Yıllık eğitim planı sahadaki görev temposuyla çakışıyor.","Takvimi korudum","Programı birliklere göre böldüm","dis+4 tek+4 ast-3","lid+5 ast+4 dis-3"],
  ["Bütçe Birimi","İdari Görev · Kaynak","Kalan bütçe ya bina onarımına ya personel donanımına yetecek.","Altyapıyı yeniledim","Personel donanımını aldım","loj+6 ope-3","ast+5 tek+3 loj-4"],
  ["Denetleme Kurulu","İdari Görev · Denetim","Eski bir kayıt hatası bugünkü kadroyu etkiliyor ve kimse sorumluluğu almak istemiyor.","Hatayı açıkça düzelttim","Geçiş maddesiyle kapattım","iti+5 dis+4 sic-2","sic+4 kar+3 iti-5"],
  ["Genç Personel","İdari Görev · Mentorluk","Yeni görevliler sistemi bilmiyor; teslim tarihi ise değişmiyor.","İşi durdurup öğrettim","Kendim tamamladım","mentor tek+4 t6","sic+4 ruh-3 ast-4"],
  ["Ailen","İdari Görev · Özel Hayat","Karargâh görevi cepheden uzak ama mesai yine eve taşınıyor.","Dosyayı makamda bıraktım","Gece evde tamamladım","aile ruh+4","gorev sic+3"]
];
ADMIN_EVENTS.forEach(x=>E("*","*",x[0],x[1],"Karargâh",x[2],x[3],x[5],x[4],x[6],{req:"idari",pri:2,w:2}));
