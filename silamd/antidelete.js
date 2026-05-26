// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║            𝙰𝙽𝚃𝙸-𝙳𝙴𝙻𝙴𝚃𝙴 𝙳𝙱 - 𝚂𝙸𝙻𝙰 𝙼𝙸𝙽𝙸                   ║
// ║                                                              ║
// ║         📦 GitHub: https://github.com/Sila-Md              ║
// ║         📺 YouTube: https://youtube.com/@silatrix22        ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚                         ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const mongoose = require('mongoose');

const antideleteSchema = new mongoose.Schema({
    chatId: { type: String, required: true, unique: true },
    status: { type: Boolean, default: false }
});

const Antidelete = mongoose.model('Antidelete', antideleteSchema);

const getAntideleteStatus = async (chatId) => {
    try {
        const data = await Antidelete.findOne({ chatId });
        return data ? data.status : false;
    } catch (e) { return false; }
};

const setAntideleteStatus = async (chatId, status) => {
    try {
        await Antidelete.findOneAndUpdate({ chatId }, { status }, { upsert: true, new: true });
        return true;
    } catch (e) { return false; }
};

module.exports = { Antidelete, getAntideleteStatus, setAntideleteStatus };
