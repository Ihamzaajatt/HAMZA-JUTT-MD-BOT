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

// --- SESSION RESTORE ---
if (process.env.SESSION_ID) {
  try {
    let sid = process.env.SESSION_ID.trim();
    if (sid.startsWith('HAMZA-') && sid.length < 50) {
      let file = `./sessions/${sid}.json`;
      if (fs.existsSync(file)) {
        fs.writeFileSync('./auth_info_baileys/creds.json', fs.readFileSync(file, 'utf8'));
        console.log(chalk.green(`✅ Short Session ${sid} Restored`));
      } else {
        console.log(chalk.red(`❌ Session file ${file} not found! Bot will start as new.`));
      }
    } else if (sid.startsWith('Hamza~')) {
      let b64 = sid.replace('Hamza~', '');
      let decoded;
      try { decoded = require('zlib').inflateSync(Buffer.from(b64, 'base64')).toString(); } 
      catch { decoded = Buffer.from(b64, 'base64').toString(); }
      fs.writeFileSync('./auth_info_baileys/creds.json', decoded);
      console.log(chalk.green('✅ Long Session Restored'));
    }
  } catch (e) { console.log('Restore fail', e.message) }
}

cfonts.say('HAMZA JUTT', { font: 'block', align: 'center', gradient: ['yellow', 'red'] });
cfonts.say('MD BOT', { font: 'chrome', align: 'center', gradient: ['yellow', 'red'] });

const app = express();
const PORT = process.env.PORT || 10000;
let qrCache = null;
let lastShort = null;
let currentSock = null;

function makeShort(){ const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let id='HAMZA-'; for(let i=0;i<8;i++) id+=c[Math.floor(Math.random()*c.length)]; return id; }

app.get('/', (req,res)=> res.send(`<html><body style="background:#000;color:#fff;text-align:center;padding:20px;font-family:sans-serif"><h2>👑 HAMZA-JUTT-MD</h2><p style="color:gold">Bot Running: ${currentSock ? 'Connected ✅' : 'Starting...'} | Last Session: ${lastShort || 'None'}</p><div style="background:#111;padding:15px;border-radius:10px;max-width:350px;margin:auto;border:1px solid gold"><button onclick="location.href='/getqr'" style="padding:10px;width:80%">GET QR</button><br><br><input id="num" placeholder="923XXXXXXXXX" style="padding:10px;width:80%"><br><br><button onclick="getPair()" style="padding:10px;width:80%;background:gold">GET PAIR CODE</button><div id="code" style="color:gold;margin-top:10px"></div></div><div id="sess" style="display:none;background:#222;border:1px solid lime;padding:15px;margin-top:20px;word-break:break-all"></div><script>async function getPair(){let n=document.getElementById('num').value;document.getElementById('code').innerText='Wait...';let r=await fetch('/pair?number='+n);let d=await r.json();document.getElementById('code').innerText=d.code?'CODE: '+d.code:d.error;check();}function check(){let iv=setInterval(async()=>{let s=await fetch('/check');let j=await s.json();if(j.session){document.getElementById('sess').style.display='block';document.getElementById('sess').innerHTML='<h3>✅ SESSION: '+j.session+'</h3>';clearInterval(iv);}},3000);}</script></body></html>`));

app.get('/getqr',(req,res)=>{ if(qrCache) res.json({qr:qrCache}); else res.json({error:'QR generating...'}); });
app.get('/pair', async (req,res)=>{
  let num=req.query.number?.replace(/[^0-9]/g,''); if(!num) return res.json({error:'Number do'}); if(!currentSock) return res.json({error:'Bot starting 15 sec'}); 
  try{ await delay(3000); let code=await currentSock.requestPairingCode(num); res.json({code:code?.match(/.{1,4}/g)?.join("-")||code}); }catch(e){ res.json({error:e.message}); }
});
app.get('/check',(req,res)=>{
  if(lastShort) return res.json({session:lastShort});
  if(fs.existsSync('./auth_info_baileys/creds.json')){
    try{ let cred=fs.readFileSync('./auth_info_baileys/creds.json','utf8'); let id=makeShort(); fs.writeFileSync('./sessions/'+id+'.json',cred); lastShort=id; return res.json({session:id}); }catch{}
  }
  res.json({waiting:true});
});
app.listen(PORT,()=>console.log(chalk.green('Server running '+PORT)));

const CONFIG = { BOT_NAME: "HAMZA-JUTT-MD-BOT", PREFIX: ".", OWNER_NUMBER: "923262091250" };
const commands = new Map();
const commandFolder = path.join(__dirname, 'commands');
function loadCommands(){
  if(!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder,{recursive:true});
  let files = fs.readdirSync(commandFolder).filter(x=>x.endsWith('.js'));
  console.log(chalk.yellow(`Loading ${files.length} commands...`));
  for(let f of files){
    try{ delete require.cache[require.resolve(path.join(commandFolder, f))]; let cmd = require(path.join(commandFolder, f)); commands.set(f.replace('.js','').toLowerCase(), cmd); console.log(chalk.green(`✅ Loaded: ${f}`)); }catch(e){ console.log(chalk.red(`❌ Failed ${f}: ${e.message}`)); }
  }
}
loadCommands();

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, logger: P({ level: 'silent' }), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })) }, browser: ["Ubuntu","Chrome","20.0.04"], printQRInTerminal: false });
  currentSock=sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u)=>{
    const {connection,lastDisconnect,qr}=u;
    if(qr){ try{ qrCache=await QRCode.toDataURL(qr); console.log('QR Generated'); }catch{} }
    if(connection==='close'){
      const c=new boom.Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('Connection closed', c);
      if(c!==DisconnectReason.loggedOut) setTimeout(startBot,5000);
      else { if(fs.existsSync('auth_info_baileys')) fs.rmSync('auth_info_baileys',{recursive:true,force:true}); setTimeout(startBot,3000); }
    }
    else if(connection==='open'){
      qrCache=null;
      console.log(chalk.green.bold(`\n${CONFIG.BOT_NAME} CONNECTED ✅`));
      await delay(2000);
      try{
        let cred=fs.readFileSync('./auth_info_baileys/creds.json','utf8');
        let id=makeShort();
        fs.writeFileSync('./sessions/'+id+'.json',cred);
        lastShort=id;
        console.log(chalk.yellow.bold(`SESSION ID: ${id}`));
        console.log(chalk.yellow(`File: ./sessions/${id}.json - Is file ko GitHub pe push karo!`));
        // Send session to owner WhatsApp
        await delay(3000);
        try{
          let me = sock.user.id;
          await sock.sendMessage(me, { text: `✅ *BOT CONNECT
