const fs = require('fs');
const path = require('path');
const express = require('express');
const chalk = require('chalk');
const cfonts = require('cfonts');
const P = require('pino');
const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const useMultiFileAuthState = baileys.useMultiFileAuthState;
const DisconnectReason = baileys.DisconnectReason;
const fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
const makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
const boom = require('@hapi/boom');
const QRCode = require('qrcode');

const delay = ms => new Promise(r => setTimeout(r, ms));

if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions',{recursive:true});
if (!fs.existsSync('./auth_info_baileys')) fs.mkdirSync('./auth_info_baileys',{recursive:true});

if (process.env.SESSION_ID && process.env.SESSION_ID.trim().startsWith('HAMZA-')) {
  let filePath = './sessions/' + process.env.SESSION_ID.trim() + '.json';
  if (fs.existsSync(filePath)) {
    fs.writeFileSync('./auth_info_baileys/creds.json', fs.readFileSync(filePath,'utf8'));
    console.log('Session Restored: ' + process.env.SESSION_ID);
  }
}

cfonts.say('HAMZA JUTT', {font:'block', align:'center', gradient:['yellow','red']});

const app = express();
const PORT = process.env.PORT || 10000;
let qrCache = null;
let lastShort = null;
let currentSock = null;

function makeShort(){
  let chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id='HAMZA-';
  for(let i=0;i<8;i++) id+=chars[Math.floor(Math.random()*chars.length)];
  return id;
}

app.get('/', (req,res)=>{
  res.send(`
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"><title>HAMZA BOT</title></head>
<body style="background:#000;color:#fff;text-align:center;font-family:sans-serif;padding:15px">
<h2 style="color:gold;background:#222;padding:12px;border-radius:10px">HAMZA-JUTT-MD BOT RUNNING</h2>

<div style="background:#111;padding:15px;border-radius:12px;max-width:360px;margin:15px auto;border:1px solid gold">
<h3>1. Pairing Code</h3>
<input id="num" placeholder="923XXXXXXXXX" style="padding:12px;width:90%;border-radius:8px;border:none;background:#222;color:#fff;text-align:center;font-size:16px">
<br><br>
<button onclick="getPair()" style="padding:12px;width:90%;background:gold;color:#000;font-weight:bold;border:none;border-radius:8px">GET PAIR CODE</button>
<div id="code" style="margin-top:12px;color:lime;font-size:22px;font-weight:bold"></div>
</div>

<div style="background:#111;padding:15px;border-radius:12px;max-width:360px;margin:15px auto;border:1px solid #444">
<h3>2. QR Code</h3>
<button onclick="getQR()" style="padding:12px;width:90%;background:#fff;color:#000;font-weight:bold;border:none;border-radius:8px">GET QR</button>
<br><br>
<img id="qrImg" style="display:none;background:#fff;padding:10px;border-radius:10px;width:250px">
</div>

<div style="background:#111;padding:15px;border-radius:12px;max-width:360px;margin:15px auto;border:1px solid lime">
<p>Last Session: <b id="last">${lastShort || 'none'}</b></p>
<button onclick="checkSess()" style="padding:10px;width:90%;background:lime;color:#000;font-weight:bold;border:none;border-radius:8px">GET SESSION</button>
<div id="sessBox" style="margin-top:12px;word-break:break-all;color:gold"></div>
</div>

<script>
async function getPair(){
  let n=document.getElementById('num').value;
  if(!n) return alert('Number likho 923...');
  document.getElementById('code').innerText='Wait 10 sec...';
  let r=await fetch('/pair?number='+n);
  let d=await r.json();
  if(d.code) document.getElementById('code').innerText='CODE: '+d.code;
  else document.getElementById('code').innerText=d.error;
}
async function getQR(){
  let r=await fetch('/getqr');
  let d=await r.json();
  if(d.qr){ document.getElementById('qrImg').src=d.qr; document.getElementById('qrImg').style.display='inline-block'; }
  else alert(d.error);
}
async function checkSess(){
  let r=await fetch('/check');
  let d=await r.json();
  if(d.session){
    document.getElementById('sessBox').innerHTML='<h3>SESSION: '+d.session+'</h3><p>Copy this ID and put in Render SESSION_ID</p>';
    document.getElementById('last').innerText=d.session;
  } else {
    document.getElementById('sessBox').innerText=JSON.stringify(d);
  }
}
</script>
</body>
</html>
`);
});

