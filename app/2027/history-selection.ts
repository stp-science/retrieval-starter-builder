export type HistoryEntry={count:number;lastUsed:number;revisit:boolean};
export type QuestionHistory=Record<string,HistoryEntry>;
export const classKey=(name:string)=>encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g,' '));
export function selectNewQuestions<T extends {id?:string}>(items:T[],history:QuestionHistory,count:number,random= Math.random):T[]{
 const seen=new Set<string>();
 return items.filter(q=>{if(!q.id||history[q.id]?.count>0||seen.has(q.id))return false;seen.add(q.id);return true;}).map(q=>({q,tie:random()})).sort((a,b)=>a.tie-b.tie).slice(0,count).map(x=>x.q);
}
export function composeStarter<T extends {id?:string}>(fresh:T[],repeats:T[],count:number):T[]{
 return [...repeats,...fresh.filter(q=>!repeats.some(r=>r.id===q.id))].slice(0,count);
}
// Every question in a starter is saved in one transaction with the same timestamp.
export function lastStarterQuestions<T extends {id?:string}>(items:T[],history:QuestionHistory):T[]{
 const latest=Math.max(0,...Object.values(history).filter(h=>h.count>0).map(h=>h.lastUsed));
 if(!latest)return [];
 const seen=new Set<string>();
 return items.filter(q=>{if(!q.id||seen.has(q.id)||history[q.id]?.lastUsed!==latest||!history[q.id]?.count)return false;seen.add(q.id);return true;});
}
