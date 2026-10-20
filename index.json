require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadContentFromMessage, jidNormalizedUser, Browsers, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const { OpenAI } = require('openai');

// Import Commands
const commands = {
    song: require('./commands/song'),
    video: require('./commands/video'),
    kick: require('./commands/kick'),
    private: require('./commands/private'),
    public: require('./commands/public'),
    owner: require('./commands/owner'),
    ai: require('./commands/ai'),
    antilink: require('./commands/antilink'),
    anticall: require('./commands/anticall'),
    status: require('./commands/status'),
    antidelete: require('./commands/antidelete'),
    ping: require('./commands/ping'),
    autoreacts: require('./commands/autoreacts'),
    hidetag: require('./commands/hidetag'),
    tagall: require('./commands/tagall'),
    setname: require('./commands/setname'),
    insta: require('./commands/insta'),
    tiktok: require('./commands/tiktok'),
    dp: require('./commands/dp'),
    vv: require('./commands/vv'),
    joke: require('./commands/joke'),
    meme: require('./commands/meme'),
    groupinfo: require('./commands/groupinfo'),
    gdrive: require('./commands/gdrive'),
    mf: require('./commands/mf'),
    translate: require('./commands/translate').handleTranslateCommand,
    autostatus: require('./commands/status'),
    apk: require('./commands/apk'),
    autoread: require('./commands/autoread').autoreadCommand,
    character: require('./commands/character'),
    emojimix: require('./commands/emojimix'),
    facebook: require('./commands/facebook'),
    hack: require('./commands/hack'),
    accept: require('./commands/accept'),
    kickoffline: require('./commands/kickoffline'),
    antistatus: require('./commands/antistatus')
};

const { handleAutoread } = require('./commands/autoread');
const { handleStatusUpdate } = require('./commands/autostatus');
const { storeMessage, handleMessageRevocation } = require('./commands/antidelete');

const app = express();
const server = http.createServer(app);

// Telegram Bot Setup - SECURED
const tgToken = process.env.TELEGRAM_TOKEN;
const tgBot = new TelegramBot(tgToken, { polling: true });

tgBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (text === '/start') {
        await tgBot.sendMessage(chatId, 
            "╔══════════════════════════╗\n" +
            "║  🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧 🌟  ║\n" +
            "╚══════════════════════════╝\n\n" +
            "        🤖 𝗚𝗘𝗧 𝗬𝗢𝗨𝗥 𝗕𝗢𝗧 𝗡𝗢𝗪\n\n" +
            "📱 𝗘𝗡𝗧𝗘𝗥 𝗬𝗢𝗨𝗥 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗡𝗨𝗠𝗕𝗘𝗥\n" +
            "┗━━ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 923262091250\n\n" +
            "✨ 𝗚𝗲𝘁 𝘆𝗼𝘂𝗿 𝗽𝗲𝗿𝘀𝗼𝗻𝗮𝗹 𝗯𝗼𝘁 𝗶𝗻 𝘀𝗲𝗰𝗼𝗻𝗱𝘀!\n\n" +
            "👑 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",
            { parse_mode: 'Markdown' }
        );
        return;
    }
    if (/^\d+$/.test(text)) {
        const userId = chatId.toString();
        if (!sessions[userId]) {
            sessions[userId] = new BotSession(userId);
        }
        if (!botData.statusSettings[userId]) {
            botData.statusSettings[userId] = { 
                autoStatus: false,
                autoSeen: false,
                autoLike: false,
                autoDownload: false,
                isPublic: false
            };
            saveBotData();
        }
        await tgBot.sendMessage(chatId, 
            "╔══════════════════════════╗\n" +
            "║  ⚡ 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗜𝗡𝗚 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘 ⚡  ║\n" +
            "╚══════════════════════════╝\n\n" +
            "📱 𝗡𝘂𝗺𝗯𝗲𝗿  ➜  " + text + "\n" +
            "🔄 𝗦𝘁𝗮𝘁𝘂𝘀   ➜  𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴...\n" +
            "⏳ 𝗧𝗶𝗺𝗲     ➜  𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁\n\n" +
            "🤖 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",
            { parse_mode: 'Markdown' }
        );
        sessions[userId].tgChatId = chatId;
        await sessions[userId].initialize(text);
    }
});

