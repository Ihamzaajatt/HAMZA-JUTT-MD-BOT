let handler = async (m, { conn, text, usedPrefix, command }) => {
  let user, number, ownerNumber, users;

  try {
    // Helper function to clean the number
    function no(number) {
      return number.replace(/\s/g, '').replace(/([@+-])/g, '');
    }

    // If a quoted message exists, prioritize it
    if (m.quoted && m.quoted.sender) {
      user = m.quoted.sender;
      number = user.split('@')[0];
    } else {
      // Clean the input text
      text = no(text);

      // Determine if the input is a number or mention
      if (isNaN(text)) {
        number = text.split`@`[1];
      } else if (!isNaN(text)) {
        number = text;
      }

      // Build the user ID
      if (number) {
        user = number + '@s.whatsapp.net';
      }
    }

    // Default response if no valid input or quoted message is provided
    if (!user) {
      return conn.reply(
        m.chat,
        `Please provide a valid user number or quote a user's message to ban.`,
        null,
        { mentions: [conn.user.jid] }
      );
    }

    let botName = conn.user.jid.split`@`[0];

    // Prevent banning the bot itself
    if (user === conn.user.jid) {
      return conn.reply(
        m.chat,
        `You cannot ban the bot (${botName}).`,
        null,
        { mentions: [user] }
      );
    }

    // Check if the target is the owner
    for (let i = 0; i < global.owner.length; i++) {
      ownerNumber = global.owner[i][0];
      if (user.replace(/@s\.whatsapp\.net$/, '') === ownerNumber) {
        let ownerContact = ownerNumber + '@s.whatsapp.net';
        await conn.reply(
          m.chat,
          `You cannot ban the bot owner (${ownerNumber}).`,
          null,
          { mentions: [ownerContact] }
        );
        return;
      }
    }

    // Access the database and mark the user as banned
    users = global.db.data.users;
    if (!users[user]) {
      users[user] = { banned: false }; // Initialize user data if missing
    }

    if (users[user].banned === true) {
      return conn.reply(
        m.chat,
        `The user ${number} is already banned.`,
        null,
        { mentions: [user] }
      );
    }

    users[user].banned = true;

    // Notify about the ban
    await conn.reply(
      m.chat,
      `User ${number} has been successfully banned.`,
      null,
      { mentions: [user] }
    );
  } catch (e) {
    await conn.reply(
      m.chat,
      `An error occurred while trying to ban the user. Please try again.`,
      null,
      m
    );
    console.error(e);
  }
};

// Command settings
handler.command = /^banuser|ban$/i;
handler.rowner = true;

export default handler;
