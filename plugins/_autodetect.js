let WAMessageStubType = (await import('@whiskeysockets/baileys')).default;
import fetch from 'node-fetch';
import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let handler = (m) => m;
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return;

    global.fkontak = { 
        "key": { 
            "participants": "0@s.whatsapp.net", 
            "remoteJid": "status@broadcast", 
            "fromMe": false, 
            "id": "Halo" 
        }, 
        "message": { 
            "contactMessage": { 
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
            }
        }, 
        "participant": "0@s.whatsapp.net" 
    };

    let user = `@${m.sender.split`@`[0]}`;
    const groupName = (await conn.groupMetadata(m.chat)).subject;
    const groupAdmins = participants.filter((p) => p.admin);

    let pp = await conn.profilePictureUrl(conn.user.jid).catch((_) => imagen1);
    const img = await (await fetch(pp)).buffer();
    const chat = global.db.data.chats[m.chat];
    const mentionsString = [m.sender, m.messageStubParameters[0], ...groupAdmins.map((v) => v.id)];
    const mentionsContentM = [m.sender, m.messageStubParameters[0]];

    if (chat.detect && m.messageStubType == 25) {
        await this.sendMessage(
            m.chat,
            {
                text: `🚩 *Now ${m.messageStubParameters[0] == 'on' ? 'only admins' : 'everyone'} can edit the group information*`,
                mentions: [m.sender],
            },
            {
                quoted: fkontak,
                ephemeralExpiration: 24 * 60 * 100,
                disappearingMessagesInChat: 24 * 60 * 100,
            }
        );
    } else if (chat.detect && m.messageStubType == 26) {
        await this.sendMessage(
            m.chat,
            {
                text: `🚩 *The group has been ${m.messageStubParameters[0] == 'on' ? 'closed' : 'opened'}*\n\n${m.messageStubParameters[0] == 'on' ? 'only admins' : 'everyone'} can send messages`,
                mentions: [m.sender],
            },
            {
                quoted: fkontak,
                ephemeralExpiration: 24 * 60 * 100,
                disappearingMessagesInChat: 24 * 60 * 100,
            }
        );
    } else if (chat.detect && m.messageStubType == 28) {
        let txt3 = `🚩 *Member Removed*\n\n`;
        txt3 += `Name: @${m.messageStubParameters[0].split`@`[0]}\n`;
        txt3 += `Removed by: @${m.sender.split`@`[0]}`;

        await conn.sendMessage(m.chat, {
            text: txt3,
            mentions: [...txt3.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
            contextInfo: {
                mentionedJid: [...txt3.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
                externalAdReply: {
                    showAdAttribution: true,
                    containsAutoReply: true,
                    renderLargerThumbnail: false,
                    title: global.packname,
                    body: dev,
                    containsAutoReply: true,
                    mediaType: 1,
                    thumbnail: img,
                    mediaUrl: 'https://chat.whatsapp.com/Jo5bmHMAlZpEIp75mKbwxP',
                    sourceUrl: 'https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11',
                },
            },
        });
    } else if (chat.detect && m.messageStubType == 29) {
        let txt1 = `🚩 *New Admin*\n\n`;
        txt1 += `Name: @${m.messageStubParameters[0].split`@`[0]}\n`;
        txt1 += `Promoted by: @${m.sender.split`@`[0]}`;

        await conn.sendMessage(m.chat, {
            text: txt1,
            mentions: [...txt1.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
            contextInfo: {
                mentionedJid: [...txt1.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
                externalAdReply: {
                    showAdAttribution: true,
                    containsAutoReply: true,
                    renderLargerThumbnail: false,
                    title: global.packname,
                    body: 'Prince',
                    containsAutoReply: true,
                    mediaType: 1,
                    thumbnail: img,
                    mediaUrl: 'https://chat.whatsapp.com/Jo5bmHMAlZpEIp75mKbwxP',
                    sourceUrl: 'https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11',
                },
            },
        });
    } else if (chat.detect && m.messageStubType == 30) {
        let txt2 = `🚩 *Admin Demoted*\n\n`;
        txt2 += `Name: @${m.messageStubParameters[0].split`@`[0]}\n`;
        txt2 += `Demoted by: @${m.sender.split`@`[0]}`;

        await conn.sendMessage(m.chat, {
            text: txt2,
            mentions: [...txt2.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
            contextInfo: {
                mentionedJid: [...txt2.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'),
                externalAdReply: {
                    showAdAttribution: true,
                    containsAutoReply: true,
                    renderLargerThumbnail: false,
                    title: global.packname,
                    body: 'Prince',
                    containsAutoReply: true,
                    mediaType: 1,
                    thumbnail: img,
                    mediaUrl: 'https://chat.whatsapp.com/Jo5bmHMAlZpEIp75mKbwxP',
                    sourceUrl: 'https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11',
                },
            },
        });
    } else {
        if (m.messageStubType == 2) return;
        console.log({
            messageStubType: m.messageStubType,
            messageStubParameters: m.messageStubParameters,
            type: WAMessageStubType[m.messageStubType],
            chatDetect: chat.detect,
        });
    }
};

export default handler;
