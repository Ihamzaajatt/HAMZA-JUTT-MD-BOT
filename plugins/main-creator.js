function handler(m) {
    // Use global.owner to fetch all owners
    const contacts = global.owner.map(([id, name]) => [
        id,                      // Owner's phone number
        name || "Unknown",       // Owner's name (fallback to 'Unknown')
        id,                      // Owner's own number
        "princegds333@yahoo.com", // Gmail
        "https://github.com/DASTAGHIR/PRINCEAI", // Instagram link
        "💫OWNER NUMBER"         // Label
    ]);

    // Debug: Check the contact list before sending
    console.log("Sending Contacts:", contacts);

    // Send contact list
    this.sendContact(m.chat, contacts, m);
}

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator'];

export default handler;
