const fs = require('fs');
if (fs.existsSync('./auth_info_baileys')) fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
if (fs.existsSync('./session')) fs.rmSync('./session', { recursive: true, force: true });
console.log("Session Cleared - Ready for new pairing");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const boom = require('@hapi/boom');
const express = require('express');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// 1. Hamza~ Session Restore
if(process.env.SESSION_ID && process.env.SESSION_ID.startsWith('Hamza~')){
  try{
    let b64 = process.env.SESSION_ID.replace('Hamza~','');
    if(!fs.existsSync('./auth_info_baileys')) fs.mkdirSync('./auth_info_baileys',{recursive:true});
    fs.writeFileSync('./auth_info_baileys/creds.json', Buffer.from(b64,'base64').toString());
    console.log(chalk.green('✅ Hamza Session Restored!'));
  }catch(e){ console.log('Session Restore Error'); }
}

const app = express();
const PORT = process.env.PORT || 10000;
let qrCache = null;
let pairSessions = {};
let currentSock = null;

// 2. WEBSITE - QR + PAIR DONO
app.get('/', (req, res) => {
  res.send(`
    <html><head><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HAMZA-JUTT-MD-BOT</title>
    <style>
      body{background:#000;color:#fff;text-align:center;font-family:sans-serif;padding:10px}
      .box{background:#111;padding:15px;border-radius:15px;margin:15px auto;max-width:400px;border:1px solid gold}
      input{padding:12px;width:85%;border-radius:10px;border:none;background:#222;color:#fff}
      button{padding:12px 20px;border:none;border-radius:10px;font-weight:bold;margin:8px;cursor:pointer}
      .qrBtn{background:#fff;color:#000;width:80%}
      .pairBtn{background:gold;color:#000;width:80%}
      #qrImg{margin-top:10px;background:#fff;padding:8px;border-radius:10px;display:none;width:260px}
      #code{color:gold;font-size:24px;margin-top:10px;font-weight:bold}
      #sess{color:lime;word-break:break-all;background:#222;padding:12px;border-radius:10px;margin-top:15px;display:none;border:1px solid lime}
    </style>
    </head><body>
    <h2>👑 HAMZA-JUTT-MD-BOT</h2>
    <p style="color:gold">QR + PAIR CODE GENERATOR</p>
    <div class="box">
      <h3>1. QR CODE SE LOGIN</h3>
      <button class="qrBtn" onclick="getQR()">GENERATE QR CODE</button>
      <div><img id="qrImg"></div>
      <p style="font-size:11px;color:#aaa">WhatsApp > Linked Devices > Link a Device</p>
    </div>
    <div class="box">
      <h3>2. PAIR CODE SE LOGIN</h3>
      <input id="num" placeholder="923262091250">
      <br><button class="pairBtn" onclick="getPair()">GET PAIR CODE</button>
      <div id="code"></div>
      <p style="font-size:11px;color:#aaa">WhatsApp > Linked Devices > Link with Phone Number</p>
    </div>
    <div id="sess" class="box"></div>
    <script>
      async function getQR(){
        document.getElementById('qrImg').style.display='none';
        document.getElementById('code').innerText='';
        let r=await fetch('/getqr'); let d=await r.json();
        if(d.qr){
          document.getElementById('qrImg').src=d.qr;
          document.getElementById('qrImg').style.display='inline-block';
        } else {
          alert(d.error || 'QR not ready, wait 5 sec');
        }
        check('qr_user');
      }
      async function getPair(){
        let n=document.getElementById('num').value;
        if(!n) return alert('Number dalo 923... format me');
        document.getElementById('code').innerText='Generating...';
        let r=await fetch('/pair?number='+n); let d=await r.json();
        if(d.code) document.getElementById('code').innerText='PAIR CODE: '+d.code;
        else document.getElementById('code').innerText=d.error;
        check(n);
      }
      function check(num){
        let clean=num.replace(/[^0-9]/g,'')||num;
        let iv=setInterval(async()=>{
          let s=await fetch('/check?number='+clean);
          let j=await s.json();
          if(j.session){
            document.getElementById('sess').style.display='block';
            document.getElementById('sess').innerHTML='<h3>✅ SESSION READY</h3><p style=color:#fff;font-size:12px>'+j.session+'</p><br><small style=color:gold>Copy karke Heroku/Render pe SESSION_ID me lagao</small>';
            clearInterval(iv);
          }
        },3000);
      }
    </script></body></html>
  `);
});

app.get('/getqr', (req,res)=>{
  if(qrCache) res.json({qr: qrCache});
  else res.json({error:'QR generating... 5 sec baad dubara click karo'});
});

app.get('/pair', async (req,res)=>{
  let number = req.query.number?.replace(/[^0-9]/g,'');
  if(!number) return res.json({error:'Number do'});
  if(!currentSock) return res.json({error:'Bot starting hai, 10 sec baad try karo'});
  try{
    let code = await currentSock.requestPairingCode(number);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    res.json({code});
  }catch(e){ res.json({error:e.message}); }
});

app.get('/check', (req,res)=>{
  let number = req.query.number?.replace(/[^0-9]/g,'') || req.query.number;
  if(pairSessions[number]) res.json({session: pairSessions[number]});
  else res.json({waiting:true});
});

app.listen(PORT, () => console.log(chalk.green(` Server Running on Port ${PORT} - QR+PAIR ACTIVE`)));

