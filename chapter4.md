# Chapter 4: Document Analysis System

## 4.1 Document Processing Pipeline
1. **File Upload**: User uploads medical documents
2. **File Validation**: Check file type and size limits
3. **Text Extraction**: 
   - Images: Tesseract.js OCR
   - PDFs: pdf-parse library
4. **Medical Relevance Check**: AI classification to determine if document is medical
5. **AI Analysis**: DeepSeek model for comprehensive medical analysis
6. **Result Storage**: Save analysis results to database

## 4.2 Supported File Types
- **Images**: JPG, JPEG, PNG, TIFF, BMP
- **Documents**: PDF (text-based)
- **Size Limit**: 10MB per file
- **Batch Processing**: Multiple files in single upload

## 4.3 AI Analysis Process
The document analysis uses a sophisticated prompt engineering approach:

### Medical Relevance Check
```typescript
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
```

### Master Medical Analysis Prompt
The system uses a comprehensive prompt that covers:
- Document summary and overview
- Key medical findings
- Medical terminology explanations
- Medications analysis
- Diagnoses extraction
- Recommendations and follow-up
- Warnings and alerts
- Questions for healthcare provider
- Patient-friendly summary

## 4.4 Analysis Results Structure
```typescript
interface AnalysisResult {
  fileName: string;
  originalText: string;
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  type: string;
}
```

## 4.5 Error Handling
- **File Upload Errors**: Invalid file types, size limits
- **Text Extraction Errors**: Corrupted files, unsupported formats
- **API Errors**: OpenRouter API failures, rate limits
- **Database Errors**: Connection issues, constraint violations
