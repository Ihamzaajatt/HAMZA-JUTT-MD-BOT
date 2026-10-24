const handler = async (m, { conn, text, usedPrefix, command }) => {
  const settings = global.db.data.settings[conn.user.jid] || {};
  if (!('prefix' in settings)) {
    settings.prefix = opts['prefix'] || '*/i!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@'; // Default prefixes
  }
  const currentPrefix = settings.prefix || 'none';

  if (!text) {
    throw `Usage: ${usedPrefix + command} [prefixes] to set\n${usedPrefix + command} none to disable prefix\n${usedPrefix + command} del [prefix] to remove one.\nExample: ${usedPrefix + command} 🌟\n${usedPrefix + command} del /\n\nCurrent prefixes: [ ${currentPrefix} ]`;
  }

  const args = text.trim().split(' ');
  const action = args[0].toLowerCase();

  if (action === 'none') {
    if (!settings.prefix) {
      await m.reply(`⚠️ The bot is already configured to work without a prefix.`);
      return;
    }
    settings.prefix = null; // No prefix
    global.db.data.settings[conn.user.jid] = settings;
    await m.reply(`✅ All prefixes have been removed. Commands will now work without a prefix.`);
  } else if (action === 'del') {
    const prefixToDelete = args[1];
    if (!prefixToDelete) {
      throw `⚠️ Please specify the prefix to remove. Example: ${usedPrefix + command} del /`;
    }
    if (!settings.prefix) {
      await m.reply(`⚠️ There are no prefixes configured to delete.`);
      return;
    }
    if (!settings.prefix.includes(prefixToDelete)) {
      await m.reply(`⚠️ The prefix [ ${prefixToDelete} ] is not in the current list.`);
      return;
    }
    // Remove only the first occurrence (safe for single-char or multi-char)
    settings.prefix = settings.prefix.replace(prefixToDelete, '');
    if (settings.prefix === '') settings.prefix = null;
    global.db.data.settings[conn.user.jid] = settings;
    const updatedPrefix = settings.prefix || 'none';
    await m.reply(`✅ The prefix [ ${prefixToDelete} ] has been removed. Current prefixes: [ ${updatedPrefix} ]`);
  } else {
    const newPrefix = text;
    if (settings.prefix === newPrefix) {
      await m.reply(`⚠️ The prefix [ ${newPrefix} ] is already set.`);
      return;
    }
    settings.prefix = newPrefix;
    global.db.data.settings[conn.user.jid] = settings;
    await m.reply(`✅ Bot prefixes have been set to: [ ${newPrefix} ]`);
  }
};

handler.help = ['setprefix'].map((v) => v + ' [prefixes | none | del prefix]');
handler.tags = ['owner'];
handler.command = /^(setprefix|prefix)$/i;
handler.owner = true;

export default handler;
