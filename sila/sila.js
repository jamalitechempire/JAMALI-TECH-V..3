// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      █╚═╝╚═════╝      ║
// ║                                                              ║
// ║              𝙼𝙰𝙸𝙽 𝙱𝙾𝚃 - 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗                         ║
// ║                                                              ║
// ║         📱 Follow 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 on WhatsApp:        ║
// ║         https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛                       ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    Browsers,
    DisconnectReason,
    jidDecode,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    getContentType
} = require('@whiskeysockets/baileys');

const config = require('./config');
const events = require('./silamd');
const { sms } = require('./Sila/msg');
const { 
    connectdb,
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB,
    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,
    saveOTPToMongoDB,
    verifyOTPFromMongoDB,
    incrementStats,
    getStatsForNumber
} = require('./Sila/database');
const { handleAntidelete } = require('./Sila/antidelete');

const express = require('express');
const fs = require('fs-extra');
const pino = require('pino');
const crypto = require('crypto');
const FileType = require('file-type');
const axios = require('axios');
const bodyparser = require('body-parser');
const moment = require('moment-timezone');

const prefix = config.PREFIX;
const mode = config.MODE;
const router = express.Router();

const path = require('path');

// ==============================================================================
// 1. INITIALIZATION & DATABASE
// ==============================================================================

connectdb();

const activeSockets = new Map();
const socketCreationTime = new Map();

// Store for anti-delete
const store = {
    messages: {},
    bind: (ev) => {
        ev.on('messages.upsert', ({ messages }) => {
            for (const msg of messages) {
                const jid = msg.key && msg.key.remoteJid;
                if (!jid) continue;
                if (!store.messages[jid]) store.messages[jid] = [];
                store.messages[jid].push(msg);
                if (store.messages[jid].length > 200) store.messages[jid].shift();
            }
        });
    },
    loadMessage: async (jid, id) => {
        if (!store.messages[jid]) return null;
        return store.messages[jid].find(m => m.key && m.key.id === id) || null;
    }
};

const createSerial = (size) => {
    return crypto.randomBytes(size).toString('hex').slice(0, size);
}

const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin == null) continue;
        admins.push(i.id);
    }
    return admins;
}

// Auto follow newsletters function
async function autoFollowNewsletters(conn) {
    try {
        console.log('📰 𝗔𝗨𝗧𝗢-𝗙𝗢𝗟𝗟𝗢𝗪 𝗖𝗛𝗔𝗡𝗡𝗘𝗟𝗦...');
        
        const channelsToFollow = [
            {
                jid: "120363425061263455@newsletter",
                name: "𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘"
            }
        ];
        
        console.log(`📊 𝙵𝚘𝚞𝚗𝚍 ${channelsToFollow.length} 𝚌𝚑𝚊𝚗𝚗𝚎𝚕𝚜 𝚝𝚘 𝚏𝚘𝚕𝚕𝚘𝚠`);
        
        for (const channel of channelsToFollow) {
            try {
                console.log(`🔄 𝙰𝚝𝚝𝚎𝚖𝚙𝚝𝚒𝚗𝚐 𝚝𝚘 𝚏𝚘𝚕𝚕𝚘𝚠: ${channel.name} (${channel.jid})`);
                await conn.sendPresenceUpdate('available', channel.jid);
                console.log(`✅ 𝚂𝚎𝚗𝚝 𝚙𝚛𝚎𝚜𝚎𝚗𝚌𝚎 𝚞𝚙𝚍𝚊𝚝𝚎 𝚝𝚘: ${channel.name}`);
                await delay(1000);
            } catch (error) {
                console.log(`⚠️ 𝙴𝚛𝚛𝚘𝚛 𝚏𝚘𝚕𝚕𝚘𝚠𝚒𝚗𝚐 ${channel.name}: ${error.message}`);
            }
        }

        // Auto-join groups from config
        console.log('👥 𝗔𝗨𝗧𝗢-𝗝𝗢𝗜𝗡 𝗚𝗥𝗢𝗨𝗣𝗦...');
        
        const joinGroup = async (groupLink, groupName) => {
            try {
                if (!groupLink || groupLink.trim() === '') {
                    console.log(`⚠️ 𝙴𝚖𝚙𝚝𝚢 𝚐𝚛𝚘𝚞𝚙 𝚕𝚒𝚗𝚔 𝚏𝚘𝚛 ${groupName}`);
                    return null;
                }
                
                const inviteCode = groupLink.split('/').pop();
                if (!inviteCode) {
                    console.log(`⚠️ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚐𝚛𝚘𝚞𝚙 𝚕𝚒𝚗𝚔: ${groupLink}`);
                    return null;
                }
                
                console.log(`🔄 𝙰𝚝𝚝𝚎𝚖𝚙𝚝𝚒𝚗𝚐 𝚝𝚘 𝚓𝚘𝚒𝚗 𝚐𝚛𝚘𝚞𝚙: ${groupName || inviteCode}`);
                const response = await conn.groupAcceptInvite(inviteCode);
                console.log(`✅ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚓𝚘𝚒𝚗𝚎𝚍 𝚐𝚛𝚘𝚞𝚙: ${groupName || inviteCode}`);
                return response;
            } catch (error) {
                console.log(`❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚓𝚘𝚒𝚗 𝚐𝚛𝚘𝚞𝚙 ${groupName || 'unknown'}: ${error.message}`);
                return null;
            }
        };

        if (config.GROUP_LINK_1 && config.GROUP_LINK_1.trim() !== '') {
            await joinGroup(config.GROUP_LINK_1, "𝗝𝗔𝗠𝗔𝗟𝗜 𝗚𝗿𝗼𝘂𝗽 𝟭");
            await delay(1000);
        }

        if (config.GROUP_LINK_2 && config.GROUP_LINK_2.trim() !== '') {
            await joinGroup(config.GROUP_LINK_2, "𝗝𝗔𝗠𝗔𝗟𝗜 𝗚𝗿𝗼𝘂𝗽 𝟮");
            await delay(1000);
        }

        console.log('🎉 𝗔𝗨𝗧𝗢-𝗙𝗢𝗟𝗟𝗢𝗪 𝗔𝗡𝗗 𝗔𝗨𝗧𝗢-𝗝𝗢𝗜𝗡 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗!');

    } catch (error) {
        console.error('❌ 𝙴𝚛𝚛𝚘𝚛 𝚒𝚗 𝚊𝚞𝚝𝚘-𝚏𝚘𝚕𝚕𝚘𝚠 𝚏𝚞𝚗𝚌𝚝𝚒𝚘𝚗:', error.message);
    }
}

