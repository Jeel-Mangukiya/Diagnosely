import { supabase } from '@/integrations/supabase/client';
import { AnalysisResult } from '@/types';

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
    try {
      console.log('Attempting to save analysis:', { userId, fileName });
      
      const { data, error } = await supabase
        .from('document_analysis')
        .insert({
          user_id: userId,
          file_name: fileName,
          original_text: result.originalText || '',
          analysis: result.analysis || '',
          confidence: result.confidence || 'medium',
          type: result.type || 'unknown'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving analysis:', error);
        throw new Error(`Failed to save analysis: ${error.message}`);
      }

      console.log('Analysis saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in saveAnalysis:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to save document analysis: ${error.message}`);
      } else {
        throw new Error('Failed to save document analysis: Unknown error');
      }
    }
  }

  async getAnalysisHistory(userId: string) {
    try {
      console.log('Fetching analysis history for user:', userId);
      
      const { data, error } = await supabase
        .from('document_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching history:', error);
        throw new Error(`Failed to fetch analysis history: ${error.message}`);
      }

      console.log('Analysis history fetched successfully:', data?.length, 'records');
      return data || [];
    } catch (error) {
      console.error('Error in getAnalysisHistory:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch analysis history: ${error.message}`);
      } else {
        throw new Error('Failed to fetch analysis history: Unknown error');
      }
    }
  }

  async deleteAnalysis(userId: string, analysisId: string) {
    try {
      console.log('Attempting to delete analysis:', { userId, analysisId });
      
      const { error } = await supabase
        .from('document_analysis')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error deleting analysis:', error);
        throw new Error(`Failed to delete analysis: ${error.message}`);
      }

      console.log('Analysis deleted successfully');
    } catch (error) {
      console.error('Error in deleteAnalysis:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to delete analysis: ${error.message}`);
      } else {
        throw new Error('Failed to delete analysis: Unknown error');
      }
    }
  }
} 