// State/DOM-contract regression checks; these do not replace browser layout QA.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./game-harness.cjs');
test('all forces and career tracks render correct next rank and progress',()=>{
  for(const force of ['k','d','h'])for(const career of ['officer','nco']){
    const {run,nodes}=boot();run(`newGame('${force}','${career}');S.cards=3;paintHUD()`);
    assert.equal(nodes.get('nextRank').textContent,career==='nco'?'Onbaşı':'Teğmen');
    assert.equal(nodes.get('promotionTrack').attributes['aria-valuenow'],career==='nco'?'50':'27');
    assert.equal(nodes.get('app').dataset.force,force);
    assert.equal(nodes.get('cardNumber').textContent,'DOSYA / 001');
  }
});
test('final rank and administrative ceiling show completion, not another promotion',()=>{
  const {run,nodes}=boot();run("newGame('d');S.r=RANKS.length-1;S.cards=99;paintHUD()");
  assert.equal(nodes.get('nextRank').textContent,'Görev tamamlama');
  assert.equal(nodes.get('promotionTrack').attributes['aria-valuenow'],'100');
  run("S.r=4;S.track='admin';S.transitionCeiling=4;paintHUD()");
  assert.equal(nodes.get('nextRank').textContent,'Görev tamamlama');
});
test('dossier blocks decisions, traps keyboard focus and closes on Escape',()=>{
  const {run,nodes,listeners}=boot();run("newGame('k');openFile()");
  assert.equal((nodes.get('careerPath').innerHTML.match(/<li /g)||[]).length,11);
  listeners.keydown({key:'ArrowRight'});run('decide(true)');assert.equal(run('S.cards'),0);
  let prevented=false;listeners.keydown({key:'Tab',preventDefault(){prevented=true}});assert.ok(prevented);
  listeners.keydown({key:'Escape'});assert.ok(nodes.get('file').classList.contains('hide'));
  run('decide(true)');assert.equal(run('S.cards'),1);
});
test('cancelled swipe never commits a decision',()=>{
  const {run,listeners}=boot();run("newGame('h');dragging=true;dx=250");listeners.pointercancel();
  assert.equal(run('S.cards'),0);assert.equal(run('dragging'),false);
});
test('promotion resets progress and locks decisions until continuation',()=>{
  const {run,nodes}=boot();run("newGame('k');completePromotion()");
  assert.equal(nodes.get('rankName').textContent,'Teğmen');assert.equal(nodes.get('nextRank').textContent,'Üsteğmen');
  assert.equal(nodes.get('promotionTrack').attributes['aria-valuenow'],'0');assert.equal(run('locked'),true);
  assert.equal(nodes.get('promo').classList.contains('hide'),false);
  run('decide(true)');assert.equal(run('S.cards'),0);
  nodes.get('promoBtn').onclick();assert.equal(run('locked'),false);
});
test('waiting period uses neutral ceremony and saved career restores progress',()=>{
  const {run,nodes}=boot();run("newGame('k');S.cards=7;S.grace=1;showPromo('Bekleme','Harbiyeli','Tekrar değerlendirme')");
  assert.ok(nodes.get('promo').classList.contains('waiting'));
  assert.match(nodes.get('progressNote').textContent,/Ek değerlendirme/);
  assert.equal(run('resumeSavedGame()'),true);assert.equal(run('S.cards'),7);assert.equal(run('locked'),true);
  nodes.get('promoBtn').onclick();run('persistGame("card","test");S=null;resumeSavedGame()');
  assert.equal(run('S.cards'),7);assert.equal(run('locked'),false);
});
