const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const { Boom } = require('@hapi/boom');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send(`HAMZA-JUTT-MD-BOT ONLINE - QR+PAIR ACTIVE - ${new Date()}`));
app.listen(PORT, () => console.log(chalk.green(`  Server Running on Port ${PORT}`)));

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
console.log(chalk.magenta(` PAIR MODE: ${CONFIG.PAIR_NUMBER ? `PAIR CODE FOR +${CONFIG.PAIR_NUMBER}` : "QR CODE MODE"}\n`));

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
                    console.log(chalk.green.bold('  ║  WhatsApp > Linked Devices >      ║'));
                    console.log(chalk.green.bold('  ║  Link with Phone Number           ║'));
                    console.log(chalk.green.bold('  ╚═══════════════════════════════════╝\n'));
                } catch (e) {
                    console.log(chalk.red(`  Pair Code Error: ${e.message}`));
                }
            }, 3000);
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr && !CONFIG.PAIR_NUMBER) {
            console.log(chalk.yellow.bold('\n  ┏━━━━━━━━━━━ QR CODE ━━━━━━━━━━━┓'));
            qrcode.generate(qr, { small: true });
            console.log(chalk.yellow.bold('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n'));
        }
        if (connection === 'close') {
            const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.red(`  Connection Closed: ${code}`));
            if (code !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
            else {
                console.log(chalk.red('  Logged Out - Deleting Session'));
                fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                setTimeout(startBot, 3000);
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold(`\n  ${CONFIG.BOT_NAME} CONNECTED ✅\n`));
            try { await sock.newsletterFollow(CONFIG.CHANNEL_ID); } catch { try { await sock.newsletterFollow(`${CONFIG.CHANNEL_ID}@newsletter`); } catch {} }
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
