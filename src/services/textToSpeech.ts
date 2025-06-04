import * as Speech from 'expo-speech';

/**
 * Reproduce un texto utilizando el motor de texto a voz.
 * @param text - El texto que se desea reproducir.
 * @param language - El código de idioma (ej: 'es-ES', 'en-US', 'de-DE'). Por defecto: 'es-ES'.
 */
export const speakText = (text: string, language: string = 'es-ES') => {
  if (!text) return;

  Speech.speak(text, {
    language,
    pitch: 1.0,
    rate: 0.9,
  });
};
