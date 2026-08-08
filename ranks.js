"use strict";
/* ==========================================================================
   SİCİL — TSK subay kariyer simülasyonu
   Etki modeli: davranış etiketi → temel vektör → rütbe ağırlığı → delta
========================================================================== */
const STATS={
  dis:{n:"Disiplin",s:"DİSİPLİN"},          sic:{n:"Sicil ve Kanaat",s:"SİCİL"},
  ast:{n:"Ast Bağlılığı",s:"AST BAĞI"},     fiz:{n:"Fiziki Yeterlilik",s:"FİZİK"},
  ruh:{n:"Ruhsal Dayanıklılık",s:"DAYANIM"},tek:{n:"Mesleki Yetkinlik",s:"MESLEKİ"},
  ope:{n:"Harekât Başarısı",s:"HAREKÂT"},   lid:{n:"Sevk ve İdare",s:"LİDERLİK"},
  loj:{n:"Kaynak Yönetimi",s:"LOJİSTİK"},   kar:{n:"Karargâh Nüfuzu",s:"NÜFUZ"},
  iti:{n:"Kurumsal İtibar",s:"İTİBAR"},     ail:{n:"Aile ve Özel Hayat",s:"AİLE"}
};
const KEYS=Object.keys(STATS);

const OFFICER_RANKS=[
 {t:"hb",n:{k:"Harbiyeli",d:"Deniz Harbiyeli",h:"Hava Harbiyeli"},cards:11,vis:["dis","fiz","tek","ruh"],need:48,ins:{cadet:1}},
 {t:"tg",n:{k:"Teğmen",d:"Teğmen",h:"Teğmen"},cards:9,vis:["dis","ast","fiz","sic"],need:46,ins:{bar:2}},
 {t:"ut",n:{k:"Üsteğmen",d:"Üsteğmen",h:"Üsteğmen"},cards:10,vis:["dis","ast","lid","sic"],need:48,ins:{bar:3}},
 {t:"yz",n:{k:"Yüzbaşı",d:"Yüzbaşı",h:"Yüzbaşı"},cards:12,vis:["lid","ast","ope","sic"],need:54,ins:{bar:4}},
 {t:"bb",n:{k:"Binbaşı",d:"Binbaşı",h:"Binbaşı"},cards:12,vis:["ope","loj","sic","ail"],need:44,ins:{star:1,laurel:1}},
 {t:"yb",n:{k:"Yarbay",d:"Yarbay",h:"Yarbay"},cards:12,vis:["lid","kar","sic","ruh"],need:50,ins:{star:2,laurel:1}},
 {t:"al",n:{k:"Albay",d:"Albay",h:"Albay"},cards:12,vis:["iti","kar","ope","ail"],need:47,ins:{star:3,laurel:1}},
 {t:"g1",n:{k:"Tuğgeneral",d:"Tuğamiral",h:"Tuğgeneral"},cards:9,vis:["iti","kar","loj","sic"],need:52,ins:{star:1,gen:1}},
 {t:"g2",n:{k:"Tümgeneral",d:"Tümamiral",h:"Tümgeneral"},cards:9,vis:["iti","kar","ope","sic"],need:52,ins:{star:2,gen:1}},
 {t:"g3",n:{k:"Korgeneral",d:"Koramiral",h:"Korgeneral"},cards:8,vis:["iti","kar","ope","ruh"],need:53,ins:{star:3,gen:1}},
 {t:"g4",n:{k:"Orgeneral",d:"Oramiral",h:"Orgeneral"},cards:14,vis:["iti","kar","ope","ail"],need:999,ins:{star:4,gen:1}}
];
const NCO_RANKS=[
 {t:"er", n:{k:"Er",d:"Er",h:"Er"},cards:6,vis:["dis","fiz","ruh","tek"],need:43,ins:{}},
 {t:"ob", n:{k:"Onbaşı",d:"Onbaşı",h:"Onbaşı"},cards:6,vis:["dis","ast","fiz","tek"],need:44,ins:{chev:1}},
 {t:"cv", n:{k:"Çavuş",d:"Çavuş",h:"Çavuş"},cards:7,vis:["dis","ast","lid","sic"],need:45,ins:{chev:2}},
 {t:"uo", n:{k:"Uzman Onbaşı",d:"Uzman Onbaşı",h:"Uzman Onbaşı"},cards:7,vis:["tek","ope","fiz","sic"],need:46,ins:{chev:1,bar:1}},
 {t:"uc", n:{k:"Uzman Çavuş",d:"Uzman Çavuş",h:"Uzman Çavuş"},cards:8,vis:["ast","lid","ope","sic"],need:47,ins:{chev:2,bar:1}},
 {t:"ac", n:{k:"Astsubay Çavuş",d:"Astsubay Çavuş",h:"Astsubay Çavuş"},cards:8,vis:["dis","ast","tek","sic"],need:48,ins:{bar:1,star:1}},
 {t:"akc",n:{k:"Astsubay Kıdemli Çavuş",d:"Astsubay Kıdemli Çavuş",h:"Astsubay Kıdemli Çavuş"},cards:8,vis:["lid","ast","loj","sic"],need:49,ins:{bar:2,star:1}},
 {t:"au", n:{k:"Astsubay Üstçavuş",d:"Astsubay Üstçavuş",h:"Astsubay Üstçavuş"},cards:8,vis:["lid","ope","loj","ruh"],need:50,ins:{bar:3,star:1}},
 {t:"aku",n:{k:"Astsubay Kıdemli Üstçavuş",d:"Astsubay Kıdemli Üstçavuş",h:"Astsubay Kıdemli Üstçavuş"},cards:8,vis:["iti","lid","sic","ail"],need:51,ins:{bar:4,star:1}},
 {t:"ab", n:{k:"Astsubay Başçavuş",d:"Astsubay Başçavuş",h:"Astsubay Başçavuş"},cards:9,vis:["iti","ast","loj","sic"],need:52,ins:{star:2,laurel:1}},
 {t:"akb",n:{k:"Astsubay Kıdemli Başçavuş",d:"Astsubay Kıdemli Başçavuş",h:"Astsubay Kıdemli Başçavuş"},cards:10,vis:["iti","lid","ruh","ail"],need:999,ins:{star:3,laurel:1}}
];
let RANKS=OFFICER_RANKS;
const FORCE={k:"Kara Kuvvetleri",d:"Deniz Kuvvetleri",h:"Hava Kuvvetleri"};
const BOARD={k:"#333a1f",d:"#1a2340",h:"#25324a"};

