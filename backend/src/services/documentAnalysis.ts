import { createWorker } from 'tesseract.js';
import type { AnalysisResult, OpenRouterResponse } from '../types/index.js';
import { extractTextFromPDF } from './pdfService.js';

const MEDICAL_RELEVANCE_CHECK_PROMPT = `
You are a medical document classifier. Analyze the following text and determine if it contains medical information.

Medical documents include:
- Lab reports, blood tests, diagnostic results
- Prescriptions, medication lists
- Doctor's notes, clinical summaries
- Radiology reports (X-ray, MRI, CT scan)
- Vaccination records
- Hospital discharge summaries
- Medical bills or insurance documents
- Health checkup reports
- Pathology reports

Non-medical documents include:
- Legal documents
- Financial statements
- Educational certificates
- General PDFs, books, articles
- Invoices (non-medical)
- Personal letters
- Technical manuals

Analyze the text and respond with ONLY a JSON object in this format:

{
  "isMedical": true/false,
  "confidence": "high/medium/low",
  "documentType": "string describing the type of document",
  "reason": "brief explanation of your classification"
}

Text to analyze:
`;

const MASTER_MEDICAL_ANALYSIS_PROMPT = `
You are an expert medical analyst AI assistant. Your task is to analyze the following medical document and provide a comprehensive, structured analysis. Please maintain strict medical accuracy while making the information accessible to patients.

Analysis Instructions:

1. Document Summary
   - Provide a brief overview of the document type and purpose
   - Identify the date, patient information (if present), and healthcare provider

2. Key Medical Findings
   - List all significant medical findings, test results, or diagnoses
   - Highlight any abnormal values or concerning results
   - Compare values to normal reference ranges when applicable

3. Medical Terminology Explanation
   - Identify and explain complex medical terms in simple language

4. Medications Analysis (if applicable)
   - List all medications with dosage, frequency, and purpose

5. Diagnoses
   - Extract all diagnoses or conditions mentioned

6. Recommendations & Follow-up
   - Categorize recommendations by type and urgency

7. Warnings
   - Separate urgent findings from general warnings

8. Questions for Healthcare Provider
   - Generate 3-5 relevant questions the patient should ask

9. Summary
   - Provide a patient-friendly summary of the entire document

Important Notes:
- Format section titles clearly as "1. Document Summary", "2. Key Medical Findings", etc.
- Do not output empty bullet points, standalone dashes, or stray divider lines like "--".
- Use "⚠️" prefix for urgent findings
- Use "ℹ️" prefix for important information
- Use "✅" prefix for normal results
- Do not provide medical advice or diagnosis
- Always recommend consulting healthcare providers
- Flag life-threatening findings immediately
`;

const CANDIDATE_MODELS = [
    'deepseek/deepseek-chat',
    'meta-llama/llama-3.3-70b-instruct',
    'google/gemini-2.5-flash',
    'openrouter/auto'
];

function getFileExtension(fileName: string): string {
    return fileName
        .slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
        .toLowerCase();
}

async function extractTextFromImage(
    imageData: Buffer
): Promise<string> {
    try {
        const worker = await createWorker('eng');

        const result = await worker.recognize(imageData);

        await worker.terminate();

        return result.data.text;
    } catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to extract text from image');
    }
}

async function callOpenRouter(
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>,
    maxTokens = 1500,
    temperature = 0.3
): Promise<string> {

    // IMPORTANT:
    // This is server-side only.
    // Never use VITE_OPENROUTER_API_KEY here.
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (
        !apiKey ||
        apiKey === 'your_openrouter_api_key' ||
        apiKey.trim() === ''
    ) {
        throw new Error(
            'OPENROUTER_API_KEY is missing from the backend environment variables.'
        );
    }

    let lastError: Error | null = null;

    for (const model of CANDIDATE_MODELS) {
        try {
            const response = await fetch(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                        'HTTP-Referer':
                            process.env.SITE_URL ||
                            'https://diagnosely-one.vercel.app',
                        'X-Title': 'Diagnosely Medical Document Analyzer'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature,
                        max_tokens: maxTokens
                    })
                }
            );

            if (response.ok) {
                const data =
                    (await response.json()) as OpenRouterResponse;

                const content =
                    data.choices?.[0]?.message?.content;

                if (content && content.trim().length > 0) {
                    return content;
                }
            } else {
                const errText = await response
                    .text()
                    .catch(() => '');

                console.warn(
                    `OpenRouter model ${model} returned ${response.status}:`,
                    errText
                );

                if (response.status === 401) {
                    throw new Error(
                        'OpenRouter authorization failed. Check OPENROUTER_API_KEY.'
                    );
                }

                lastError = new Error(
                    `OpenRouter ${response.status}: ${errText}`
                );
            }
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('authorization failed')
            ) {
                throw error;
            }

            console.warn(
                `OpenRouter fetch error for ${model}:`,
                error
            );

            lastError =
                error instanceof Error
                    ? error
                    : new Error(String(error));
        }
    }

    throw (
        lastError ||
        new Error(
            'Failed to connect to OpenRouter AI models.'
        )
    );
}

