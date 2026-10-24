let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) throw '*Only work in groups!*'
  if (!m.quoted) throw `*Reply With a image you want keep on group profile*`
  if (!/image/.test(m.quoted.mimetype)) throw '*Reply with an image!*'
  
  let image = await m.quoted.download()
  await conn.updateProfilePicture(m.chat, image)
  m.reply('*Group DP successfully changed!*')
}

handler.help = ['setgdp']
handler.tags = ['group']
handler.command = /^(setgdp|setppgc|setgcpp|ppgc|gcpp)$/i
handler.admin = true
handler.botAdmin = true

export default handler
