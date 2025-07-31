# Chapter 9: Deployment & Environment Setup

## 9.1 Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_SITE_URL=your_site_url
```

## 9.2 Development Setup
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: `npm install`
3. **Environment Configuration**: Create `.env` file
4. **Start Development Server**: `npm run dev`

## 9.3 Production Build
```bash
npm run build
npm run preview
```

## 9.4 Supabase Configuration
- **Database Setup**: Run migrations to create tables
- **Authentication**: Configure Supabase Auth
- **Storage**: Set up file storage if needed
- **API Keys**: Configure environment variables
