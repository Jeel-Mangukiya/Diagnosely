import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Share2,
  Calendar,
  Activity
} from 'lucide-react';
import { AnalysisResult } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentStorageService } from '@/services/documentStorageService';

const documentStorage = DocumentStorageService.getInstance();

const formatAnalysisText = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      return <div key={index} className="h-1.5" />;
    }

    // Skip stray dash lines like '--', '-', '—'
    if (/^[-—_]{1,2}$/.test(trimmedLine)) {
      return null;
    }

    // Horizontal rules (3 or more dashes, asterisks, underscores)
    if (/^[-*_]{3,}$/.test(trimmedLine)) {
      return <hr key={index} className="my-6 border-t border-slate-200" />;
    }

    // Headings starting with # or numbered section headers like "1. Document Summary" or "1. **Document Summary**"
    const isMarkdownHeader = trimmedLine.startsWith('#');
    const isNumberedHeader = /^(\d+\.)\s+\*{0,2}(.*?)\*{0,2}$/.test(trimmedLine);

    if (isMarkdownHeader || isNumberedHeader) {
      const cleanHeading = trimmedLine
        .replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
      
      return (
        <div key={index} className="pt-4 pb-2 border-b border-slate-200/80 mb-3 mt-6">
          <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            {cleanHeading}
          </h3>
        </div>
      );
    }

    // Warnings / Urgent callouts starting with ⚠️
    if (trimmedLine.startsWith('⚠️')) {
      return (
        <div key={index} className="my-3 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-900 flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            {renderFormattedInlineText(trimmedLine.replace(/^⚠️\s*/, ''))}
          </div>
        </div>
      );
    }

    // Normal / Verified callouts starting with ✅
    if (trimmedLine.startsWith('✅')) {
      return (
        <div key={index} className="my-2 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium leading-relaxed">
            {renderFormattedInlineText(trimmedLine.replace(/^✅\s*/, ''))}
          </div>
        </div>
      );
    }

    // Informational callouts starting with ℹ️
    if (trimmedLine.startsWith('ℹ️')) {
      return (
        <div key={index} className="my-2 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 flex items-start space-x-3">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            {renderFormattedInlineText(trimmedLine.replace(/^ℹ️\s*/, ''))}
          </div>
        </div>
      );
    }

    // Bullet points (starts with •, -, or *)
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      const bulletText = trimmedLine.replace(/^[•\-\*]\s*/, '').trim();
      // Filter out empty bullet lines or stray bullet dashes
      if (!bulletText || bulletText === '-' || bulletText === '--' || bulletText === '—') {
        return null;
      }
      return (
        <div key={index} className="flex items-start space-x-2 my-1.5 pl-2 text-sm text-slate-700">
          <span className="text-primary font-bold">•</span>
          <div className="flex-1 leading-relaxed">
            {renderFormattedInlineText(bulletText)}
          </div>
        </div>
      );
    }

    // Regular paragraphs
    return (
      <p key={index} className="mb-2 text-sm md:text-base text-slate-700 leading-relaxed">
        {renderFormattedInlineText(trimmedLine)}
      </p>
    );
  });
};

const renderFormattedInlineText = (text: string) => {
  if (!text) return null;
  const boldPattern = /\*\*(.*?)\*\*/g;
  let matches = [...text.matchAll(boldPattern)];
  
  if (matches.length > 0) {
    let elements: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index! > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      elements.push(
        <strong key={`bold-${i}`} className="font-semibold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = match.index! + match[0].length;
    });

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return <>{elements}</>;
  }

  return text.replace(/\*\*/g, '');
};

