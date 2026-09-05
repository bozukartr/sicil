// State/DOM-contract regression checks; these do not replace browser layout QA.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(){
  const nodes=new Map(),listeners={},saved=new Map(),timers=[];
  let document;
  function element(){
    const classes=new Set();
    const node={style:{},dataset:{},children:[],attributes:{},textContent:'',innerHTML:'',clientHeight:400,scrollHeight:20,
      classList:{add:(...a)=>a.forEach(x=>classes.add(x)),remove:(...a)=>a.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle(x,on){on=on===undefined?!classes.has(x):on;on?classes.add(x):classes.delete(x);return on}},
      appendChild(el){this.children.push(el);return el},append(...els){this.children.push(...els)},
      setAttribute(k,v){this.attributes[k]=String(v)},getAttribute(k){return this.attributes[k]},
      addEventListener(){},querySelector(){return element()},querySelectorAll(){return []},
      getClientRects(){return [{}]},focus(){document.activeElement=this}};
    Object.defineProperty(node,'firstElementChild',{get(){return this.children[0]||(this.children[0]=element())}});
    return node;
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)){
    const el=element();if(/class="[^"]*\bhide\b/.test(match[0]))el.classList.add('hide');nodes.set(match[1],el);
  }
  document={getElementById(id){assert.ok(nodes.has(id),'Missing DOM id: '+id);return nodes.get(id)},createElement:element,addEventListener(){},querySelectorAll(){return ['fileStatsTab','fileJournalTab','fileClose'].map(x=>nodes.get(x))}};
  nodes.get('text').parentElement=element();
  const window={innerWidth:390,matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>listeners[name]=fn,
    localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)}};
  const context=vm.createContext({document,window,navigator:{},console,setTimeout:fn=>timers.push(fn),clearTimeout(){},requestAnimationFrame:fn=>{fn();return 1},cancelAnimationFrame(){}});
  const run=code=>vm.runInContext(code,context);
  for(const file of ['ranks.js','storage.js','game.js','progression.js','specialties.js','transitions.js','events-officer.js','events-field.js','events-phase5.js'])run(fs.readFileSync(path.join(root,file),'utf8'));
  return {run,nodes,listeners,timers};
}
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
