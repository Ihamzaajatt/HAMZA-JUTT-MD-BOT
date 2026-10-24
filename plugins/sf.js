import fs from 'fs';

let handler = async (m, { text, usedPrefix, command }) => {
    if (!m.quoted.text) throw `Reply to the code message!`;
    let path = text ? `${text}` : 'plugins/testcode.js'; // Default path if no text provided
    await fs.writeFileSync(path, m.quoted.text);
    m.reply(`Stored in ${path}`);
};

handler.help = ['sf [path]'];
handler.tags = ['owner'];
handler.command = /^(sf|sp)$/i;
handler.rowner = true;

export default handler;
