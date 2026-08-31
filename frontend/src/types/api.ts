export interface AIRespondPayload {
  text: string;
  source_language?: string;
  target_language: string;
  grade: string;
  subject: string;
}

export interface AIRespondResponseData {
  success: boolean;
  language: string;
  response: string;
  provider_mode?: string;
  is_development_fallback?: boolean;
  error?: string;
}

export interface AITutorPayload {
  query: string;
  grade?: string;
  subject?: string;
  topic?: string;
  language?: string;
}

export interface AITutorResponseData {
  success: boolean;
  query: string;
  detected_language: string;
  response: string;
  simple_explanation?: string;
  key_points?: string[];
  example?: string;
  follow_up_question?: string;
  source?: string;
  confidence_score?: number;
  provider_mode?: string;
  is_development_fallback?: boolean;
  error?: string;
}

export interface TranslationPayload {
  text: string;
  source_lang: string;
  target_lang: string;
  grade: string;
  subject: string;
  topic?: string;
}

export interface TranslationResponseData {
  source_text: string;
  detected_lang: string;
  direct_translation: string;
  pedagogical_adaptation: string;
  key_points: string[];
  rag_source: string;
  audio_script: string;
}

export interface RAGQueryPayload {
  query: string;
  grade?: string;
  subject?: string;
  lang?: string;
}

export interface RAGQueryResponseData {
  answer: string;
  source: string;
  confidence_score: number;
}

export interface QuizOptionData {
  key: string;
  text: string;
}

export interface QuizQuestionData {
  id: number;
  question: string;
  translation: string;
  options: QuizOptionData[];
}

export interface QuizGenerateResponseData {
  quiz_id: string;
  topic: string;
  questions: QuizQuestionData[];
}

export interface QuizEvaluateResponseData {
  score: number;
  total: number;
  percentage: number;
  feedback: string;
}

export interface AnalyticsSummaryData {
  total_lessons: number;
  total_students: number;
  avg_accuracy: number;
  language_breakdown: Record<string, number>;
  recent_activity: any[];
}
