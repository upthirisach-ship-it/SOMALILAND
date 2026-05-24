const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const readline = require("readline");

function question(text) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(text, answer => {
        rl.close();
        resolve(answer);
    }));
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("✅ Bot Connected Successfully");
        }
    });

    // 🔥 PAIRING CODE LOGIN (IMPORTANT)
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("📱 Enter your WhatsApp number (country code): ");

        const code = await sock.requestPairingCode(phoneNumber);
        console.log("🔑 Your Pairing Code is: " + code);
    }

    // Messages
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const sender = msg.key.remoteJid;

        if (text === "hi") {
            await sock.sendMessage(sender, { text: "Hello 👋 Pair code bot is working!" });
        }
    });
}

startBot();