const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let openai = null;
if (process.env.OPENAI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1"
        });
    } catch (e) {}
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const AUTH_DIR = './auth_info';
const DATA_FILE = './data/bot_data.json';
fs.ensureDirSync(AUTH_DIR);
fs.ensureDirSync('./data');

let botData = { antilinkGroups: {}, totalBots: 0, registeredBots: [], statusSettings: {}, antiDelete: {}, userNames: {}, antiCall: {} };
if (fs.existsSync(DATA_FILE)) {
    try { botData = fs.readJsonSync(DATA_FILE); } catch (e) {}
}

function saveBotData() {
    fs.writeJsonSync(DATA_FILE, botData);
}

const sessions = {}; 
const userSockets = {}; 
const messageLogs = {}; 

async function loadExistingSessions() {
    try {
        const authDirs = await fs.readdir(AUTH_DIR);
        for (const userId of authDirs) {
            const authPath = path.join(AUTH_DIR, userId);
            const stats = await fs.stat(authPath);
            if (stats.isDirectory()) {
                const credsFile = path.join(authPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    console.log('📂 [System] Found existing session for: ' + userId + '. Initializing...');
                    if (!sessions[userId]) {
                        sessions[userId] = new BotSession(userId);
                        sessions[userId].initialize().catch(err => {
                            console.error('❌ [System] Failed to auto-initialize session ' + userId + ': ' + err.message);
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('❌ [System] Error loading existing sessions:', err.message);
    }
}

const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

// ═══════════════════════════════════════
// STYLISH TEXT TEMPLATES - HAMZA-JUTT-MD-BOT
// ═══════════════════════════════════════
const STYLISH = {
    connected: 
        "╔══════════════════════════╗\n" +
        "║ 🚀 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧 🚀 ║\n" +
        "╚══════════════════════════╝\n\n" +
        "        ✅ 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗\n" +
        "      ⚡ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬\n\n" +
        "🤖 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦   ➜  𝗢𝗡𝗟𝗜𝗡𝗘\n" +
        "⚡ 𝗦𝗬𝗦𝗧𝗘𝗠       ➜  𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗\n" +
        "🛡️ 𝗦𝗘𝗥𝗩𝗘𝗥      ➜  𝗥𝗨𝗡𝗡𝗜𝗡𝗚\n" +
        "🔥 𝗠𝗢𝗗𝗨𝗟𝗘𝗦     ➜  𝗔𝗖𝗧𝗜𝗩𝗘\n\n" +
        "📋 𝗧𝘆𝗽𝗲 .𝗺𝗲𝗻𝘂 𝘁𝗼 𝘃𝗶𝗲𝘄 𝗮𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n\n" +
        "👑 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",
  
    disconnected:
        "╔══════════════════════════╗\n" +
        "║ ⚠️ 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧 ⚠️ ║\n" +
        "╚══════════════════════════╝\n\n" +
        "        🔴 𝗗𝗜𝗦𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗\n" +
        "      🔄 𝗥𝗘𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗡𝗚...\n\n" +
        "🤖 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦   ➜  𝗢𝗙𝗙𝗟𝗜𝗡𝗘\n" +
        "⚡ 𝗦𝗬𝗦𝗧𝗘𝗠       ➜  𝗥𝗘𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚\n" +
        "🛡️ 𝗦𝗘𝗥𝗩𝗘𝗥      ➜  𝗔𝗖𝗧𝗜𝗩𝗘\n\n" +
        "⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝘄𝗵𝗶𝗹𝗲 𝘄𝗲 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁...\n\n" +
        "👑 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",

    keepAlive:
        "╔══════════════════════════╗\n" +
        "║ 🚀 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧 🚀 ║\n" +
        "╚══════════════════════════╝\n\n" +
        "        ✅ 𝗔𝗖𝗧𝗜𝗩𝗘 𝟮𝟰/𝟳\n" +
        "      ⚡ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗡𝗟𝗜𝗡𝗘\n\n" +
        "🤖 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦   ➜  𝗥𝗨𝗡𝗡𝗜𝗡𝗚\n" +
        "⚡ 𝗨𝗣𝗧𝗜𝗠𝗘       ➜  𝗔𝗖𝗧𝗜𝗩𝗘\n" +
        "🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬    ➜  𝗘𝗡𝗔𝗕𝗟𝗘𝗗\n" +
        "🔥 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ➜  𝗢𝗣𝗧𝗜𝗠𝗔𝗟\n\n" +
        "🌟 𝗬𝗼𝘂𝗿 𝗯𝗼𝘁 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝘀𝗺𝗼𝗼𝘁𝗵𝗹𝘆!\n\n" +
        "👑 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",

    pairingCode:
        "╔══════════════════════════╗\n" +
        "║  🔑 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘 🔑  ║\n" +
        "╚══════════════════════════╝\n\n" +
        "📱 𝗬𝗢𝗨𝗥 𝗖𝗢𝗗𝗘:\n" +
        "┗━━  [CODE]\n\n" +
        "⚡ 𝗘𝗻𝘁𝗲𝗿 𝘁𝗵𝗶𝘀 𝗰𝗼𝗱𝗲 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽\n" +
        "⏰ 𝗖𝗼𝗱𝗲 𝗲𝘅𝗽𝗶𝗿𝗲𝘀 𝗶𝗻 𝟲𝟬 𝘀𝗲𝗰𝗼𝗻𝗱𝘀\n\n" +
        "👑 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",

    antiCall:
        "╔══════════════════════════╗\n" +
        "║  🚫 𝗔𝗡𝗧𝗜-𝗖𝗔𝗟𝗟 𝗔𝗖𝗧𝗜𝗩𝗘 🚫  ║\n" +
        "╚══════════════════════════╝\n\n" +
        "⚠️ 𝗜 𝗱𝗼𝗻'𝘁 𝗮𝗰𝗰𝗲𝗽𝘁 𝗰𝗮𝗹𝗹𝘀!\n" +
        "💬 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗶𝗻𝘀𝘁𝗲𝗮𝗱.\n\n" +
        "📵 𝗖𝗮𝗹𝗹 𝗔𝘂𝘁𝗼-𝗥𝗲𝗷𝗲𝗰𝘁𝗲𝗱\n\n" +
        "🤖 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧\n" +
        "👑 𝗕𝗬 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧",

    sessionExpired:
        "╔══════════════════════════╗\n" +
        "║  🔴 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗘𝗫𝗣𝗜𝗥𝗘𝗗 🔴  ║\n" +
        "╚══════════════════════════╝\n\n" +
        "⚠️ 𝗬𝗼𝘂𝗿 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗵𝗮𝘀 𝗲𝘅𝗽𝗶𝗿𝗲𝗱\n" +
        "🔄 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗮𝗶𝗿 𝗮𝗴𝗮𝗶𝗻 𝘄𝗶𝘁𝗵 𝗻𝗲𝘄 𝗰𝗼𝗱𝗲\n\n" +
        "📱 𝗘𝗻𝘁𝗲𝗿 𝘆𝗼𝘂𝗿 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁\n\n" +
        "👑 𝗛𝗔𝗠𝗭𝗔-𝗝𝗨𝗧𝗧-𝗠𝗗-𝗕𝗢𝗧"
};

class BotSession {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.isConnected = false;
        this.aiEnabled = false; 
        this.autoReact = botData.statusSettings[userId]?.autoReact || false;
        this.isPublic = botData.statusSettings[userId]?.isPublic || false; 
        this.authPath = path.join(AUTH_DIR, userId);
        this.processedMessages = new Set();
        this.activeInterval = null;
        this.isInitializing = false;
        this.userChats = {}; 
        this.lastConnectMessageTime = null;
    }

    sendLog(message, type = 'info') {
        const logEntry = { timestamp: new Date().toLocaleTimeString(), message, type };
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('console', logEntry);
        console.log('[' + this.userId + '] ' + message);
    }

    sendConnectionStatus() {
        const socketId = userSockets[this.userId];
        if (socketId) {
            io.to(socketId).emit('connection-status', {
                connected: this.isConnected,
                user: this.userId
            });
        }
        io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
    }

    async getAIResponse(userJid, userMessage) {
        if (!openai) return "❌ AI is not configured.";
        try {
            const completion = await openai.chat.completions.create({
                model: process.env.AI_MODEL || "gpt-3.5-turbo",
                messages: [{ role: "system", content: "You are HAMZA-JUTT-MD-BOT created by HAMZA JUTT. Helpful assistant." }, { role: "user", content: userMessage }],
                max_tokens: 150
            });
            return completion.choices[0].message.content.trim();
        } catch (error) {
            return "❌ AI Error: " + error.message;
        }
    }

    startActiveCheck() {
        if (this.activeInterval) clearInterval(this.activeInterval);
        this.activeInterval = setInterval(async () => {
            if (this.isConnected && this.sock?.user) {
                try {
                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    await this.sock.sendMessage(botNumber, { text: STYLISH.keepAlive });
                    this.sendLog("✅ Keep-alive: Status message sent successfully", "success");
                } catch (e) {
                    this.sendLog("⚠️ Keep-alive failed: " + e.message, "error");
                }
            }
        }, 60 * 60 * 1000);
    }

    async initialize(pairingNumber = null) {
        if (this.isInitializing) {
            this.sendLog("⏳ Initialization already in progress...", "info");
            return;
        }
        this.isInitializing = true;
        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
            
            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: P({ level: 'fatal' }),
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: true,
                keepAliveIntervalMs: 30000,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                emitOwnEvents: true,
                retryRequestDelayMs: 5000,
                maxMsgRetryCount: 5,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                getMessage: async (key) => {
                    if (messageLogs[key.id]) {
                        return { conversation: messageLogs[key.id].text };
                    }
                    return { conversation: '🤖 HAMZA-JUTT-MD-BOT is active' };
                },
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(
                        message.buttonsMessage ||
                        message.templateMessage ||
                        message.listMessage
                    );
                    if (requiresPatch) {
                        return {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                },
                generateHighQualityLinkPreview: true,
            });

            if (pairingNumber && !state.creds.registered) {
                if (!this.sock.authState.creds.registered) {
                    await delay(3000);
                    try {
                        let code = await this.sock.requestPairingCode(pairingNumber);
                        code = code?.match(/.{1,4}/g)?.join("-") || code;
                        this.sendLog("🔑 Pairing Code Generated: " + code, 'success');
                        
                        if (this.tgChatId) {
                            const pairingMsg = STYLISH.pairingCode.replace('[CODE]', code);
                            await tgBot.sendMessage(this.tgChatId, pairingMsg, { parse_mode: 'Markdown' });
                        }

                        const socketId = userSockets[this.userId];
                        if (socketId) io.to(socketId).emit('pairing-code', code);
                    } catch (err) {
                        this.sendLog("❌ Pairing error: " + err.message, 'error');
                    }
                }
            }

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('call', async (calls) => {
                if (botData.antiCall[this.userId]) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            try {
                                await this.sock.rejectCall(call.id, call.from);
                                await this.sock.sendMessage(call.from, { text: STYLISH.antiCall });
                            } catch (e) {}
                        }
                    }
                }
            });

            this.sock.ev.on('messages.upsert', async (m) => {
                if (m.type !== 'notify') return;
                
                await Promise.all(m.messages.map(async (msg) => {
                    try {
                        const from = msg.key.remoteJid;
                        const isMe = msg.key.fromMe;
                        const isGroup = from.endsWith('@g.us');
                        const isStatus = from === 'status@broadcast';
                        
                        const messageContent = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message || msg.message;
                        if (!messageContent) return;
                        
                        let type = Object.keys(messageContent)[0];
                        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();

                        if (!isMe && !isStatus) {
                            await handleAutoread(this.sock, msg);
                            await storeMessage(msg);
                        }

                        if (msg.message?.protocolMessage?.type === 0) {
                            await handleMessageRevocation(this.sock, msg);
                            return;
                        }

                        const msgId = msg.key.id;
                        if (this.processedMessages.has(msgId)) return;
                        this.processedMessages.add(msgId);
                        if (this.processedMessages.size > 1000) this.processedMessages.delete(this.processedMessages.values().next().value);

                        if (!isStatus) {
                            let logEntry = { text, type };
                            messageLogs[msgId] = logEntry;
                        }

                        if (this.autoReact && !isMe && !isStatus) {
                            const emojis = ['❤️', '👍', '🔥', '👏', '😮', '😂', '🙌', '✨', '⭐', '✅', '🤖', '⚡', '🌟', '💯'];
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            try { await this.sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } }); } catch (e) {}
                        }

                        if (this.aiEnabled && !isMe && !isStatus && !isGroup && text && !text.startsWith('.')) {
                            try {
                                const aiResponse = await this.getAIResponse(from, text);
                                await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
                            } catch (e) {}
                        }

                        if (isStatus && !isMe) {
                            await handleStatusUpdate(this.sock, m, botData, this.userId);
                            return;
                        }

                        const botNumber = jidNormalizedUser(this.sock.user.id);
                        const sender = msg.key.participant || from;
                        const isOwner = isMe || sender.includes(botNumber.split('@')[0]);
                        let isAdmin = isOwner;
                        if (!isAdmin && isGroup) {
                            try {
                                const groupMetadata = await this.sock.groupMetadata(from);
                                const participant = groupMetadata.participants.find(p => p.id === sender);
                                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
                            } catch (e) { isAdmin = false; }
                        }
                        const cmd = text.toLowerCase();
                        const args = text.split(' ').slice(1);
                        const q = args.join(' ');

                        if (!this.isPublic && !isOwner) return;

                        if (cmd.startsWith('.')) {
                            const commandName = cmd.slice(1).split(' ')[0];
                            try {
                                switch (commandName) {
                                    case 'menu':
                                        const customName = botData.userNames[this.userId] || msg.pushName || 'User';
                                        const menuText = `╭━━━〔 ${toBold("🔥 HAMZA-JUTT-MD-BOT 🔥")} 〕━━━┈⊷
┃ 👤 ${toBold("User:")} ${customName}
┃ 🤖 ${toBold("Status:")} ${toBold("Online ✅")}
┃ ⚙️ ${toBold("Mode:")} ${this.isPublic ? toBold('Public 🌍') : toBold('Private 🔐')}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 ${toBold("👤 USER COMMANDS")} 〕━━━┈⊷
┃ ⚡ ${toBold(".autoreact [on/off]")}
┃ 🔗 ${toBold(".antilink [on/off/kick]")}
┃ 🛡️ ${toBold(".antidelete [on/off]")}
┃ 🤖 ${toBold(".ai [on/off]")}
┃ 📶 ${toBold(".ping")}
┃ 👑 ${toBold(".owner")}
┃ 🖼️ ${toBold(".dp")}
┃ 🎥 ${toBold(".vv")}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 ${toBold("🛠️ TOOLS")} 〕━━━┈⊷
┃ 📱 ${toBold(".apk (name)")}
┃ 📘 ${toBold(".facebook (url)")}
┃ 🎵 ${toBold(".tiktok (url)")}
┃ 📸 ${toBold(".insta (url)")}
┃ 🎧 ${toBold(".song (name)")}
┃ 🎬 ${toBold(".video (name)")}
┃ 😂 ${toBold(".joke")}
┃ 🤣 ${toBold(".meme")}
┃ 😍 ${toBold(".emojimix (e1+e2)")}
┃ 🎭 ${toBold(".character (mention)")}
┃ ☁️ ${toBold(".gdrive (url)")}
┃ 📂 ${toBold(".mf (url)")}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 ${toBold("👑 ADMIN PANEL")} 〕━━━┈⊷
┃ 🔒 ${toBold(".private")}
┃ 🌍 ${toBold(".public")}
┃ 👀 ${toBold(".autoread [on/off]")}
┃ 📢 ${toBold(".status [on/off/seen/like/download/system]")}
┃ 💻 ${toBold(".hack")}
┃ 🏷️ ${toBold(".hidetag")}
┃ 📣 ${toBold(".tagall")}
┃ ✏️ ${toBold(".setname (name)")}
┃ 📵 ${toBold(".anticall [on/off]")}
┃ 🚫 ${toBold(".kickoffline [on/off]")}
┃ 🛡️ ${toBold(".antistatus [on/off]")}
┃ 👥 ${toBold(".groupinfo")}
┃ ✅ ${toBold(".accept")}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 ${toBold("🔥 ACTIVE FEATURES")} 〕━━━┈⊷
┃ 🤖 ${toBold("AI:")} ${this.aiEnabled ? '✅' : '❌'}
┃ ⚡ ${toBold("Auto-React:")} ${this.autoReact ? '✅' : '❌'}
┃ 🛡️ ${toBold("Anti-Delete:")} ${botData.antiDelete[this.userId] ? '✅' : '❌'}
┃ 📢 ${toBold("Auto-Status:")} ${(botData.statusSettings[this.userId] && botData.statusSettings[this.userId].autoStatus) ? '✅' : '❌'}
╰━━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 ${toBold("👑 POWERED BY")} 〕━━━┈⊷
┃ 🚀 ${toBold("HAMZA-JUTT-MD-BOT")}
┃ 👤 ${toBold("HAMZA JUTT")}
╰━━━━━━━━━━━━━━━━━━┈⊷`;
                                        try {
                                            await this.sock.sendMessage(from, { image: { url: 'https://i.imgur.com/your-logo.png' }, caption: menuText });
                                        } catch (e) { await this.sock.sendMessage(from, { text: menuText }); }
                                        break;
                                    case 'ping': await commands.ping(this.sock, from, msg); break;
                                    case 'owner': await commands.owner(this.sock, from, msg); break;
                                    case 'ai': await commands.ai(this.sock, from, msg, isAdmin, this, args); break;
                                    case 'antilink': await commands.antilink(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                    case 'anticall': await commands.anticall(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                    case 'antidelete': await commands.antidelete(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                    case 'status': 
                                    case 'autostatus': await commands.autostatus(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                    case 'autoreacts': await commands.autoreacts(this.sock, from, msg, isAdmin, this, args); break;
                                    case 'kick': await commands.kick(this.sock, from, msg, isAdmin); break;
                                    case 'private': 
                                        await commands.private(this.sock, from, msg, isAdmin, this); 
                                        if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                        botData.statusSettings[this.userId].isPublic = false;
                                        saveBotData();
                                        break;
                                    case 'public': 
                                        await commands.public(this.sock, from, msg, isAdmin, this); 
                                        if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                        botData.statusSettings[this.userId].isPublic = true;
                                        saveBotData();
                                        break;
                                    case 'hidetag': await commands.hidetag(this.sock, from, msg, isAdmin, q); break;
                                    case 'tagall': await commands.tagall(this.sock, from, msg, isAdmin, q); break;
                                    case 'setname': await commands.setname(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, q); break;
                                    case 'insta': case 'ig': await commands.insta(this.sock, from, msg, q); break;
                                    case 'tiktok': await commands.tiktok(this.sock, from, msg, q); break;
                                    case 'song': await commands.song(this.sock, from, msg); break;
                                    case 'video': await commands.video(this.sock, from, msg); break;
                                    case 'joke': await commands.joke(this.sock, from, msg); break;
                                    case 'meme': await commands.meme(this.sock, from, msg); break;
                                    case 'vv': await commands.vv(this.sock, from, msg); break;
                                    case 'dp': await commands.dp(this.sock, from, msg); break;
                                    case 'groupinfo': await commands.groupinfo(this.sock, from, msg); break;
                                    case 'apk': await commands.apk(this.sock, from, msg); break;
                                    case 'autoread': await commands.autoread(this.sock, from, msg); break;
                                    case 'character': await commands.character(this.sock, from, msg); break;
                                    case 'emojimix': await commands.emojimix(this.sock, from, msg); break;
                                    case 'facebook': case 'fb': await commands.facebook(this.sock, from, msg); break;
                                    case 'hack': await commands.hack(this.sock, from, msg); break;
                                    case 'accept': await commands.accept(this.sock, from, msg); break;
                                    case 'kickoffline': await commands.kickoffline(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                    case 'antistatus': await commands.antistatus(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                    case 'gdrive': await commands.gdrive(this.sock, from, msg, q); break;
                                    case 'mf': await commands.mf(this.sock, from, msg, q); break;
                                    case 'translate': case 'trt': await commands.translate(this.sock, from, msg); break;
                                }
                            } catch(e) { console.log("Command Error:", e.message); }
                        }
                    } catch (err) { console.log("Message Error:", err.message); }
                }));
            });
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;
                if (connection === 'close') {
                    this.isConnected = false;
                    this.sendConnectionStatus();
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    if (shouldReconnect) {
                        this.sendLog("🔄 Reconnecting...", "info");
                        setTimeout(() => this.initialize(), 3000);
                    } else {
                        this.sendLog("🔴 Session Logged Out - " + STYLISH.sessionExpired, "error");
                    }
                } else if (connection === 'open') {
                    this.isConnected = true;
                    this.isInitializing = false;
                    this.sendConnectionStatus();
                    this.startActiveCheck();
                    const now = Date.now();
                    if (!this.lastConnectMessageTime || (now - this.lastConnectMessageTime > 10*60*1000)) {
                        try {
                            const botNumber = jidNormalizedUser(this.sock.user.id);
                            await this.sock.sendMessage(botNumber, { text: STYLISH.connected });
                            this.lastConnectMessageTime = now;
                        } catch(e) {}
                    }
                    this.sendLog("✅ HAMZA-JUTT-MD-BOT Connected Successfully!", "success");
                    if (this.tgChatId) {
                        await tgBot.sendMessage(this.tgChatId, STYLISH.connected, { parse_mode: 'Markdown' });
                    }
                }
            });

        } catch (err) {
            this.isInitializing = false;
            this.sendLog("❌ Initialization Error: " + err.message, "error");
            console.error(err);
        }
    }
}

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        userSockets[userId] = socket.id;
        console.log(`🔌 Socket registered for ${userId}`);
    });
    socket.on('disconnect', () => {
        for (const [uid, sid] of Object.entries(userSockets)) {
            if (sid === socket.id) delete userSockets[uid];
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`🚀 HAMZA-JUTT-MD-BOT Server running on port ${PORT}`);
    console.log(`👑 Powered by HAMZA JUTT`);
    await loadExistingSessions();
});

process.on('uncaughtException', (err) => console.log('Uncaught:', err.message));
process.on('unhandledRejection', (err) => console.log('Unhandled:', err.message));
