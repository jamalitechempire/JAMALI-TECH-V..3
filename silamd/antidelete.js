// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║        ██╗ █████╗ ███╗   ███╗ █████╗ ██╗     ██╗             ║
// ║        ██║██╔══██╗████╗ ████║██╔══██╗██║     ██║             ║
// ║        ██║███████║██╔████╔██║███████║██║     ██║             ║
// ║   ██   ██║██╔══██║██║╚██╔╝██║██╔══██║██║     ██║             ║
// ║   ╚█████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║███████╗██║             ║
// ║    ╚════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝             ║
// ║                                                              ║
// ║              𝗔𝗡𝗧𝗜-𝗗𝗘𝗟𝗘𝗧𝗘 𝗗𝗕 - 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗                   ║
// ║                                                              ║
// ║         📱 Follow 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 on WhatsApp:        ║
// ║         https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛                       ║
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
