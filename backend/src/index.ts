import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { analyzeDocument } from './services/documentAnalysis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/analyze-documents', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const analysisResults = await Promise.all(
      files.map(file => analyzeDocument(file.path))
    );

    const analysisId = Date.now().toString();
    // TODO: Store analysis results in database
    
    res.json({
      analysisId,
      message: 'Documents analyzed successfully',
      results: analysisResults,
    });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while analyzing the documents',
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    error: err.message || 'Something went wrong!',
  });
});

// Start server
app.listen(port, () => {
  // Server is running
}); 