const reminders = [];

import fs from "fs";
import { generateAndPlayAudio as speak } from './server.js';
import { setState } from './server.js';

const REMINDERS_FILE = "./reminders.json";

/* -------------------------------------------------------
   PARSE PRINCIPAL (LLM YA DEVUELVE JSON)
------------------------------------------------------- */
export function parseReminder(llmJson) {
  return llmJson;
}

/* -------------------------------------------------------
   MANEJO DE INTENCIÓN
------------------------------------------------------- */
export function handleReminderIntent(data) {
  if (data.intent === "timer") {
    const ms = parseDurationToMs(data.duration);
    createTimer(ms, data.message || "¡Tiempo!");
    return;
  }

  if (data.intent === "reminder") {
    const info = detectNaturalDate(data.datetime);
    const date = naturalDateToRealDate(info);
    createReminder(date, data.message);
  }
}

export function detectNaturalDate(text) {
    if (!text) return null;

    text = text.toLowerCase().trim();

    const meses = {
        "enero": 1, "febrero": 2, "marzo": 3, "abril": 4,
        "mayo": 5, "junio": 6, "julio": 7, "agosto": 8,
        "septiembre": 9, "setiembre": 9, "octubre": 10,
        "noviembre": 11, "diciembre": 12
    };

    const regex = /(\d{1,2})\s+de\s+([a-záéíóú]+)/i;
    const match = text.match(regex);

    if (!match) return null;

    const day = parseInt(match[1], 10);
    const monthName = match[2];

    const month = meses[monthName];
    if (!month) return null;

    return { day, month };
}

export function naturalDateToRealDate({ day, month }) {
    const now = new Date();
    const year = now.getFullYear();

    let date = new Date(year, month - 1, day);

    // Si la fecha ya pasó este año → usar el año siguiente
    if (date < now) {
        date = new Date(year + 1, month - 1, day);
    }

    return date;
}

/* -------------------------------------------------------
   PARSE DURACIÓN → MS
------------------------------------------------------- */
export function parseDurationToMs(text) {
  const regex = /(\d+)\s*(segundos|minutos|horas)/i;
  const match = text.match(regex);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith("seg")) return value * 1000;
  if (unit.startsWith("min")) return value * 60 * 1000;
  if (unit.startsWith("hor")) return value * 60 * 60 * 1000;

  return 0;
}

/* -------------------------------------------------------
   CREAR TIMER
------------------------------------------------------- */
function createTimer(durationMs, message = "¡Tiempo!") {
  const id = Date.now();

const timeout = setTimeout(async () => {
    setState('speaking');
    speak(message);

    // 🔥 Enviar notificación push
    try {
        await fetch("http://localhost:3001/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "⏳ Temporizador finalizado",
                body: message,
                url: "https://asistente-eva.com"
            })
        });
    } catch (err) {
        console.log("Error enviando notificación del timer:", err);
    }

}, durationMs);


  const entry = {
    id,
    type: "timer",
    message,
    createdAt: Date.now(),
    durationMs
  };

  reminders.push(entry);
  saveReminders();

  entry._timeout = timeout;

  return id;
}

/* -------------------------------------------------------
   CREAR RECORDATORIO
------------------------------------------------------- */
function createReminder(date, message) {
  const now = Date.now();
  const target = date.getTime();
  const delay = target - now;

  if (delay <= 0) {
    setState('speaking');
    speak("Esa hora ya ha pasado");
    return;
  }

  const id = Date.now();

const timeout = setTimeout(async () => {
    setState('speaking');
    speak(message);

    // 🔥 Enviar notificación push
    try {
        await fetch("http://localhost:3001/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "⏰ Recordatorio",
                body: message,
                url: "https://asistente-eva.com"
            })
        });
    } catch (err) {
        console.log("Error enviando notificación del recordatorio:", err);
    }

}, delay);


  const entry = {
    id,
    type: "reminder",
    message,
    date,
  };

  reminders.push(entry);
  saveReminders();

  entry._timeout = timeout;

  return id;
}

