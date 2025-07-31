# Chapter 10: API Reference

## 10.1 Frontend Services

### Document Analysis Service
```typescript
// Analyze a document
analyzeDocument(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>

// Analyze specific document types
analyzeLabReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
analyzePrescription(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
analyzeRadiologyReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
```

### Authentication Service
```typescript
// Auth context methods
signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ error: any }>
signIn(email: string, password: string): Promise<{ error: any }>
signOut(): Promise<{ error: any }>
```

### Chat Service
```typescript
// Chat management
createNewChat(): Promise<void>
loadChatSessions(): Promise<void>
saveMessage(content: string, sender: 'user' | 'ai', sessionId: string): Promise<any>
```

## 10.2 Backend API Endpoints

### Document Analysis
```typescript
POST /api/analyze-documents
Content-Type: multipart/form-data
Body: files (array of files)

Response:
{
  "analysisId": "string",
  "message": "string",
  "results": [AnalysisResult]
}
```

## 10.3 Error Responses
All endpoints return consistent error format:
```json
{
  "error": "Error message describing the issue"
}
```

## 10.4 Success Responses
```json
{
  "success": true,
  "data": "Response data"
}
