const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // Save login session
    sock.ev.on("creds.update", saveCreds);

    // QR Code login
    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;

        if (qr) {
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("✅ WhatsApp Bot Connected!");
        }

        if (connection === "close") {
            console.log("❌ Connection closed. Restart bot...");
            startBot();
        }
    });

    // Message handler
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];

        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const sender = msg.key.remoteJid;

        console.log("Message:", text);

        // Simple commands
        if (text === "hi") {
            await sock.sendMessage(sender, { text: "Hello 👋 I am your WhatsApp bot!" });
        }

        if (text === "menu") {
            await sock.sendMessage(sender, {
                text: "📌 MENU:\n1. hi\n2. time\n3. owner"
            });
        }

        if (text === "time") {
            await sock.sendMessage(sender, {
                text: "⏰ " + new Date().toLocaleString()
            });
        }

        if (text === "owner") {
            await sock.sendMessage(sender, {
                text: "👨‍💻 Bot created using Node.js + Baileys"
            });
        }
    });
}

startBot();
