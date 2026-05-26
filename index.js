// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║              𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗 - 𝗪𝗛𝗔𝗧𝗦𝗔𝗣𝗣 𝗕𝗢𝗧                     ║
// ║                                                              ║
// ║         📱 Follow the 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 channel on WhatsApp: ║
// ║         https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛                       ║
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

const pairRouter = require('./jamali_md/jamali_md');  // imebadilishwa kutoka ./sila/sila
app.use('/', pairRouter);

app.listen(port, () => {
    console.log(`🚀 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗 𝗕𝗢𝗧 is running on port ${port}`);
    console.log(`📱 Follow the 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 channel on WhatsApp:`);
    console.log(`   https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h`);
    console.log(`👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛`);
});

module.exports = app;
