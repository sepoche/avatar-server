//weather.js

import {getClientConfig} from './server.js';

// Función para obtener texto del clima

export function detectDay(text) {
    // Si viene vacío, null o undefined → hoy
    if (!text || text.trim() === "") {
        return "hoy";
    }

    text = text.toLowerCase();

    if (text.includes("hoy")) return "hoy";
    if (text.includes("mañana")) return "mañana";
    if (text.includes("ahora")) return "ahora";
    if (text.includes("semana")) return "semana";

    // Por defecto, si no reconoce nada → hoy
    return "hoy";
}


//const DAYSURLS = {
//    hoy: "https://wttr.in/Monistrol+de+Montserrat?format=3",
//    mañana: "https://wttr.in/Monistrol+de+Montserrat?format=j1",
//    semana: "https://wttr.in/Monistrol+de+Montserrat??format=j1",
//    ahora: "https://wttr.in/Monistrol+de+Montserrat?format=3"
//};

//export async function getWeatherText(day) {
//  const url = DAYSURLS[day];
//  const res = await fetch(url);
  // Ejemplo: "Monistrol de Montserrat: 🌦️ +12°C"
//  const text = await res.text();
//  console.log("🌤️ RAW WEATHER:", JSON.stringify(text));
//  return text;
//}

function toFormat3(desc, temp) {
    const emoji = desc.includes("sun") || desc.includes("clear") ? "☀️"
                : desc.includes("cloud") ? "☁️"
                : desc.includes("rain") ? "🌧️"
                : "🌡️";

    return `Monistrol+de+Montserrat: ${emoji}  +${temp}°C`;
}

// Modifica esta función en tu weather.js existente

export async function getWeatherText(day = "ahora") {
    // Obtener configuración del cliente (tu código existente)
    const config = await getClientConfig();
    const city = (config.city || 'Barcelona').trim();
    const encodedCity = city.replace(/\s+/g, '+');

    try {
        // INTENTAR USAR CACHÉ DEL SERVIDOR primero
        if (day === "ahora" || day === "hoy") {
            try {
                const cacheResponse = await fetch('/api/weather/cached');
                const cacheData = await cacheResponse.json();
                
                // Si hay caché válido, usarlo
                if (cacheData.success && cacheData.data) {
                    console.log('📦 Usando clima cacheado:', cacheData.data);
                    const w = cacheData.data;
                    // Devolver en el mismo formato que espera wttr.in
                    return `${w.ciudad}: ${getEmojiFromDesc(w.descripcion)} ${w.temperatura}°C`;
                }
            } catch (e) {
                console.log('Caché no disponible, usando wttr.in');
            }
        }
        
        // SI NO HAY CACHÉ O ES OTRO DÍA, usar wttr.in directamente
        if (day === "ahora" || day === "hoy") {
            const res = await fetch(`https://wttr.in/${encodedCity}?format=3`, {
                timeout: 5000
            });
            if (!res.ok) throw new Error("Respuesta no válida de wttr.in");
            return await res.text();
        }

        const res = await fetch(`https://wttr.in/${encodedCity}?format=j1`, {
            timeout: 5000
        });
        if (!res.ok) throw new Error("Error en wttr.in API");
        
        const data = await res.json();
        
        if (day === "mañana") {
            const tomorrow = data.weather[1];
            return `${city}: ${getEmojiFromDesc(tomorrow.hourly[0].weatherDesc[0].value)} ${tomorrow.avgtempC}°C`;
        } else if (day === "semana") {
            const weekForecast = data.weather.slice(0, 5).map(day => 
                `${getEmojiFromDesc(day.hourly[0].weatherDesc[0].value)} ${day.avgtempC}°C`
            ).join(' | ');
            return `${city}: ${weekForecast}`;
        }
        
        return "No se pudo obtener el clima";
        
    } catch (err) {
        console.error("❌ Error en getWeatherText:", err.message);
        return "No he podido obtener el tiempo ahora mismo.";
    }
}

// Función helper para mantener compatibilidad
function getEmojiFromDesc(desc) {
    const descLower = desc.toLowerCase();
    if (descLower.includes('sun') || descLower.includes('clear')) return '☀️';
    if (descLower.includes('cloud')) return '☁️';
    if (descLower.includes('rain')) return '🌧️';
    if (descLower.includes('thunder')) return '⛈️';
    if (descLower.includes('snow')) return '❄️';
    if (descLower.includes('fog') || descLower.includes('mist')) return '🌫️';
    return '🌡️';
}



//funcion para normalizar texto del clima
function normalizeWeatherRaw(raw) {
    return raw
        .replace(/\+/g, " ") // convertir + en espacios
        .replace(/\s+/g, " ") // colapsar espacios múltiples
        .trim();
}

//funcion para cambiar icon de clima

function getWeatherConditionFromEmoji(text) {
    const map = {
        "☀️": "cielo despejado",
        "☀": "cielo despejado",
        "🌞": "cielo despejado",
        "🌤️": "parcialmente soleado",
        "🌤": "parcialmente soleado",
        "⛅": "nubes dispersas",
        "☁️": "cubierto",
        "☁️": "cielo nublado",
        "☁": "cielo nublado",
        "🌦️": "lluvia ligera",
        "🌦": "lluvia ligera",
        "🌧️": "lluvia",
        "🌧": "lluvia",
        "⛈️": "tormenta",
        "⛈": "tormenta",
        "🌫️": "niebla",
        "🌫": "niebla"
    };

    for (const emoji in map) {
        if (text.includes(emoji)) return map[emoji];
    }

    return null;
}



