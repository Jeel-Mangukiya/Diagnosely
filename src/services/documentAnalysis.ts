import { createWorker } from 'tesseract.js';
import { AnalysisResult, OpenRouterResponse } from '@/types';
import { extractTextFromPDF } from './pdfService';

// Medical relevance check prompt
const MEDICAL_RELEVANCE_CHECK_PROMPT = `You are a medical document classifier. Analyze the following text and determine if it contains medical information.

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

Text to analyze:`;

// Master prompt for medical document analysis
const MASTER_MEDICAL_ANALYSIS_PROMPT = `You are an expert medical analyst AI assistant. Your task is to analyze the following medical document and provide a comprehensive, structured analysis. Please maintain strict medical accuracy while making the information accessible to patients.

**Analysis Instructions:**

1. **Document Summary**
   - Provide a brief overview of the document type and purpose
   - Identify the date, patient information (if present), and healthcare provider

2. **Key Medical Findings**
   - List all significant medical findings, test results, or diagnoses
   - Highlight any abnormal values or concerning results  
   - Compare values to normal reference ranges when applicable

3. **Medical Terminology Explanation**
   - Identify and explain complex medical terms in simple language

4. **Medications Analysis** (if applicable)
   - List all medications with dosage, frequency, and purpose

5. **Diagnoses**
   - Extract all diagnoses or conditions mentioned

6. **Recommendations & Follow-up**
   - Categorize recommendations by type and urgency

7. **Warnings**
   - Separate urgent findings from general warnings

8. **Questions for Healthcare Provider**
   - Generate 3-5 relevant questions the patient should ask

9. **Summary**
   - Provide a patient-friendly summary of the entire document

**Important Notes:**
- Use "⚠️" prefix for urgent findings
- Use "ℹ️" prefix for important information  
- Use "✅" prefix for normal results
- Do not provide medical advice or diagnosis
- Always recommend consulting healthcare providers
- Flag life-threatening findings immediately`;

// Helper function to get file extension
function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
}

async function extractTextFromImage(imageData: ArrayBuffer, fileName: string): Promise<string> {
  try {
    const uint8Array = new Uint8Array(imageData);
    const blob = new Blob([uint8Array], { type: 'image/png' });
    const imageUrl = URL.createObjectURL(blob);
    
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    
    URL.revokeObjectURL(imageUrl);
    return text;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to extract text from image');
  }
}

// New function to check if the document is medical
async function checkMedicalRelevance(text: string): Promise<{isMedical: boolean, confidence: string, documentType: string, reason: string}> {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.');
    }

    // Take a sample of the text for relevance check (first 1000 characters should be enough)
    const textSample = text.substring(0, 1000);

    const requestBody = {
      model: 'deepseek/deepseek-chat-v3-0324:free', // Using a free model for the check
      messages: [
        {
          role: 'system',
          content: 'You are a document classifier. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: `${MEDICAL_RELEVANCE_CHECK_PROMPT}\n\n${textSample}`
        }
      ],
      temperature: 0.1, // Low temperature for more consistent classification
      max_tokens: 150
    };

    console.log('Sending relevance check request...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
        'X-Title': 'Medical Document Analyzer'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Relevance check API error:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }

    const data: OpenRouterResponse = await response.json();
    const result = data.choices[0]?.message?.content;

    if (!result) {
      throw new Error('No response from relevance check');
    }

    try {
      // Clean the response in case it has extra text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse relevance check response:', result);
      // Default to treating as non-medical if we can't parse the response
      return {
        isMedical: false,
        confidence: 'low',
        documentType: 'unknown',
        reason: 'Unable to determine document type'
      };
    }
  } catch (error) {
    console.error('Error checking medical relevance:', error);
    // In case of error, default to allowing the analysis to proceed
    return {
      isMedical: true,
      confidence: 'low',
      documentType: 'unknown',
      reason: 'Error during classification, proceeding with analysis'
    };
  }
}

async function analyzeTextWithLLM(text: string, fileName: string): Promise<AnalysisResult> {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not found. Please set VITE_OPENROUTER_API_KEY in your .env file.');
    }

    // First, check if the document is medical
    const relevanceCheck = await checkMedicalRelevance(text);
    
    if (!relevanceCheck.isMedical) {
      // Return a non-medical document response
      return {
        fileName,
        originalText: text.substring(0, 500) + '...', // Truncate for response
        analysis: `⚠️ **Non-Medical Document Detected**

This document appears to be a **${relevanceCheck.documentType}** and not a medical document. 

**Our medical assistant is designed specifically to analyze medical documents such as:**
• Lab reports and test results
• Prescriptions and medication lists
• Doctor's notes and clinical summaries
• Radiology reports (X-ray, MRI, CT scans)
• Hospital discharge summaries
• Health checkup reports
• Vaccination records
• Pathology reports

**Please upload a medical document for analysis.**

If you believe this is a medical document, please ensure it contains clear medical information such as test results, diagnoses, or medical terminology.

**Classification Details:**
- Document Type: ${relevanceCheck.documentType}
- Confidence: ${relevanceCheck.confidence}
- Reason: ${relevanceCheck.reason}`,
        confidence: relevanceCheck.confidence as 'high' | 'medium' | 'low',
        type: 'non_medical_document'
      };
    }

    // Proceed with medical analysis if the document is medical
    const requestBody = {
      model: 'deepseek/deepseek-chat-v3-0324:free', // Using a free model
      messages: [
        {
          role: 'system',
          content: MASTER_MEDICAL_ANALYSIS_PROMPT
        },
        {
          role: 'user',
          content: `Please analyze this medical document from file "${fileName}":\n\n${text.substring(0, 3000)}` // Limit text to avoid token limits
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    };

    console.log('Sending medical analysis request...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
        'X-Title': 'Medical Document Analyzer'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Medical analysis API error:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }

    const data: OpenRouterResponse = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis received from LLM');
    }

    return {
      fileName,
      originalText: text,
      analysis,
      confidence: 'high',
      type: relevanceCheck.documentType || 'medical_report'
    };
  } catch (error) {
    console.error('Error analyzing text with LLM:', error);
    throw new Error(`Analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateAndEnrichAnalysis(analysis: any, fileName: string): AnalysisResult {
  return {
    fileName,
    originalText: analysis.originalText || '',
    analysis: analysis.analysis || 'Analysis not available',
    confidence: analysis.confidence || 'medium',
    type: analysis.type || 'medical_report'
  };
}

export async function analyzeDocument(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult> {
  try {
    let text: string;
    const fileExt = getFileExtension(fileName);

    // Extract text based on file type
    if (fileExt === 'pdf') {
      text = await extractTextFromPDF(fileData);
    } else if (['jpg', 'jpeg', 'png', 'tiff', 'bmp'].includes(fileExt)) {
      text = await extractTextFromImage(fileData, fileName);
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    // Check if text extraction was successful
    if (!text || text.trim().length < 10) {
      throw new Error('Unable to extract meaningful text from the document');
    }

    // Analyze the extracted text using LLM (includes relevance check)
    const analysis = await analyzeTextWithLLM(text, fileName);
    return analysis;
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}

export async function analyzeLabReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult> {
  return analyzeDocument(fileName, fileData);
}

export async function analyzePrescription(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult> {
  return analyzeDocument(fileName, fileData);
}

export async function analyzeRadiologyReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult> {
  return analyzeDocument(fileName, fileData);
}