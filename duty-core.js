/* One playable duty day: equipment -> muster -> assignment -> fieldwork -> report -> rest. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./world-core.js'));else root.SicilDuty=factory(root.SicilWorldCore)})(typeof window!=='undefined'?window:this,function(C){
  'use strict';
  const roster=['training','supply','patrol'];
  const steps=[
    {x:430,y:160,area:'barracks',title:'Güne hazırlan',label:'Koğuş dolabından üniformanı kuşan',action:'Üniformayı kuşan',time:'06.00'},
    {x:480,y:430,title:'Sabah içtiması',label:'İçtima meydanında birliğe katıl',action:'İçtimaya katıl',time:'06.30'},
    {x:488,y:268,title:'Görev emri',label:'Komutandan bugünün görevini al',action:'Görevi al',time:'07.00'},
    {x:370,y:305,area:'supply',title:'Teçhizat teslimi',label:'İkmalden telsiz ve saha çantanı al',action:'Teçhizatı al',time:'08.00'},
    null,
    {x:488,y:268,title:'Gün sonu değerlendirmesi',label:'Sahada yaptıklarını komutana raporla',action:'Rapor ver',time:'17.00'},
    {x:195,y:345,area:'barracks',title:'İstirahat',label:'Koğuşa dön; dinlenerek yeni güne başla',action:'Dinlen ve yeni gün',time:'21.00'}
  ];
  function restore(raw,legacy){
    const r=raw&&typeof raw==='object'?raw:{},old=!raw&&roster.includes(legacy?.mission?.id)?legacy.mission:null;
    const day=Number.isSafeInteger(r.day)&&r.day>0?r.day:1;
    let phase=Number.isInteger(r.phase)&&r.phase>=0&&r.phase<=6?r.phase:0;
    const missionKey=roster.includes(r.missionKey)?r.missionKey:old?old.id:roster[(day-1)%3];
    if(old)phase=4;
    const count=C.missions[missionKey].steps.length;
    const step=old?old.step:Number.isInteger(r.fieldStep)?r.fieldStep:0;
    const energy=Number.isFinite(r.energy)?C.clamp(r.energy,0,100):100;
    return {day,phase,missionKey,fieldStep:C.clamp(step,0,count-1),energy,
      uniform:phase>0,radio:phase>=4,pack:phase>=4,rations:r.rations===0?0:1,
      distance:Number.isFinite(r.distance)?Math.max(0,r.distance):0,
      completedDays:Number.isSafeInteger(r.completedDays)?Math.max(0,r.completedDays):0,
      lastGrade:typeof r.lastGrade==='string'?r.lastGrade.slice(0,32):'',
      lastScore:Number.isFinite(r.lastScore)?C.clamp(r.lastScore,0,100):0};
  }
  function target(d){
    if(d.phase!==4)return steps[d.phase];
    const m=C.missions[d.missionKey],p=m.steps[d.fieldStep];
    return {...p,title:m.title,action:d.missionKey==='supply'?(d.fieldStep?'Teslim et':'Sandığı al'):'Noktayı tamamla',time:'10.00',label:p.label};
  }
  function act(d,pos){
    if(C.areaOf(pos)!==C.areaOf(target(d))||C.distance(pos,target(d))>46)return null;
    if(d.phase===0){d.uniform=true;d.phase=1;return {kind:'step',text:'Üniforman hazır. Sabah içtimasına katıl.'}}
    if(d.phase===1){d.phase=2;return {kind:'step',text:'İçtima tamamlandı. Komutan seni bekliyor.'}}
    if(d.phase===2){d.phase=3;return {kind:'step',text:C.missions[d.missionKey].title+' görevi verildi. Önce teçhizatını al.'}}
    if(d.phase===3){d.radio=true;d.pack=true;d.phase=4;return {kind:'step',text:'Telsiz ve saha çantası envanterine eklendi.'}}
    if(d.phase===4){
      if(!d.uniform||!d.radio||!d.pack)return null;
      d.energy=Math.max(0,d.energy-4);d.fieldStep++;
      if(d.fieldStep===C.missions[d.missionKey].steps.length){d.phase=5;d.fieldStep=0;return {kind:'step',text:'Saha görevi tamamlandı. Komutana rapor ver.'}}
      return {kind:'step',text:'Kontrol noktası tamamlandı. Sıradaki işarete ilerle.'};
    }
    if(d.phase===5){
      const score=Math.round(65+d.energy*.35),grade=score>=90?'Üstün başarı':score>=78?'Başarılı':'Tamamlandı';
      d.phase=6;d.completedDays++;d.lastScore=score;d.lastGrade=grade;
      return {kind:'report',score,grade,text:grade+' · '+score+'/100',stats:{...C.missions[d.missionKey].reward,sic:score>=90?3:score>=78?2:1}};
    }
    d.day++;d.phase=0;d.missionKey=roster[(d.day-1)%3];d.fieldStep=0;d.energy=100;d.uniform=false;d.radio=false;d.pack=false;d.rations=1;d.distance=0;
    return {kind:'rest',text:'Dinlendin. Yeni görev gününe hazırsın.'};
  }
  function walk(d,distance){d.distance+=distance;d.energy=Math.max(0,d.energy-distance*.012)}
  function eat(d){if(!d.rations||d.energy>=100)return false;d.rations=0;d.energy=Math.min(100,d.energy+25);return true}
  return {restore,target,act,walk,eat,steps};
});
