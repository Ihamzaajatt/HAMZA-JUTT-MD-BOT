var handler = async (m, { conn, participants, usedPrefix, command }) => {
    if (!m.mentionedJid[0] && !m.quoted) {
        return conn.reply(m.chat, `You must mention a user to kick them from the group.`, m);
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net';
    //const nn = conn.getName(m.sender);

    if (user === conn.user.jid) {
        return conn.reply(m.chat, `I cannot remove the bot from the group.`, m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, `I cannot remove the group owner.`, m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, `I cannot remove the bot owner.`, m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    //conn.reply(`${suitag}@s.whatsapp.net`, `An Admin Just Removed a User from the Group:\n> ${groupMetadata.subject}.`, m, rcanal, );
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = ['kick', 'remove', 'k'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