export const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [resultsList, setResultsList] = useState<{ result: AnalysisResult; fileName: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. From location state (after immediate upload)
    if (location.state && location.state.results && location.state.results.length > 0) {
      const stateResults = location.state.results.map((res: AnalysisResult, idx: number) => ({
        result: res,
        fileName: location.state.fileNames?.[idx] || res.fileName || 'Medical Document'
      }));
      setResultsList(stateResults);
      return;
    }

    // 2. From query parameter docId or fallback to latest user history
    const docId = searchParams.get('docId');
    if (user) {
      setIsLoading(true);
      documentStorage.getAnalysisHistory(user.id).then((history: any[]) => {
        if (history && history.length > 0) {
          if (docId) {
            const target = history.find((h: any) => h.id === docId);
            if (target) {
              setResultsList([{
                result: {
                  fileName: target.file_name,
                  originalText: target.original_text,
                  analysis: target.analysis,
                  confidence: target.confidence,
                  type: target.type
                },
                fileName: target.file_name
              }]);
              setIsLoading(false);
              return;
            }
          }

          // Fallback to displaying all historical documents or latest document
          const formatted = history.map((item: any) => ({
            result: {
              fileName: item.file_name,
              originalText: item.original_text,
              analysis: item.analysis,
              confidence: item.confidence,
              type: item.type
            },
            fileName: item.file_name
          }));
          setResultsList(formatted.slice(0, 5));
        }
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [location.state, searchParams, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleChatAboutReport = (result: AnalysisResult, fileName: string) => {
    navigate('/chat', {
      state: {
        reportContext: result,
        fileName: fileName
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Activity className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-600 font-medium">Loading analysis report...</p>
        </div>
      </div>
    );
  }

  if (resultsList.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/60 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="rounded-3xl shadow-xl border-0 bg-white text-center p-8">
            <CardContent className="space-y-4 pt-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">No Document Analysis Found</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                No active document reports were found in your session. Please upload a medical receipt or lab report to view detailed AI analysis.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/upload')}
                  className="rounded-xl bg-primary hover:bg-primary/90 px-6 py-2.5 text-white font-medium shadow-md"
                >
                  Upload Medical Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="rounded-xl text-slate-600 hover:text-primary hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Report
            </Button>
            <Button
              onClick={() => handleChatAboutReport(resultsList[0].result, resultsList[0].fileName)}
              size="sm"
              className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Chat About This Report
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-xs font-semibold px-3 py-1 mb-2">
            <Sparkles className="w-3 h-3 mr-1 inline" /> Diagnosely AI Clinical Analysis
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Medical Analysis Report
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Comprehensive diagnostic insights extracted and structured by AI.
          </p>
        </div>
        
        {/* Document Results List */}
        {resultsList.map(({ result, fileName }, index) => (
          <Card key={index} className="rounded-3xl shadow-xl border-0 bg-white mb-8 overflow-hidden">
            
            {/* Executive Document Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <FileText className="h-7 w-7 text-teal-300" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{fileName}</h2>
                    <p className="text-xs text-teal-200 mt-0.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 opacity-80" /> Analyzed on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={() => handleChatAboutReport(result, fileName)}
                    size="sm"
                    className="rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-semibold shadow-md text-xs px-3.5"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Chat with AI About Report
                  </Button>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs font-medium px-3 py-1">
                    Confidence: <span className="font-bold ml-1 text-emerald-300 uppercase">{result.confidence || 'High'}</span>
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs font-medium px-3 py-1">
                    Type: <span className="font-bold ml-1 text-teal-200 capitalize">{(result.type || 'Medical Report').replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Analysis Body */}
            <CardContent className="p-6 sm:p-8">
              <div className="prose max-w-none">
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/70 shadow-inner">
                  {formatAnalysisText(result.analysis)}
                </div>
              </div>

              {/* Disclaimer footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-start space-x-3 text-xs text-slate-500">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Medical Disclaimer:</strong> Diagnosely AI analysis is provided for informational and patient decision-support purposes only. It does not constitute formal medical diagnosis or treatment advice. Always present this report to a licensed physician for professional review.
                </p>
              </div>
            </CardContent>

          </Card>
        ))}
        
        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button
            onClick={() => navigate('/upload')}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white px-8 py-3 font-medium shadow-lg w-full sm:w-auto"
          >
            Upload Another Document
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-8 py-3 font-medium shadow-sm w-full sm:w-auto"
          >
            Go to Health Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Results;