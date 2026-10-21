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

// --- HAMZA JUTT HEROKU FIX START ---
try {
  if (process.env.SESSION_ID) {
    let sid = process.env.SESSION_ID.trim();
    if (sid.startsWith('HAMZA-')) {
      let filePath = './sessions/' + sid + '.json';
      if (fs.existsSync(filePath)) {
        fs.writeFileSync('./auth_info_baileys/creds.json', fs.readFileSync(filePath,'utf8'));
        console.log('Session Restored: ' + sid);
      } else {
        console.log('Session file not found locally for: ' + sid + ' | If on Heroku, paste full creds.json in SESSION_ID');
      }
    } else if (sid.startsWith('{')) {
      // Heroku pe full creds.json paste kiya hai to
      fs.writeFileSync('./auth_info_baileys/creds.json', sid);
      console.log('Session Restored From ENV JSON - HEROKU OK');
    }
  }
} catch(e){ console.log('Session Restore Error: '+e.message) }
// --- HEROKU FIX END ---

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
  if(d.qr){ document.getElementById('qrImg').src=d.qr; document
