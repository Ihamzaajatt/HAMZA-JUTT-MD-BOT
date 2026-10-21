const fs = require('fs');
const path = require('path');

// FIX: Agar SESSION_ID nahi hai (pairing site) to purana auth delete karo taake Couldn't link na aye
if (!process.env.SESSION_ID) {
  if (fs.existsSync('./auth_info_baileys')) fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
  if (fs.existsSync('./session')) fs.rmSync('./session', { recursive: true, force: true });
}

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
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
      input{padding:12px;width:85%;border-radius:10px;border:none;background:#222;color:#fff;text-align:center}
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
      <input id="num" placeholder="+923XXXXXXXXX">
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
        if(!n) return alert('Number dalo +923... format me');
        document.getElementById('code').innerText='Generating... 10 sec wait';
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
  if(qr
