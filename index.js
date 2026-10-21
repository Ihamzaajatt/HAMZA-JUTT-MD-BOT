const fs = require('fs');
const path = require('path');
const express = require('express');
const chalk = require('chalk');
const figlet = require('figlet');
const cfonts = require('cfonts');
const P = require('pino');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const boom = require('@hapi/boom');
const QRCode = require('qrcode');

const delay = ms => new Promise(r => setTimeout(r, ms));

// Fresh session for pairing site
if (!process.env.SESSION_ID) {
  if (fs.existsSync('./auth_info_baileys')) fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
}

// Restore session if Hamza~ provided
if (process.env.SESSION_ID && process.env.SESSION_ID.startsWith('Hamza~')) {
  try {
    let b64 = process.env.SESSION_ID.replace('Hamza~', '');
    if (!fs.existsSync('./auth_info_baileys')) fs.mkdirSync('./auth_info_baileys', { recursive: true });
    fs.writeFileSync('./auth_info_baileys/creds.json', Buffer.from(b64, 'base64').toString());
    console.log(chalk.green('✅ Session Restored'));
  } catch {}
}

// STYLISH FONT
cfonts.say('HAMZA JUTT', { font: 'block', align: 'center', gradient: ['yellow', 'red'] });
cfonts.say('MD BOT', { font: 'chrome', align: 'center', gradient: ['yellow', 'red'] });
console.log(chalk.yellow.bold('   Owner: Hamza Jutt | Channel: 0029VbDh9IP1noz6H4T13v1t\n'));

const app = express();
const PORT = process.env.PORT || 10000;
let qrCache = null;
let pairSessions = {};
let currentSock = null;

app.get('/', (req, res) => {
  res.send(`
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>HAMZA-JUTT-MD-BOT</title>
<style>
body{background:#000;color:#fff;text-align:center;font-family:sans-serif;padding:10px}
.box{background:#111;padding:15px;border-radius:15px;margin:12px auto;max-width:380px;border:1px solid gold}
input{padding:12px;width:85%;border-radius:10px;border:none;background:#222;color:#fff;text-align:center}
button{padding:12px;width:80%;border:none;border-radius:10px;font-weight:bold;margin:8px;cursor:pointer}
.qrBtn{background:#fff;color:#000}
.pairBtn{background:gold;color:#000}
#qrImg{margin-top:10px;background:#fff;padding:8px;border-radius:10px;display:none;width:260px}
#code{color:gold;font-size:22px;margin-top:10px;font-weight:bold}
#sess{color:lime;word-break:break-all;background:#222;padding:12px;border-radius:10px;margin-top:15px;display:none;border:1px solid lime}
a.link{color:gold;border:1px solid gold;padding:8px 15px;border-radius:20px;text-decoration:none;display:inline-block;margin:5px;font-size:12px}
</style>
</head><body>
<h2>👑 HAMZA-JUTT-MD-BOT</h2>
<p style="color:gold">Bot is Running Successfully ✅</p>
<div class="box">
  <p>Owner: Hamza Jutt</p>
  <p style="font-size:12px;color:#aaa">Version: 7.0.0 QR+PAIR PRO</p>
  <a class="link" href="https://whatsapp.com/channel/0029VbDh9IP1noz6H4T13v1t" target="_blank">JOIN WHATSAPP CHANNEL</a>
  <a class="link" href="https://github.com/Ihamzaajatt/HAMZA-JUTT-MD-BOT" target="_blank">GITHUB REPO</a>
</div>

<div class="box">
  <h3>1. QR CODE SE LOGIN</h3>
  <button class="qrBtn" onclick="getQR()">GENERATE QR CODE</button>
  <div><img id="qrImg"></div>
</div>

<div class="box">
  <h3>2. PAIR CODE SE LOGIN</h3>
  <input id="num" placeholder="+923XXXXXXXXX">
  <br><button class="pairBtn" onclick="getPair()">GET PAIR CODE</button>
  <div id="code"></div>
  <p style="font-size:10px;color:#aaa">WhatsApp > Linked Devices > Link with Phone Number</p>
</div>

<div id="sess" class="box"></div>

<script>
async function getQR(){
  let r=await fetch('/getqr'); let d=await r.json();
  if(d.qr){ document.getElementById('qrImg').src=d.qr; document.getElementById('qrImg').style.display='inline-block'; }
  else alert(d.error);
  check('qr_user');
}
async function getPair(){
  let n=document.getElementById('num').value;
  if(!n) return alert('Number likho +923...');
  document.getElementById('code').innerText='Generating... 10 sec wait';
  let r=await fetch('/pair?number='+n); let d=await r.json();
  if(d.code) document.getElementById('code').innerText='CODE: '+d.code;
  else document.getElementById('code').innerText=d.error;
  check(n);
}
function check(num){
  let clean=num.replace(/[^0-9]/g,'')||num;
  let iv=setInterval(async()=>{
    let s=await fetch('/check?number='+clean); let j=await s.json();
    if(j.session){
      document.getElementById('sess').style.display='block';
      document.getElementById('sess').innerHTML='<h3>✅ SESSION READY</h3><p>'+j.session+'</p>';
      clearInterval(iv);
    }
  },3000);
}
</script>
</body></html>
  `);
});

