// import db from '../lib/database.js'

let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {

    let isEnable = /true|enable|(turn)?on|1/i.test(command)
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    let bot = global.db.data.settings[conn.user.jid] || {}
    let type = (args[0] || '').toLowerCase()
    let isAll = false, isUser = false

    switch (type) {
        
        // ═══════════════════════════════════════════════════════════
        // 👑 OWNER ONLY COMMANDS
        // ═══════════════════════════════════════════════════════════
        
        case 'public':
        case 'publico':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            global.opts['self'] = !isEnable
            break

        case 'pmblocker':
        case 'pbm':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.pmblocker = isEnable
            break

        case 'jadibot':
        case 'modojadibot':
        case 'serbot':
        case 'modoserbot':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.jadibotmd = isEnable
            break

        case 'reacts':
        case 'reaction':
        case 'autoreaction':
        case 'reactions':
        case 'autoreactions':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.autoreacts = isEnable
            break

        case 'oreact':
        case 'ownerreacts':
        case 'ownerreact':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.ownerreacts = isEnable
            break

        case 'statuslikes':
        case 'statuslike':
        case 'slikes':
        case 'likes':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.like = isEnable
            break

        case 'statusreply':
        case 'replystatus':
        case 'sreply':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.statusreply = isEnable
            break

        case 'sw':
        case 'sview':
        case 'statusview':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.statusview = isEnable
            break

        case 'alwaysonline':
        case 'online':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.alwaysonline = isEnable
            break

        case 'statussaver':
        case 'savestatus':
        case 'statussave':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.statussave = isEnable
            break

        case 'anticall':
        case 'nocall':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.anticalls = isEnable
            break

        case 'autoread':
        case 'read':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.autoread2 = isEnable
            global.opts['autoread'] = isEnable
            break

        case 'antiviewonce':
        case 'viewonce':
        case 'vv':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.viewonce = isEnable
            break

        case 'antipmspam':
        case 'pmspam':
        case 'spampm':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.pmspam = isEnable
            break

        case 'autobio':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.autoBio = isEnable
            break

        case 'restrict':
        case 'restringir':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.restrict = isEnable
            break

        case 'autotype':
        case 'type':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            chat.autotype = isEnable
            break

        case 'onlypv':
        case 'onlydm':
        case 'onlymd':
        case 'pconly':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.pconly = isEnable
            break

        case 'gponly':
        case 'onlygp':
        case 'grouponly':
        case 'gconly':
        case 'sologrupo':
            isAll = true
            if (!isOwner) {
                global.dfail('owner', m, conn)
                throw false
            }
            bot.gconly = isEnable
            break

        case 'antibotclone':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            bot.antibotclone = isEnable
            break

        // ═══════════════════════════════════════════════════════════
        // 👥 ADMIN COMMANDS (Group)
        // ═══════════════════════════════════════════════════════════

        case 'welcome':
            if (!m.isGroup) {
                if (!isOwner) {
                    global.dfail('group', m, conn)
                    throw false
                }
            } else if (!isAdmin) {
                global.dfail('admin', m, conn)
                throw false
            }
            chat.welcome = isEnable
            break

        case 'jarvis':
        case 'autotalk':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.jarvis = isEnable
            break

        case 'detect':
        case 'detector':
            if (!m.isGroup) {
                if (!isOwner) {
                    global.dfail('group', m, conn)
                    throw false
                }
            } else if (!isAdmin) {
                global.dfail('admin', m, conn)
                throw false
            }
            chat.detect = isEnable
            break

        case 'autosticker':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.autosticker = isEnable
            break

        case 'antispam':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiSpam = isEnable
            break

        case 'antidelete':
        case 'delete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.delete = !isEnable
            break

        case 'antitoxic':
        case 'antibadword':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiToxic = isEnable
            break

        case 'document':
        case 'documento':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
            }
            chat.useDocument = isEnable
            break

        case 'autostatus':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            chat.viewStory = isEnable
            break

        case 'testf':
        case 'testfeature':
        case 'tst':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.testf = isEnable
            break

        case 'antibot':
        case 'botanti':
        case 'nobot':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiBot = isEnable
            break

        case 'admin':
        case 'adminmode':
        case 'modeadmin':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.modoadmin = isEnable
            break

        case 'approve':
        case 'ap':
        case 'autoapprove':
        case 'approveauto':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.autoapprove = isEnable
            break

        case 'antifake':
        case 'fake':
        case 'blockusers':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antifake = isEnable
            break

        case 'antideletelinks':
        case 'deletelinks':
        case 'linksdelete':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antdeletelinks = isEnable
            break

        case 'nocmds':
        case 'anticommands':
        case 'blockcmds':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.anticmds = isEnable
            break

        case 'antilink2':
        case 'antilinkall':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiLink2 = isEnable
            break

        case 'antitiktok':
        case 'antitk':
        case 'antitik':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiTiktok = isEnable
            break

        case 'antiyoutube':
        case 'antiyt':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiYoutube = isEnable
            break

        case 'antitelegram':
        case 'antitl':
        case 'antitele':
        case 'antitg':
        case 'antitel':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiTelegram = isEnable
            break

        case 'antifacebook':
        case 'antifb':
        case 'antifbook':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiFacebook = isEnable
            break

        case 'antiinstagram':
        case 'antinstagram':
        case 'antiig':
        case 'antig':
        case 'antiinsta':
        case 'antinsta':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiInstagram = isEnable
            break

        case 'antitwitter':
        case 'antitw':
        case 'antitwit':
        case 'antitwter':
        case 'antitwiter':
        case 'antix':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiTwitter = isEnable
            break

        case 'antidiscord':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiDiscord = isEnable
            break

        case 'antithreads':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiThreads = isEnable
            break

        case 'antitwitch':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiTwitch = isEnable
            break

        case 'antiporn':
        case 'antinude':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiPorn = isEnable
            break

        case 'antibotclone':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.antiBotClone = isEnable
            break

        case 'nsfw':
        case '+18':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.nsfw = isEnable
            break

        case 'chatbot':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.chatbot = isEnable
            break

        case 'princechat':
        case 'princegpt':
            if (m.isGroup) {
                if (!(isAdmin || isOwner)) {
                    global.dfail('admin', m, conn)
                    throw false
                }
            }
            chat.princechat = isEnable
            break

        case 'antiviewonce2':
        case 'viewonce2':
        case 'vv2':
            isAll = true
            if (!isROwner) {
                global.dfail('rowner', m, conn)
                throw false
            }
            chat.viewOnce = isEnable
            break

        // ═══════════════════════════════════════════════════════════
        // 👤 USER COMMANDS
        // ═══════════════════════════════════════════════════════════

        case 'autolevelup':
            isUser = true
            user.autolevelup = isEnable
            break

        default:
            // Helper functions to get status
            const getBotStatus = (key) => bot[key] ? '🟢' : '🔴'
            const getChatStatus = (key) => chat[key] ? '🟢' : '🔴'
            const getGlobalStatus = (key) => global.opts[key] ? '🟢' : '🔴'

            if (!/[01]/.test(command)) {
                return m.reply(`
╔══════════════════════════════════════════════════════════╗
║           🤖 *BOT SETTINGS - TOGGLE FEATURES* 🤖          ║
╚══════════════════════════════════════════════════════════╝

📌 *How to Use:*
   Use *${usedPrefix}on* or *${usedPrefix}off* followed by feature name
   
   *Example:*
   ${usedPrefix}on welcome
   ${usedPrefix}off welcome

╔══════════════════════════════════════════════════════════╗
║  👑 *OWNER COMMANDS*                   ║
╠══════════════════════════════════════════════════════════╣

  ${getGlobalStatus('self') === '🟢' ? '🔴' : '🟢'} *public* - Switch bot between private/public mode
  ${getBotStatus('pmblocker')} *pmblocker* - Block spam messages in PM
  ${getBotStatus('jadibotmd')} *jadibot* - Allow others to use .jadibot command
  ${getBotStatus('autoreacts')} *autoreaction* - Auto-react to chats
  ${getBotStatus('ownerreacts')} *ownerreact* - Auto-react to bot messages
  ${getBotStatus('like')} *statuslikes* - Auto-like status updates
  ${getBotStatus('statussave')} *statussaver* - Auto-save status updates
  ${getBotStatus('statusreply')} *statusreply* - Auto-reply to status
  ${getBotStatus('statusview')} *statusview* - Auto-view status updates
  ${getBotStatus('alwaysonline')} *alwaysonline* - Show always online
  ${getBotStatus('autoread2')} *autoread* - Auto-read messages
  ${getBotStatus('viewonce')} *antiviewonce* - Anti-view once mode
  ${getBotStatus('pmspam')} *antipmspam* - Block PM spam/viruses
  ${getBotStatus('autoBio')} *autobio* - Auto-update bio
  ${getBotStatus('restrict')} *restrict* - Restrict features (antilink)
  ${getBotStatus('pconly')} *onlydm* - Bot works only in DMs
  ${getBotStatus('gconly')} *onlygp* - Bot works only in groups
  ${getChatStatus('autotype')} *autotype* - Show typing indicator
  ${getBotStatus('antibotclone')} *antibotclone* - Remove cloned bots
  ${getBotStatus('anticalls')} *anticall* - Block incoming calls

╔══════════════════════════════════════════════════════════╗
║  ⚡ *ADMIN COMMANDS*                 ║
╠══════════════════════════════════════════════════════════╣

  ${getChatStatus('welcome')} *welcome* - Welcome/goodbye messages
  ${getChatStatus('jarvis')} *jarvis* - Voice chatbot mode
  ${getChatStatus('detect')} *detect* - Show admin actions
  ${getChatStatus('autosticker')} *autosticker* - Auto-create stickers
  ${getChatStatus('antiSpam')} *antispam* - Block spammers
  ${getChatStatus('delete') === false ? '🟢' : '🔴'} *antidelete* - Anti-delete messages
  ${getChatStatus('antiToxic')} *antitoxic* - Block bad words
  ${getChatStatus('useDocument')} *document* - Send as document
  ${getChatStatus('testf')} *testfeature* - Test feature mode
  ${getChatStatus('antiBot')} *antibot* - Remove other bots
  ${getChatStatus('modoadmin')} *adminmode* - Only admins use bot
  ${getChatStatus('autoapprove')} *autoapprove* - Auto-approve requests
  ${getChatStatus('antifake')} *antifake* - Block fake numbers
  ${getChatStatus('antdeletelinks')} *antideletelinks* - Delete all links
  ${getChatStatus('anticmds')} *nocmds* - Block command misuse
  ${getChatStatus('antiLink2')} *antilinkall* - Block all links
  ${getChatStatus('antiTiktok')} *antitiktok* - Block TikTok links
  ${getChatStatus('antiYoutube')} *antiyoutube* - Block YouTube links
  ${getChatStatus('antiTelegram')} *antitelegram* - Block Telegram links
  ${getChatStatus('antiFacebook')} *antifacebook* - Block Facebook links
  ${getChatStatus('antiInstagram')} *antiinstagram* - Block Instagram links
  ${getChatStatus('antiTwitter')} *antitwitter* - Block Twitter links
  ${getChatStatus('antiThreads')} *antithreads* - Block Threads links
  ${getChatStatus('antiDiscord')} *antidiscord* - Block Discord links
  ${getChatStatus('antiTwitch')} *antitwitch* - Block Twitch links
  ${getChatStatus('antiPorn')} *antiporn* - Block NSFW content
  ${getChatStatus('antiBotClone')} *antibotclone* - Remove bot clones
  ${getChatStatus('nsfw')} *nsfw* - Allow NSFW content (+18)
  ${getChatStatus('chatbot')} *chatbot* - Chat with AI bot
  ${getChatStatus('princechat')} *princechat* - PrinceGPT chat mode
  ${getChatStatus('viewOnce')} *antiviewonce2* - Anti-view once (chat)

╔══════════════════════════════════════════════════════════╗
║  👤 *USER COMMANDS*                    ║
╠══════════════════════════════════════════════════════════╣

  ${user?.autolevelup ? '🟢' : '🔴'} *autolevelup* - Auto level up notifications

╚══════════════════════════════════════════════════════════╝

⚠️ *Note:* 🟢 = Currently ON | 🔴 = Currently OFF
                `)
            }
            throw false
    }

    // Success message
    const statusText = isEnable ? 'ENABLED ✅' : 'DISABLED ❌'
    const scopeText = isAll ? 'for this Bot' : isUser ? 'for you' : 'in this Group'

    m.reply(`
╔════════════════════════════════════╗
║     ✅ *SETTING UPDATED* ✅        ║
╠════════════════════════════════════╣
║  Feature: *${type.toUpperCase()}*     
║  Status: *${statusText}*            
║  Scope: *${scopeText}*              
╚════════════════════════════════════╝
    `.trim())
}

handler.help = ['en', 'dis'].map(v => v + 'able <option>')
handler.tags = ['config']
handler.command = /^(setting|settings|(en|dis)able|(turn)?o(n|ff)|[01])$/i

export default handler
