// chatHistory.js
import fs from "fs";

const CHAT_FILE = "./chatHistory.json";

// Historial en memoria
export let chatHistory = [];

/* -----------------------------------------
   Cargar historial desde disco
----------------------------------------- */
export function loadChatHistory() {
  if (fs.existsSync(CHAT_FILE)) {
    try {
      const data = fs.readFileSync(CHAT_FILE, "utf8");
      chatHistory = JSON.parse(data);
      console.log(`💾 Historial cargado (${chatHistory.length} mensajes)`);
    } catch (e) {
      console.error("❌ Error cargando chatHistory:", e);
      chatHistory = [];
    }
  }
}

/* -----------------------------------------
   Guardar historial en disco
----------------------------------------- */
export function saveChatHistory() {
  try {
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chatHistory, null, 2));
  } catch (e) {
    console.error("❌ Error guardando chatHistory:", e);
  }
}

/* -----------------------------------------
   Añadir mensaje al historial
----------------------------------------- */
export function addChatMessage(sender, text) {
  const entry = {
    sender,
    text,
    timestamp: Date.now()
  };

  chatHistory.push(entry);

  // Mantener solo los últimos 200 mensajes
  if (chatHistory.length > 200) {
    chatHistory = chatHistory.slice(-200);
  }

  saveChatHistory();
}

/* -----------------------------------------
   Obtener últimas N interacciones
----------------------------------------- */
export function getLastInteractions(n = 5) {
  return chatHistory.slice(-n);
}
