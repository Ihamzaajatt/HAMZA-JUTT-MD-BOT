let handler = async (m, { conn, text, command, usedPrefix }) => {
  
  let who;
  if (m.quoted?.sender) {
    who = m.quoted.sender;
  } else if (m.isGroup) {
    who = m.mentionedJid[0];
  } else {
    who = m.chat;
  }

  
  if (!who) {
    throw `Tag someone or quote their message to unban.\nExample:\n*${usedPrefix + command} @tag*`;
  }

  let users = global.db.data.users;

  
  if (!users[who]) {
    throw `The user is not found in the database.`;
  }


  users[who].banned = false;

  
  conn.reply(
    m.chat,
    `The user has been successfully unbanned. 🎉\nThey can now use PRINCE MD.`,
    m
  );
};

handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser|unban$/i;

handler.rowner = true;
export default handler;
