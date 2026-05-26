// ╔══════════════════════════════════════════════════════════════╗
// ║                                                              ║
// ║      ███████╗██╗██╗      █████╗    ███╗   ███╗██████╗      ║
// ║      ██╔════╝██║██║     ██╔══██╗   ████╗ ████║██╔══██╗     ║
// ║      ███████╗██║██║     ███████║   ██╔████╔██║██║  ██║     ║
// ║      ╚════██║██║██║     ██╔══██║   ██║╚██╔╝██║██║  ██║     ║
// ║      ███████║██║███████╗██║  ██║   ██║ ╚═╝ ██║██████╔╝     ║
// ║      ╚══════╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═╝╚═════╝      ║
// ║                                                              ║
// ║         𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 - 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗                            ║
// ║                                                              ║
// ║         📱 Follow 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛 𝗘𝗠𝗣𝗜𝗥𝗘 on WhatsApp:        ║
// ║         https://whatsapp.com/channel/0029VbC7AgJK5cD71vGIpO3h ║
// ║                                                              ║
// ║         👨‍💻 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐝 𝐁𝐲 𝗝𝗔𝗠𝗔𝗟𝗜 𝗧𝗘𝗖𝗛                       ║
// ║                                                              ║
// ╚══════════════════════════════════════════════════════════════╝

const mongoose = require('mongoose');
const config = require('../config');

const connectdb = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆");
    } catch (e) {
        console.error("❌ 𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻 𝗙𝗮𝗶𝗹𝗲𝗱:", e.message);
    }
};

// Session Schema
const silaSessionSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    credentials: {
        type: Object,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// User Config Schema
const silaConfigSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    config: {
        AUTO_RECORDING: { type: String, default: 'false' },
        AUTO_TYPING: { type: String, default: 'false' },
        ANTI_CALL: { type: String, default: 'false' },
        REJECT_MSG: { type: String, default: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*' },
        READ_MESSAGE: { type: String, default: 'false' },
        AUTO_VIEW_STATUS: { type: String, default: 'false' },
        AUTO_LIKE_STATUS: { type: String, default: 'false' },
        AUTO_STATUS_REPLY: { type: String, default: 'false' },
        AUTO_STATUS_MSG: { type: String, default: 'Hello from 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗! 🔥' },
        AUTO_LIKE_EMOJI: { type: Array, default: ['❤️', '👍', '😮', '😎', '🔥', '💫', '👑'] },
        ANTIDELETE: { type: String, default: 'false' }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// OTP Schema
const silaOtpSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true,
        index: true 
    },
    otp: { type: String, required: true },
    config: { type: Object, required: true },
    expiresAt: { 
        type: Date, 
        default: () => new Date(Date.now() + 5 * 60000),
        index: { expires: '5m' }
    },
    createdAt: { type: Date, default: Date.now }
});

// Active Numbers Schema
const silaActiveNumberSchema = new mongoose.Schema({
    number: { 
        type: String, 
        required: true, 
        unique: true,
        index: true 
    },
    lastConnected: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    connectionInfo: {
        ip: String,
        userAgent: String,
        timestamp: Date
    }
});

// Stats Schema
const silaStatsSchema = new mongoose.Schema({
    number: { type: String, required: true },
    date: { type: String, required: true },
    commandsUsed: { type: Number, default: 0 },
    messagesReceived: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    groupsInteracted: { type: Number, default: 0 }
});

// Models
const Session = mongoose.model('SilaSession', silaSessionSchema);
const UserConfig = mongoose.model('SilaConfig', silaConfigSchema);
const OTP = mongoose.model('SilaOTP', silaOtpSchema);
const ActiveNumber = mongoose.model('SilaActiveNumber', silaActiveNumberSchema);
const Stats = mongoose.model('SilaStats', silaStatsSchema);

