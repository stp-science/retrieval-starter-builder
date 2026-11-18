"use client";
import {useEffect,useRef,useState} from 'react';
type Tracked={id?:string;focusId?:string;topicId?:string};
type Entry={count:number;lastUsed:number;revisit:boolean};
type History=Record<string,Entry>;
type User={displayName?:string;uid:string}|null;
type Backend={login:()=>Promise<unknown>;logout:()=>Promise<unknown>;watch:()=>void;save:(ids:string[],flag:boolean|null)=>Promise<void>};
const normalise=(s:string)=>encodeURIComponent(s.trim().toLowerCase().replace(/\s+/g,' '));
export function useTeacherHistory(){
 const [className,setClassName]=useState('My class'),[mode,setMode]=useState('fresh'),[history,setHistory]=useState<History>({}),[user,setUser]=useState<User>(null),[ready,setReady]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('Loading teacher history…');
 const backend=useRef<Backend|null>(null),preview=useRef(true),classRef=useRef(className),currentUser=useRef<User>(null);classRef.current=className;
 const localKey=()=>`stp-2027-preview-${normalise(classRef.current)}`;
 function localLoad(){try{setHistory(JSON.parse(localStorage.getItem(localKey())||'{}'));setReady(true);}catch{setHistory({});setReady(true);}}
 useEffect(()=>{let active=true;
  const modulePath=new URL('./firebase-store.js',window.location.href).href;
  const configPath=new URL('./config.js',window.location.href).href;
  (async()=>{try{
   const config=await import(/* webpackIgnore: true */ configPath);
   if(!active)return;
   if(!config.firebaseConfig){preview.current=true;localLoad();setMessage('Device-only preview. Google sign-in and cross-device history will be available once Firebase is connected.');return;}
   preview.current=false;
   const mod=await import(/* webpackIgnore: true */ modulePath);
   const service=await mod.connect((u:User)=>{if(!active)return;currentUser.current=u;setUser(u);setReady(false);setHistory({});setMessage(u?'Loading your class history…':'Sign in with your school Google account.');},(h:History,synced:boolean)=>{if(!active)return;setHistory(h);setReady(!!synced);if(synced)setMessage('School account connected. Your class history is synced.');},(s:string)=>{if(active){setReady(false);setMessage(s);}},()=>normalise(classRef.current));
   if(active)backend.current=service;
  }catch{if(active){setMessage('History could not be connected. Refresh the page to try again.');setReady(false);}}})();
  return()=>{active=false;};
 },[]);
 useEffect(()=>{if(preview.current)localLoad();else{setReady(false);setHistory({});backend.current?.watch();}},[className]);
 function matches(q:Tracked){const h=history[q.id||''];return mode==='unused'?!(h?.count>0):mode==='used'?h?.count>0:mode==='revisit'?h?.revisit:true;}
 function select<T extends Tracked>(items:T[],n:number):T[]{const shuffled=items.filter(matches).map(q=>({q,tie:Math.random()})).sort((a,b)=>{
  if(mode==='fresh'){const ah=history[a.q.id||''],bh=history[b.q.id||''];const au=(ah?.count||0)>0,bu=(bh?.count||0)>0;if(au!==bu)return au?1:-1;if(au&&bu){const diff=(ah.lastUsed||0)-(bh.lastUsed||0);if(diff)return diff;}}
  return a.tie-b.tie;
 });return shuffled.slice(0,n).map(x=>x.q);}
 async function persist(items:Tracked[],flag:boolean|null=null){if(!ready||saving||!className.trim())return;const ids=[...new Set(items.flatMap(q=>q.id?[q.id]:[]))];if(!ids.length)return;
  setSaving(true);try{if(preview.current){const next={...history};for(const id of ids){const h=next[id]||{count:0,lastUsed:0,revisit:false};next[id]={count:h.count+(flag===null?1:0),lastUsed:flag===null?Date.now():h.lastUsed,revisit:flag===null?h.revisit:flag};}localStorage.setItem(localKey(),JSON.stringify(next));setHistory(next);}else{if(!backend.current||!currentUser.current)throw Error('Sign in first.');await backend.current.save(ids,flag);}
   setMessage(flag===null?`Starter marked as used for ${className}. ${preview.current?'Saved on this device only.':'Cloud history updated.'}`:'Revisit list updated.');
  }catch(e){setMessage('Could not save: '+(e instanceof Error?e.message:'Please try again.'));}finally{setSaving(false);}
 }
 async function login(){if(!backend.current){setMessage('Google sign-in needs the school Firebase project configuration. The builder is available in device-only preview.');return;}try{if(user)await backend.current.logout();else await backend.current.login();}catch(e){setMessage('Sign-in failed: '+(e instanceof Error?e.message:'Please try again.'));}}
 return {notify:setMessage,className,setClassName,mode,setMode,history,user,ready:ready&&!!className.trim(),saving,message,select,matches,login,save:(items:Tracked[])=>persist(items),flag:(q:Tracked)=>persist([q],!history[q.id||'']?.revisit)};
}
