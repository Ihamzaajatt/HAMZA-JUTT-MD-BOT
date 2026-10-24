import fs from 'fs';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Sound
    let name = m.pushName || conn.getName(m.sender);
    let vn = "https://github.com/DASTAGHIR/PRINCEAI/raw/main/lib/source/mp3/Audio5.mp3";
    let url = "https://github.com/DASTAGHIR/PRINCEAI";
    let murl = "https://youtu.be/DibiLc17dh0?si=xp9bQ-_frEyDB1-i";
    let img = './lib/source/drd.jpg'; // Path to your local image

    let con = {
        key: { 
            fromMe: false, 
            participant: `${m.sender.split`@`[0]}@s.whatsapp.net`, 
            ...(m.chat ? { remoteJid: '923092668108@s.whatsapp.net' } : {}) 
        },
        message: { 
            contactMessage: { 
                displayName: `${name}`, 
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }
    };

    let doc = {
        audio: {
            url: vn
        },
        mimetype: 'audio/mp4',
        ptt: true,
        waveform: [100, 0, 100, 0, 100, 0, 100],
        fileName: "Prince",
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "🎗️ᴘʀɪɴᴄᴇ ᴍᴅ ɪs ᴀʟɪᴠᴇ ʀᴇᴄɪᴛᴇ ᴅᴀʀᴏᴏᴅ sʜᴀʀᴇᴇғ🎗️",
                body: "PRINCE BOT",
                thumbnail: fs.readFileSync(img), // Use the image as a buffer
                sourceUrl: 'https://chat.whatsapp.com/Jo5bmHMAlZpEIp75mKbwxP',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    };

    await conn.sendMessage(m.chat, doc);
};

handler.help = ['alive'];
handler.tags = ['main'];
handler.command = /^(alive)$/i;

export default handler;