// ==================== SESSION FUNCTIONS ====================
async function saveSessionToMongoDB(number, credentials) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.findOneAndUpdate(
            { number: cleanNumber },
            { 
                credentials: credentials,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log(`📁 [𝗝𝗔𝗠𝗔𝗟𝗜-𝗠𝗗] Session saved for ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving session to MongoDB:', error);
        return false;
    }
}

async function getSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({ number: cleanNumber });
        return session ? session.credentials : null;
    } catch (error) {
        console.error('❌ Error getting session from MongoDB:', error);
        return null;
    }
}

async function deleteSessionFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteOne({ number: cleanNumber });
        await ActiveNumber.deleteOne({ number: cleanNumber });
        console.log(`🗑️ Session deleted from MongoDB for ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Error deleting session from MongoDB:', error);
        return false;
    }
}

// ==================== CONFIG FUNCTIONS ====================
async function getUserConfigFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const configData = await UserConfig.findOne({ number: cleanNumber });
        
        if (configData) {
            return configData.config;
        } else {
            const defaultConfig = {
                AUTO_RECORDING: 'false',
                AUTO_TYPING: 'false',
                ANTI_CALL: 'false',
                REJECT_MSG: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*',
                READ_MESSAGE: 'false',
                AUTO_VIEW_STATUS: 'false',
                AUTO_LIKE_STATUS: 'false',
                AUTO_STATUS_REPLY: 'false',
                AUTO_STATUS_MSG: 'Hello from 𝗝𝗔𝗠𝗔𝗟𝗜 𝗠𝗗! 🔥',
                AUTO_LIKE_EMOJI: ['❤️', '👍', '😮', '😎', '🔥', '💫', '👑'],
                ANTIDELETE: 'false'
            };
            
            await UserConfig.create({
                number: cleanNumber,
                config: defaultConfig
            });
            
            return defaultConfig;
        }
    } catch (error) {
        console.error('❌ Error getting user config from MongoDB:', error);
        return {};
    }
}

async function updateUserConfigInMongoDB(number, newConfig) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await UserConfig.findOneAndUpdate(
            { number: cleanNumber },
            { 
                config: newConfig,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        console.log(`⚙️ [𝗝𝗔𝗠𝗔𝗟𝗜-𝗠𝗗] Config updated for ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Error updating user config in MongoDB:', error);
        return false;
    }
}

// ==================== OTP FUNCTIONS ====================
async function saveOTPToMongoDB(number, otp, configData) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await OTP.create({
            number: cleanNumber,
            otp: otp,
            config: configData
        });
        console.log(`🔐 OTP saved for ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving OTP to MongoDB:', error);
        return false;
    }
}

async function verifyOTPFromMongoDB(number, otp) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const otpRecord = await OTP.findOne({ 
            number: cleanNumber, 
            otp: otp,
            expiresAt: { $gt: new Date() }
        });
        
        if (!otpRecord) {
            return { valid: false, error: 'Invalid or expired OTP' };
        }
        
        await OTP.deleteOne({ _id: otpRecord._id });
        
        return {
            valid: true,
            config: otpRecord.config
        };
    } catch (error) {
        console.error('❌ Error verifying OTP from MongoDB:', error);
        return { valid: false, error: 'Verification error' };
    }
}

// ==================== ACTIVE NUMBERS FUNCTIONS ====================
async function addNumberToMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.findOneAndUpdate(
            { number: cleanNumber },
            { 
                lastConnected: new Date(),
                isActive: true
            },
            { upsert: true, new: true }
        );
        return true;
    } catch (error) {
        console.error('❌ Error adding number to MongoDB:', error);
        return false;
    }
}

async function removeNumberFromMongoDB(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        await ActiveNumber.deleteOne({ number: cleanNumber });
        return true;
    } catch (error) {
        console.error('❌ Error removing number from MongoDB:', error);
        return false;
    }
}

async function getAllNumbersFromMongoDB() {
    try {
        const activeNumbers = await ActiveNumber.find({ isActive: true });
        return activeNumbers.map(num => num.number);
    } catch (error) {
        console.error('❌ Error getting numbers from MongoDB:', error);
        return [];
    }
}

// ==================== STATS FUNCTIONS ====================
async function incrementStats(number, field) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const today = new Date().toISOString().split('T')[0];
        
        await Stats.findOneAndUpdate(
            { number: cleanNumber, date: today },
            { $inc: { [field]: 1 } },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Error updating stats:', error);
    }
}

async function getStatsForNumber(number) {
    try {
        const cleanNumber = number.replace(/[^0-9]/g, '');
        const stats = await Stats.find({ number: cleanNumber })
            .sort({ date: -1 })
            .limit(30);
        return stats;
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return [];
    }
}

// ==================== EXPORTS ====================
module.exports = {
    connectdb,
    Session,
    UserConfig,
    OTP,
    ActiveNumber,
    Stats,
    
    saveSessionToMongoDB,
    getSessionFromMongoDB,
    deleteSessionFromMongoDB,
    
    getUserConfigFromMongoDB,
    updateUserConfigInMongoDB,
    
    saveOTPToMongoDB,
    verifyOTPFromMongoDB,
    
    addNumberToMongoDB,
    removeNumberFromMongoDB,
    getAllNumbersFromMongoDB,
    
    incrementStats,
    getStatsForNumber,
    
    getUserConfig: async (number) => {
        const configData = await getUserConfigFromMongoDB(number);
        return configData || {};
    },
    updateUserConfig: updateUserConfigInMongoDB
};
