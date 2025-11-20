import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateSubTopics = async (topic: string, context: string = ""): Promise<string[]> => {
    try {
        const client = getClient();
        const prompt = `
        I am building a mind map. 
        The current node is: "${topic}".
        The parent context is: "${context}".
        
        Please generate 3 to 5 brief, relevant sub-topics or child nodes for this concept.
        Keep the labels short and concise (under 5 words).
        `;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subtopics: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return data.subtopics || [];
        }
        return [];

    } catch (error) {
        console.error("Error generating subtopics:", error);
        throw error;
    }
};
