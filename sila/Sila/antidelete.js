// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║         𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴 𝙷𝙰𝙽𝙳𝙻𝙴𝚁 - 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸                ║
// ║                                                              ║
// ║         📦 GitHub: https://github.com/Sila-Md              ║
// ║         📺 YouTube: https://youtube.com/@silatrix22        ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚                         ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const { getAntideleteStatus } = require('../../silamd/antidelete'); // Path to silamd folder
const config = require('../config');

const handleAntidelete = async (conn, updates, store) => {
    try {
        for (const update of updates) {
            if (update.key.fromMe) continue;

            const isRevoke = update.update.messageStubType === 68 || 
                             (update.update.message && 
                              update.update.message.protocolMessage && 
                              update.update.message.protocolMessage.type === 0);

            if (isRevoke) {
                const chatId = update.key.remoteJid;
                const messageId = update.key.id;
                const participant = update.key.participant || chatId;

                const isEnabled = await getAntideleteStatus(chatId);
                if (!isEnabled) return;

                if (!store || !store.messages[chatId]) return;
                const msg = await store.loadMessage(chatId, messageId);

                if (msg) {
                    const alertText = `*╭━━〔 🐢 𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴 🐢 〕━━┈⊷*
*┃🐢│ • 🚫 Message Deleted!*
*┃🐢│ • 👤 User:* @${participant.split('@')[0]}
*┃🐢│ • 📅 Date:* ${new Date().toLocaleString()}
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚*`;
                    
                    await conn.sendMessage(chatId, { text: alertText, mentions: [participant] });
                    await conn.sendMessage(chatId, { forward: msg, contextInfo: { isForwarded: false } }, { quoted: msg });
                }
            }
        }
    } catch (e) { 
        console.error("𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴 Error:", e); 
    }
};

module.exports = { handleAntidelete };
