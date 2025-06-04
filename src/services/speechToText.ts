import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

let recording: Audio.Recording;

export const startRecording = async (): Promise<string> => {
    try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const recordingOptions = {
            android: {
                extension: '.m4a',
                outputFormat: 2, // MPEG_4
                audioEncoder: 3, // AAC
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
            },
            ios: {
                extension: '.caf',
                audioQuality: 127, // AVAudioQuality.high = 0x7F
                sampleRate: 44100,
                numberOfChannels: 2,
                bitRate: 128000,
                linearPCMBitDepth: 16,
                linearPCMIsBigEndian: false,
                linearPCMIsFloat: false,
            },
            web: {
                mimeType: 'audio/webm',
                bitsPerSecond: 128000,
            },
        };


        recording = new Audio.Recording();
        await recording.prepareToRecordAsync(recordingOptions);

        await recording.startAsync();

        return ''; // En este ejemplo no se retorna aún la URI
    } catch (error) {
        console.error('Error al iniciar grabación:', error);
        throw error;
    }
};

export const stopRecording = async (uri?: string) => {
    try {
        await recording.stopAndUnloadAsync();
        const uriFinal = recording.getURI();

        const base64Audio = await FileSystem.readAsStringAsync(uriFinal!, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const transcript = await whisperToText(base64Audio);
        return { transcript };
    } catch (error) {
        console.error('Error al detener grabación:', error);
        throw error;
    }
};

const whisperToText = async (base64Audio: string): Promise<string> => {
    const formData = new FormData();

    formData.append('file', {
        uri: `data:audio/webm;base64,${base64Audio}`,
        name: 'audio.webm',
        type: 'audio/webm',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'de');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        },
        body: formData,
    });

    const data = await response.json();
    return data.text || 'Error en transcripción';
};
