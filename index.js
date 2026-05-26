// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║              𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 𝙱𝙾𝚃                     ║
// ║                                                              ║
// ║         📦 GitHub: https://github.com/Sila-Md              ║
// ║         📺 YouTube: https://youtube.com/@silatrix22        ║
// ║         📱 Channel: https://whatsapp.com/channel/          ║
// ║              0029VbBG4gfISTkCpKxyMH02                      ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚                         ║
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
    console.log(`🚀 𝚂𝙸𝙻𝙰 𝙼𝙳 𝙱𝙾𝚃 is running on port ${port}`);
    console.log(`📦 GitHub: https://github.com/Sila-Md`);
    console.log(`📺 YouTube: https://youtube.com/@silatrix22`);
    console.log(`📱 Channel: https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02`);
    console.log(`👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝐒𝐢𝐥𝐚`);
});

module.exports = app;
