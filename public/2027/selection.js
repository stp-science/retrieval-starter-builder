export function selectQuestions(pool, history, mode, count, random = Math.random) {
 let items=pool.filter(q=>mode==='unused'?!(history[q.id]?.count>0):mode==='used'?history[q.id]?.count>0:mode==='revisit'?history[q.id]?.revisit:true);
 const shuffle=xs=>xs.map(q=>({q,tie:random()})).sort((a,b)=>a.tie-b.tie).map(x=>x.q);
 const spread=xs=>{const first=[],later=[],seen=new Set();for(const q of xs){if(seen.has(q.focusId))later.push(q);else{first.push(q);seen.add(q.focusId);}}return [...first,...later];};
 if(mode==='fresh'){
  const fresh=spread(shuffle(items.filter(q=>!(history[q.id]?.count>0))));
  const used=shuffle(items.filter(q=>history[q.id]?.count>0)).sort((a,b)=>(history[a.id].lastUsed||0)-(history[b.id].lastUsed||0));
  return [...fresh,...used].slice(0,count);
 }
 return spread(shuffle(items)).slice(0,count);
}
export function classKey(name){return encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g,' '));}
