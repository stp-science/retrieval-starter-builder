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