// Auto update bio function
async function autoUpdateBio(conn, number) {
    try {
        if (config.AUTO_BIO === 'true' && config.BIO_LIST && config.BIO_LIST.length > 0) {
            const bioList = config.BIO_LIST;
            let currentIndex = 0;
            
            const isConnectionActive = () => {
                const sanitizedNumber = number.replace(/[^0-9]/g, '');
                return activeSockets.has(sanitizedNumber) && conn.user && conn.user.id;
            };
            
            const updateBio = async () => {
                try {
                    if (!isConnectionActive()) {
                        console.log(`⚠️ 𝚂𝚔𝚒𝚙𝚙𝚒𝚗𝚐 𝚋𝚒𝚘 𝚞𝚙𝚍𝚊𝚝𝚎 - 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚌𝚕𝚘𝚜𝚎𝚍 𝚏𝚘𝚛 ${number}`);
                        return;
                    }
                    
                    const bioText = bioList[currentIndex];
                    
                    if (!conn.user || !conn.user.id) {
                        console.log(`⚠️ 𝚂𝚔𝚒𝚙𝚙𝚒𝚗𝚐 𝚋𝚒𝚘 𝚞𝚙𝚍𝚊𝚝𝚎 - 𝚗𝚘 𝚞𝚜𝚎𝚛 𝚍𝚊𝚝𝚊 𝚏𝚘𝚛 ${number}`);
                        return;
                    }
                    
                    await conn.updateProfileStatus(bioText);
                    console.log(`📝 𝚄𝚙𝚍𝚊𝚝𝚎𝚍 𝚋𝚒𝚘 𝚏𝚘𝚛 ${number}: ${bioText}`);
                    
                    currentIndex = (currentIndex + 1) % bioList.length;
                } catch (error) {
                    console.error(`❌ 𝙴𝚛𝚛𝚘𝚛 𝚞𝚙𝚍𝚊𝚝𝚒𝚗𝚐 𝚋𝚒𝚘 𝚏𝚘𝚛 ${number}:`, error.message);
                    currentIndex = (currentIndex + 1) % bioList.length;
                }
            };
            
            if (isConnectionActive()) {
                await updateBio();
            }
            
            const bioInterval = setInterval(() => {
                if (isConnectionActive()) {
                    updateBio();
                } else {
                    console.log(`🔌 𝚂𝚝𝚘𝚙𝚙𝚒𝚗𝚐 𝚋𝚒𝚘 𝚞𝚙𝚍𝚊𝚝𝚎 𝚏𝚘𝚛 ${number} - 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚕𝚘𝚜𝚝`);
                    clearInterval(bioInterval);
                }
            }, 30 * 60 * 1000);
            
            const sanitizedNumber = number.replace(/[^0-9]/g, '');
            if (!global.bioIntervals) global.bioIntervals = {};
            global.bioIntervals[sanitizedNumber] = bioInterval;
        }
    } catch (error) {
        console.error(`❌ 𝙴𝚛𝚛𝚘𝚛 𝚒𝚗 𝚊𝚞𝚝𝚘-𝚋𝚒𝚘 𝚏𝚞𝚗𝚌𝚝𝚒𝚘𝚗 𝚏𝚘𝚛 ${number}:`, error.message);
    }
}

