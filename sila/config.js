// ╔══════════════════════════════════════════════════════════╗
// ║                                                          ║
// ║     ███████╗██╗██╗      █████╗     ███╗   ███╗██╗███╗   ██╗██╗
// ║     ██╔════╝██║██║     ██╔══██╗    ████╗ ████║██║████╗  ██║██║
// ║     ███████╗██║██║     ███████║    ██╔████╔██║██║██╔██╗ ██║██║
// ║     ╚════██║██║██║     ██╔══██║    ██║╚██╔╝██║██║██║╚██╗██║██║
// ║     ███████║██║███████╗██║  ██║    ██║ ╚═╝ ██║██║██║ ╚████║██║
// ║     ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝
// ║                                                          ║
// ║              ██████╗  ██████╗ ██╗   ██╗                 ║
// ║              ██╔══██╗██╔═══██╗╚██╗ ██╔╝                 ║
// ║              ██████╔╝██║   ██║ ╚████╔╝                  ║
// ║              ██╔══██╗██║   ██║  ╚██╔╝                   ║
// ║              ██████╔╝╚██████╔╝   ██║                    ║
// ║              ╚═════╝  ╚═════╝    ╚═╝                    ║
// ║                                                          ║
// ║          🤖 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸 - WhatsApp Bot 🤖               ║
// ║                                                          ║
// ║         📦 GitHub: https://github.com/Sila-Md          ║
// ║         📺 YouTube: https://youtube.com/@silatrix22    ║
// ║         📱 Channel: https://whatsapp.com/channel/       ║
// ║              0029VbBG4gfISTkCpKxyMH02                   ║
// ║                                                          ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚                         ║
// ║                                                          ║
// ╚══════════════════════════════════════════════════════════╝

const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

module.exports = {
    // ===========================================================
    // 1. CONFIGURATION DE BASE (Session & Database)
    // ===========================================================
    SESSION_ID: process.env.SESSION_ID || "𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸", 
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://kxshrii:i7sgjXF6SO2cTJwU@kelumxz.zggub8h.mongodb.net/',
    
    // ===========================================================
    // 2. INFORMATIONS DU BOT
    // ===========================================================
    PREFIX: process.env.PREFIX || '.',
    OWNER_NUMBER: process.env.OWNER_NUMBER || '255612491554',
    BOT_NAME: "𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸",
    BOT_FOOTER: '𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚',
    
    // Mode de travail : public, private, group, inbox
    WORK_TYPE: process.env.WORK_TYPE || "public", 
    
    // ===========================================================
    // 3. FONCTIONNALITÉS AUTOMATIQUES (STATUTS)
    // ===========================================================
    AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || 'true',
    AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || 'true',
    AUTO_LIKE_EMOJI: ['❤️', '🌹', '😇', '💥', '🔥', '💫', '💎', '💙', '🌝', '💚'], 
    
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || 'false',
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || 'Nice status! 🔥',
    
    // ===========================================================
    // 4. FONCTIONNALITÉS DE CHAT & PRÉSENCE
    // ===========================================================
    READ_MESSAGE: process.env.READ_MESSAGE || 'false',
    AUTO_TYPING: process.env.AUTO_TYPING || 'false',
    AUTO_RECORDING: process.env.AUTO_RECORDING || 'false',
    
    // ===========================================================
    // 5. GESTION DES GROUPES
    // ===========================================================
    WELCOME_ENABLE: process.env.WELCOME_ENABLE || 'true',
    GOODBYE_ENABLE: process.env.GOODBYE_ENABLE || 'true',
    WELCOME_MSG: process.env.WELCOME_MSG || null, 
    GOODBYE_MSG: process.env.GOODBYE_MSG || null, 
    WELCOME_IMAGE: process.env.WELCOME_IMAGE || null, 
    GOODBYE_IMAGE: process.env.GOODBYE_IMAGE || null,
    
    GROUP_INVITE_LINK: process.env.GROUP_INVITE_LINK || 'https://chat.whatsapp.com/IS276Wg9zcuCnJRiMDI64g',
    
    // ===========================================================
    // 6. SÉCURITÉ & ANTI-CALL
    // ===========================================================
    ANTI_CALL: process.env.ANTI_CALL || 'false',
    REJECT_MSG: process.env.REJECT_MSG || '*📞 Call rejected automatically. No calls allowed.*',
    
    // ===========================================================
    // 7. IMAGES & LISNS
    // ===========================================================
    IMAGE_PATH: process.env.IMAGE_PATH || 'https://i.ibb.co/4RM2GC9F/Sila-mini.jpg',
    CHANNEL_LINK: process.env.CHANNEL_LINK || 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
    CHANNEL_JID: '120363402325089913@newsletter',
    
    // ===========================================================
    // 8. LIENS SOCIAUX
    // ===========================================================
    GITHUB_LINK: 'https://github.com/Sila-Md',
    YOUTUBE_LINK: 'https://youtube.com/@silatrix22?si=C_AdfiLUHnzIhmoD',
    GROUP_LINK_1: 'https://chat.whatsapp.com/IS276Wg9zcuCnJRiMDI64g',
    GROUP_LINK_2: 'https://chat.whatsapp.com/LigL9dzqtCjJek07ecnSV6',
    
    // ===========================================================
    // 9. EXTERNAL API (Optionnel)
    // ===========================================================
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7214172448:AAHGqSgaw-zGVPZWvl8msDOVDhln-9kExas',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '7825445776'
};
