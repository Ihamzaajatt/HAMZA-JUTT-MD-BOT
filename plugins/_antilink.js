const linkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.fromMe) return true;  // Ignore actions if the message is sent by the bot itself
    if (!m.isGroup) return false;

    const globalAntiLink = process.env.ANTI_LINK === 'true';
    const chat = global.db.data.chats[m.chat] || {};
    const isGroupLink = linkRegex.exec(m.text);

    // Check if the chat is banned and return true if it is
    if (chat.isBanned) return true;

    // If anti-link protection is enabled and the message contains a link
    if ((chat.antiLink || globalAntiLink) && isGroupLink && !isAdmin) {
        try {
            if (isBotAdmin) {
                // Generate the link to the current group
                const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
                
                // If the message contains the group's own link, ignore it
                if (m.text.includes(linkThisGroup)) return true;
            }

            // Notify the user about the rule violation
            await conn.reply(m.chat, `*⭕ʀᴜʟᴇs ᴠɪᴏʟᴀᴛɪᴏɴ ɢʀᴏᴜᴘ ʟɪɴᴋ ᴅᴇᴛᴇᴄᴛᴇᴅ ʙʏᴇ ʙʏᴇ 👋🏻*, *@${m.sender.split('@')[0]}*! ✌️ ${isBotAdmin ? '' : '\n *ᴍᴀᴋᴇ ᴍᴇ ᴛʜᴇ ᴀᴅᴍɪɴ ᴛᴏ ᴅᴇʟᴇᴛᴇ ᴛʜᴇ ʟɪɴᴋs ᴀɴᴅ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ ɢᴜʏ🙌🏻*'}`, null, { mentions: [m.sender] });

            // Delete the offending message
            await conn.sendMessage(m.chat, { delete: m.key });

            // If the bot is an admin, remove the user without banning the chat
            if (isBotAdmin && (chat.antiLink || globalAntiLink)) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    return true;
}