/* ---- davranış etiketleri: temel vektörler ---- */
const ACT={
 kural:{dis:7,sic:3,ast:-4},            esnek:{dis:-6,ast:7,lid:2},
 sertlik:{dis:7,ast:-8,lid:-3},         yumusak:{dis:-4,ast:8,lid:4},
 dogruluk:{dis:5,iti:6,sic:-3,kar:-4},  ortbas:{dis:-8,iti:-7,sic:4,kar:3},
 seffaf:{iti:7,dis:6,kar:-5},           kapali:{iti:-6,dis:-4,kar:4},
 durust:{dis:8,iti:6,loj:-2,kar:-3},    yolsuz:{dis:-12,iti:-10,loj:5,ail:4},
 koruma:{ast:9,lid:5,dis:-3,sic:-3},    harcama:{ast:-11,lid:-7,sic:4,kar:3},
 sahiplen:{lid:9,ast:8,iti:5,sic:-5},   yikma:{lid:-9,ast:-10,sic:4,kar:3},
 moral:{ast:9,ruh:4,ope:-3},            feragat:{ast:8,lid:5,sic:-5,ruh:3},
 mentor:{lid:8,ast:7,tek:3,ail:-3},     menfaat:{sic:6,kar:5,ast:-7,iti:-4},
 risk:{ope:8,ruh:-4,fiz:-3},            ihtiyat:{ope:-5,ruh:4,tek:3},
 insiyatif:{lid:7,ope:6,dis:-4,kar:-3}, pasif:{lid:-6,ope:-4,dis:4,kar:2},
 tempo:{ope:6,tek:5,ast:-6,fiz:-4,ruh:-3},
 ozveri:{ope:5,sic:4,fiz:-5,ruh:-5,ail:-4}, dinlenme:{fiz:6,ruh:6,ope:-4,sic:-2},
 destek:{ruh:9,fiz:4,sic:-3},           sakla:{ruh:-7,fiz:-5,dis:-3},
 aile:{ail:11,ruh:5,ope:-5,kar:-4,sic:-3}, gorev:{ope:6,sic:5,kar:3,ail:-10,ruh:-4},
 ogrenme:{tek:9,sic:4,ail:-4,ruh:-3},   ihmal:{tek:-6,ope:-3},
 iliski:{kar:9,sic:4,dis:-3,iti:-2},    mesafe:{kar:-7,iti:5,dis:4},
 itaat:{kar:6,dis:-6,iti:-6,ruh:-4},    direnc:{dis:6,iti:7,kar:-8,ruh:3},
 gorunur:{iti:8,kar:5,ruh:-3},          geriplan:{iti:-5,kar:-3,ruh:4},
 temsil:{iti:7,kar:4,ail:-4},
 tasarruf:{loj:8,ope:-4,ast:-3},        israf:{loj:-7,ope:4,ast:3},
 duzen:{loj:7,tek:5,ruh:-3},            savsakla:{loj:-6,dis:-4}
};
/* ---- rütbe ağırlık matrisi ---- */
const RW={
 hb:{dis:1.3,sic:.9,ast:.8,fiz:1.4,ruh:1.2,tek:1.3,ope:.4,lid:.7,loj:.4,kar:.2,iti:.5,ail:.8},
 tg:{dis:1.2,sic:1.1,ast:1.4,fiz:1.1,ruh:1,tek:1,ope:.8,lid:1.1,loj:.6,kar:.3,iti:.6,ail:.9},
 ut:{dis:1.2,sic:1.1,ast:1.3,fiz:1,ruh:1,tek:1,ope:.9,lid:1.2,loj:.7,kar:.5,iti:.7,ail:.9},
 yz:{dis:1,sic:1.1,ast:1.3,fiz:.8,ruh:1,tek:.9,ope:1.2,lid:1.4,loj:.8,kar:.6,iti:.8,ail:1},
 bb:{dis:.9,sic:1.2,ast:.9,fiz:.6,ruh:1,tek:.9,ope:1.3,lid:1,loj:1.3,kar:.9,iti:.9,ail:1.1},
 yb:{dis:.9,sic:1.2,ast:.8,fiz:.5,ruh:1.1,tek:.9,ope:.9,lid:1.2,loj:.9,kar:1.4,iti:1,ail:1},
 al:{dis:.9,sic:1,ast:.9,fiz:.5,ruh:1,tek:.8,ope:1.1,lid:1.1,loj:.9,kar:1.3,iti:1.3,ail:1.1},
 g1:{dis:.9,sic:1.1,ast:.8,fiz:.4,ruh:1,tek:.8,ope:1,lid:1,loj:1.2,kar:1.3,iti:1.4,ail:1},
 g2:{dis:.9,sic:1.1,ast:.8,fiz:.4,ruh:1,tek:.8,ope:1.1,lid:1,loj:1,kar:1.3,iti:1.4,ail:1},
 g3:{dis:.9,sic:.9,ast:.8,fiz:.4,ruh:1.1,tek:.8,ope:1.1,lid:1,loj:.9,kar:1.3,iti:1.5,ail:1.1},
 g4:{dis:.9,sic:.8,ast:.8,fiz:.4,ruh:1.1,tek:.8,ope:1.1,lid:1,loj:.9,kar:1.2,iti:1.5,ail:1.1}
};
Object.assign(RW,{
 er:RW.hb,ob:RW.hb,cv:RW.tg,uo:RW.tg,uc:RW.ut,
 ac:RW.ut,akc:RW.yz,au:RW.bb,aku:RW.yb,ab:RW.al,akb:RW.g1
});
const rawCache=new Map(),resCache=new Map();
function parseRaw(s){
  if(rawCache.has(s))return rawCache.get(s);
  const o={tag:{},exp:{},add:[],del:[],t:0,end:null,mul:1};
  for(const p of (s||"").split(" ")){
    if(!p)continue;
    if(p[0]==="!"){o.end=p.slice(1);continue}
    if(p[0]==="x"&&!isNaN(+p.slice(1))){o.mul=+p.slice(1);continue}
    if(p[0]==="t"&&!isNaN(+p.slice(1))){o.t=+p.slice(1);continue}
    const m=/^([a-z]{3})([+-]\d+)$/.exec(p);
    if(m&&STATS[m[1]]){o.exp[m[1]]=(o.exp[m[1]]||0)+ +m[2];continue}
    if(p[0]==="+"){o.add.push(p.slice(1));continue}
    if(p[0]==="-"){o.del.push(p.slice(1));continue}
    const v=ACT[p];
    if(v){for(const k in v)o.tag[k]=(o.tag[k]||0)+v[k]}
    else if(typeof console!=="undefined")console.warn("bilinmeyen etiket:",p);
  }
  rawCache.set(s,o);return o;
}
function resolve(s,r){
  const key=RANKS[r].t+"|"+s;
  if(resCache.has(key))return resCache.get(key);
  const raw=parseRaw(s),W=RW[RANKS[r].t],st={};
  for(const k in raw.tag){
    const v=raw.tag[k]*(W[k]||1)*raw.mul;
    if(Math.abs(v)>=.5)st[k]=Math.round(v);
  }
  for(const k in raw.exp)st[k]=(st[k]||0)+raw.exp[k];
  const o={st,add:raw.add,del:raw.del,t:raw.t,end:raw.end};
  resCache.set(key,o);return o;
}

