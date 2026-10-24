let handler = async (m, { conn, text, usedPrefix, command }) => {
  
  m.reply(`
✨ **Prince MD All Gist Plugins for Installation** ✨
  
📂 **Installation**  
**.install** _<paste gist link>_

**📜 Plugins List:**
1️⃣ **All GP JIDs Plugin**  
   🔗 https://gist.github.com/DASTAGHIR/e71c17f1b622b41c60e991d1e4b8bdd7
   
2️⃣ **Soon more will be added!**  
   🌟 _Or you can create your own._

3️⃣ **Placeholder Plugin (Coming Soon)**  
4️⃣ **Placeholder Plugin (Coming Soon)**  
5️⃣ **Placeholder Plugin (Coming Soon)**  
6️⃣ **Placeholder Plugin (Coming Soon)**  
7️⃣ **Placeholder Plugin (Coming Soon)**  
8️⃣ **Placeholder Plugin (Coming Soon)**  
9️⃣ **Placeholder Plugin (Coming Soon)**  
🔟 **Placeholder Plugin (Coming Soon)**  
  `)
  
}

handler.help = ['listplugins']
handler.tags = ['owner']
handler.command = /^(listplugin|plugins|pluginslist)$/i
handler.rowner = false

export default handler