function cleanupBioInterval(number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    if (global.bioIntervals && global.bioIntervals[sanitizedNumber]) {
        clearInterval(global.bioIntervals[sanitizedNumber]);
        delete global.bioIntervals[sanitizedNumber];
        console.log(`🧹 𝙲𝚕𝚎𝚊𝚗𝚎𝚍 𝚞𝚙 𝚋𝚒𝚘 𝚒𝚗𝚝𝚎𝚛𝚟𝚊𝚕 𝚏𝚘𝚛 ${number}`);
    }
}

function isNumberAlreadyConnected(number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    return activeSockets.has(sanitizedNumber);
}

function getConnectionStatus(number) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const isConnected = activeSockets.has(sanitizedNumber);
    const connectionTime = socketCreationTime.get(sanitizedNumber);

    return {
        isConnected,
        connectionTime: connectionTime ? new Date(connectionTime).toLocaleString() : null,
        uptime: connectionTime ? Math.floor((Date.now() - connectionTime) / 1000) : 0
    };
}

// Load silatech plugins (keep folder name as is)
const silatechDir = path.join(__dirname, '..', 'silatech');
if (!fs.existsSync(silatechDir)) {
    fs.mkdirSync(silatechDir, { recursive: true });
}

const files = fs.readdirSync(silatechDir).filter(file => file.endsWith('.js'));
console.log(`📦 𝙻𝚘𝚊𝚍𝚒𝚗𝚐 ${files.length} 𝚓𝚊𝚖𝚊𝚕𝚒𝚝𝚎𝚌𝚑...`);
for (const file of files) {
    try {
        require(path.join(silatechDir, file));
    } catch (e) {
        console.error(`❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚕𝚘𝚊𝚍 𝚓𝚊𝚖𝚊𝚕𝚒𝚝𝚎𝚌𝚑 ${file}:`, e);
    }
}

// ==============================================================================
// 2. SPECIFIC HANDLERS
// ==============================================================================

async function setupCallHandlers(socket, number) {
    socket.ev.on('call', async (calls) => {
        try {
            const userConfig = await getUserConfigFromMongoDB(number);
            if (userConfig.ANTI_CALL !== 'true') return;

            for (const call of calls) {
                if (call.status !== 'offer') continue;
                await socket.rejectCall(call.id, call.from);
                await socket.sendMessage(call.from, {
                    text: userConfig.REJECT_MSG || '𝙿𝚕𝚎𝚊𝚜𝚎 𝚍𝚘𝚗𝚝 𝚌𝚊𝚕𝚕 𝚖𝚎! 😊'
                });
                console.log(`📞 𝙲𝚊𝚕𝚕 𝚛𝚎𝚓𝚎𝚌𝚝𝚎𝚍 𝚏𝚘𝚛 ${number} 𝚏𝚛𝚘𝚖 ${call.from}`);
            }
        } catch (err) {
            console.error(`𝙰𝚗𝚝𝚒-𝚌𝚊𝚕𝚕 𝚎𝚛𝚛𝚘𝚛 𝚏𝚘𝚛 ${number}:`, err);
        }
    });
}

