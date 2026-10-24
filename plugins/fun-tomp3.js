let handler = async (m, { conn }) => {
    try {
        if (!m.quoted || m.quoted.mtype !== 'videoMessage') {
            return m.reply("❌ Please reply to a *video* you want to convert to audio.");
        }

        await m.react('⏳'); // React with hourglass while processing
        let buffer = await m.quoted.download();

        await conn.sendMessage(m.chat, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: m });

        await m.react('✅'); // React with check mark when done
    } catch (e) {
        console.error(e);
        await m.reply("❌ An error occurred while converting video to audio.");
    }
};

handler.help = ['toaudio', 'tomp3'];
handler.tags = ['converter'];
handler.command = /^(toaudio|tomp3|mp3)$/i;
handler.limit = false;

export default handler;
