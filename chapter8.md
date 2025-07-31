# Chapter 8: Backend Services

## 8.1 Express Server Setup
```typescript
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({...}),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {...}
});
```

## 8.2 API Endpoints
- **POST /api/analyze-documents**: Document analysis endpoint
- **File Upload**: Multer middleware for handling file uploads
- **Error Handling**: Centralized error handling middleware

## 8.3 Document Analysis Service
```typescript
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

    // Analyze the extracted text using LLM
    const analysis = await analyzeTextWithLLM(text, fileName);
    return analysis;
  } catch (error) {
    console.error('Error analyzing document:', error);
    throw error;
  }
}
