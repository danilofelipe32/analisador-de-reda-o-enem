import type { EvaluationResult } from '../types';

// The transcribeImage function is no longer supportable with the new API.
// It will be removed from the application flow.
export const transcribeImage = async (imageFile: File): Promise<string> => {
    console.error("Image transcription is not supported by ApiFreeLLM.");
    throw new Error("A funcionalidade de envio de imagem não é mais suportada. Por favor, digite ou cole sua redação diretamente.");
};


const stringifySchemaForPrompt = () => {
    // A simple string representation of the expected JSON structure.
    return `
    {
        "overallScore": integer (0-1000),
        "summary": string,
        "competencies": [
            {
                "name": string ("Competência I", "Competência II", etc.),
                "score": integer (0, 40, 80, 120, 160, or 200),
                "feedback": string
            }
        ],
        "improvementInsights": [string, string, ...],
        "deviations": [
            {
                "competency": string ("I", "II", "III", "IV", "V"),
                "type": string (e.g., "Erro de Ortografia", "Concordância Verbal"),
                "originalExcerpt": string (the original text with the error),
                "correction": string (the suggested correction),
                "comment": string (explanation of the error)
            }
        ]
    }
    `;
};


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
6.  **Desvios Gramaticais:** Identifique desvios gramaticais ou de norma culta. Para cada desvio, indique a competência afetada, o tipo de erro, o trecho original, uma sugestão de correção e um breve comentário. Se não houver desvios, retorne uma lista vazia para "deviations".
7.  **Formato de Saída:** Sua resposta DEVE ser um único objeto JSON válido, sem nenhuma formatação de markdown (como \`\`\`json). O JSON deve seguir estritamente a seguinte estrutura: ${stringifySchemaForPrompt()}
`;


export const analyzeEssayText = async (essayText: string): Promise<EvaluationResult> => {
    if (!essayText || essayText.trim().length < 50) {
        throw new Error("O texto da redação é muito curto para ser analisado. Por favor, escreva mais.");
    }
    
    const API_URL = "https://apifreellm.com/api/chat";
    const fullPrompt = `${analysisPrompt}\n\n---\n\n# REDAÇÃO PARA ANÁLISE:\n\n${essayText}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: fullPrompt }),
        });
        
        const data = await response.json();

        if (data.status !== 'success') {
            console.error("ApiFreeLLM Error:", data);
            const errorMessage = data.error || "Ocorreu um erro desconhecido na API.";
            if (data.status === 'rate_limited') {
                throw new Error(`Limite de requisições atingido. Por favor, aguarde ${data.retry_after || 5} segundos e tente novamente.`);
            }
            throw new Error(`Erro da API: ${errorMessage}`);
        }

        const jsonText = data.response.trim();
        // The API might wrap the JSON in markdown, so we need to clean it.
        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        const parsedResult = JSON.parse(cleanedJsonText) as EvaluationResult;
        
        // Basic validation
        if (!parsedResult.overallScore && parsedResult.overallScore !== 0 || !parsedResult.competencies || parsedResult.competencies.length !== 5) {
            console.warn("Validation failed for parsed result", parsedResult);
            throw new Error("A resposta da IA está em um formato inválido ou incompleto. A estrutura do JSON recebido não corresponde ao esperado.");
        }

        // Add `deviations` array if it's missing, as the prompt asks for it.
        if (!parsedResult.deviations) {
            parsedResult.deviations = [];
        }
        
        return parsedResult;

    } catch (error) {
        console.error("Erro ao processar a análise com ApiFreeLLM:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Não foi possível processar a resposta da IA. O formato do JSON retornado é inválido.");
        }
        if (error instanceof Error) {
            throw error; // Re-throw known errors
        }
        throw new Error("Houve um problema ao se comunicar com o serviço de IA. Tente novamente.");
    }
};
