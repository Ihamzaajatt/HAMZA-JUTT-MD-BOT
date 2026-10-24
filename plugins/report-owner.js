let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw '⚠ *_Please enter the error you wish to report._*'
    if (text.length < 10) throw '⚠️ *_Please describe the error in detail, minimum 10 characters._*'
    if (text.length > 1000) throw '⚠️ *_Maximum 1000 characters allowed for error reporting._*'
    const teks = `╭───────────────────\n│⊷〘 *R E P O R T* 🤍 〙⊷\n├───────────────────\n│⁖🧡꙰  *Client:*\n│✏️ Wa.me/${m.sender.split`@`[0]}\n│\n│⁖💚꙰  *Message:*\n│📩 ${text}\n╰───────────────────`
    await conn.reply('923092668108@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, m, { mentions: conn.parseMention(teks) })
    m.reply('⚠️ *_The report has been sent to my creator. Any false report may ban you._*')
}
handler.help = ['report']
handler.tags = ['info']
handler.command = ['report','bug','error']

export default handler
