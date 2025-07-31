# Chapter 2: Architecture & Technology Stack

## 2.1 Frontend Architecture
- **Framework**: React.js with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router for navigation
- **State Management**: React Context API for authentication
- **Data Fetching**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system

## 2.2 Backend Architecture
- **Runtime**: Node.js/Express (backend service)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **File Processing**: Multer for file uploads
- **AI Integration**: OpenRouter API for document analysis
- **OCR**: Tesseract.js for image text extraction
- **PDF Processing**: pdf-parse for PDF text extraction

## 2.3 Technology Stack Details

### Frontend Dependencies
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

### Key Libraries
- **OCR**: Tesseract.js for image text recognition
- **PDF Processing**: pdf-parse for extracting text from PDFs
- **AI Integration**: Custom service using OpenRouter API
- **UI Components**: Radix UI primitives with shadcn/ui wrapper
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