// 3. BOT CONFIG
const CONFIG = {
    BOT_NAME: "HAMZA-JUTT-MD-BOT",
    OWNER_NAME: "Hamza Jutt",
    OWNER_NUMBER: "923262091250",
    PAIR_NUMBER: process.env.PAIR_NUMBER || "",
    OWNER_JID: "923262091250@s.whatsapp.net",
    PREFIX: ".",
    CHANNEL_LINK: "https://whatsapp.com/channel/0029VbDh9IP1noz6H4T13v1t",
    CHANNEL_ID: "0029VbDh9IP1noz6H4T13v1t",
    AUTO_READ: true,
    AUTO_STATUS_VIEW: true,
    AUTO_REACT: true,
    AUTO_TYPING: true,
    VERSION: "7.0.0 QR+PAIR PRO",
};

console.clear();
console.log(chalk.cyan(figlet.textSync(CONFIG.BOT_NAME, { font: 'Small' })));
console.log(chalk.yellow.bold(` BOT: ${CONFIG.BOT_NAME} | OWNER: +${CONFIG.OWNER_NUMBER}`));

const commands = new Map();
const commandFolder = path.join(__dirname, 'commands');
function loadCommands() {
    if (!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder, { recursive: true });
    const files = fs.readdirSync(commandFolder).filter(f => f.endsWith('.js'));
    for (let file of files) {
        try {
            delete require.cache[require.resolve(path.join(commandFolder, file))];
            commands.set(file.replace('.js','').toLowerCase(), require(path.join(commandFolder, file)));
            console.log(chalk.green(`  ✓ ${file}`));
        } catch {}
    }
    console.log(chalk.blue(`  Total Commands: ${commands.size}\n`));
}
loadCommands();

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: [CONFIG.BOT_NAME, "Chrome", "122.0.0.0"],
        markOnlineOnConnect: true,
    });
    currentSock = sock;
    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phoneNumber = CONFIG.PAIR_NUMBER;
        if (phoneNumber) {
            setTimeout(async () => {
                try {
                    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
                    console.log(chalk.yellow.bold(`\n  REQUESTING PAIR CODE FOR: +${cleanNumber}\n`));
                    let code = await sock.requestPairingCode(cleanNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    console.log(chalk.green.bold('\n  ╔═══════════════════════════════════╗'));
                    console.log(chalk.green.bold(`  ║  PAIR CODE: ${code.padEnd(25)}║`));
                    console.log(chalk.green.bold('  ╚═══════════════════════════════════╝\n'));
                } catch (e) {
                    console.log(chalk.red(`  Pair Code Error: ${e.message}`));
                }
            }, 3000);
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            try{
                let img = await QRCode.toDataURL(qr);
                qrCache = img;
                console.log(chalk.yellow.bold('\n  QR Generated for Website\n'));
                qrcodeTerminal.generate(qr, { small: true });
            }catch{}
        }
        if (connection === 'close') {
            const code = new boom.Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.red(`  Connection Closed: ${code}`));
            if (code !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
            else {
                console.log(chalk.red('  Logged Out - Deleting Session'));
                fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                setTimeout(startBot, 3000);
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`\n  ${CONFIG.BOT_NAME} CONNECTED ✅\n`));
            await delay(3000);
            try{
                let credsData = fs.readFileSync('./auth_info_baileys/creds.json','utf8');
                let finalSession = 'Hamza~' + Buffer.from(credsData).toString('base64');
                console.log(chalk.green('SESSION_ID: ' + finalSession.slice(0,100) + '...'));
                pairSessions['qr_user'] = finalSession;
                if(CONFIG.PAIR_NUMBER){
                  pairSessions[CONFIG.PAIR_NUMBER.replace(/[^0-9]/g,'')] = finalSession;
                }
                // Try to send session to self
                try{ await sock.sendMessage(sock.user.id, {text:`*👑 HAMZA-JUTT-MD SESSION*\n\n*SESSION_ID:*\n${finalSession}\n\n> Copy karke Heroku pe lagao`}); }catch{}
            }catch(e){}
            try { await sock.newsletterFollow(CONFIG.CHANNEL_ID); } catch {}
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.fromMe) return;
            if (mek.key.remoteJid === 'status@broadcast') {
                if (CONFIG.AUTO_STATUS_VIEW) await sock.readMessages([mek.key]);
                return;
            }
            if (CONFIG.AUTO_READ) await sock.readMessages([mek.key]);
            if (CONFIG.AUTO_TYPING) await sock.sendPresenceUpdate('composing', mek.key.remoteJid);
            const mtype = Object.keys(mek.message)[0];
            let body = '';
            if (mtype === 'conversation') body = mek.message.conversation;
            else if (mtype === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
            else if (mtype === 'imageMessage') body = mek.message.imageMessage.caption || '';
            else if (mtype === 'videoMessage') body = mek.message.videoMessage.caption || '';
            if (!body || !body.startsWith(CONFIG.PREFIX)) return;
            const args = body.slice(CONFIG.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            if (!commands.has(commandName)) return;
            if (CONFIG.AUTO_REACT) {
                try { await sock.sendMessage(mek.key.remoteJid, { react: { text: "⚡", key: mek.key } }); } catch {}
            }
            await commands.get(commandName)(sock, mek, args, CONFIG);
        } catch {}
    });
}
startBot();