function setupAutoRestart(socket, number) {
    let restartAttempts = 0;
    const maxRestartAttempts = 3;

    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        console.log(`𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚞𝚙𝚍𝚊𝚝𝚎 𝚏𝚘𝚛 ${number}:`, { connection, lastDisconnect });

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const errorMessage = lastDisconnect?.error?.message;

            console.log(`𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚌𝚕𝚘𝚜𝚎𝚍 𝚏𝚘𝚛 ${number}:`, {
                statusCode,
                errorMessage,
                isManualUnlink: statusCode === 401
            });

            cleanupBioInterval(number);

            if (statusCode === 401 || errorMessage?.includes('401')) {
                console.log(`🔐 𝙼𝚊𝚗𝚞𝚊𝚕 𝚞𝚗𝚕𝚒𝚗𝚔 𝚍𝚎𝚝𝚎𝚌𝚝𝚎𝚍 𝚏𝚘𝚛 ${number}, 𝚌𝚕𝚎𝚊𝚗𝚒𝚗𝚐 𝚞𝚙...`);
                const sanitizedNumber = number.replace(/[^0-9]/g, '');

                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);
                await deleteSessionFromMongoDB(sanitizedNumber);
                await removeNumberFromMongoDB(sanitizedNumber);

                socket.ev.removeAllListeners();
                return;
            }

            const isNormalError = statusCode === 408 || 
                                errorMessage?.includes('QR refs attempts ended');

            if (isNormalError) {
                console.log(`ℹ️ 𝙽𝚘𝚛𝚖𝚊𝚕 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚌𝚕𝚘𝚜𝚞𝚛𝚎 𝚏𝚘𝚛 ${number}, 𝚗𝚘 𝚛𝚎𝚜𝚝𝚊𝚛𝚝 𝚗𝚎𝚎𝚍𝚎𝚍.`);
                return;
            }

            if (restartAttempts < maxRestartAttempts) {
                restartAttempts++;
                console.log(`🔄 𝚄𝚗𝚎𝚡𝚙𝚎𝚌𝚝𝚎𝚍 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚕𝚘𝚜𝚝 𝚏𝚘𝚛 ${number}, 𝚊𝚝𝚝𝚎𝚖𝚙𝚝𝚒𝚗𝚐 𝚝𝚘 𝚛𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝 (${restartAttempts}/${maxRestartAttempts}) 𝚒𝚗 10 𝚜𝚎𝚌𝚘𝚗𝚍𝚜...`);

                const sanitizedNumber = number.replace(/[^0-9]/g, '');
                activeSockets.delete(sanitizedNumber);
                socketCreationTime.delete(sanitizedNumber);

                socket.ev.removeAllListeners();

                await delay(10000);

                try {
                    const mockRes = { 
                        headersSent: false, 
                        send: () => {}, 
                        status: () => mockRes,
                        setHeader: () => {},
                        json: () => {}
                    };
                    await startBot(number, mockRes);
                    console.log(`✅ 𝚁𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚒𝚗𝚒𝚝𝚒𝚊𝚝𝚎𝚍 𝚏𝚘𝚛 ${number}`);
                } catch (reconnectError) {
                    console.error(`❌ 𝚁𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚏𝚊𝚒𝚕𝚎𝚍 𝚏𝚘𝚛 ${number}:`, reconnectError);
                }
            } else {
                console.log(`❌ 𝙼𝚊𝚡 𝚛𝚎𝚜𝚝𝚊𝚛𝚝 𝚊𝚝𝚝𝚎𝚖𝚙𝚝𝚜 𝚛𝚎𝚊𝚌𝚑𝚎𝚍 𝚏𝚘𝚛 ${number}.`);
            }
        }

        if (connection === 'open') {
            console.log(`✅ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚎𝚜𝚝𝚊𝚋𝚕𝚒𝚜𝚑𝚎𝚍 𝚏𝚘𝚛 ${number}`);
            restartAttempts = 0;
        }
    });
}

// ==============================================================================
// 3. MAIN STARTBOT FUNCTION
// ==============================================================================

