// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║         𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗛𝗔𝗡𝗗𝗟𝗘𝗥 - 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗                   ║
// ║                                                              ║
// ║         📱 Follow 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 on WhatsApp:        ║
// ║         https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛                       ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const { getAntideleteStatus } = require('../../jamali_md/antidelete'); // Path to jamali_md folder
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
                    const alertText = `*╭━━〔 🐢 𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 🐢 〕━━┈⊷*
*┃🐢│ • 🚫 Message Deleted!*
*┃🐢│ • 👤 User:* @${participant.split('@')[0]}
*┃🐢│ • 📅 Date:* ${new Date().toLocaleString()}
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗕𝘆 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛*`;
                    
                    await conn.sendMessage(chatId, { text: alertText, mentions: [participant] });
                    await conn.sendMessage(chatId, { forward: msg, contextInfo: { isForwarded: false } }, { quoted: msg });
                }
            }
        }
    } catch (e) { 
        console.error("𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 Error:", e); 
    }
};

module.exports = { handleAntidelete };
