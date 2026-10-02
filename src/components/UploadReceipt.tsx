import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, X, Camera, Image, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocumentsWithBackend } from '@/services/documentAnalysis';
import { AnalysisResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentStorageService } from '@/services/documentStorageService';

export const UploadReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const documentStorage = DocumentStorageService.getInstance();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    processFiles(files);
  }, [navigate]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateProgress = (stage: string, percent: number) => {
    setProgress(percent);
    setCurrentFile(stage);
  };

  const processFiles = async (files: FileList | File[]) => {
    if (files.length === 0 || !user) {
      setError('Please select files to upload');
      return;
    }

    const fileList = Array.from(files);
    setUploading(true);
    setError('');
    setProgress(0);

    try {
      updateProgress('Preparing documents for upload...', 15);
      await new Promise(resolve => setTimeout(resolve, 300));

      updateProgress('Sending documents to backend server for AI analysis...', 40);
      const results = await analyzeDocumentsWithBackend(fileList);

      updateProgress('Storing analysis results...', 80);
      const fileNames: string[] = [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const fileName = result.fileName || fileList[i]?.name || 'Medical Document';
        fileNames.push(fileName);

        try {
          await documentStorage.saveAnalysis(user.id, fileName, result);
        } catch (storageError) {
          console.warn('Error storing analysis in database:', storageError);
        }
      }

      updateProgress('Analysis complete!', 100);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Navigate to results page with the analysis results
      navigate('/results', { state: { results, fileNames } });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during analysis');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setUploadComplete(false);
    setUploading(false);
  };

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center animate-fade-in">
            <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Upload Successful!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your medical receipt has been analyzed successfully.
            </p>

            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-2xl mx-auto mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-foreground">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Medications Identified</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Lisinopril 10mg - Blood Pressure</li>
                      <li>• Metformin 500mg - Diabetes</li>
                      <li>• Vitamin D3 1000IU - Supplement</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Total Cost</h3>
                    <p className="text-2xl font-bold text-accent">$45.67</p>
                    <p className="text-sm text-muted-foreground">Insurance covered: $123.33</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-foreground mb-2">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Consider discussing with your doctor about potential interactions between 
                    Lisinopril and your current supplement routine.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetUpload} variant="outline" className="rounded-xl">
                Upload Another Receipt
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">
                View Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">Upload Medical Receipt</h1>
          <p className="text-xl text-muted-foreground">
            Let our AI analyze your prescription and provide personalized insights
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-gray-300 hover:border-primary hover:bg-primary/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                onChange={handleFileChange}
              />

              {!uploading ? (
                <>
                  <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>

                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    {dragActive ? 'Drop your files here' : 'Upload your medical documents'}
                  </h3>
                  
                  <Button
                    onClick={handleFileSelect}
                    className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg mt-4"
                  >
                    <Image className="h-5 w-5 mr-2" />
                    Select Files
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">{currentFile}</p>
                  <p className="text-center font-semibold text-foreground">{Math.round(progress)}% Complete</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                {error}
              </div>
            )}

            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-xl p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Instant Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Get medication insights within seconds
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-xl p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Secure Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and protected
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-xl p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Detailed Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive health insights and recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadReceipt;
