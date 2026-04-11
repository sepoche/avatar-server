import { getJokeByCategory } from './chistes.js';
import { askOllama, getBotConfig, io } from './server.js'; 
import { addChatMessage } from './chatHistory.js';
import { handleReminderIntent, getActiveRemindersText } from './reminders.js';
import { detectDay, getWeatherText, naturalizeWeatherText } from './weather.js';
import { detectRoom, getHATemperature, enviarOrdenHA } from './homeassistant.js';
import { selfie } from './selfie.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';



// En tools.js
export async function executeTool(toolCall, message, socket) {
  const { function: fn } = toolCall;
  const args = toolCall.function.arguments || {};
  
  console.log("Tool llamada:", fn.name, "con args:", args);
  let parsedArgs = args;
  if (typeof args === 'string') {
    try {
      parsedArgs = JSON.parse(args);
    } catch (e) {
      console.error("Error parseando args:", e);
      parsedArgs = {};
    }
  }
  
  console.log("Ejecutando tool:", fn.name, "con args:", parsedArgs);

  switch (fn.name) {
    case "parse_reminder":
      handleReminderIntent(parsedArgs);
      return `¡Vale! He configurado tu ${parsedArgs.intent === "timer" ? "temporizador" : "recordatorio"}.`;

    case "read_reminders":
      return await speakActiveReminders();

    case "take_photo":
      return await toolTakePhoto(message, socket);

    case "radio":
      return await toolRadio(parsedArgs, socket);  // parsedArgs ya es objeto

    case "weather":
      return await toolWeather(parsedArgs);

    case "get_temperature":
      return await toolTemperature(parsedArgs);

    case "tell_joke":
      return await toolJoke(parsedArgs);

    case "control_device":
      return await toolControlDevice(parsedArgs, socket);

    case "ArmAlarm":
      return await toolArmAlarm();

    case "fallback":
      return await askOllama(message);

    default:
      return "No entendí lo que querías.";
  }
}

