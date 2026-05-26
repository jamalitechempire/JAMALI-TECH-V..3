// jamalitech/general.js (au silatech/general.js - jina la folder unaweza kulibadilisha)
const { cmd } = require('../jamali_md/jamalimd');   // Badala ya '../sila/silamd'
const config = require('../jamali_md/config');     // Badala ya '../sila/config'

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
            text: '*_⚡️ 𝗣𝗜𝗡𝗚𝗜𝗡𝗚 𝗧𝗢 𝗦𝗘𝗥𝗩𝗘𝗥..._*' 
        }, { quoted: mek });
        
        const startTime = Date.now();
        const endTime = Date.now();
        const ping = endTime - startTime;
        
        const pingMsg = `*╭━━〔 🐢 𝗣𝗜𝗡𝗚 🐢 〕━━┈⊷*
*┃🐢│ • 🏓 𝗣𝗢𝗡𝗚!*
*┃🐢│ • ⚡ 𝗟𝗔𝗧𝗘𝗡𝗖𝗬: ${ping}ms*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗕𝘆 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛*`;
        
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
        
        const aliveMsg = `*╭━━〔 🐢 𝗔𝗟𝗜𝗩𝗘 🐢 〕━━┈⊷*
*┃🐢│ • 𝗕𝗢𝗧: 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗*
*┃🐢│ • 𝗦𝗧𝗔𝗧𝗨𝗦: ✅ 𝗔𝗖𝗧𝗜𝗩𝗘*
*┃🐢│ • 𝗣𝗥𝗘𝗙𝗜𝗫: ${config.PREFIX || '.'}*
*┃🐢│ • 𝗥𝗨𝗡𝗧𝗜𝗠𝗘: ${hours}h ${minutes}m ${seconds}s*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗕𝘆 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛*`;

        await conn.sendMessage(from, { 
            image: { url: config.IMAGE_PATH || 'https://i.ibb.co/4RM2GC9F/Sila-mini.jpg' },  // Unaweza kubadilisha URL ya picha baadaye
            caption: aliveMsg
        }, { quoted: mek });
        
    } catch (e) {
        reply("Error: " + e.message);
    }
});
