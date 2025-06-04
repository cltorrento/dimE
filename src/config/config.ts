import Constants from 'expo-constants';

interface Config {
    openaiApiKey: string;
}

const config: Config = {
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || Constants.expoConfig?.extra?.openaiApiKey || '',
};

// Validar que la API key existe
if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY no está configurada. Verifica tu archivo .env o app.config.js');
}

export default config;