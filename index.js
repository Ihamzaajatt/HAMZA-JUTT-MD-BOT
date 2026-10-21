const fs = require('fs');
const path = require('path');
const express = require('express');
const chalk = require('chalk');
const cfonts = require('cfonts');
const P = require('pino');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const boom = require('@hapi/boom');
const QRCode = require('qrcode');
const delay = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', { recursive: true });
if (!fs.existsSync('./auth_info_baileys')) fs.mkdirSync('./auth_info_baileys', { recursive: true });

if (process.env.SESSION_ID && process.env.SESSION_ID.startsWith('HAMZA-') && process.env.SESSION_ID.length < 50) {
  let file = `./sessions/${process.env.SESSION_ID.trim()}.json`;
  if (fs.existsSync(file)) {
    fs.writeFileSync('./auth_info_baileys/creds.json', fs.readFileSync(file, 'utf8'));
    console.log(chalk.green(`✅ Short Session ${process.env.SESSION_ID} Restored`));
  }
}

cfonts.say('HAMZA JUTT', { font: 'block', align: 'center', gradient: ['yellow', 'red'] });

const app = express();
const PORT = process.env.PORT || 10000;
let qrCache = null;
let lastShort = null;
let currentSock = null;

function makeShort(){
  const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id='HAMZA-'; for(let i=0;i<8;i++) id+=c[Math.floor(Math.random()*c.length)];
  return id; // HAMZA- + 8 = 14 chars
}

app.get('/', (req,res)=>{ res.send(`
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>HAMZA</title>
<style>body{background:#000;color:#fff;text-align:center;font-family:sans-serif;padding:10px}.box{background:#111;padding:15px;border-radius:15px;margin:12px auto;max-width:380px;border:1px solid gold}button{padding:12px;width:80%;border-radius:10px;font-weight:bold;margin:8px} .qr{background:#fff;color:#000}.pair{background:gold;color:#000} #sess{background:#222;border:1px solid lime;color:lime;padding:15px;border-radius:10px;margin-top:15px;word-break:break-all;display:none}</style>
</head><body>
<h2>👑 HAMZA-JUTT-MD</h2>
<p style="color:gold">Bot Running ✅</p>
<div class="box"><button class="qr" onclick="getQR()">GET QR</button><div><img id="qrImg" style="display:none;background:#fff;padding:8px;border-radius:10px;width:250px"></div></div>
<div class="box"><input id="num" placeholder="923XXXXXXXXX" style="padding:12px;width:80%;border-radius:10px;border:none;background:#222;color:#fff;text-align:center"><br><button class="pair" onclick="getPair()">GET PAIR CODE</button><div id="code" style="color:gold;font-size:22px;margin-top:10px"></div></div>
<div id="sess" class="box"></div>
<script>
async function getQR(){let r=await fetch('/getqr');let d=await r.json();if(d.qr){document.getElementById('qrImg').src=d.qr;document.getElementById('qrImg').style.display='inline-block';} check();}
async function getPair(){let n=document.getElementById('num').value; if(!n) return alert('Number likho'); document.getElementById('code').innerText='Wait...'; let r=await fetch('/pair?number='+n); let d=await r.json(); document.getElementById('code').innerText=d.code? 'CODE: '+d.code : d.error; check();}
function check(){ let iv=setInterval(async()=>{ let s=await fetch('/check'); let j=await s.json(); if(j.session){ document.getElementById('sess').style.display='block'; document.getElementById('sess').innerHTML='<h3>✅ SESSION ID (20 CHAR)</h3><p style=font-size:24px;color:gold><b>'+j.session+'</b></p><p>SESSION_ID me lagao:<br>'+j.session+'</p><a href=/getsession? id='+j.session+' style=color:gold>Download Session File</a>'; clearInterval(iv); } },3000); }
</script></body></html>
`)});

app.get('/getqr',(req,res)=>{ if(qrCache) res.json({qr:qrCache}); else res.json({error:'Wait 5 sec QR ban raha'}); });
app.get('/pair', async (req,res)=>{
  let num=req.query.number?.replace(/[^0-9]/g,''); if(!num) return res.json({error:'Number do'}); if(!currentSock) return res.json({error:'Bot starting 15 sec wait'}); 
  try{ await delay(4000); let code=await currentSock.requestPairingCode(num); code=code?.match(/.{1,4}/g)?.join("-")||code; res.json({code}); }catch(e){ res.json({error:e.message}); }
});
app.get('/check',(req,res)=>{
  if(lastShort) return res.json({session:lastShort});
  if(fs.existsSync('./auth_info_baileys/creds.json')){
    try{ let cred=fs.readFileSync('./auth_info_baileys/creds.json','utf8'); if(!cred) return res.json({waiting:true}); let id=makeShort(); fs.writeFileSync('./sessions/'+id+'.json',cred); lastShort=id; console.log('SESSION GENERATED: '+id); return res.json({session:id}); }catch(e){ return res.json({waiting:true}); }
  }
  res.json({waiting:true});
});
app.get('/getsession',(req,res)=>{
  if(lastShort && fs.existsSync('./sessions/'+lastShort+'.json')) return res.download('./sessions/'+lastShort+'.json');
  res.send('No session yet');
});
app.listen(PORT,()=>console.log('Server '+PORT));

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, logger: P({ level: 'silent' }), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })) }, browser: ["Ubuntu","Chrome","20.0.04"] });
  currentSock=sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    const {connection,lastDisconnect,qr}=u;
    if(qr){ try{ qrCache=await QRCode.toDataURL(qr); }catch{} }
    if(connection==='close'){ const c=new boom.Boom(lastDisconnect?.error)?.output?.statusCode; if(c!==DisconnectReason.loggedOut) setTimeout(startBot,5000); else { if(fs.existsSync('auth_info_baileys')) fs.rmSync('auth_info_baileys',{recursive:true,force:true}); setTimeout(startBot,3000);} }
    else if(connection==='open'){ qrCache=null; await delay(2000); try{ let cred=fs.readFileSync('./auth_info_baileys/creds.json','utf8'); let id=makeShort(); fs.writeFileSync('./sessions/'+id+'.json',cred); lastShort=id; console.log(chalk.green.bold('✅ FINAL SHORT SESSION: '+id)); console.log(chalk.yellow('File: ./sessions/'+id+'.json')); }catch(e){ console.log('open error',e.message)} }
  });
}
startBot();
