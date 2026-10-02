export interface AnalysisResult {
    fileName: string;
    originalText: string;
    analysis: string;
    confidence: 'high' | 'medium' | 'low';
    type: string;
}

export interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
            role: string;
        };
    }>;
}