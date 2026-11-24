import {firebaseConfig,schoolDomain} from './config.js';
export async function connect(onUser,onHistory,onError,getClass,onClasses=()=>{}){
 if(!firebaseConfig)return null;
 const v='https://www.gstatic.com/firebasejs/13.3.0/';
 const [app,authSdk,dbSdk]=await Promise.all([import(v+'firebase-app.js'),import(v+'firebase-auth.js'),import(v+'firebase-firestore.js')]);
 const a=app.initializeApp(firebaseConfig),auth=authSdk.getAuth(a),db=dbSdk.getFirestore(a);
 let user=null,unsubscribe=null,unclasses=null;
 const owns= u=>u?.emailVerified && u.email?.toLowerCase().endsWith('@'+schoolDomain);
 function stop(){unsubscribe?.();unclasses?.();unsubscribe=null;unclasses=null;}
 function watch(){unsubscribe?.();onHistory({},null);if(!user||!getClass())return;
  unsubscribe=dbSdk.onSnapshot(dbSdk.collection(db,'teachers',user.uid,'classes',getClass(),'questions'),s=>{
   const h={};s.forEach(x=>{const d=x.data();h[x.id]={count:d.count,lastUsed:d.lastUsed?.toMillis()||0,revisit:d.revisit};});onHistory(h,true);
  },e=>onError('History could not be loaded. '+e.code));
 }
 const unauth=authSdk.onAuthStateChanged(auth,async u=>{
  stop();user=null;onHistory({},null);
  if(u&&!owns(u)){await authSdk.signOut(auth);onError('Use your verified @'+schoolDomain+' school account.');return;}
  user=u;onUser(u);if(user)unclasses=dbSdk.onSnapshot(dbSdk.collection(db,'teachers',user.uid,'classes'),s=>onClasses(s.docs.map(x=>x.data()).filter(c=>typeof c.name==='string'&&[7,8,9,10].includes(c.year)).sort((a,b)=>a.year-b.year||a.name.localeCompare(b.name))),e=>onError('Classes could not be loaded. '+e.code));watch();
 });
 return {
  login:()=>{const p=new authSdk.GoogleAuthProvider();p.setCustomParameters({hd:schoolDomain,prompt:'select_account'});return authSdk.signInWithPopup(auth,p);},
  logout:()=>authSdk.signOut(auth),watch,dispose:()=>{stop();unauth();},
  async addClass(name,year){if(!user)throw Error('Sign in first.');const key=encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g,' '));await dbSdk.setDoc(dbSdk.doc(db,'teachers',user.uid,'classes',key),{name,year});},
  async deleteClass(name){if(!user)throw Error('Sign in first.');const uid=user.uid,key=encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g,' '));const records=await dbSdk.getDocs(dbSdk.collection(db,'teachers',uid,'classes',key,'questions'));for(let i=0;i<records.docs.length;i+=450){const batch=dbSdk.writeBatch(db);records.docs.slice(i,i+450).forEach(d=>batch.delete(d.ref));await batch.commit();}await dbSdk.deleteDoc(dbSdk.doc(db,'teachers',uid,'classes',key));},
  async save(ids,flag=null){
   if(!user)throw Error('Sign in to save your history.');
   const key=getClass();
   // Transaction prevents lost counts when the same teacher uses two devices.
   await dbSdk.runTransaction(db,async tx=>{
    const refs=ids.map(id=>dbSdk.doc(db,'teachers',user.uid,'classes',key,'questions',id));
    const snapshots=await Promise.all(refs.map(r=>tx.get(r)));
    refs.forEach((r,i)=>{const prev=snapshots[i].data()||{};
     tx.set(r,{count:(prev.count||0)+(flag===null?1:0),lastUsed:flag===null?dbSdk.serverTimestamp():(prev.lastUsed||null),revisit:flag===null?(prev.revisit||false):flag});
    });
   });
  }
 };
}