/* -------------------------------------------------------
   RESTAURAR RECORDATORIOS Y TIMERS
------------------------------------------------------- */
export function restoreScheduledReminders() {
  const now = Date.now();

  for (const r of reminders) {

    /* -------------------------
       RESTAURAR TIMER
    ------------------------- */
    if (r.type === "timer") {
      const elapsed = now - r.createdAt;
      const remaining = r.durationMs - elapsed;

      if (remaining > 0) {
        r._timeout = setTimeout(async () => {
          setState('speaking');
          speak(r.message);

          // 🔥 Notificación push
          try {
            await fetch("http://localhost:3001/api/send-notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: "⏳ Temporizador finalizado",
                body: r.message,
                url: "https://asistente-eva.com"
              })
            });
          } catch (err) {
            console.log("Error enviando notificación del timer restaurado:", err);
          }

        }, remaining);
      }
    }

    /* -------------------------
       RESTAURAR RECORDATORIO
    ------------------------- */
    if (r.type === "reminder") {
      const target = new Date(r.date).getTime();
      const delay = target - now;

      if (delay > 0) {
        r._timeout = setTimeout(async () => {
          setState('speaking');
          speak(r.message);

          // 🔥 Notificación push
          try {
            await fetch("http://localhost:3001/api/send-notification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: "⏰ Recordatorio",
                body: r.message,
                url: "https://asistente-eva.com"
              })
            });
          } catch (err) {
            console.log("Error enviando notificación del recordatorio restaurado:", err);
          }

        }, delay);
      }
    }
  }
}


/* -------------------------------------------------------
   GUARDAR / CARGAR
------------------------------------------------------- */
export function saveReminders() {
  const serializable = reminders.map(r => {
    const copy = { ...r };
    delete copy._timeout;
    return copy;
  });

  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(serializable, null, 2));
}

export function loadReminders() {
  if (!fs.existsSync(REMINDERS_FILE)) return;
  const data = JSON.parse(fs.readFileSync(REMINDERS_FILE, "utf8"));
  reminders.push(...data);
}

/* -------------------------------------------------------
   CANCELAR
------------------------------------------------------- */
export function cancelReminder(id) {
  const index = reminders.findIndex(r => r.id === id);
  if (index === -1) return false;

  const reminder = reminders[index];
  if (reminder._timeout) {
    clearTimeout(reminder._timeout);
  }
  reminders.splice(index, 1);
  saveReminders();

  return true;
}


/*-------------------------------------------------------
    BORRAR TODOS LOS RECORDATORIOS Y TIMERS EXPIRADOS
-------------------------------------------------------*/
export function cleanupExpiredReminders() {
  const now = Date.now();

  const alive = reminders.filter(r => {
    if (r.type === "timer") {
      const elapsed = now - r.createdAt;
      return elapsed < r.durationMs;
    }

    if (r.type === "reminder") {
      const target = new Date(r.date).getTime();
      return target > now;
    }

    return false;
  });

  reminders.length = 0;
  reminders.push(...alive);
  saveReminders();
}

/* -------------------------------------------------------
    BORRAR TODOS LOS TIMEOUTS ACTIVOS
------------------------------------------------------- */
export function clearAllTimeouts() {
  for (const r of reminders) {
    if (r._timeout) {
      clearTimeout(r._timeout);
      r._timeout = null;
    }
  }
}

/* -------------------------------------------------------
   LEER TODOS LOS REMINDERS ACTIVOS EN VOZ ALTA
------------------------------------------------------- */
export function getActiveRemindersText() {
  const now = Date.now();
  const activeReminders = [];

  for (const r of reminders) {
    let isActive = false;
    let timeLeftText = "";

    if (r.type === "timer") {
      const elapsed = now - r.createdAt;
      const remainingMs = r.durationMs - elapsed;

      if (remainingMs > 0) {
        isActive = true;
        const seconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
          timeLeftText = `${hours} hora${hours > 1 ? 's' : ''} y ${minutes % 60} minuto${minutes % 60 !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          timeLeftText = `${minutes} minuto${minutes > 1 ? 's' : ''} y ${seconds % 60} segundo${seconds % 60 !== 1 ? 's' : ''}`;
        } else {
          timeLeftText = `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        }
      }
    }

    if (r.type === "reminder") {
      const target = new Date(r.date).getTime();
      const remainingMs = target - now;

      if (remainingMs > 0) {
        isActive = true;
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          timeLeftText = `${days} día${days > 1 ? 's' : ''}, ${hours} hora${hours !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
          timeLeftText = `${hours} hora${hours > 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          timeLeftText = `${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else {
          timeLeftText = `menos de un minuto`;
        }
      }
    }

    if (isActive) {
      let typeText = r.type === "timer" ? "temporizador" : "recordatorio";
      activeReminders.push(`${typeText}: "${r.message}", pendiente en ${timeLeftText}`);
    }
  }

  if (activeReminders.length === 0) {
    return "No tienes temporizadores ni recordatorios activos.";
  }

  if (activeReminders.length === 1) {
    return `Tienes un ${activeReminders[0]}.`;
  }

  const lista = activeReminders.slice(0, -1).join(", ");
  const ultimo = activeReminders[activeReminders.length - 1];
  return `Tienes ${activeReminders.length} elementos pendientes: ${lista} y ${ultimo}.`;
}

