// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║        ██╗ █████╗ ███╗   ███╗ █████╗ ██╗     ██╗             ║
// ║        ██║██╔══██╗████╗ ████║██╔══██╗██║     ██║             ║
// ║        ██║███████║██╔████╔██║███████║██║     ██║             ║
// ║   ██   ██║██╔══██║██║╚██╔╝██║██╔══██║██║     ██║             ║
// ║   ╚█████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║███████╗██║             ║
// ║    ╚════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝             ║
// ║                                                              ║
// ║                 𝙹𝙰𝙼𝙰𝙻𝙸 𝙼𝙳 - 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃                  ║
// ║                                                              ║
// ║   📢 Follow the 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 Channel on WhatsApp ║
// ║   🔗 https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║                👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐉𝐀𝐌𝐀𝐋𝐈 𝐓𝐄𝐂𝐇              ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./sila/sila');
app.use('/', pairRouter);

app.listen(port, () => {
    console.log(`🚀 𝙹𝙰𝙼𝙰𝙻𝙸 𝙼𝙳 𝙱𝙾𝚃 is running on port ${port}`);
    console.log(`📢 Follow the 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 Channel on WhatsApp`);
    console.log(`🔗 https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h`);
    console.log(`👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐉𝐀𝐌𝐀𝐋𝐈 𝐓𝐄𝐂𝐇`);
});

module.exports = app;
