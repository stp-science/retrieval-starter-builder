import curriculum from './curriculum.json';
import expansion from './question-expansion.json';
export type StaffQuestion={id:string;focusId:string;q:string;a:string;statement?:string;difficulty:'foundation'|'core'|'stretch';kind:'short'|'explain';oneWord?:boolean;clozeText?:string;clozeAnswer?:string};
const isExplanation=(q:string)=>/^(why|explain|compare|describe how|how (does|do|can|is|are))\b/i.test(q);
const unique=(items:StaffQuestion[])=>{const seen=new Set<string>();return items.filter(q=>{const key=q.q.trim().toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});};
export const staffQuestionBank=curriculum.topics.map(t=>{
 const original:StaffQuestion[]=t.focuses.flatMap(f=>f.questions.filter(q=>q.type!=='cloze').map(q=>({id:q.id,focusId:f.id,statement:q.statement,q:q.prompt,a:q.answer,difficulty:isExplanation(q.prompt)?'stretch' as const:'core' as const,kind:isExplanation(q.prompt)?'explain' as const:'short' as const})));
 const additional=t.focuses.flatMap(f=>(expansion as Record<string,StaffQuestion[]>)[f.id]||[]);
 const questions=unique([...original,...additional]);
 const clozeQuestions:StaffQuestion[]=t.focuses.flatMap(f=>f.questions.filter(q=>q.type==='cloze').map(q=>({id:q.id,focusId:f.id,statement:q.statement,q:q.prompt,a:q.statement||q.sourceStatement,difficulty:'foundation' as const,kind:'short' as const,clozeText:q.prompt.replace(/^Complete:\s*/,''),clozeAnswer:q.answer})));
 return {...t,questions,oneWordQuestions:questions.filter(q=>q.oneWord),clozeQuestions};
});
export function activityQuestions<T>(topic:{questions:T[];oneWordQuestions?:T[];clozeQuestions?:T[]},activity:string){return activity==='one-worders'?(topic.oneWordQuestions||[]):activity==='cloze-recall'?(topic.clozeQuestions||[]):topic.questions;}
