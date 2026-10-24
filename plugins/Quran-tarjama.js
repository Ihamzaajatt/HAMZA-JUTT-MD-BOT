import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) throw `*♥️😌 براہ کرم کوئی URL دیں، مثال:*\n\n*${usedPrefix + command }* https://data2.dawateislami.net/download/tilawat-e-quran/ur/mp3/2015/35322.mp3\n\n\n*🔘یا \`𝗾𝘂𝗿𝗮𝗻𝘂𝗿𝗹𝘀.\` لکھیں 114 سورتوں کی ترجمہ تفسیر کے ساتھ لنکس پھر ان لنکس کو کمانڈ ٹائپ کر کے اگے پیسٹ کر کے ڈاؤن لوڈ کریں جیسے مثال دیا گیا ہے* `

    let url = text.trim()
    m.reply("*⏳ براہِ کرم انتظار کریں، فائل ڈاؤنلوڈ ہو رہی ہے...*")

    let res = await fetch(url)
    if (!res.ok) throw await res.text()

    let size = +res.headers.get("content-length") // فائل کا سائز bytes میں
    let buffer = Buffer.from(await res.arrayBuffer())

    if (size > 60 * 1024 * 1024) {
      // 🔹 بڑی فائل → document کے طور پر بھیجیں
      await conn.sendMessage(m.chat, {
        document: buffer,
        mimetype: 'audio/mpeg',
        fileName: '♥️🥀𝗗𝗮𝗶𝗹𝘆-𝗤𝘂𝗿𝗮𝗻.𝗺𝗽𝟯📖🥀♥️',  // 👈 نام بدل دیا
      }, { quoted: m })
    } else {
      // 🔹 چھوٹی فائل → audio کے طور پر بھیجیں
      await conn.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: '♥️🥀𝗗𝗮𝗶𝗹𝘆-𝗤𝘂𝗿𝗮𝗻.𝗺𝗽𝟯📖🥀♥️',  // 👈 یہاں بھی بدل دیا
        ptt: false
      }, { quoted: m })
    }

  } catch (e) {
    m.reply(e)
  }
}

handler.help = ['dlquran <url>']
handler.tags = ['quran']
handler.command = /^(dlmp|dlquran)$/i

export default handler
