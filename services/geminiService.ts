import { GoogleGenAI, Type } from "@google/genai";
import type { EvaluationResult } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const transcribeImage = async (imageFile: File): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("A chave da API da Gemini não foi configurada. Defina a variável de ambiente API_KEY.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const base64Image = await fileToBase64(imageFile);

        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64Image,
            },
        };
        
        const textPart = { text: "Transcreva o texto manuscrito contido nesta imagem. Retorne apenas o texto transcrito, sem qualquer formatação, cabeçalhos ou comentários adicionais." };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Erro ao chamar a API Gemini para transcrição:", error);
        throw new Error("Não foi possível ler o texto na imagem. Tente novamente com uma foto mais nítida e bem iluminada.");
    }
}


const analysisPrompt = `
Você é um avaliador especialista em redações do ENEM (Exame Nacional do Ensino Médio) do Brasil. Sua tarefa é analisar o texto de uma redação fornecido a seguir e fornecer uma avaliação detalhada e construtiva.

Siga estas etapas rigorosamente:
1.  **Avaliação por Competências:** Avalie o texto extraído com base nas 5 competências oficiais do ENEM.
    *   **Competência I:** Demonstrar domínio da modalidade escrita formal da língua portuguesa.
    *   **Competência II:** Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento para desenvolver o tema, dentro dos limites estruturais do texto dissertativo-argumentativo em prosa.
    *   **Competência III:** Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.
    *   **Competência IV:** Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.
    *   **Competência V:** Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.
2.  **Atribuição de Notas:** Para cada competência, atribua uma nota de 0 a 200, em incrementos de 40 (0, 40, 80, 120, 160, 200).
3.  **Feedback Detalhado:** Para cada competência, forneça um parágrafo de feedback explicando a nota atribuída. Destaque os pontos fortes e as áreas que precisam de melhoria, oferecendo sugestões claras e práticas.
4.  **Resumo Geral e Nota Final:** Calcule a nota final somando as notas das 5 competências. Escreva um parágrafo de resumo geral da avaliação, consolidando os principais pontos de feedback.
5.  **Dicas de Melhoria:** Com base na análise, forneça uma lista curta (3 a 5 itens) de dicas acionáveis e específicas para o autor melhorar sua escrita em futuras redações.
6.  **Formato de Saída:** Retorne a sua análise estritamente no formato JSON, conforme o schema definido. Não inclua markdown ou qualquer texto fora da estrutura JSON.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.INTEGER,
            description: "A nota final total, que é a soma das notas das 5 competências (0 a 1000)."
        },
        summary: {
            type: Type.STRING,
            description: "Um parágrafo de resumo geral da avaliação, destacando os pontos fortes e fracos principais."
        },
        competencies: {
            type: Type.ARRAY,
            description: "Uma lista contendo a avaliação detalhada de cada uma das 5 competências.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "O nome da competência (ex: 'Competência I')."
                    },
                    score: {
                        type: Type.INTEGER,
                        description: "A nota para esta competência (0, 40, 80, 120, 160, ou 200)."
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "O feedback detalhado e construtivo para esta competência."
                    }
                },
                 required: ["name", "score", "feedback"]
            }
        },
        improvementInsights: {
            type: Type.ARRAY,
            description: "Uma lista de 3 a 5 dicas acionáveis para o autor melhorar a redação.",
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ["overallScore", "summary", "competencies", "improvementInsights"]
};


export const analyzeEssayText = async (essayText: string): Promise<EvaluationResult> => {
    if (!process.env.API_KEY) {
        throw new Error("A chave da API da Gemini não foi configurada. Defina a variável de ambiente API_KEY.");
    }
    if (!essayText || essayText.trim().length < 50) {
        throw new Error("O texto da redação é muito curto para ser analisado. Verifique a transcrição.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const fullContent = `${analysisPrompt}\n\n---\n\n# REDAÇÃO PARA ANÁLISE:\n\n${essayText}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullContent,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as EvaluationResult;
        
        // Basic validation
        if (!parsedResult.overallScore && parsedResult.overallScore !== 0 || !parsedResult.competencies || parsedResult.competencies.length !== 5 || !parsedResult.improvementInsights) {
            throw new Error("A resposta da IA está em um formato inválido ou incompleto.");
        }
        
        return parsedResult;

    } catch (error) {
        console.error("Erro ao chamar a API Gemini para análise:", error);
        throw new Error("Houve um problema com a IA durante a análise da redação. Tente novamente.");
    }
};