import test from 'node:test';
import assert from 'node:assert/strict';
import {classKey,selectNewQuestions,composeStarter} from '../app/2027/history-selection.ts';
const questions=[{id:'a'},{id:'b'},{id:'c'}];
const used={count:1,lastUsed:100,revisit:false};
test('each named class has an independent question history',()=>{
 const histories={[classKey('9PL')]:{a:used},[classKey('9SG')]:{}};
 assert.deepEqual(selectNewQuestions(questions,histories[classKey(' 9pl ')],3,()=>0).map(q=>q.id),['b','c']);
 assert.deepEqual(selectNewQuestions(questions,histories[classKey('9SG')],3,()=>0).map(q=>q.id),['a','b','c']);
 assert.notEqual(classKey('9PL'),classKey('9SG'));
});
test('exhausted content never automatically falls back to old questions',()=>{
 assert.deepEqual(selectNewQuestions(questions,{a:used,b:used,c:used},8),[]);
 assert.equal(selectNewQuestions([...questions,questions[0],{}],{},8).length,3);
});
test('only explicitly selected repeats enter the starter, preserving fixed grid counts',()=>{
 assert.deepEqual(composeStarter(questions,[],3),questions);
 assert.deepEqual(composeStarter(questions,[{id:'old'}],3).map(q=>q.id),['old','a','b']);
 assert.equal(composeStarter(questions,Array.from({length:16},(_,i)=>({id:`old${i}`})),16).length,16);
 assert.deepEqual(composeStarter(questions,[questions[0]],3),questions);
 assert.deepEqual(composeStarter(questions,[],3),questions); // Unticking restores the new questions.
});

test('repeat choices contain only the last saved starter for the current class',async()=>{
 const {lastStarterQuestions}=await import('../app/2027/history-selection.ts');
 const bank=[{id:'old'},{id:'last-a'},{id:'last-b'},{id:'unused'}];
 const history={old:{...used,lastUsed:100},'last-a':{...used,lastUsed:200},'last-b':{...used,lastUsed:200}};
 assert.deepEqual(lastStarterQuestions(bank,history).map(q=>q.id),['last-a','last-b']);
 assert.deepEqual(lastStarterQuestions(bank,{}),[]);
 assert.deepEqual(lastStarterQuestions(bank,{old:{...used,lastUsed:300}}).map(q=>q.id),['old']);
 const fresh=selectNewQuestions(bank,history,1,()=>0);
 assert.deepEqual(composeStarter(fresh,[bank[1]],2).map(q=>q.id),['last-a','unused']);
 assert.deepEqual(selectNewQuestions(bank,history,2,()=>0).map(q=>q.id),['unused']);
 assert.deepEqual(lastStarterQuestions([...bank,bank[1]],history).map(q=>q.id),['last-a','last-b']);
});

test('automatic mixing includes recall, core and explanation questions when available',async()=>{
 const {mixQuestions}=await import('../app/2027/history-selection.ts');
 const items=[{id:'a',difficulty:'foundation'},{id:'b',difficulty:'foundation'},{id:'c',difficulty:'core'},{id:'d',difficulty:'stretch'}];
 assert.deepEqual(mixQuestions(items,3).map(q=>q.difficulty),['foundation','core','stretch']);
 assert.equal(mixQuestions(items,0).length,0);
 assert.equal(mixQuestions(items.filter(q=>q.difficulty==='foundation'),5).length,2);
});
