const crypto=require('crypto');
const {authorized}=require('./_adminAuth');
const COOKIE='mks_seller_session';
const hits=new Map();
function reply(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data))}
function body(req){if(req.body&&typeof req.body==='object')return req.body;try{return JSON.parse(req.body||'{}')}catch{return{}}}
async function db(path,opts={}){const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('Supabase is not configured');const r=await fetch(url.replace(/\/$/,'')+'/rest/v1/'+path,{...opts,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...opts.headers}});if(!r.ok)throw Error('Seller database unavailable. Run supabase/sellers-v4.6.sql first.');const text=await r.text();return text?JSON.parse(text):null}
const patch=(id,value)=>db('seller_accounts?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:JSON.stringify(value)});
function sign(value){return crypto.createHmac('sha256',process.env.CONTENT_ADMIN_KEY||'').update(value).digest('hex')}
function safeEqual(a,b){try{return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b))}catch{return false}}
function hash(pass,salt){return crypto.scryptSync(pass,salt,64).toString('hex')}
function cookie(res,token,max=43200){res.setHeader('Set-Cookie',`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${max}`)}
async function identity(req){const m=String(req.headers.cookie||'').match(/(?:^|;\s*)mks_seller_session=([^;]+)/);if(!m)return null;const [payload,sig]=m[1].split('.');if(!payload||!sig||!safeEqual(sign(payload),sig))return null;let t;try{t=JSON.parse(Buffer.from(payload,'base64url').toString())}catch{return null}if(t.exp<Date.now())return null;const rows=await db('seller_accounts?id=eq.'+encodeURIComponent(t.id)+'&select=id,store_id,username,enabled,session_version');const a=rows?.[0];return a?.enabled&&a.session_version===t.v?a:null}
async function content(){const rows=await db('site_content?id=eq.main&select=data&limit=1');return rows?.[0]?.data||{stores:[],products:[]}}
async function accountResponse(a){const c=await content(),store=c.stores?.find(s=>s.id===a.store_id);if(!store)return null;return{username:a.username,store:{id:store.id,name:store.name,logo:store.logo,slug:store.slug},products:(c.products||[]).filter(p=>p.store===a.store_id).map(p=>({id:p.id,name:p.name,image:p.media?.find(x=>x.type==='image')?.url||p.colors?.[0]?.images?.[0]||''}))}}
function limit(req){const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0],now=Date.now(),r=hits.get(ip)||{n:0,t:now};if(now-r.t>900000){r.n=0;r.t=now}r.n++;hits.set(ip,r);if(hits.size>10000)hits.delete(hits.keys().next().value);return r.n<=30}
module.exports=async(req,res)=>{try{
 if(!process.env.CONTENT_ADMIN_KEY)return reply(res,503,{error:'Server session signing is not configured'});
 if(req.method==='POST'&&req.headers.origin){const expected='https://'+String(req.headers['x-forwarded-host']||req.headers.host||'');if(req.headers.origin!==expected)return reply(res,403,{error:'Invalid request origin'})}
 const b=body(req),action=req.method==='GET'?String(req.query?.action||'me'):String(b.action||'');
 if(action==='login'&&req.method==='POST'){
  if(!limit(req))return reply(res,429,{error:'Too many attempts. Try again in 15 minutes.'});
  const user=String(b.user||'').slice(0,80),pass=String(b.pass||'');if(pass.length>200)return reply(res,400,{error:'Invalid credentials'});
  const rows=await db('seller_accounts?username=eq.'+encodeURIComponent(user)+'&select=*'),a=rows?.[0];
  if(!a||!a.enabled||Date.parse(a.locked_until||0)>Date.now())return reply(res,401,{error:'Incorrect credentials or account temporarily locked'});
  if(!safeEqual(hash(pass,a.salt),a.password_hash)){const n=a.failed_attempts+1;await patch(a.id,{failed_attempts:n,locked_until:n>=5?new Date(Date.now()+900000).toISOString():null});return reply(res,401,{error:'Incorrect credentials'})}
  const result=await accountResponse(a);if(!result)return reply(res,403,{error:'Store unavailable'});
  await patch(a.id,{failed_attempts:0,locked_until:null});const p=Buffer.from(JSON.stringify({id:a.id,v:a.session_version,exp:Date.now()+43200000})).toString('base64url');cookie(res,p+'.'+sign(p));return reply(res,200,result)
 }
 if(action==='logout'&&req.method==='POST'){cookie(res,'',0);return reply(res,200,{ok:true})}
 if(['list','create','reset','disable'].includes(action)){
  if(!authorized(req))return reply(res,403,{error:'Administrator session required'});
  if(action==='list'&&req.method==='GET')return reply(res,200,{accounts:await db('seller_accounts?select=id,store_id,username,enabled&order=created_at.asc')});
  if(req.method!=='POST')return reply(res,405,{error:'Method not allowed'});
  const storeId=String(b.storeId||''),c=await content();if(!c.stores?.some(s=>s.id===storeId))return reply(res,404,{error:'Publish the market before creating a seller account'});
  const rows=await db('seller_accounts?store_id=eq.'+encodeURIComponent(storeId)+'&select=*'),a=rows?.[0];
  if(action==='disable'){if(a)await patch(a.id,{enabled:false,session_version:a.session_version+1});return reply(res,200,{ok:true})}
  if(action==='create'&&a)return reply(res,200,{username:a.username,exists:true});
  const pass=crypto.randomBytes(18).toString('base64url'),salt=crypto.randomBytes(24).toString('hex'),username=a?.username||'seller_'+crypto.randomBytes(6).toString('hex');
  const row={store_id:storeId,username,password_hash:hash(pass,salt),salt,enabled:true,failed_attempts:0,locked_until:null,session_version:(a?.session_version||0)+1};
  if(a)await patch(a.id,row);else await db('seller_accounts',{method:'POST',body:JSON.stringify(row)});
  return reply(res,200,{username,password:pass,storeId})
 }
 const a=await identity(req);if(!a)return reply(res,401,{error:'Seller sign-in required'});
 if(action==='me'&&req.method==='GET'){const result=await accountResponse(a);return result?reply(res,200,result):reply(res,403,{error:'Store unavailable'})}
 if(req.method!=='POST')return reply(res,405,{error:'Method not allowed'});
 if(action==='product-name'){
  if(Object.keys(b).some(k=>!['action','productId','name'].includes(k)))return reply(res,400,{error:'Only product names may be edited'});
  const c=await content(),p=c.products?.find(p=>p.id===b.productId&&p.store===a.store_id);if(!p)return reply(res,403,{error:'Product is not in your store'});
  const name=String(b.name||'').trim();if(!name||name.length>160)return reply(res,400,{error:'Product name must be 1–160 characters'});
  await db('rpc/seller_edit_content',{method:'POST',body:JSON.stringify({p_store:a.store_id,p_product:p.id,p_name:name})});return reply(res,200,{saved:true})
 }
 if(action==='logo'){
  if(Object.keys(b).some(k=>!['action','dataUrl'].includes(k)))return reply(res,400,{error:'Only your store logo may be edited'});
  const m=String(b.dataUrl||'').match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=\r\n]+)$/);if(!m)return reply(res,400,{error:'Choose a PNG, JPEG or WebP logo'});
  const buf=Buffer.from(m[2],'base64');if(buf.length<12||buf.length>2000000)return reply(res,400,{error:'Logo must be below 2 MB'});
  const valid=m[1]==='png'?buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):m[1]==='jpeg'?buf[0]===255&&buf[1]===216:buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP';if(!valid)return reply(res,400,{error:'Invalid image file'});
  const url=process.env.SUPABASE_URL.replace(/\/$/,''),key=process.env.SUPABASE_SERVICE_ROLE_KEY,bucket=process.env.SUPABASE_STORAGE_BUCKET||'marketplace-media',path=`sellers/${a.id}/${crypto.randomBytes(16).toString('hex')}.${m[1]==='jpeg'?'jpg':m[1]}`;
  const r=await fetch(`${url}/storage/v1/object/${bucket}/${path}`,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'image/'+m[1]},body:buf});if(!r.ok)throw Error('Logo upload failed');
  const logo=`${url}/storage/v1/object/public/${bucket}/${path}`;await db('rpc/seller_edit_content',{method:'POST',body:JSON.stringify({p_store:a.store_id,p_logo:logo})});return reply(res,200,{saved:true,logo})
 }
 return reply(res,400,{error:'Action not allowed'})
 }catch(e){console.error(e.message);return reply(res,503,{error:e.message||'Seller service unavailable'})}};