export const qwenTools = [
  {
    type: "function",
    function: {
      name: "parse_reminder",
      description: `
Analiza la frase del usuario y determina si es un temporizador o un recordatorio.

REGLAS IMPORTANTES:
- Si el usuario menciona una duración (ej: "en 5 minutos", "dentro de 2 horas"), entonces intent = "timer".
- Si el usuario menciona una fecha o momento específico (ej: "mañana", "8 de abril", "el lunes a las 5"), entonces intent = "reminder".
- NO uses "reminder" cuando el usuario diga "en X minutos". Eso SIEMPRE es un temporizador.
- Para temporizadores: usa el campo "duration".
- Para recordatorios: usa el campo "datetime".
- El campo "message" debe contener lo que el usuario quiere recordar.
    `,
      parameters: {
        type: "object",
        properties: {
          intent: { type: "string",
            enum: ["timer", "reminder"]
          },
          duration: { type: "string" },
          datetime: { type: "string" },
          message: { type: "string" }
        },
        required: ["intent"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "take_photo",
      description: "Toma una selfie",
      parameters: { type: "object", properties: {} }
    }
  },
    {
    type: "function",
    function: {
      name: "ArmAlarm",
      description: "Arma la alarma",
      parameters: { 
        properties: {
          action: { 
            enum: ["total", "exterior"]
          }
        }
         },
         required: ["action"]
        }
  },
  {
    type: "function",
    function: {
      name: "radio",
      description: "Controla la radio del sistema. Si no se especidica ninguna emisora, elige la cadena100 por defecto.",
      parameters: {
        properties: {
          action: {
            enum: ["play", "stop"]
          },
          station: {
            type: "string",
            enum: [
              "ser",
              "los40",
              "cadena100",
              "rockfm",
              "kissfm",
              "npr",
              "technobasefm",
              "s80s",
            ]
          }
          }
        },
        required: ["action"]
      }
    },

  {
    type: "function",
    function: {
      name: "weather",
      description: "Consulta el clima",
      parameters: {
        type: "object",
        properties: {
          day: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_temperature",
      description: "Obtiene temperatura de una habitación",
      parameters: {
        type: "object",
        properties: {
          room: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "tell_joke",
      description: "Cuenta un chiste. Si no se especifica categoría, elige la categoria random",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string",
            enum: [
                "general",
                "negro",
                "verde",
                "tecnología",
                "animales",
                "random"
            ]
           }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "control_device",
      description: "Controla un dispositivo",
      parameters: {
        type: "object",
        properties: {
          device: { type: "string" },
          action: { type: "string" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "fallback",
      description: "Conversación normal",
      parameters: { type: "object", properties: {} }
    }
  },
    {
    type: "function",
    function: {
      name: "read_reminders",
      description: "Lee en voz alta los recordatorios activos",
      parameters: { type: "object", properties: {} }
    }
  },
];

// llamadas a funciones para cada tool:

function toolJoke(args = {}) {
    return getJokeByCategory(args.category);
}

async function toolRadio(args, socket) {
    const { action, station } = args;

    if (action === "stop") {
        const botText = "He parado la reproducción de la emisora.";
        socket.emit("radio-stop");

        return botText;
    }

    if (action === "play") {
        const botText = `Reproduciendo emisora: ${station}`;
        socket.emit("radio-play", { name: station });

        return botText;
    }

    return "No entendí qué hacer con la radio.";
}

async function toolArmAlarm(args) {
    let parsed = {};

    if (!args) {
        parsed = {};
    } else if (typeof args === "string") {
        try {
            parsed = JSON.parse(args);
        } catch {
            parsed = {};
        }
    } else if (typeof args === "object") {
        parsed = args;
    }

    const modo = parsed.action || "total";
    try {
        const res = await fetch("http://localhost:3001/alarma/armar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ modo: modo })
        });

        const data = await res.json();

        if (data.ok) {
            console.log("✔ Alarma en proceso:", data);

        } else {
            console.log("❌ Error:", data.error);
        }

    } catch (err) {
        console.log("Error en fetch:", err);
    }

}

async function toolWeather(args) {
        const day = detectDay(args.day);
        console.log(`🌤️ Obteniendo el tiempo de ${day}`);

        let weatherRaw = await getWeatherText(day);
        let weatherNatural = naturalizeWeatherText(weatherRaw, day);

        return weatherNatural;
    }

  async function toolTakePhoto(message, socket) {
            console.log('🔧 Manejo de intención: tomar Selfie');
            const botConfig = await getBotConfig();
            const lenceria = botConfig.clothing_bot || "lencería sexy roja";
            const IP = botConfig.ia_server_ip
            const take_selfie = await selfie(lenceria, IP);
            
             // 🔥 Guardar imagen en el servidor 
             const filename = `selfie_${Date.now()}.webp`;
             const filepath = path.join("public", "gallery", filename);
             const webpBuffer = await sharp(take_selfie).webp({ quality: 80 }).toBuffer();
             fs.writeFileSync(filepath, webpBuffer);
             console.log("📸 Imagen guardada en:", filepath);
    
            const botText = "Me acabo de tomar esta foto, ¿Qué te parece?";

            io.emit("new_photo", {
               image: `data:image/png;base64,${take_selfie.toString('base64')}`,
               url: `/gallery/${filename}`
             });
            
            await addChatMessage("bot", `[imagen:/gallery/${filename}]`);
    
             // Emitir la foto a los clientes
             io.emit("photo_saved", {
               url: `/gallery/${filename}`
             });
    
    
            return botText; 
        }

            async function toolTemperature(args) {
                const room = detectRoom(args.room);
                console.log(`🌡️ Obteniendo la temperatura de ${room} desde Home Assistant…`);

                let temperature = await getHATemperature(room);
                console.log("🌡️ Temperatura obtenida:", temperature);

                const botText = `La temperatura actual de ${room} es de ${temperature} grados.`;
        
                return botText;
            }

            async function toolControlDevice(args, socket) {
                const { device, action } = args;
                console.log(`🔌 Controlando dispositivo: ${device} con acción: ${action}`);
                let result = await enviarOrdenHA(action, device);
                console.log("Resultado del control de dispositivo:", result);
                return `He enviado la orden para ${action} el dispositivo ${device}.`;

             }

/* -------------------------------------------------------
   FUNCIÓN PRINCIPAL PARA QUE EL ASISTENTE LEA EN VOZ ALTA
------------------------------------------------------- */
async function speakActiveReminders() {
  const botText = getActiveRemindersText();
  return botText;
}