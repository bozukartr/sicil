const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(withWorld=false){
  const nodes=new Map(),listeners={},saved=new Map(),timers=[],frames=[];let clock=0;
  let document;
  function element(){
    const classes=new Set();
    const node={style:{},dataset:{},children:[],attributes:{},textContent:'',innerHTML:'',clientHeight:400,scrollHeight:20,
      classList:{add:(...a)=>a.forEach(x=>classes.add(x)),remove:(...a)=>a.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle(x,on){on=on===undefined?!classes.has(x):on;on?classes.add(x):classes.delete(x);return on}},
      appendChild(el){this.children.push(el);return el},append(...els){this.children.push(...els)},
      setAttribute(k,v){this.attributes[k]=String(v)},getAttribute(k){return this.attributes[k]},
      events:{},addEventListener(name,fn){this.events[name]=fn},getBoundingClientRect(){return {width:390,height:340,left:0,top:0}},captured:null,setPointerCapture(id){this.captured=id},hasPointerCapture(id){return this.captured===id},releasePointerCapture(id){if(this.captured===id)this.captured=null},querySelector(){return element()},querySelectorAll(){return []},
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
  const window={innerWidth:390,matchMedia:()=>({matches:false}),addEventListener:(name,fn)=>{const previous=listeners[name];listeners[name]=event=>{if(previous)previous(event);fn(event)}},
    localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)}};
  const context=vm.createContext({document,window,navigator:{},console,setTimeout:fn=>timers.push(fn),clearTimeout(){},performance:{now:()=>clock},requestAnimationFrame:fn=>{frames.push(fn);return frames.length},cancelAnimationFrame(){}});
  const run=code=>vm.runInContext(code,context);
  for(const file of ['ranks.js','storage.js','game.js','progression.js','specialties.js','transitions.js','events-officer.js','events-field.js','events-phase5.js'])run(fs.readFileSync(path.join(root,file),'utf8'));
  if(withWorld)for(const file of ['world-core.js','world-art.js','touch-control.js','duty-core.js','relationships.js','world.js'])run(fs.readFileSync(path.join(root,file),'utf8'));
  function tick(ms=16){clock+=ms;for(const fn of frames.splice(0))fn(clock)}
  return {run,nodes,listeners,timers,tick};
}

module.exports={boot};
