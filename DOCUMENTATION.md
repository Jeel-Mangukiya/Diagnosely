# Diagnosely - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Authentication & Security](#authentication--security)
4. [Document Analysis System](#document-analysis-system)
5. [AI Chat System](#ai-chat-system)
6. [Database Schema](#database-schema)
7. [Frontend Components](#frontend-components)
8. [Backend Services](#backend-services)
9. [Deployment & Environment Setup](#deployment--environment-setup)
10. [API Reference](#api-reference)

---

## 1. Project Overview

### 1.1 Introduction
Diagnosely is an AI-powered medical assistant web application that helps users understand their medical documents through intelligent analysis and provides personalized healthcare guidance. The application combines OCR technology, AI analysis, and secure user management to create a comprehensive medical document analysis platform.

### 1.2 Key Features
- **Smart Document Analysis**: Upload and analyze medical documents (receipts, reports, prescriptions)
- **Multi-format Support**: Images (JPG, PNG, TIFF, BMP) and PDF documents
- **AI-Powered Analysis**: Comprehensive medical insights including summaries, findings, and recommendations
- **Interactive Medical Chat**: AI-powered chat interface for medical queries
- **User Dashboard**: Overview of analyzed documents and activity tracking
- **Secure Authentication**: User authentication with Supabase
- **Privacy-Focused**: HIPAA-compliant data handling

### 1.3 Target Users
- Patients with medical documents needing analysis
- Healthcare providers looking for document interpretation tools
- Individuals managing their health records
- Medical professionals seeking AI-assisted document review

---

## 2. Architecture & Technology Stack

### 2.1 Frontend Architecture
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router for navigation
- **State Management**: React Context API for authentication
- **Data Fetching**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system

### 2.2 Backend Architecture
- **Runtime**: Node.js/Express (backend service)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **File Processing**: Multer for file uploads
- **AI Integration**: OpenRouter API for document analysis
- **OCR**: Tesseract.js for image text extraction
- **PDF Processing**: pdf-parse for PDF text extraction

### 2.3 Technology Stack Details

#### Frontend Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "@supabase/supabase-js": "^2.50.3",
  "@tanstack/react-query": "^5.56.2",
  "tesseract.js": "^5.0.4",
  "pdf-parse": "^1.1.1",
  "lucide-react": "^0.462.0",
  "tailwindcss": "^3.4.11"
}
```

#### Key Libraries
- **OCR**: Tesseract.js for image text recognition
- **PDF Processing**: pdf-parse for extracting text from PDFs
- **AI Integration**: Custom service using OpenRouter API
- **UI Components**: Radix UI primitives with shadcn/ui wrapper
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

---

## 3. Authentication & Security

### 3.1 Authentication Flow
The application uses Supabase for authentication with the following flow:

1. **User Registration**: Users sign up with email/password
2. **Email Verification**: Supabase sends confirmation email
3. **Session Management**: JWT-based session handling
4. **Protected Routes**: Route protection for authenticated users
5. **Automatic Sign-in**: Remember user sessions

### 3.2 Security Features
- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Secure password storage
- **CORS Protection**: Configured for specific domains
- **Environment Variables**: Sensitive data stored securely
- **HTTPS**: Secure communication in production

### 3.3 AuthContext Implementation
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}
```

### 3.4 Protected Routes
The application implements route protection using a ProtectedRoute component:
- Checks user authentication status
- Redirects unauthenticated users to sign-in page
- Maintains intended destination for post-authentication redirect

---

## 4. Document Analysis System

### 4.1 Document Processing Pipeline
1. **File Upload**: User uploads medical documents
2. **File Validation**: Check file type and size limits
3. **Text Extraction**: 
   - Images: Tesseract.js OCR
   - PDFs: pdf-parse library
4. **Medical Relevance Check**: AI classification to determine if document is medical
5. **AI Analysis**: DeepSeek model for comprehensive medical analysis
6. **Result Storage**: Save analysis results to database

### 4.2 Supported File Types
- **Images**: JPG, JPEG, PNG, TIFF, BMP
- **Documents**: PDF (text-based)
- **Size Limit**: 10MB per file
- **Batch Processing**: Multiple files in single upload

### 4.3 AI Analysis Process
The document analysis uses a sophisticated prompt engineering approach:

#### Medical Relevance Check
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

#### Master Medical Analysis Prompt
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

### 4.4 Analysis Results Structure
```typescript
interface AnalysisResult {
  fileName: string;
  originalText: string;
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  type: string;
}
```

### 4.5 Error Handling
- **File Upload Errors**: Invalid file types, size limits
- **Text Extraction Errors**: Corrupted files, unsupported formats
- **API Errors**: OpenRouter API failures, rate limits
- **Database Errors**: Connection issues, constraint violations

---

## 5. AI Chat System

### 5.1 Chat Architecture
The AI chat system is built with the following components:
- **Message Management**: Local state with database persistence
- **Conversation History**: Context-aware chat sessions
- **AI Integration**: OpenRouter API with DeepSeek model
- **Session Management**: Multiple chat sessions per user
- **Real-time Updates**: Live message display with typing indicators

### 5.2 Chat Features
- **Multiple Sessions**: Users can have multiple concurrent chats
- **Message History**: Persistent chat history stored in database
- **Quick Questions**: Pre-defined medical questions for quick access
- **Typing Indicators**: Visual feedback during AI response generation
- **Message Persistence**: All messages saved to database
- **Session Management**: Create, switch between, and delete chat sessions

### 5.3 Chat Database Schema
```sql
-- Chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### 5.4 AI Service Integration
The chat system uses a dedicated service for AI responses:
```typescript
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class OpenRouterService {
  async sendMessage(messages: OpenRouterMessage[]): Promise<string> {
    // API call to OpenRouter with conversation history
  }
}
```

### 5.5 Chat UI Components
- **Message Display**: User/AI message bubbles with distinct styling
- **Input Area**: Text input with send button and Enter key support
- **Sidebar**: Chat session list with management options
- **Welcome Screen**: Initial state with quick question suggestions
- **Mobile Responsive**: Optimized for mobile and desktop viewing

---

## 6. Database Schema

### 6.1 Document Analysis Table
```sql
CREATE TABLE public.document_analysis (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  file_name text NOT NULL,
  original_text text NOT NULL,
  analysis text NOT NULL,
  confidence text NOT NULL,
  type text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 6.2 User Profiles Table
```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### 6.3 Row Level Security (RLS)
All tables implement RLS policies:
- Users can only access their own data
- Automatic profile creation on user signup
- CRUD operations restricted to authenticated users

### 6.4 Database Triggers
```sql
-- Create profile automatically on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 7. Frontend Components

### 7.1 Core Components
- **App.tsx**: Main application component with routing
- **Navbar.tsx**: Navigation header with user menu
- **Dashboard.tsx**: User dashboard with document overview
- **UploadReceipt.tsx**: Document upload interface
- **ChatAI.tsx**: AI chat interface
- **ProtectedRoute.tsx**: Route protection wrapper

### 7.2 Authentication Components
- **SignIn.tsx**: User login form
- **SignUp.tsx**: User registration form
- **AuthContext.tsx**: Authentication context provider

### 7.3 UI Components (shadcn/ui)
The application uses a comprehensive set of UI components:
- **Form Components**: Input, Button, Select, Checkbox, Radio Group
- **Feedback Components**: Toast, Alert, Dialog, Sheet
- **Navigation Components**: Navigation Menu, Breadcrumb, Tabs
- **Data Display**: Table, Card, Avatar, Badge
- **Feedback Components**: Progress, Skeleton, Loading States

### 7.4 Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Responsive design with Tailwind CSS
- **Touch Support**: Mobile-friendly interactions
- **Adaptive Layout**: Flexible component layouts

---

## 8. Backend Services

### 8.1 Express Server Setup
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

### 8.2 API Endpoints
- **POST /api/analyze-documents**: Document analysis endpoint
- **File Upload**: Multer middleware for handling file uploads
- **Error Handling**: Centralized error handling middleware

### 8.3 Document Analysis Service
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
```

---

## 9. Deployment & Environment Setup

### 9.1 Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_SITE_URL=your_site_url
```

### 9.2 Development Setup
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `npm install`
3. **Environment Configuration**: Create `.env` file
4. **Start Development Server**: `npm run dev`

### 9.3 Production Build
```bash
npm run build
npm run preview
```

### 9.4 Supabase Configuration
- **Database Setup**: Run migrations to create tables
- **Authentication**: Configure Supabase Auth
- **Storage**: Set up file storage if needed
- **API Keys**: Configure environment variables

---

## 10. API Reference

### 10.1 Frontend Services

#### Document Analysis Service
```typescript
// Analyze a document
analyzeDocument(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>

// Analyze specific document types
analyzeLabReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
analyzePrescription(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
analyzeRadiologyReport(fileName: string, fileData: ArrayBuffer): Promise<AnalysisResult>
```

#### Authentication Service
```typescript
// Auth context methods
signUp(email: string, password: string, firstName: string, lastName: string): Promise<{ error: any }>
signIn(email: string, password: string): Promise<{ error: any }>
signOut(): Promise<{ error: any }>
```

#### Chat Service
```typescript
// Chat management
createNewChat(): Promise<void>
loadChatSessions(): Promise<void>
saveMessage(content: string, sender: 'user' | 'ai', sessionId: string): Promise<any>
```

### 10.2 Backend API Endpoints

#### Document Analysis
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

### 10.3 Error Responses
All endpoints return consistent error format:
```json
{
  "error": "Error message describing the issue"
}
```

### 10.4 Success Responses
```json
{
  "success": true,
  "data": "Response data"
}
```

---

## Conclusion

This documentation provides a comprehensive overview of the Diagnosely application architecture, features, and implementation details. The application demonstrates modern web development practices with React, TypeScript, Supabase, and AI integration to create a powerful medical document analysis platform.

For additional questions or specific implementation details, refer to the source code or contact the development team.
