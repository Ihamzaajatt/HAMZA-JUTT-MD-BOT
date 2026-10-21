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

if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions', {recursive:true});
if (!fs.existsSync('./auth_info_baileys')) fs.mkdirSync('./auth_info_baileys',{recursive:true});

if (process.env.SESSION_ID && process.env.SESSION_ID.startsWith('HAMZA-')) {
  let f = './sessions/' + process.env.SESSION_ID.trim() + '.json';
  if (fs.existsSync(f)) {
    fs.writeFileSync('./auth_info_baileys/creds.json', fs.readFileSync(f,'utf8'));
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
  res.send('<h1 style="text-align:center;background:#000;color:gold;padding:20px">HAMZA-JUTT-MD BOT RUNNING</h1><div style="text-align:center"><p>QR: <a href="/getqr">Get QR</a></p><p>Check: <a href="/check">Get Session</a></p><p>Last: '+(lastShort||'none')+'</p></div>');
});

app.get('/getqr', (req,res)=>{
  if(qrCache) res.json({qr:qrCache});
  else res.json({error:'QR not ready, wait 10 sec'});
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
      console.log('Msg: '+body);
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
