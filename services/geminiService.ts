
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyInsight = async (userName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Give a very short (max 12 words) welcoming message for ${userName}. Mention something inspirational for a productive day.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini insight error:", error);
    return `Hope you have an amazing day, ${userName}!`;
  }
};

/**
 * Maps WMO Weather codes to our dashboard conditions
 * https://open-meteo.com/en/docs
 */
const mapWmoToCondition = (code: number): string => {
  if (code === 0) return 'Sunny';
  if (code >= 1 && code <= 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Cloudy'; // Fog
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) return 'Rainy';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snowy';
  return 'Sunny';
};

/**
 * Fetches weather data using either a string location or coordinates.
 */
export const getWeatherInfo = async (location: string, coords?: { lat: number, lng: number }) => {
  try {
    let latitude: number;
    let longitude: number;
    let resolvedLocationName: string;

    if (coords) {
      // Direct coordinate access (fastest/most reliable)
      latitude = coords.lat;
      longitude = coords.lng;
      resolvedLocationName = location || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    } else {
      const query = (location && location.trim().length > 0) ? location : 'San Francisco';
      
      // 1. Geocode the location string to Lat/Lng
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
      if (!geoRes.ok) throw new Error("Geocoding service unavailable");
      
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        // Silent fallback to San Francisco if the specific location wasn't found
        const sfRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=San%20Francisco&count=1&language=en&format=json`);
        const sfData = await sfRes.json();
        latitude = sfData.results[0].latitude;
        longitude = sfData.results[0].longitude;
        resolvedLocationName = `San Francisco (Default)`;
      } else {
        latitude = geoData.results[0].latitude;
        longitude = geoData.results[0].longitude;
        resolvedLocationName = `${geoData.results[0].name}, ${geoData.results[0].admin1 || ''}`;
      }
    }

    // 2. Fetch real-time weather from Open-Meteo
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
    if (!weatherRes.ok) throw new Error("Weather service unavailable");
    const weatherData = await weatherRes.json();
    
    const currentTemp = Math.round(weatherData.current.temperature_2m);
    const condition = mapWmoToCondition(weatherData.current.weather_code);

    // 3. Use Gemini to generate a creative description based on the REAL data
    const aiDescResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The weather at ${resolvedLocationName} is ${currentTemp}°F and ${condition}. Write a friendly, one-sentence description of how this feels.`,
    });

    return { 
      temp: currentTemp, 
      condition: condition, 
      description: aiDescResponse.text || `It's a ${condition.toLowerCase()} day.`,
      locationName: resolvedLocationName,
      latitude,
      longitude
    };
  } catch (error) {
    console.warn("Weather service encountered an issue, using fallback:", error);
    return { 
      temp: 72, 
      condition: 'Sunny', 
      description: 'The weather is looking great today.', 
      locationName: location || 'Global' 
    };
  }
};

export const getMockNews = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "List 5 top trending news headlines today. Format as a simple list. Do not include extra text.",
    });
    return response.text.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
  } catch (error) {
    return [
      "New Breakthrough in Energy Efficiency",
      "Global Markets Show Resilience",
      "Mars Rover Discovers Ancient Riverbed",
      "AI Tools Reshaping Productivity",
      "Major Advances in Ocean Conservation"
    ];
  }
};
