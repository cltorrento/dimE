import * as Speech from 'expo-speech';

export const speakText = (text: string) => {
  Speech.speak(text, { language: 'es-ES' });
};
