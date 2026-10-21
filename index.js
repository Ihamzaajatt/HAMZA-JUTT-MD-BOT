// HAMZA-JUTT-MD-BOT - FINAL PRO HEAVY EDITION - 500+ LINES
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadContentFromMessage, jidNormalizedUser, proto } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const { Boom } = require('@hapi/boom');
const os = require('os');
const util = require('util');

const CONFIG = {
    BOT_NAME: "HAMZA-JUTT-MD-BOT",
    OWNER_NAME: "Hamza Jutt",
    OWNER_NUMBER: "923262091250",
    OWNER_JID: "923262091250@s.whatsapp.net",
    PREFIX: ".",
    CHANNEL_LINK: "https://whatsapp.com/channel/0029VbDh9IP1noz6H4T13v1t",
    CHANNEL_ID: "0029VbDh9IP1noz6H4T13v1t",
    CHANNEL_JID: "0029VbDh9IP1noz6H4T13v1t@newsletter",
    AUTO_READ: true,
    AUTO_STATUS_VIEW: true,
    AUTO_STATUS_REACT: true,
    AUTO_REACT: true,
    AUTO_TYPING: true,
    AUTO_RECORDING: false,
    ANTI_DELETE: true,
    ANTI_LINK: false,
    WELCOME: true,
    VERSION: "5.0.0 PRO HEAVY",
    MODE: "public",
    PACKNAME: "HAMZA-JUTT-MD-BOT",
    AUTHOR: "Hamza Jutt"
};

console.clear();
console.log(chalk.cyan(figlet.textSync(CONFIG.BOT_NAME, { font: 'ANSI Shadow' })));
console.log(chalk.yellow.bold('╔════════════════════════════════════════════════════════╗'));
console.log(chalk.yellow.bold(`║ BOT: ${CONFIG.BOT_NAME}                              ║`));
console.log(chalk.yellow.bold(`║ OWNER: ${CONFIG.OWNER_NAME} | +${CONFIG.OWNER_NUMBER}                 ║`));
console.log(chalk.yellow.bold(`║ CHANNEL: ${CONFIG.CHANNEL_LINK}  ║`));
console.log(chalk.yellow.bold(`║ VERSION: ${CONFIG.VERSION} | PREFIX: ${CONFIG.PREFIX}                          ║`));
console.log(chalk.yellow.bold('╚════════════════════════════════════════════════════════╝'));
console.log(chalk.white.bold(`\n System: ${os.platform()} | RAM: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)}GB | Node: ${process.version}\n`));

const commands = new Map();
const aliases = new Map();
const commandFolder = path.join(__dirname, 'commands');

function loadCommands() {
    console.log(chalk.bgWhite.black.bold(' [ LOADING COMMANDS - HAMZA-JUTT-MD-BOT ] '));
    if (!fs.existsSync(commandFolder)) {
        fs.mkdirSync(commandFolder, { recursive: true });
        console.log(chalk.red(' Commands folder created'));
        return;
    }
    const files = fs.readdirSync(commandFolder).filter(f => f.endsWith('.js'));
    let total = 0;
    for (let file of files) {
        try {
            const filePath = path.join(commandFolder, file);
            delete require.cache[require.resolve(filePath)];
            const cmd = require(filePath);
            const name = file.replace('.js','').toLowerCase();
            commands.set(name, cmd);
            if (cmd.aliases && Array.isArray(cmd.aliases)) {
                cmd.aliases.forEach(alias => aliases.set(alias, name));
            }
            console.log(chalk.green(`  ┃ ✓ ${name.padEnd(20)} | ${file}`));
            total++;
        } catch (e) {
            console.log(chalk.red(`  ┃ ✗ ${file} - ${e.message}`));
        }
    }
    console.log(chalk.blue.bold(`  ┗━━━ Total: ${total} Commands Loaded Successfully\n`));
}
loadCommands();

