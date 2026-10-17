// Vercel serverless API: 환경 변수는 서버에서만 사용합니다.
const URL=process.env.SUPABASE_URL;
const SECRET=process.env.SUPABASE_SECRET_KEY;
const headers=()=>({'apikey':SECRET,'Authorization':`Bearer ${SECRET}`,'Content-Type':'application/json'});
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','PUT'].includes(req.method)){res.setHeader('Allow','GET, PUT');return res.status(405).json({error:'method_not_allowed'});}
 if(!URL||!SECRET)return res.status(503).json({error:'database_not_configured'});
 try{
  if(req.method==='GET'){
   const r=await fetch(`${URL}/rest/v1/pds_state?id=eq.main&select=data`,{headers:headers()});
   if(!r.ok)throw Error(`DB ${r.status}`);const rows=await r.json();return res.status(200).json({state:rows[0]?.data||null});
  }
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!body||!['plans','tasks','executions','reflections'].every(k=>Array.isArray(body[k])))return res.status(400).json({error:'invalid_data'});
  if(JSON.stringify(body).length>1500000)return res.status(413).json({error:'data_too_large'});
  const r=await fetch(`${URL}/rest/v1/pds_state?on_conflict=id`,{method:'POST',headers:{...headers(),'Prefer':'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({id:'main',data:body,updated_at:new Date().toISOString()})});
  if(!r.ok)throw Error(`DB ${r.status}`);return res.status(200).json({ok:true});
 }catch(e){console.error('pds_database_error',e.message);return res.status(502).json({error:'database_error'});}
};