async function startBot(number, res = null) {
    let connectionLockKey;
    const sanitizedNumber = number.replace(/[^0-9]/g, '');

    try {
        const sessionDir = path.join(__dirname, '..', 'jamali_md', `session_${sanitizedNumber}`);

        if (isNumberAlreadyConnected(sanitizedNumber)) {
            console.log(`⏩ ${sanitizedNumber} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍, 𝚜𝚔𝚒𝚙𝚙𝚒𝚗𝚐...`);
            const status = getConnectionStatus(sanitizedNumber);

            if (res && !res.headersSent) {
                return res.json({ 
                    status: 'already_connected', 
                    message: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍',
                    connectionTime: status.connectionTime,
                    uptime: `${status.uptime} 𝚜𝚎𝚌𝚘𝚗𝚍𝚜`
                });
            }
            return;
        }

        connectionLockKey = `connecting_${sanitizedNumber}`;
        if (global[connectionLockKey]) {
            console.log(`⏩ ${sanitizedNumber} 𝚒𝚜 𝚊𝚕𝚛𝚎𝚊𝚍𝚢 𝚒𝚗 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚙𝚛𝚘𝚌𝚎𝚜𝚜...`);
            if (res && !res.headersSent) {
                return res.json({ 
                    status: 'connection_in_progress', 
                    message: '𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚘𝚗 𝚒𝚗 𝚙𝚛𝚘𝚐𝚛𝚎𝚜𝚜'
                });
            }
            return;
        }
        global[connectionLockKey] = true;

        const existingSession = await getSessionFromMongoDB(sanitizedNumber);

        if (!existingSession) {
            console.log(`🧹 𝙽𝚘 𝙼𝚘𝚗𝚐𝚘𝙳𝙱 𝚜𝚎𝚜𝚜𝚒𝚘𝚗 𝚏𝚘𝚛 ${sanitizedNumber} - 𝚗𝚎𝚠 𝚙𝚊𝚒𝚛𝚒𝚗𝚐`);

            if (fs.existsSync(sessionDir)) {
                await fs.remove(sessionDir);
                console.log(`🗑️ 𝙲𝚕𝚎𝚊𝚗𝚎𝚍 𝚕𝚎𝚏𝚝𝚘𝚟𝚎𝚛 𝚜𝚎𝚜𝚜𝚒𝚘𝚗 𝚏𝚘𝚛 ${sanitizedNumber}`);
            }
        } else {
            fs.ensureDirSync(sessionDir);
            fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(existingSession, null, 2));
            console.log(`🔄 𝚁𝚎𝚜𝚝𝚘𝚛𝚎𝚍 𝚜𝚎𝚜𝚜𝚒𝚘𝚗 𝚏𝚛𝚘𝚖 𝙼𝚘𝚗𝚐𝚘𝙳𝙱 𝚏𝚘𝚛 ${sanitizedNumber}`);
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        const conn = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
            },
            printQRInTerminal: false,
            usePairingCode: !existingSession, 
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS('Safari'),
            syncFullHistory: false,
            getMessage: async (key) => {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg && msg.message ? msg.message : { conversation: '𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗' };
            }
        });

        socketCreationTime.set(sanitizedNumber, Date.now());
        activeSockets.set(sanitizedNumber, conn);
        
        store.bind(conn.ev);

        setupCallHandlers(conn, number);
        setupAutoRestart(conn, number);

        conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
            } else return jid;
        };

        conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await downloadContentFromMessage(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };

        if (!existingSession) {
            setTimeout(async () => {
                try {
                    await delay(1500);
                    const code = await conn.requestPairingCode(sanitizedNumber);
                    console.log(`🔑 𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝙲𝚘𝚍𝚎 𝚏𝚘𝚛 ${sanitizedNumber}: ${code}`);
                    if (res && !res.headersSent) {
                        return res.json({ 
                            code: code, 
                            status: 'new_pairing'
                        });
                    }
                } catch (err) {
                    console.error('❌ 𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝙴𝚛𝚛𝚘𝚛:', err.message);
                    if (res && !res.headersSent) {
                        return res.json({ 
                            error: '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎',
                            details: err.message 
                        });
                    }
                }
            }, 3000);
        } else if (res && !res.headersSent) {
            res.json({
                status: 'reconnecting',
                message: '𝚁𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚗𝚐 𝚠𝚒𝚝𝚑 𝚎𝚡𝚒𝚜𝚝𝚒𝚗𝚐 𝚜𝚎𝚜𝚜𝚒𝚘𝚗'
            });
        }

        conn.ev.on('creds.update', async () => {
            await saveCreds();
            const fileContent = fs.readFileSync(path.join(sessionDir, 'creds.json'), 'utf8');
            const creds = JSON.parse(fileContent);
            await saveSessionToMongoDB(sanitizedNumber, creds);
            console.log(`💾 𝚂𝚎𝚜𝚜𝚒𝚘𝚗 𝚞𝚙𝚍𝚊𝚝𝚎𝚍 𝚒𝚗 𝙼𝚘𝚗𝚐𝚘𝙳𝙱 𝚏𝚘𝚛 ${sanitizedNumber}`);
        });

        conn.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'open') {
                console.log(`✅ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍: ${sanitizedNumber}`);
                const userJid = jidNormalizedUser(conn.user.id);
                await addNumberToMongoDB(sanitizedNumber);

                if (!existingSession) {
                    const connectText = `*╭━━〔 🐢 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗 🐢 〕━━┈⊷*
*┃🐢│ • 𝗕𝗢𝗧: 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗*
*┃🐢│ • 𝗦𝗧𝗔𝗧𝗨𝗦: ✅ 𝗔𝗖𝗧𝗜𝗩𝗘*
*┃🐢│ • 𝗣𝗥𝗘𝗙𝗜𝗫: ${config.PREFIX || '.'}*
*┃🐢│ • 𝗠𝗢𝗗𝗘: ${mode || 'public'}*
*╰━━━━━━━━━━━━━━━┈⊷*

*> 🐢 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗱 𝗕𝘆 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛*`;

                    try {
                        await conn.sendMessage(userJid, {
                            image: { url: config.IMAGE_PATH || 'https://files.catbox.moe/xney4v.jpg' },
                            caption: connectText
                        });
                        console.log(`✅ 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚜𝚎𝚗𝚝 𝚝𝚘 ${sanitizedNumber}`);
                    } catch (error) {
                        console.log(`⚠️ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚜𝚎𝚗𝚍 𝚠𝚎𝚕𝚌𝚘𝚖𝚎 𝚖𝚎𝚜𝚜𝚊𝚐𝚎: ${error.message}`);
                    }
                }

                setTimeout(async () => {
                    try {
                        await autoFollowNewsletters(conn);
                        await autoUpdateBio(conn, number);
                    } catch (error) {
                        console.error('❌ 𝙴𝚛𝚛𝚘𝚛 𝚒𝚗 𝚊𝚞𝚝𝚘-𝚏𝚘𝚕𝚕𝚘𝚠:', error.message);
                    }
                }, 5000);

                console.log(`🎉 ${sanitizedNumber} 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍!`);
            }

            if (connection === 'close') {
                let reason = lastDisconnect?.error?.output?.statusCode;
                if (reason === DisconnectReason.loggedOut) {
                    console.log(`❌ 𝚂𝚎𝚜𝚜𝚒𝚘𝚗 𝚌𝚕𝚘𝚜𝚎𝚍: 𝙻𝚘𝚐𝚐𝚎𝚍 𝙾𝚞𝚝.`);
                    cleanupBioInterval(number);
                }
            }
        });

        conn.ev.on('messages.update', async (updates) => {
            await handleAntidelete(conn, updates, store);
        });

        // ===============================================================
        // 📥 MESSAGE HANDLER (UPSERT)
        // ===============================================================
        conn.ev.on('messages.upsert', async (msg) => {
            try {
                let mek = msg.messages[0];
                if (!mek.message) return;

                const userConfig = await getUserConfigFromMongoDB(number);

                mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                    ? mek.message.ephemeralMessage.message 
                    : mek.message;

                if (mek.message.viewOnceMessageV2) {
                    mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
                        ? mek.message.ephemeralMessage.message 
                        : mek.message;
                }

                if (userConfig.READ_MESSAGE === 'true') {
                    await conn.readMessages([mek.key]);
                }

                // Status Handling
                if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                    try {
                        if (userConfig.AUTO_VIEW_STATUS === "true") {
                            await conn.readMessages([mek.key]);
                        }

                        if (userConfig.AUTO_LIKE_STATUS === "true") {
                            const jawadlike = await conn.decodeJid(conn.user.id);
                            const emojis = userConfig.AUTO_LIKE_EMOJI || config.AUTO_LIKE_EMOJI;
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            await conn.sendMessage(mek.key.remoteJid, {
                                react: { text: randomEmoji, key: mek.key } 
                            }, { statusJidList: [mek.key.participant, jawadlike] });
                        }
                    } catch (error) {
                        console.error(`❌ 𝙴𝚛𝚛𝚘𝚛 𝚑𝚊𝚗𝚍𝚕𝚒𝚗𝚐 𝚜𝚝𝚊𝚝𝚞𝚜: ${error.message}`);
                    }
                    return; 
                }

                // Newsletter Reaction (including new one)
                const newsletterJids = [
                    "120363425061263455@newsletter"
                ];

                const newsEmojis = ["❤️", "👍", "😮", "😎", "💀", "💫", "🔥", "👑"];
                
                if (mek.key && newsletterJids.includes(mek.key.remoteJid)) {
                    try {
                        if (mek.newsletterServerId) {
                            const serverId = mek.newsletterServerId;
                            const emoji = newsEmojis[Math.floor(Math.random() * newsEmojis.length)];
                            await conn.newsletterReactMessage(mek.key.remoteJid, serverId.toString(), emoji);
                        }
                    } catch (e) {
                        console.log(`⚠️ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚛𝚎𝚊𝚌𝚝: ${e.message}`);
                    }
                }

                const m = sms(conn, mek);
                const type = getContentType(mek.message);
                const from = mek.key.remoteJid;
                const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';

                const isCmd = body.startsWith(config.PREFIX);
                const command = isCmd ? body.slice(config.PREFIX.length).trim().split(' ').shift().toLowerCase() : '';
                const args = body.trim().split(/ +/).slice(1);
                const q = args.join(' ');
                const text = q;
                const isGroup = from.endsWith('@g.us');

                const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid);
                const senderNumber = sender.split('@')[0];
                const botNumber = conn.user.id.split(':')[0];
                const botNumber2 = await jidNormalizedUser(conn.user.id);
                const pushname = mek.pushName || '𝚄𝚜𝚎𝚛';

                const isMe = botNumber.includes(senderNumber);
                const isOwner = config.OWNER_NUMBER.includes(senderNumber) || isMe;
                const isCreator = isOwner;

                let groupMetadata = null;
                let groupName = null;
                let participants = null;
                let groupAdmins = null;
                let isBotAdmins = null;
                let isAdmins = null;

                if (isGroup) {
                    try {
                        groupMetadata = await conn.groupMetadata(from);
                        groupName = groupMetadata.subject;
                        participants = await groupMetadata.participants;
                        groupAdmins = await getGroupAdmins(participants);
                        isBotAdmins = groupAdmins.includes(botNumber2);
                        isAdmins = groupAdmins.includes(sender);
                    } catch(e) {}
                }

                if (userConfig.AUTO_TYPING === 'true') await conn.sendPresenceUpdate('composing', from);
                if (userConfig.AUTO_RECORDING === 'true') await conn.sendPresenceUpdate('recording', from);

                const fakevCard = {
                    key: {
                        fromMe: false,
                        participant: "0@s.whatsapp.net",
                        remoteJid: "status@broadcast"
                    },
                    message: {
                        contactMessage: {
                            displayName: "𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗",
                            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗\nORG:𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛;\nTEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER || '255784062158'}:+${config.OWNER_NUMBER || '255784062158'}\nEND:VCARD`
                        }
                    },
                    messageTimestamp: Math.floor(Date.now() / 1000),
                    status: 1
                };

                const reply = (text) => conn.sendMessage(from, { text: text }, { quoted: fakevCard });
                const l = reply;

                if (isCmd) {
                    await incrementStats(sanitizedNumber, 'commandsUsed');

                    const cmd = events.commands.find((cmd) => cmd.pattern === (command)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(command));
                    if (cmd) {
                        if (config.WORK_TYPE === 'private' && !isOwner) return;
                        if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

                        try {
                            cmd.function(conn, mek, m, {
                                from, quoted: mek, body, isCmd, command, args, q, text, isGroup, sender, 
                                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, 
                                reply, config, fakevCard
                            });
                        } catch (e) {
                            console.error("[𝚓𝚊𝚖𝚊𝚕𝚒𝚝𝚎𝚌𝚑 𝙴𝚁𝚁𝙾𝚁] " + e);
                        }
                    }
                }

                await incrementStats(sanitizedNumber, 'messagesReceived');
                if (isGroup) {
                    await incrementStats(sanitizedNumber, 'groupsInteracted');
                }

                events.commands.map(async (command) => {
                    const ctx = { from, l, quoted: mek, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply, config, fakevCard };

                    if (body && command.on === "body") command.function(conn, mek, m, ctx);
                    else if (mek.q && command.on === "text") command.function(conn, mek, m, ctx);
                    else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") command.function(conn, mek, m, ctx);
                    else if (command.on === "sticker" && mek.type === "stickerMessage") command.function(conn, mek, m, ctx);
                });

            } catch (e) {
                console.error(e);
            }
        });

    } catch (err) {
        console.error(err);
        if (res && !res.headersSent) {
            return res.json({ 
                error: '𝙸𝚗𝚝𝚎𝚛𝚗𝚊𝚕 𝚂𝚎𝚛𝚟𝚎𝚛 𝙴𝚛𝚛𝚘𝚛', 
                details: err.message 
            });
        }
    } finally {
        if (connectionLockKey) {
            global[connectionLockKey] = false;
        }
    }
}

// ==============================================================================
// 4. API ROUTES
// ==============================================================================

router.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pair.html')));

router.get('/code', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍' });
    await startBot(number, res);
});

router.get('/status', async (req, res) => {
    const { number } = req.query;

    if (!number) {
        const activeConnections = Array.from(activeSockets.keys()).map(num => {
            const status = getConnectionStatus(num);
            return {
                number: num,
                status: 'connected',
                connectionTime: status.connectionTime,
                uptime: `${status.uptime} seconds`
            };
        });

        return res.json({
            totalActive: activeSockets.size,
            connections: activeConnections
        });
    }

    const connectionStatus = getConnectionStatus(number);
    res.json(connectionStatus);
});

router.get('/disconnect', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');

    if (!activeSockets.has(sanitizedNumber)) {
        return res.status(404).json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍' });
    }

    try {
        const socket = activeSockets.get(sanitizedNumber);
        await socket.ws.close();
        socket.ev.removeAllListeners();

        activeSockets.delete(sanitizedNumber);
        socketCreationTime.delete(sanitizedNumber);
        await removeNumberFromMongoDB(sanitizedNumber);
        await deleteSessionFromMongoDB(sanitizedNumber);

        res.json({ status: 'success', message: '𝙳𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍' });
    } catch (error) {
        res.status(500).json({ error: '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝' });
    }
});

router.get('/active', (req, res) => {
    res.json({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

router.get('/ping', (req, res) => {
    res.json({
        status: 'active',
        message: '𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴',
        activeSessions: activeSockets.size
    });
});

router.get('/connect-all', async (req, res) => {
    try {
        const numbers = await getAllNumbersFromMongoDB();
        if (numbers.length === 0) {
            return res.status(404).json({ error: '𝙽𝚘 𝚗𝚞𝚖𝚋𝚎𝚛𝚜 𝚏𝚘𝚞𝚗𝚍' });
        }

        const results = [];
        for (const number of numbers) {
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { 
                headersSent: false, 
                json: () => {}, 
                status: () => mockRes 
            };
            await startBot(number, mockRes);
            results.push({ number, status: 'connection_initiated' });
            await delay(1000);
        }

        res.json({ status: 'success', total: numbers.length, connections: results });
    } catch (error) {
        res.status(500).json({ error: '𝙵𝚊𝚒𝚕𝚎𝚍' });
    }
});

router.get('/update-config', async (req, res) => {
    const { number, config: configString } = req.query;
    if (!number || !configString) {
        return res.status(400).json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚊𝚗𝚍 𝚌𝚘𝚗𝚏𝚒𝚐 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍' });
    }

    let newConfig;
    try {
        newConfig = JSON.parse(configString);
    } catch (error) {
        return res.status(400).json({ error: '𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚌𝚘𝚗𝚏𝚒𝚐' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const socket = activeSockets.get(sanitizedNumber);
    if (!socket) {
        return res.status(404).json({ error: '𝙽𝚘 𝚊𝚌𝚝𝚒𝚟𝚎 𝚜𝚎𝚜𝚜𝚒𝚘𝚗' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await saveOTPToMongoDB(sanitizedNumber, otp, newConfig);

    try {
        const userJid = jidNormalizedUser(socket.user.id);
        await socket.sendMessage(userJid, { text: `*🔐 𝙲𝙾𝙽𝙵𝙸𝙶 𝚄𝙿𝙳𝙰𝚃𝙴*\n\n𝙾𝚃𝙿: *${otp}*\n𝚅𝚊𝚕𝚒𝚍 5 𝚖𝚒𝚗𝚞𝚝𝚎𝚜` });
        res.json({ status: 'otp_sent' });
    } catch (error) {
        res.status(500).json({ error: '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚜𝚎𝚗𝚍 𝙾𝚃𝙿' });
    }
});

router.get('/verify-otp', async (req, res) => {
    const { number, otp } = req.query;
    if (!number || !otp) {
        return res.status(400).json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚊𝚗𝚍 𝙾𝚃𝙿 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍' });
    }

    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const verification = await verifyOTPFromMongoDB(sanitizedNumber, otp);

    if (!verification.valid) {
        return res.status(400).json({ error: verification.error });
    }

    await updateUserConfigInMongoDB(sanitizedNumber, verification.config);
    const socket = activeSockets.get(sanitizedNumber);
    if (socket) {
        await socket.sendMessage(jidNormalizedUser(socket.user.id), { text: '*✅ 𝙲𝙾𝙽𝙵𝙸𝙶 𝚄𝙿𝙳𝙰𝚃𝙴𝙳*' });
    }
    res.json({ status: 'success' });
});

router.get('/stats', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).json({ error: '𝙽𝚞𝚖𝚋𝚎𝚛 𝚛𝚎𝚚𝚞𝚒𝚛𝚎𝚍' });
    }

    try {
        const stats = await getStatsForNumber(number);
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const connectionStatus = getConnectionStatus(sanitizedNumber);

        res.json({
            number: sanitizedNumber,
            connectionStatus: connectionStatus.isConnected ? 'Connected' : 'Disconnected',
            uptime: connectionStatus.uptime,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ error: '𝙵𝚊𝚒𝚕𝚎𝚍' });
    }
});

// ==============================================================================
// 5. AUTO RECONNECT AT STARTUP
// ==============================================================================

async function autoReconnectFromMongoDB() {
    try {
        console.log('🔁 𝗔𝘂𝘁𝗼-𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝗳𝗿𝗼𝗺 𝗠𝗼𝗻𝗴𝗼𝗗𝗕...');
        const numbers = await getAllNumbersFromMongoDB();

        if (numbers.length === 0) {
            console.log('ℹ️ 𝙽𝚘 𝚗𝚞𝚖𝚋𝚎𝚛𝚜 𝚏𝚘𝚞𝚗𝚍');
            return;
        }

        for (const number of numbers) {
            if (!activeSockets.has(number)) {
                console.log(`🔁 𝚁𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚒𝚗𝚐: ${number}`);
                const mockRes = { headersSent: false, json: () => {}, status: () => mockRes };
                await startBot(number, mockRes);
                await delay(2000);
            }
        }
        console.log('✅ 𝗔𝘂𝘁𝗼-𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝗰𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱');
    } catch (error) {
        console.error('❌ 𝙰𝚞𝚝𝚘-𝚛𝚎𝚌𝚘𝚗𝚗𝚎𝚌𝚝 𝚎𝚛𝚛𝚘𝚛:', error.message);
    }
}

setTimeout(() => {
    autoReconnectFromMongoDB();
}, 3000);

// ==============================================================================
// 6. CLEANUP ON EXIT
// ==============================================================================

process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
});

process.on('uncaughtException', (err) => {
    console.error('𝚄𝚗𝚌𝚊𝚞𝚐𝚑𝚝 𝚎𝚡𝚌𝚎𝚙𝚝𝚒𝚘𝚗:', err);
});

module.exports = router;
