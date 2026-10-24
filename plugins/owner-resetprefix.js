const handler = async (m, { conn }) => {
  const settings = global.db.data.settings[conn.user.jid] || {};

  // Set only '.' as prefix
  settings.prefix = '.';
  global.db.data.settings[conn.user.jid] = settings;

  await m.reply(`✅ Bot prefix has been reset. Commands will now work only with: [ . ]`);
};

handler.help = ['resetprefix'];
handler.tags = ['owner'];
handler.command = /^resetprefix$/i;
handler.owner = true;

export default handler;
