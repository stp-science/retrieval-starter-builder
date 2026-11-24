"use client";
import {useEffect,useRef,useState} from 'react';
import {classKey as normalise,selectNewQuestions} from './history-selection';
type Tracked={id?:string;focusId?:string;topicId?:string};
type Entry={count:number;lastUsed:number;revisit:boolean};
type History=Record<string,Entry>;
type ClassGroup={name:string;year:number};
type User={displayName?:string;uid:string}|null;
type Backend={login:()=>Promise<unknown>;logout:()=>Promise<unknown>;watch:()=>void;save:(ids:string[],flag:boolean|null)=>Promise<void>;addClass:(name:string,year:number)=>Promise<void>;deleteClass:(name:string)=>Promise<void>;dispose:()=>void};
export function useTeacherHistory(){
 const [className,setClassName]=useState(''),[classes,setClasses]=useState<ClassGroup[]>([]),[history,setHistory]=useState<History>({}),[user,setUser]=useState<User>(null),[ready,setReady]=useState(false),[classesReady,setClassesReady]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('Loading teacher history…');
 const backend=useRef<Backend|null>(null),preview=useRef(true),classRef=useRef(className),currentUser=useRef<User>(null),locked=useRef(false);classRef.current=className;
 const localKey=()=>`stp-2027-preview-${normalise(classRef.current)}`;
 function localLoad(){try{setHistory(JSON.parse(localStorage.getItem(localKey())||'{}'));}catch{setHistory({});}setReady(true);}
 useEffect(()=>{let active=true;
  const modulePath=new URL('./firebase-store.js',window.location.href).href;
  const configPath=new URL('./config.js',window.location.href).href;
  (async()=>{try{
   const config=await import(/* webpackIgnore: true */ configPath);
   if(!active)return;
   if(!config.firebaseConfig){preview.current=true;let saved:ClassGroup[]=[];try{saved=JSON.parse(localStorage.getItem('stp-2027-classes')||'[]');}catch{}setClasses(saved);setClassesReady(true);localLoad();setMessage('Device-only preview. Set up your classes to try the builder. School Google sign-in is awaiting Firebase configuration.');return;}
   preview.current=false;setReady(false);setClassesReady(false);
   const mod=await import(/* webpackIgnore: true */ modulePath);
   const service=await mod.connect((u:User)=>{if(!active)return;currentUser.current=u;setUser(u);setClassName('');setClasses([]);setClassesReady(false);setReady(false);setHistory({});setMessage(u?'Loading your classes…':'Sign in with your school Google account.');},(h:History,synced:boolean)=>{if(!active)return;setHistory(h);setReady(!!synced);},(s:string)=>{if(active){setReady(false);setMessage(s);}},()=>normalise(classRef.current),(list:ClassGroup[])=>{if(active){setClasses(list);setClassesReady(true);setMessage(list.length?'Select your class before generating a starter.':'Welcome. Set up your classes to get started.');}});
   if(active)backend.current=service;else service.dispose();
  }catch{if(active){setMessage('History could not be connected. Refresh the page to try again.');setReady(false);}}})();
  return()=>{active=false;backend.current?.dispose();};
 },[]);
 useEffect(()=>{setHistory({});setReady(false);if(!className)return;if(preview.current)localLoad();else backend.current?.watch();},[className]);
 function chooseClass(name:string){setMessage(name?`Selected ${name}. New questions use this class's history.`:'Select your class before generating a starter.');setReady(false);setHistory({});setClassName(name);classRef.current=name;}
 function matches(q:Tracked){return !!q.id&&!(history[q.id]?.count>0);}
 function select<T extends Tracked>(items:T[],n:number):T[]{return selectNewQuestions(items,history,n);}
 async function persist(items:Tracked[]){if(!ready||locked.current||!classRef.current)return false;const ids=[...new Set(items.flatMap(q=>q.id?[q.id]:[]))];if(!ids.length)return true;
  locked.current=true;setSaving(true);const key=localKey(),name=classRef.current;
  try{if(preview.current){const next:History=JSON.parse(localStorage.getItem(key)||'{}');for(const id of ids){const h=next[id]||{count:0,lastUsed:0,revisit:false};next[id]={count:h.count+1,lastUsed:Date.now(),revisit:false};}localStorage.setItem(key,JSON.stringify(next));if(classRef.current===name)setHistory(next);}else{if(!backend.current||!currentUser.current)throw Error('Sign in first.');await backend.current.save(ids,null);if(classRef.current===name)setHistory(current=>{const next={...current};for(const id of ids){const h=next[id]||{count:0,lastUsed:0,revisit:false};next[id]={...h,count:Math.max(1,h.count),lastUsed:Date.now()};}return next;});}
   setMessage(`Starter history saved for ${name}.${preview.current?' On this device only.':''}`);return true;
  }catch(e){setMessage('Could not save: '+(e instanceof Error?e.message:'Please try again.'));return false;}finally{locked.current=false;setSaving(false);}
 }
 async function addClass(name:string,year:number){name=name.trim().replace(/\s+/g,' ');if(!name||name.length>60||normalise(name).length>180||![7,8,9,10].includes(year)||locked.current)return false;if(classes.some(c=>normalise(c.name)===normalise(name))){setMessage('That class already exists. Choose a different name.');return false;}
  locked.current=true;setSaving(true);try{if(preview.current){const next=[...classes,{name,year}];localStorage.setItem('stp-2027-classes',JSON.stringify(next));setClasses(next);}else{if(!backend.current||!currentUser.current)throw Error('Sign in first.');await backend.current.addClass(name,year);}return true;}catch(e){setMessage('Could not add class: '+(e instanceof Error?e.message:'Please try again.'));return false;}finally{locked.current=false;setSaving(false);}
 }
 async function deleteClass(name:string){if(locked.current)return false;locked.current=true;setSaving(true);try{if(preview.current){const next=classes.filter(c=>normalise(c.name)!==normalise(name));localStorage.setItem('stp-2027-classes',JSON.stringify(next));localStorage.removeItem(`stp-2027-preview-${normalise(name)}`);setClasses(next);}else{if(!backend.current||!currentUser.current)throw Error('Sign in first.');await backend.current.deleteClass(name);}if(normalise(classRef.current)===normalise(name))chooseClass('');setMessage(`Deleted ${name} and its question history.`);return true;}catch(e){setMessage('Could not delete class: '+(e instanceof Error?e.message:'Please try again.'));return false;}finally{locked.current=false;setSaving(false);}}
 async function login(){if(!backend.current){setMessage('Google sign-in needs the school Firebase project configuration. You can set up classes in device-only preview.');return;}try{if(user)await backend.current.logout();else await backend.current.login();}catch(e){setMessage('Sign-in failed: '+(e instanceof Error?e.message:'Please try again.'));}}
 return {notify:setMessage,className,setClassName:chooseClass,classes,classesReady,addClass,deleteClass,history,user,ready:ready&&!!className&&classes.some(c=>c.name===className),saving,message,select,matches,login,save:persist};
}
