/* Local fictional NPC relationships. Rewards are bounded to one greeting/help per day. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./world-core.js'));else root.SicilRelations=factory(root.SicilWorldCore)})(typeof window!=='undefined'?window:this,function(C){
  'use strict';
  function restore(raw){
    return Object.fromEntries(C.stations.map(n=>{const r=raw?.[n.id]||{};return [n.id,{trust:Number.isFinite(r.trust)?C.clamp(Math.round(r.trust),0,100):40,
      greetedDay:Number.isSafeInteger(r.greetedDay)?r.greetedDay:0,helpDay:Number.isSafeInteger(r.helpDay)?r.helpDay:0,reportDay:Number.isSafeInteger(r.reportDay)?r.reportDay:0}]}));
  }
  function tier(trust){return trust>=80?'Yakın bağ':trust>=60?'Güveniyor':trust>=30?'Tanışıyor':'Mesafeli'}
  function greet(contacts,id,day){const c=contacts[id];if(!c||c.greetedDay===day)return false;c.greetedDay=day;c.trust=Math.min(100,c.trust+2);return true}
  function report(contacts,duty,score){
    const changes=[];
    for(const id of ['command',duty.missionKey]){
      const c=contacts[id];if(!c||c.reportDay===duty.day)continue;c.reportDay=duty.day;
      const delta=score>=90?(id==='command'?4:3):score>=78?2:-2,before=c.trust;
      c.trust=C.clamp(c.trust+delta,0,100);changes.push({id,delta:c.trust-before,trust:c.trust});
    }
    return changes;
  }
  function help(contacts,id,duty){
    const c=contacts[id];if(!c||c.trust<60||c.helpDay===duty.day||duty.energy>=100)return false;
    c.helpDay=duty.day;duty.energy=Math.min(100,duty.energy+10);return true;
  }
  function line(id,duty,trust){
    const friendly=trust>=60;
    const lines={
      command:friendly?'Sana güveniyorum. Görevi düzenli tamamlaman birliğe örnek oluyor.':'Önce hazırlığını tamamla. Sahada yaptığın iş, raporundan daha çok şey söyler.',
      training:friendly?'Parkurdaki gelişimini gördüm. Tempoyu koru, enerjini son noktaya kadar sakla.':'Engellere yaklaşırken yönünü önceden belirle. Hız kadar düzen de önemli.',
      supply:friendly?'Teçhizata özen gösterdiğini biliyorum. Burada her malzemenin bir sorumlusu var.':'Telsizini ve çantanı teslim almadan sahaya çıkma. Teslimatlar soldaki işaretli alana.',
      medic:friendly?'Kendini zorladığını fark ettim. Kısa bir mola verelim; sonra daha iyi toparlanırsın.':'Enerjin azaldığında kumanyanı kullan. Dinlenmek de görev hazırlığının bir parçası.',
      patrol:friendly?'Seninle nöbet tutmak rahat. Kontrol noktalarını atlamayacağını biliyorum.':'Devriyede sırayı takip et. Her noktayı yerinde kontrol edip raporla.',
      roommate:friendly?'Bugün iyi çalıştın. Akşam burada biraz soluklanırız.':'Ben Mert. Dolap sağ tarafta, yatağın sol tarafta. İçtima meydanında görüşürüz.'
    };
    return (duty.phase===6&&id==='command'?'Bugünün notu: '+duty.lastGrade+'. ':'')+lines[id];
  }
  return {restore,tier,greet,report,help,line};
});
