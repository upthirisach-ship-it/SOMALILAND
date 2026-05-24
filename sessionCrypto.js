const CryptoJS = require("crypto-js");
require("dotenv").config();

// Secret key from .env file
const SECRET = process.env.SESSION_SECRET || "default_secret_key";

// 🔐 Encrypt session data
function encrypt(data) {
    try {
        return CryptoJS.AES.encrypt(
            typeof data === "string" ? data : JSON.stringify(data),
            SECRET
        ).toString();
    } catch (err) {
        console.log("Encryption error:", err.message);
        return null;
    }
}

// 🔓 Decrypt session data
function decrypt(data) {
    try {
        const bytes = CryptoJS.AES.decrypt(data, SECRET);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        return JSON.parse(decrypted);
    } catch (err) {
        console.log("Decryption error:", err.message);
        return null;
    }
}

module.exports = {
    encrypt,
    decrypt
};
