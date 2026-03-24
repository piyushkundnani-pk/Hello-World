import { create } from 'zustand';
import {
  ParsedResume,
  ParsedJobPosting,
  AssessmentSession,
  GapAnalysis,
  StudyPlan,
  QuestionResponse,
} from '../types';
import * as api from '../services/api';

interface AppStore {
  // ── Candidate State ────────────────────────────────────────────────────────
  resumeText: string;
  parsedResume: ParsedResume | null;
  setResumeText: (text: string) => void;
  setParsedResume: (resume: ParsedResume) => void;
  parseResume: (text: string) => Promise<void>;
  parseResumePDF: (fileUri: string, fileName: string) => Promise<void>;

  // ── Job State ─────────────────────────────────────────────────────────────
  jobText: string;
  parsedJob: ParsedJobPosting | null;
  setJobText: (text: string) => void;
  setParsedJob: (job: ParsedJobPosting) => void;
  parseJob: (text: string) => Promise<void>;

  // ── Assessment State ───────────────────────────────────────────────────────
  currentSession: AssessmentSession | null;
  currentQuestionIndex: number;
  sessionHistory: AssessmentSession[];
  startAssessment: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => void;
  completeAssessment: () => Promise<void>;

  // ── Results State ─────────────────────────────────────────────────────────
  gapAnalysis: GapAnalysis | null;
  studyPlan: StudyPlan | null;
  generateResults: () => Promise<void>;

  // ── UI State ──────────────────────────────────────────────────────────────
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean, message?: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // ── Initial State ─────────────────────────────────────────────────────────
  resumeText: '',
  parsedResume: null,
  jobText: '',
  parsedJob: null,
  currentSession: null,
  currentQuestionIndex: 0,
  sessionHistory: [],
  gapAnalysis: null,
  studyPlan: null,
  isLoading: false,
  loadingMessage: '',
  error: null,

  // ── Setters ───────────────────────────────────────────────────────────────
  setResumeText: (text) => set({ resumeText: text }),
  setParsedResume: (resume) => set({ parsedResume: resume }),
  setJobText: (text) => set({ jobText: text }),
  setParsedJob: (job) => set({ parsedJob: job }),
  setError: (error) => set({ error }),
  setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),

  // ── Resume Actions ────────────────────────────────────────────────────────
  parseResume: async (text: string) => {
    set({ isLoading: true, loadingMessage: 'Analyzing your resume...', error: null });
    try {
      const parsed = await api.parseResumeText(text);
      set({ parsedResume: parsed, resumeText: text, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse resume';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  parseResumePDF: async (fileUri: string, fileName: string) => {
    set({ isLoading: true, loadingMessage: 'Extracting text from PDF...', error: null });
    try {
      const { parsed, rawText } = await api.parseResumePDF(fileUri, fileName);
      set({ parsedResume: parsed, resumeText: rawText, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse PDF';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  // ── Job Actions ───────────────────────────────────────────────────────────
  parseJob: async (text: string) => {
    set({ isLoading: true, loadingMessage: 'Analyzing job requirements...', error: null });
    try {
      const parsed = await api.parseJobText(text);
      set({ parsedJob: parsed, jobText: text, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse job posting';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  // ── Assessment Actions ────────────────────────────────────────────────────
  startAssessment: async () => {
    const { parsedResume, parsedJob } = get();
    if (!parsedResume || !parsedJob) {
      set({ error: 'Please complete resume and job posting setup first.' });
      return;
    }

    set({ isLoading: true, loadingMessage: 'Crafting your personalized assessment...', error: null });
    try {
      const session = await api.generateAssessment(parsedResume, parsedJob);
      // Initialize responses array
      const sessionWithResponses: AssessmentSession = {
        ...session,
        responses: [],
        started_at: new Date().toISOString(),
      };
      set({ currentSession: sessionWithResponses, currentQuestionIndex: 0, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate assessment';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  submitAnswer: async (answer: string) => {
    const { currentSession, currentQuestionIndex, parsedResume, parsedJob } = get();
    if (!currentSession || !parsedResume || !parsedJob) return;

    const allQuestions = [...currentSession.mcqs, ...currentSession.open_ended];
    const currentQuestion = allQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    const startTime = Date.now();

    set({ isLoading: true, loadingMessage: 'Evaluating your answer...', error: null });
    try {
      const evaluation = await api.evaluateAnswer(answer, currentQuestion, parsedResume, parsedJob);

      const response: QuestionResponse = {
        question_id: currentQuestion.id,
        question: currentQuestion,
        answer,
        evaluation: evaluation as QuestionResponse['evaluation'],
        time_taken_seconds: Math.round((Date.now() - startTime) / 1000),
      };

      const updatedSession: AssessmentSession = {
        ...currentSession,
        responses: [...currentSession.responses, response],
      };

      set({ currentSession: updatedSession, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to evaluate answer';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentSession } = get();
    if (!currentSession) return;
    const total = currentSession.mcqs.length + currentSession.open_ended.length;
    if (currentQuestionIndex < total - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  completeAssessment: async () => {
    const { currentSession } = get();
    if (!currentSession) return;
    const completed: AssessmentSession = {
      ...currentSession,
      completed_at: new Date().toISOString(),
    };
    set({ currentSession: completed, currentQuestionIndex: 0 });
  },

  // ── Results Actions ───────────────────────────────────────────────────────
  generateResults: async () => {
    const { parsedResume, parsedJob, currentSession } = get();
    if (!parsedResume || !parsedJob || !currentSession) {
      set({ error: 'Missing data to generate results.' });
      return;
    }

    // Build assessment scores summary for gap analysis
    const responses = currentSession.responses;
    const assessmentScores = {
      total_questions: responses.length,
      responses_summary: responses.map((r) => ({
        question_id: r.question_id,
        skills_tested: r.question.skills_tested,
        answer: r.answer.substring(0, 200), // Truncate for token efficiency
        evaluation_summary: r.evaluation,
      })),
    };

    set({ isLoading: true, loadingMessage: 'Generating gap analysis...', error: null });
    try {
      const gap = await api.generateGapAnalysis(parsedResume, parsedJob, assessmentScores);
      set({ gapAnalysis: gap, loadingMessage: 'Building your study plan...' });

      const plan = await api.generateStudyPlan(gap, parsedResume, parsedJob);
      set({ studyPlan: plan, isLoading: false });

      // Archive session
      set((state) => ({
        sessionHistory: [currentSession, ...state.sessionHistory].slice(0, 10),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate results';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  // ── Reset ─────────────────────────────────────────────────────────────────
  reset: () =>
    set({
      resumeText: '',
      parsedResume: null,
      jobText: '',
      parsedJob: null,
      currentSession: null,
      currentQuestionIndex: 0,
      gapAnalysis: null,
      studyPlan: null,
      isLoading: false,
      error: null,
    }),
}));
