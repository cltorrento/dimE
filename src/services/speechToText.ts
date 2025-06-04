import * as FileSystem from 'expo-file-system';
import config from '../config/config';

export async function whisperToText(audioFilePath: string): Promise<string> {
    try {
        console.log('Procesando archivo de audio:', audioFilePath);

        // Obtener información del archivo
        const fileInfo = await FileSystem.getInfoAsync(audioFilePath);
        console.log('Info del archivo:', fileInfo);

        if (!fileInfo.exists) {
            throw new Error('El archivo de audio no existe');
        }

        // Crear FormData de manera compatible con Expo
        const formData = new FormData();

        // En Expo, formateamos el archivo de esta manera
        formData.append('file', {
            uri: audioFilePath,
            type: 'audio/m4a',
            name: 'audio.m4a',
        } as any);

        formData.append('model', 'whisper-1');
        formData.append('language', 'de'); // Especificar alemán para mejor precisión

        console.log('Enviando audio a OpenAI Whisper...');

        const apiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.openaiApiKey}`,
                // No incluir Content-Type, FormData lo establece automáticamente
            },
            body: formData,
        });

        console.log('Status de respuesta:', apiResponse.status);

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('Error de API OpenAI:', errorText);
            throw new Error(`API Error: ${apiResponse.status} - ${errorText}`);
        }

        const data = await apiResponse.json();
        console.log('Transcripción recibida:', data.text);

        if (!data.text) {
            throw new Error('No se recibió texto en la respuesta de Whisper');
        }

        return data.text;
    } catch (error) {
        console.error('Error detallado en whisperToText:', error);

        // Proporcionar más información sobre el tipo de error
        if ((error as Error).message.includes('Network request failed')) {
            throw new Error('Error de conexión. Verifica tu conexión a internet y la API key.');
        }

        throw new Error(`Error al transcribir audio: ${(error as Error).message}`);
    }
}