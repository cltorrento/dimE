import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { startRecording, stopRecording } from '../services/speechToText';
import { translateText } from '../services/translate';
import { speakText } from '../services/textToSpeech';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    setIsRecording(true);
    setTranslated('');
    const audioUri = await startRecording();
    const { transcript } = await stopRecording(audioUri);
    setLoading(true);
    const translation = await translateText(transcript);
    setTranslated(translation);
    speakText(translation);
    setLoading(false);
    setIsRecording(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Traductor en Tiempo Real</Text>

      <TouchableOpacity
        onPress={handleRecord}
        disabled={isRecording || loading}
        style={{ backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          {isRecording ? 'Escuchando...' : 'Hablar en Alemán'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}

      {translated !== '' && (
        <Text style={{ marginTop: 24, fontSize: 16, textAlign: 'center' }}>
          Traducción: {translated}
        </Text>
      )}
    </View>
  );
}