//funcion para narrar el clima

export function naturalizeWeatherText(raw, day) {
    console.log("RAW:", raw);

    const condition = getWeatherConditionFromEmoji(raw);

    raw = normalizeWeatherRaw(raw);
    console.log("NORMALIZED:", raw);

    let clean = raw
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/\uFE0F/g, "")   // <--- elimina variation selectors invisibles
        .trim();

    console.log("CLEAN:", clean);

    const match = clean.match(/^(.*?):\s*([+-]?\d+)\s*°C/i);
    console.log("MATCH:", match);

    if (!match) {
        return "No he podido obtener el tiempo ahora mismo.";
    }

    const city = match[1].trim();
    const temp = parseInt(match[2], 10);

    let thermal = "";
    if (temp <= 0) thermal = "hace bastante frío";
    else if (temp <= 10) thermal = "hace frío";
    else if (temp <= 18) thermal = "el clima es fresco";
    else if (temp <= 25) thermal = "la temperatura es agradable";
    else if (temp <= 32) thermal = "hace calor";
    else thermal = "hace mucho calor";

    let sentence = `El tiempo ${day} en ${city} hay ${temp} grados`;
    if (condition) sentence += ` y ${condition}`;
    sentence += `, ${thermal}.`;

    return sentence;
}

// Variable para caché del clima
export let weatherCache = {
    data: null,
    timestamp: null,
    city: null
};

// Función para actualizar el clima (usa tu misma lógica)
export async function updateWeatherCache() {
    try {
            // Usar la ciudad de la configuración o default
            const config = await getClientConfig();
            const city = (config.city || 'Barcelona').trim();
            // Reemplazar espacios por "+" para la URL
            const encodedCity = city.replace(/\s+/g, '+');

            console.log('🌤️ Actualizando caché del clima para:', city);

            // Usar el mismo formato que en tu weather.js
            const response = await fetch(`https://wttr.in/${encodedCity}?format=j1`);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const current = data.current_condition[0];
        const englishDesc = current.weatherDesc[0].value;
        const translatedDesc = translateWeatherDescription(englishDesc);
        
        // Nuevos datos válidos
        const newData = {
            temperatura: current.temp_C,
            humedad: current.humidity,
            descripcion: translatedDesc,
            descripcionOriginal: englishDesc,
            ciudad: city.replace(/\+/g, ' ')
        };
        
        // Actualizar caché
        weatherCache = {
            data: newData,
            timestamp: Date.now(),
            lastValidData: newData,           // Guardar como último válido
            lastValidTimestamp: Date.now(),
            city: city
        };
        
        console.log('✅ Caché actualizado:', newData.temperatura + '°C');
        return newData;
        
    } catch (error) {
        console.error('❌ Error actualizando caché:', error.message);
        
        // Si hay error pero tenemos lastValidData, lo mantenemos
        if (weatherCache.lastValidData) {
            console.log('⚠️ Usando último dato válido de:', new Date(weatherCache.lastValidTimestamp).toLocaleString());
            weatherCache.data = weatherCache.lastValidData;
            weatherCache.timestamp = weatherCache.lastValidTimestamp;
        }
        return false;
    }
}

function translateWeatherDescription(englishDesc) {
    const translations = {
        // Soleado / Despejado
        'sunny': 'soleado',
        'clear': 'despejado',
        'clear sky': 'cielo despejado',
        'sun': 'sol',
        
        // Nubes
        'partly cloudy': 'parcialmente nublado',
        'cloudy': 'nublado',
        'overcast': 'cubierto',
        'cloud': 'nubes',
        'clouds': 'nublado',
        
        // Lluvia
        'rain': 'lluvia',
        'light rain': 'lluvia ligera',
        'moderate rain': 'lluvia moderada',
        'heavy rain': 'lluvia fuerte',
        'drizzle': 'llovizna',
        'showers': 'chubascos',
        'patchy rain': 'lluvia dispersa',
        
        // Tormenta
        'thunder': 'tormenta',
        'thunderstorm': 'tormenta eléctrica',
        'thundery outbreaks': 'tormentas',
        
        // Nieve
        'snow': 'nieve',
        'light snow': 'nieve ligera',
        'heavy snow': 'nevada fuerte',
        'sleet': 'aguanieve',
        'blizzard': 'ventisca',
        
        // Niebla
        'fog': 'niebla',
        'mist': 'neblina',
        'haze': 'calima',
        
        // Viento
        'windy': 'ventoso',
        'breezy': 'con brisa',
        
        // Otros
        'fair': 'buen tiempo',
        'variable': 'variable'
    };
    
    const lowerDesc = englishDesc.toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    for (const [en, es] of Object.entries(translations)) {
        if (lowerDesc.includes(en)) {
            return es;
        }
    }
    
    // Si no hay traducción, devolver el original pero capitalizado
    console.log('⚠️ Sin traducción para:', englishDesc);
    return englishDesc;
}