async function checkMedicalRelevance(
    text: string
): Promise<{
    isMedical: boolean;
    confidence: string;
    documentType: string;
    reason: string;
}> {
    try {
        const textSample = text.substring(0, 1000);

        const result = await callOpenRouter(
            [
                {
                    role: 'system',
                    content:
                        'You are a document classifier. Respond only with valid JSON.'
                },
                {
                    role: 'user',
                    content:
                        `${MEDICAL_RELEVANCE_CHECK_PROMPT}\n\n${textSample}`
                }
            ],
            150,
            0.1
        );

        const jsonMatch = result.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return JSON.parse(result);
    } catch (error) {
        if (
            error instanceof Error &&
            error.message.toLowerCase().includes('authorization')
        ) {
            throw error;
        }

        console.warn(
            'Relevance check warning, proceeding with full OpenRouter AI analysis:',
            error
        );

        return {
            isMedical: true,
            confidence: 'medium',
            documentType: 'medical_report',
            reason:
                'Proceeding with OpenRouter AI analysis'
        };
    }
}

async function analyzeTextWithLLM(
    text: string,
    fileName: string
): Promise<AnalysisResult> {

    const relevanceCheck =
        await checkMedicalRelevance(text);

    if (!relevanceCheck.isMedical) {
        return {
            fileName,
            originalText:
                text.substring(0, 500) + '...',
            analysis: `⚠️ **Non-Medical Document Detected**

This document appears to be a **${relevanceCheck.documentType}** and not a medical document.

Our medical assistant is designed specifically to analyze medical documents such as:

• Lab reports and test results
• Prescriptions and medication lists
• Doctor's notes and clinical summaries
• Radiology reports (X-ray, MRI, CT scans)

Please upload a medical document for analysis.`,
            confidence:
                relevanceCheck.confidence as
                | 'high'
                | 'medium'
                | 'low',
            type: 'non_medical_document'
        };
    }

    const responseText = await callOpenRouter(
        [
            {
                role: 'system',
                content: MASTER_MEDICAL_ANALYSIS_PROMPT
            },
            {
                role: 'user',
                content:
                    `Please analyze this medical document from file "${fileName}":\n\n${text.substring(
                        0,
                        3000
                    )}`
            }
        ],
        1500,
        0.3
    );

    return {
        fileName,
        originalText: text,
        analysis: responseText,
        confidence: 'high',
        type:
            relevanceCheck.documentType ||
            'medical_report'
    };
}

export async function analyzeDocument(
    fileName: string,
    fileData: Buffer
): Promise<AnalysisResult> {

    try {
        let text: string;

        const fileExt = getFileExtension(fileName);

        if (fileExt === 'pdf') {
            text = await extractTextFromPDF(fileData);
        } else if (
            ['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(
                fileExt
            )
        ) {
            text = await extractTextFromImage(fileData);
        } else {
            throw new Error(
                `Unsupported file type: ${fileExt}`
            );
        }

        if (!text || text.trim().length < 10) {
            throw new Error(
                'Unable to extract meaningful text from the document'
            );
        }

        return await analyzeTextWithLLM(
            text,
            fileName
        );

    } catch (error) {
        console.error(
            'Error analyzing document:',
            error
        );

        throw error;
    }
}

export async function analyzeLabReport(
    fileName: string,
    fileData: Buffer
): Promise<AnalysisResult> {
    return analyzeDocument(fileName, fileData);
}

export async function analyzePrescription(
    fileName: string,
    fileData: Buffer
): Promise<AnalysisResult> {
    return analyzeDocument(fileName, fileData);
}

export async function analyzeRadiologyReport(
    fileName: string,
    fileData: Buffer
): Promise<AnalysisResult> {
    return analyzeDocument(fileName, fileData);
}