app.get('/getqr', (req, res) => {
  if (qrCache) res.json({ qr: qrCache });
  else res.json({ error: 'QR ban raha hai, 5 sec baad try karo' });
});

app.get('/pair', async (req, res) => {
  let number = req.query.number?.replace(/[^0-9]/g, '');
  if (!number) return res.json({ error: 'Number do' });
  if (!currentSock) return res.json({ error: 'Bot starting hai, 15 sec wait karo' });
  try {
    await delay(3000);
    if (currentSock.authState.creds.registered) return res.json({ error: 'Already Linked' });
    let code = await currentSock.requestPairingCode(number);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    res.json({ code });
  } catch (e) { res.json({ error: e.message }); }
});

app.get('/check', (req, res) => {
  let n = req.query.number?.replace(/[^0-9]/g, '') || req.query.number;
  if (pairSessions[n]) res.json({ session: pairSessions[n] });
  else res.json({ waiting: true });
});

app.listen(PORT, () => console.log(chalk.green('Server running on ' + PORT)));

const CONFIG = { BOT_NAME: "HAMZA-JUTT-MD-BOT", PREFIX: ".", CHANNEL_ID: "0029VbDh9IP1noz6H4T13v1t", OWNER_NUMBER: "923262091250" };

const commands = new Map();
const commandFolder = path.join(__dirname, 'commands');
function loadCommands() {
  if (!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder, { recursive: true });
  for (let f of fs.readdirSync(commandFolder).filter(x => x.endsWith('.js'))) {
    try { delete require.cache[require.resolve(path.join(commandFolder, f))]; commands.set(f.replace('.js', '').toLowerCase(), require(path.join(commandFolder, f))); } catch {}
  }
}
loadCommands();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version, logger: P({ level: 'silent' }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })) },
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });
  currentSock = sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr) { try { qrCache = await QRCode.toDataURL(qr); } catch {} }
    if (connection === 'close') {
      const c = new boom.Boom(lastDisconnect?.error)?.output?.statusCode;
      if (c !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
      else { fs.rmSync('auth_info_baileys', { recursive: true, force: true }); setTimeout(startBot, 3000); }
    } else if (connection === 'open') {
      console.log(chalk.green.bold(CONFIG.BOT_NAME + ' CONNECTED ✅'));
      try {
        let cred = fs.readFileSync('./auth_info_baileys/creds.json', 'utf8');
        let sess = 'Hamza~' + Buffer.from(cred).toString('base64');
        pairSessions['qr_user'] = sess;
      } catch {}
    }
  });
  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages[0];
      if (!mek.message || mek.key.fromMe) return;
      let body = mek.message.conversation || mek.message.extendedTextMessage?.text || mek.message.imageMessage?.caption || '';
      if (!body.startsWith(CONFIG.PREFIX)) return;
      const args = body.slice(1).trim().split(/ +/);
      const cmd = args.shift().toLowerCase();
      if (commands.has(cmd)) await commands.get(cmd)(sock, mek, args, CONFIG);
    } catch {}
  });
}
startBot();
