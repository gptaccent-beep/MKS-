const crypto=require('crypto');
const COOKIE='vetra_admin_session';
function secret(){return process.env.CONTENT_ADMIN_KEY||''}
function sign(value){return crypto.createHmac('sha256',secret()).update(value).digest('hex')}
function parseCookies(req){return Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return i<0?[x,'']:[x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))}
function authorized(req){const expected=secret(),provided=String(req.headers['x-content-admin-key']||'');if(expected&&provided===expected)return true;const token=parseCookies(req)[COOKIE]||'',parts=token.split('.');if(parts.length!==2||!expected)return false;const exp=Number(parts[0]);if(!Number.isFinite(exp)||Date.now()>exp)return false;const good=sign(String(exp));try{return crypto.timingSafeEqual(Buffer.from(parts[1]),Buffer.from(good))}catch{return false}}
function issue(res){const exp=Date.now()+30*86400000,token=`${exp}.${sign(String(exp))}`;res.setHeader('Set-Cookie',`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`)}
module.exports={authorized,issue};
