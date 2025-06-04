export const translateText = async (input: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Eres un traductor experto del alemán al español. Responde solo con la traducción.' },
                { role: 'user', content: input },
            ],
        }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
};
