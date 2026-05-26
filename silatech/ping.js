// silatech/general.js
const { cmd } = require('../sila/silamd');  // Imebadilishwa
const config = require('../sila/config');    // Imebadilishwa

// Commande Ping
cmd({
    pattern: "ping",
    desc: "Check bot latency",
    category: "general",
    react: "⚙️"
},
async(conn, mek, m, { from, reply }) => {
    try {
        const sentMsg = await conn.sendMessage(from, { 
            text: '*_⚡️ 𝙿𝙸𝙽𝙶𝙸𝙽𝙶 𝚃𝙾 𝚂𝙴𝚁𝚅𝙴𝚁..._*' 
        }, { quoted: mek });
        
        const startTime = Date.now();
        const endTime = Date.now();
        const ping = endTime - startTime;
        
        const pingMsg = `*╭━━〔 🐢 𝙿𝙸𝙽𝙶 🐢 〕━━┈⊷*
*┃🐢│ • 🏓 𝙿𝙾𝙽𝙶!*
*┃🐢│ • ⚡ 𝙻𝙰𝚃𝙴𝙽𝙲𝚈: ${ping}ms*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚*`;
        
        await conn.sendMessage(from, { 
            text: pingMsg, 
            edit: sentMsg.key 
        });
        
    } catch (e) {
        console.log(e);
        reply(`Error: ${e.message}`);
    }
});

// Commande Alive
cmd({
    pattern: "alive",
    desc: "Check if bot is alive",
    category: "general",
    react: "💫"
},
async(conn, mek, m, { from, reply }) => {
    try {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const aliveMsg = `*╭━━〔 🐢 𝙰𝙻𝙸𝚅𝙴 🐢 〕━━┈⊷*
*┃🐢│ • 𝙱𝙾𝚃: 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸*
*┃🐢│ • 𝚂𝚃𝙰𝚃𝚄𝚂: ✅ 𝙰𝙲𝚃𝙸𝚅𝙴*
*┃🐢│ • 𝙿𝚁𝙴𝙵𝙸𝚇: ${config.PREFIX || '.'}*
*┃🐢│ • 𝚁𝚄𝙽𝚃𝙸𝙼𝙴: ${hours}h ${minutes}m ${seconds}s*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚*`;

        await conn.sendMessage(from, { 
            image: { url: config.IMAGE_PATH || 'https://i.ibb.co/4RM2GC9F/Sila-mini.jpg' },
            caption: aliveMsg
        }, { quoted: mek });
        
    } catch (e) {
        reply("Error: " + e.message);
    }
});
