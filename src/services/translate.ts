import config from '../config/config';

export const translateText = async (input: string): Promise<string> => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.openaiApiKey}`, // Aquí tu API key real
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'Eres un traductor experto del alemán al español. Responde solo con la traducción.' },
                    { role: 'user', content: input },
                ],
                temperature: 0,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Error en API OpenAI: ${errorBody}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No se recibió traducción en la respuesta.');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error en translateText:', error);
        throw error;
    }
};