app.get('/getqr', (req,res)=>{
  if(qrCache) res.json({qr:qrCache});
  else res.json({error:'QR not ready, wait 10 sec and try again'});
});

app.get('/pair', async (req,res)=>{
  let num = req.query.number ? req.query.number.replace(/[^0-9]/g,'') : '';
  if(!num) return res.json({error:'Number do'});
  if(!currentSock) return res.json({error:'Bot starting, wait 10 sec'});
  try{
    await delay(3000);
    let code = await currentSock.requestPairingCode(num);
    res.json({code: code});
  }catch(e){
    res.json({error:e.message});
  }
});

app.get('/check', (req,res)=>{
  if(lastShort) return res.json({session:lastShort});
  if(fs.existsSync('./auth_info_baileys/creds.json')){
    try{
      let cred = fs.readFileSync('./auth_info_baileys/creds.json','utf8');
      let id = makeShort();
      fs.writeFileSync('./sessions/'+id+'.json', cred);
      lastShort=id;
      console.log('NEW SESSION: '+id);
      return res.json({session:id});
    }catch(e){
      return res.json({error:e.message});
    }
  }
  res.json({waiting:true});
});

app.listen(PORT, ()=>{ console.log('Server running on '+PORT); });

const CONFIG = {BOT_NAME:"HAMZA-JUTT-MD", PREFIX:".", OWNER_NUMBER:"923262091250"};
const commands = new Map();
const commandFolder = path.join(__dirname,'commands');

function loadCommands(){
  if(!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder,{recursive:true});
  let files = fs.readdirSync(commandFolder).filter(x=>x.endsWith('.js'));
  console.log('Loading '+files.length+' commands');
  for(let f of files){
    try{
      delete require.cache[require.resolve(path.join(commandFolder,f))];
      let cmd = require(path.join(commandFolder,f));
      commands.set(f.replace('.js','').toLowerCase(), cmd);
      console.log('Loaded: '+f);
    }catch(e){
      console.log('Failed '+f+': '+e.message);
    }
  }
}
loadCommands();

async function startBot(){
  const {state, saveCreds} = await useMultiFileAuthState('auth_info_baileys');
  const {version} = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger: P({level:'silent'}),
    auth: {creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({level:'silent'}))},
    browser: ["Ubuntu","Chrome","20.0.04"]
  });
  currentSock=sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    let connection = u.connection;
    let lastDisconnect = u.lastDisconnect;
    let qr = u.qr;
    if(qr){
      try{ qrCache = await QRCode.toDataURL(qr); }catch{}
    }
    if(connection==='close'){
      let c = new boom.Boom(lastDisconnect?.error)?.output?.statusCode;
      if(c!==DisconnectReason.loggedOut) setTimeout(startBot,5000);
      else{
        if(fs.existsSync('auth_info_baileys')) fs.rmSync('auth_info_baileys',{recursive:true,force:true});
        setTimeout(startBot,3000);
      }
    } else if(connection==='open'){
      qrCache=null;
      console.log(CONFIG.BOT_NAME+' CONNECTED');
      await delay(2000);
      try{
        let cred = fs.readFileSync('./auth_info_baileys/creds.json','utf8');
        let id = makeShort();
        fs.writeFileSync('./sessions/'+id+'.json', cred);
        lastShort=id;
        console.log('FINAL SESSION ID: '+id);
      }catch(e){ console.log('Open error: '+e.message); }
    }
  });
  sock.ev.on('messages.upsert', async (chatUpdate)=>{
    try{
      let mek = chatUpdate.messages[0];
      if(!mek.message) return;
      if(mek.key.fromMe) return;
      let body = mek.message.conversation || mek.message.extendedTextMessage?.text || '';
      if(!body) return;
      if(!body.startsWith(CONFIG.PREFIX)) return;
      let args = body.slice(1).trim().split(/ +/);
      let cmd = args.shift().toLowerCase();
      if(commands.has(cmd)){
        await commands.get(cmd)(sock, mek, args, CONFIG);
      }
    }catch(e){ console.log('Msg error: '+e.message); }
  });
}
startBot();