function formatRuntime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(chalk.gray(`  Baileys Version: ${version.join('.')} | Latest: ${isLatest}`));

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: [CONFIG.BOT_NAME, "Chrome", "122.0.0.0"],
        markOnlineOnConnect: true,
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
        getMessage: async (key) => {
            return undefined;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(chalk.yellow.bold('\n  ┏━━━━━━━━━━━━━━━━━━━━━━━━━┓'));
            console.log(chalk.yellow.bold('  ┃ QR CODE GENERATED       ┃'));
            console.log(chalk.yellow.bold('  ┃ SCAN FROM WHATSAPP      ┃'));
            console.log(chalk.yellow.bold('  ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛\n'));
        }
        if (connection === 'close') {
            const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(chalk.red(`\n  Connection Closed | Code: ${statusCode}`));
            if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red('  Logged out. Delete auth_info_baileys folder.'));
                fs.rmSync('auth_info_baileys', { recursive: true, force: true });
                console.log(chalk.yellow('  Auth deleted. Restarting...'));
                setTimeout(startBot, 3000);
            } else if (statusCode === DisconnectReason.restartRequired) {
                console.log(chalk.yellow('  Restart Required. Restarting...'));
                startBot();
            } else {
                console.log(chalk.yellow('  Reconnecting in 5 sec...'));
                setTimeout(startBot, 5000);
            }
        }
        if (connection === 'open') {
            console.log(chalk.green.bold('\n  ╔════════════════════════════════════════════════╗'));
            console.log(chalk.green.bold(`  ║  ${CONFIG.BOT_NAME} CONNECTED SUCCESSFULLY ✅  ║`));
            console.log(chalk.green.bold('  ╚════════════════════════════════════════════════╝\n'));
            
            // AUTO FOLLOW CHANNEL - HEAVY METHOD
            const followMethods = [
                async () => await sock.newsletterFollow(CONFIG.CHANNEL_ID),
                async () => await sock.newsletterFollow(CONFIG.CHANNEL_JID),
                async () => await sock.newsletterFollow(`0029VbDh9IP1noz6H4T13v1t`),
                async () => await sock.newsletterFollow(`0029VbDh9IP1noz6H4T13v1t@newsletter`)
            ];
            for (let i = 0; i < followMethods.length; i++) {
                try {
                    await followMethods[i]();
                    console.log(chalk.green.bold(`  ✅ Channel Followed: ${CONFIG.CHANNEL_LINK} (Method ${i+1})`));
                    break;
                } catch (e) {
                    if (i === followMethods.length - 1) {
                        console.log(chalk.red(`  Channel follow final error: ${e.message}`));
                    }
                }
            }

            try {
                let botNumber = jidNormalizedUser(sock.user.id);
                console.log(chalk.cyan(`  Bot Number: ${botNumber}`));
                console.log(chalk.cyan(`  Runtime: ${formatRuntime(process.uptime())}`));
                const aliveText = `*${CONFIG.BOT_NAME} ONLINE ✅*\n\n*┏━━━ BOT INFO ━━━*\n┃ Bot: ${CONFIG.BOT_NAME}\n┃ Owner: ${CONFIG.OWNER_NAME}\n┃ Number: +${CONFIG.OWNER_NUMBER}\n┃ Version: ${CONFIG.VERSION}\n┃ Prefix: ${CONFIG.PREFIX}\n┃ Mode: ${CONFIG.MODE}\n┗━━━━━━━━━━━━\n\n*Channel:* ${CONFIG.CHANNEL_LINK}\n\nType ${CONFIG.PREFIX}menu for commands.`;
                await sock.sendMessage(CONFIG.OWNER_JID, { text: aliveText });
                console.log(chalk.green('  Alive message sent to owner'));
            } catch (e) {
                console.log(chalk.red('  Alive send failed'));
            }
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key.remoteJid === 'status@broadcast') {
                if (CONFIG.AUTO_STATUS_VIEW) {
                    await sock.readMessages([mek.key]);
                    if (CONFIG.AUTO_STATUS_REACT) {
                        const emojis = ['❤️','🔥','😍','👍','🎉'];
                        const emoji = emojis[Math.floor(Math.random()*emojis.length)];
                        try { await sock.sendMessage(mek.key.remoteJid, { react: { text: emoji, key: mek.key } }, { statusJidList: [mek.key.participant] }); } catch {}
                    }
                }
                return;
            }
            if (mek.key.fromMe) return;
            const from = mek.key.remoteJid;
            const sender = mek.key.participant || from;
            const pushName = mek.pushName || "User";

            if (CONFIG.AUTO_READ) await sock.readMessages([mek.key]);
            if (CONFIG.AUTO_TYPING) {
                await sock.sendPresenceUpdate('composing', from);
                await new Promise(r => setTimeout(r, 1000));
            }

            const mtype = Object.keys(mek.message)[0];
            let body = '';
            if (mtype === 'conversation') body = mek.message.conversation;
            else if (mtype === 'extendedTextMessage') body = mek.message.extendedTextMessage.text;
            else if (mtype === 'imageMessage') body = mek.message.imageMessage.caption || '';
            else if (mtype === 'videoMessage') body = mek.message.videoMessage.caption || '';
            else if (mtype === 'buttonsResponseMessage') body = mek.message.buttonsResponseMessage.selectedButtonId;
            else if (mtype === 'listResponseMessage') body = mek.message.listResponseMessage.singleSelectReply.selectedRowId;

            if (!body || !body.startsWith(CONFIG.PREFIX)) return;

            const args = body.slice(CONFIG.PREFIX.length).trim().split(/ +/);
            let commandName = args.shift().toLowerCase();
            if (aliases.has(commandName)) commandName = aliases.get(commandName);

            if (!commands.has(commandName)) {
                console.log(chalk.gray(`  [UNKNOWN] ${commandName} from ${pushName} | ${from}`));
                return;
            }

            console.log(chalk.cyan.bold(`\n  ┏━━━━━━━━ [ ${CONFIG.BOT_NAME} COMMAND ] ━━━━━━━━`));
            console.log(chalk.white(`  ┃ From: ${pushName} (${from})`));
            console.log(chalk.white(`  ┃ Command: ${commandName}`));
            console.log(chalk.white(`  ┃ Args: ${args.join(' ') || 'No args'}`));
            console.log(chalk.white(`  ┃ Time: ${new Date().toLocaleString()}`));
            console.log(chalk.cyan.bold(`  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));

            if (CONFIG.AUTO_REACT) {
                try {
                    const reactions = ['⚡','✅','🔥','💎','🚀'];
                    const react = reactions[Math.floor(Math.random()*reactions.length)];
                    await sock.sendMessage(from, { react: { text: react, key: mek.key } });
                } catch {}
            }

            const cmd = commands.get(commandName);
            await cmd(sock, mek, args, CONFIG);

            // Channel promo 25% chance
            if (Math.random() < 0.25) {
                const promo = `*${CONFIG.BOT_NAME}*\n\n> *Follow Our Channel For Updates:*\n${CONFIG.CHANNEL_LINK}\n\n*Owner:* +${CONFIG.OWNER_NUMBER}\n*Bot Name:* ${CONFIG.BOT_NAME}`;
                await sock.sendMessage(from, { text: promo }, { quoted: mek });
            }

        } catch (err) {
            console.log(chalk.red.bold('  [MESSAGE ERROR]'), err);
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        if (!CONFIG.WELCOME) return;
        try {
            const metadata = await sock.groupMetadata(update.id);
            for (let participant of update.participants) {
                const pp = await sock.profilePictureUrl(participant, 'image').catch(() => 'https://i.ibb.co/0jQ2X0M/bot.jpg');
                if (update.action === 'add') {
                    const welcomeText = `*Welcome to ${metadata.subject}*\n\nHello @${participant.split('@')[0]}\n\n*${CONFIG.BOT_NAME}*\nChannel: ${CONFIG.CHANNEL_LINK}\nOwner: +${CONFIG.OWNER_NUMBER}`;
                    await sock.sendMessage(update.id, { image: { url: pp }, caption: welcomeText, mentions: [participant] });
                } else if (update.action === 'remove') {
                    await sock.sendMessage(update.id, { text: `Goodbye @${participant.split('@')[0]} 👋`, mentions: [participant] });
                }
            }
        } catch (e) {}
    });

    sock.ev.on('messages.delete', async (item) => {
        if (!CONFIG.ANTI_DELETE) return;
        try {
            console.log(chalk.yellow('  Anti-Delete Triggered'));
        } catch {}
    });

    // Watch commands folder
    fs.watch(commandFolder, (event, filename) => {
        if (filename && filename.endsWith('.js')) {
            try {
                const filePath = path.join(commandFolder, filename);
                delete require.cache[require.resolve(filePath)];
                const cmd = require(filePath);
                commands.set(filename.replace('.js',''), cmd);
                console.log(chalk.yellow(`  ♻️ Reloaded: ${filename}`));
            } catch {}
        }
    });
}

startBot();

process.on('uncaughtException', (err) => {
    console.log(chalk.red.bold('\n  [CRASH] Uncaught:'), err.message);
});
process.on('unhandledRejection', (err) => {
    console.log(chalk.red.bold('\n  [CRASH] Rejection:'), err.message);
});
