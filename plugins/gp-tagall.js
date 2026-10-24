let handler = async (m, { conn, text, participants, isAdmin, isOwner, groupMetadata }) => {
    const botNumber = conn.user.jid;
    const users = participants.map(u => u.id).filter(v => v !== conn.user.jid);
    if (m.sender !== botNumber && !isOwner && !isAdmin) {
        m.reply("🛡️ This command is only for *Group Admins*");
        return;
    }

    const groupInfo = `┃💗⊹ 𝗚𝗥𝗢𝗨𝗣 : *${groupMetadata.subject}*\n\n`;
    const membersInfo = `┃💗⊹ 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 : *${participants.length}*${text ? `\n┃💗⊹ 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 : ${text}\n` : ''}`;
    const mentions = users.map(v => '┃💗⊹ @' + v.replace(/@.+/, '')).join`\n`;
    const footer = '\n└──✪ ⚡𝑷-𝑴𝑫⚡ ┃ ᴮᴼᵀ ✪──';

    const tagAllMessage = `${groupInfo}${membersInfo}\n\n┌───⊷ 𝗠𝗘𝗡𝗧𝗜𝗢𝗡𝗦\n${mentions}${footer}`;


    m.reply(tagAllMessage, null, { mentions: users });
};

handler.help = ['tagall'];
handler.tags = ['group'];
handler.command = ['tagall', 'invo'];
handler.admin = false; 
handler.group = true; 

export default handler;
