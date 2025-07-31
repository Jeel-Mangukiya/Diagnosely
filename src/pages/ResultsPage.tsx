import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Brain, Pill, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisResult {
  documentName: string;
  documentType: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    notes?: string;
  }>;
  diagnoses: string[];
  recommendations: string[];
  warnings: string[];
  summary: string;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = React.useState<AnalysisResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // TODO: Fetch analysis results from backend
    // This is a mock implementation
    setTimeout(() => {
      setResults({
        documentName: "Lab Report - 2024-03-15",
        documentType: "Laboratory Results",
        medications: [
          {
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            notes: "Take with meals"
          }
        ],
        diagnoses: [
          "Type 2 Diabetes",
          "Mild Hypertension"
        ],
        recommendations: [
          "Schedule follow-up in 3 months",
          "Consider dietary modifications",
          "Monitor blood glucose levels regularly"
        ],
        warnings: [
          "Potential interaction with current medications",
          "May cause stomach upset initially"
        ],
        summary: "Lab results indicate stable blood glucose levels with current medication regimen. Some improvements needed in cholesterol levels."
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Medical Document Analysis</h1>
          <p className="text-xl text-muted-foreground">
            AI-powered insights from your medical documents
          </p>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Document Overview */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Document Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold">Document Name</h3>
                    <p className="text-muted-foreground">{results.documentName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Document Type</h3>
                    <p className="text-muted-foreground">{results.documentType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Key Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Medications */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Medications
                    </h3>
                    {results.medications.map((med, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium">{med.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </p>
                        {med.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{med.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Diagnoses */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Diagnoses</h3>
                    <div className="bg-green-50 rounded-lg p-4">
                      <ul className="list-disc list-inside space-y-2">
                        {results.diagnoses.map((diagnosis, index) => (
                          <li key={index} className="text-muted-foreground">
                            {diagnosis}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations & Warnings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="mt-1">•</div>
                        <div className="text-muted-foreground">{rec}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Warnings & Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-yellow-700">
                        <div className="mt-1">⚠</div>
                        <div>{warning}</div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-center space-x-4 mt-8">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate('/upload')}
              >
                Upload Another Document
              </Button>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage; 