import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { whisperToText } from '../services/speechToText';
import { translateText } from '../services/translate';
import { speakText } from '../services/textToSpeech';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      console.log('Solicitando permisos...');
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos de micrófono para grabar');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Iniciando grabación...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      console.log('Grabación iniciada');
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setLoading(true);
    console.log('Deteniendo grabación...');
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        console.log('Grabación guardada en:', uri);
        
        // Procesar audio con Whisper
        console.log('Transcribiendo audio...');
        const transcript = await whisperToText(uri);
        console.log('Transcripción:', transcript);

        // Traducir texto
        console.log('Traduciendo texto...');
        const translation = await translateText(transcript);
        console.log('Traducción:', translation);

        setTranslated(translation);

        // Texto a voz
        await speakText(translation);
      }
    } catch (error) {
      console.error('Error al procesar grabación:', error);
      Alert.alert('Error', 'No se pudo procesar la grabación');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordToggle = async () => {
    if (!isRecording) {
      setTranslated('');
      await startRecording();
    } else {
      await stopRecording();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        Traductor en Tiempo Real
      </Text>

      <TouchableOpacity
        onPress={handleRecordToggle}
        disabled={loading}
        style={{
          backgroundColor: isRecording ? '#FF3B30' : '#007AFF',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          {isRecording ? 'Detener grabación' : 'Hablar en Alemán'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10, color: '#666' }}>
            Procesando audio...
          </Text>
        </View>
      )}

      {translated !== '' && (
        <View style={{ 
          marginTop: 24, 
          padding: 16, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 8,
          width: '100%'
        }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Traducción:
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center' }}>
            {translated}
          </Text>
        </View>
      )}
    </View>
  );
}