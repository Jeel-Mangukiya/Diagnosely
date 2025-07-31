import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';
import { AnalysisResult } from '@/types';

const formatAnalysisText = (text: string) => {
  // Split the text into lines
  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    
    // Check for heading (# or ###)
    if (trimmedLine.startsWith('#')) {
      // Remove # symbols and any surrounding ** symbols
      const headingText = trimmedLine
        .replace(/^#+\s*/, '') // Remove # symbols from start
        .replace(/^\*\*|\*\*$/g, '') // Remove ** symbols from start and end
        .trim();
      
      return (
        <h3 key={index} className="text-xl font-semibold text-foreground mb-4 mt-6">
          {headingText}
        </h3>
      );
    }

    // Check for bold text (**text**)
    const boldPattern = /\*\*(.*?)\*\*/g;
    let matches = [...trimmedLine.matchAll(boldPattern)];
    
    if (matches.length > 0) {
      let elements: (string | JSX.Element)[] = [];
      let lastIndex = 0;

      matches.forEach((match, i) => {
        // Add text before the bold part
        if (match.index! > lastIndex) {
          elements.push(trimmedLine.slice(lastIndex, match.index));
        }
        // Add the bold part
        elements.push(
          <strong key={`bold-${index}-${i}`} className="font-semibold">
            {match[1]}
          </strong>
        );
        lastIndex = match.index! + match[0].length;
      });

      // Add any remaining text
      if (lastIndex < trimmedLine.length) {
        elements.push(trimmedLine.slice(lastIndex));
      }

      return <p key={index} className="mb-2">{elements}</p>;
    }

    // Handle horizontal rules
    if (trimmedLine === '---') {
      return <hr key={index} className="my-6 border-t border-gray-200" />;
    }

    // Regular text (only if not empty)
    if (trimmedLine) {
      return <p key={index} className="mb-2">{trimmedLine}</p>;
    }

    // Empty lines get smaller spacing
    return <div key={index} className="h-2" />;
  });
};

export const Results: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, fileNames } = location.state || { results: [], fileNames: [] };

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-6">No Results Available</h1>
              <p className="text-muted-foreground mb-6">
                No analysis results were found. Please try uploading your documents again.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Upload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">Analysis Results</h1>
          <p className="text-xl text-muted-foreground">
            Here's what we found in your medical documents
          </p>
        </div>
        
        {results.map((result: AnalysisResult, index: number) => (
          <Card key={index} className="rounded-2xl shadow-lg border-0 bg-card mb-6">
            <CardHeader className="border-b border-border/20">
              <CardTitle className="flex items-center text-2xl">
                <FileText className="h-6 w-6 mr-2 text-primary" />
                {fileNames[index]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="bg-muted rounded-xl p-6">
                  {formatAnalysisText(result.analysis)}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    Confidence: <span className="ml-1 font-semibold text-foreground">{result.confidence}</span>
                  </span>
                  <span className="flex items-center">
                    Type: <span className="ml-1 font-semibold text-foreground">{result.type}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/')}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Upload More Documents
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results; 