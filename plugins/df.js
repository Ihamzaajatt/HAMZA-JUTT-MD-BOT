import { tmpdir } from 'os';
import path, { join } from 'path';
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from 'fs';

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, text }) => {
  let defaultFile = 'testcode'; // Default file to delete (without .js extension)
  let fileName = text ? args[0] : defaultFile; // Use provided text or default to testcode
  let ar = Object.keys(plugins);
  let ar1 = ar.map(v => v.replace('.js', ''));

  // Check if the file exists in the plugins list or use default
  if (text && !ar1.includes(fileName)) {
    return m.reply(`*🗃️ NOT FOUND!*\n==================================\n\n${ar1.map(v => ' ' + v).join`\n`}`);
  }

  const file = join(__dirname, '../plugins/' + fileName + '.js');
  
  // Check if the file exists before attempting to delete
  if (!existsSync(file)) {
    return m.reply(`*🗃️ NOT FOUND!* File "plugins/${fileName}.js" does not exist.`);
  }

  unlinkSync(file);
  conn.reply(m.chat, `Successfully deleted "plugins/${fileName}.js"`, m);
};

handler.help = ['df [file]'];
handler.tags = ['owner'];
handler.command = /^(df)$/i;
handler.mods = true;

export default handler;
