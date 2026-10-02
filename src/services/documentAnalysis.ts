import { AnalysisResult } from '@/types';

/**
 * Sends selected files to the production backend endpoint for medical document analysis.
 * Endpoint: POST ${import.meta.env.VITE_API_URL}/api/analyze-documents
 * Form field: "files"
 */
export async function analyzeDocumentsWithBackend(files: File[] | FileList): Promise<AnalysisResult[]> {
  if (!files || files.length === 0) {
    throw new Error('No files selected for analysis.');
  }

  const fileArray = Array.from(files);
  const formData = new FormData();
  
  fileArray.forEach((file) => {
    formData.append('files', file);
  });

  const rawApiUrl = import.meta.env.VITE_API_URL || '';
  const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
  const endpoint = `${apiUrl}/api/analyze-documents`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
  } catch (netError) {
    console.error('Network error connecting to backend:', netError);
    throw new Error('Failed to connect to analysis server. Please ensure backend service is running.');
  }

  if (!response.ok) {
    let errorMsg = `Analysis server error (HTTP ${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMsg = errJson.error;
      }
    } catch (e) {
      // Non-JSON error response
    }
    throw new Error(errorMsg);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.results)) {
    throw new Error('Invalid response structure received from analysis server.');
  }

  return data.results as AnalysisResult[];
}

/**
 * Legacy single-file helper method.
 * Wraps file buffer into a File object and sends to backend analysis.
 */
export async function analyzeDocument(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult> {
  const blob = new Blob([fileData]);
  const file = new File([blob], fileName);
  const results = await analyzeDocumentsWithBackend([file]);
  if (!results || results.length === 0) {
    throw new Error(`No analysis result returned for ${fileName}`);
  }
  return results[0];
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