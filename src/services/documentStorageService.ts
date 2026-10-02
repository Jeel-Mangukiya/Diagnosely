import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types';

const getLocalAnalyses = (userId: string): any[] => {
  try {
    const raw = localStorage.getItem(`diagnosely_analyses_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

const saveLocalAnalyses = (userId: string, items: any[]) => {
  try {
    localStorage.setItem(`diagnosely_analyses_${userId}`, JSON.stringify(items));
  } catch (e) {}
};

export class DocumentStorageService {
  private static instance: DocumentStorageService;
  
  private constructor() {}
  
  public static getInstance(): DocumentStorageService {
    if (!DocumentStorageService.instance) {
      DocumentStorageService.instance = new DocumentStorageService();
    }
    return DocumentStorageService.instance;
  }

  async saveAnalysis(userId: string, fileName: string, result: AnalysisResult) {
    const now = new Date().toISOString();
    const localRecord = {
      id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: userId,
      file_name: fileName,
      original_text: result.originalText || '',
      analysis: result.analysis || '',
      confidence: result.confidence || 'medium',
      type: result.type || 'unknown',
      created_at: now
    };

    try {
      console.log('Attempting to save analysis to Supabase:', { userId, fileName });
      
      const { data, error } = await supabase
        .from('document_analysis')
        .insert({
          user_id: userId,
          file_name: fileName,
          original_text: result.originalText || '',
          analysis: result.analysis || '',
          confidence: result.confidence || 'medium',
          type: result.type || 'unknown',
          created_at: now
        })
        .select()
        .single();

      if (!error && data) {
        console.log('Analysis saved successfully to Supabase:', data);
        const existing = getLocalAnalyses(userId);
        saveLocalAnalyses(userId, [data, ...existing]);
        return data;
      } else {
        console.warn('Supabase save failed, saving locally:', error?.message);
      }
    } catch (error) {
      console.warn('Error connecting to Supabase table document_analysis, saving locally:', error);
    }

    // Fallback to local storage persistence
    const existing = getLocalAnalyses(userId);
    const updated = [localRecord, ...existing];
    saveLocalAnalyses(userId, updated);
    return localRecord;
  }

  async getAnalysisHistory(userId: string) {
    try {
      console.log('Fetching analysis history for user:', userId);
      
      const { data, error } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        console.log('Analysis history fetched successfully from Supabase:', data.length, 'records');
        return data;
      }
    } catch (error) {
      console.warn('Supabase getAnalysisHistory failed, returning local history:', error);
    }

    return getLocalAnalyses(userId);
  }

  async deleteAnalysis(userId: string, analysisId: string) {
    try {
      console.log('Attempting to delete analysis:', { userId, analysisId });
      
      await supabase
        .from('document_analysis')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);
    } catch (error) {
      console.warn('Supabase deleteAnalysis warning:', error);
    }

    const local = getLocalAnalyses(userId).filter((item: any) => item.id !== analysisId);
    saveLocalAnalyses(userId, local);
  }
} 