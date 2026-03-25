import axios from 'axios';
import { ParsedResume, ParsedJobPosting, AssessmentSession, GapAnalysis, StudyPlan } from '../types';

// Update this to your server URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90s — Claude can take a while for complex assessments
  headers: { 'Content-Type': 'application/json' },
});

// ── Resume ───────────────────────────────────────────────────────────────────
export const parseResumeText = async (resumeText: string): Promise<ParsedResume> => {
  const res = await api.post('/api/resume/parse-text', { resumeText });
  return res.data.data as ParsedResume;
};

export const parseResumePDF = async (fileUri: string, fileName: string): Promise<{ parsed: ParsedResume; rawText: string }> => {
  const formData = new FormData();
  formData.append('resume', {
    uri: fileUri,
    name: fileName,
    type: 'application/pdf',
  } as unknown as Blob);

  const res = await axios.post(`${BASE_URL}/api/resume/parse-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  });

  return { parsed: res.data.data as ParsedResume, rawText: res.data.raw_text as string };
};

// ── Job Posting ──────────────────────────────────────────────────────────────
export const parseJobText = async (jobText: string): Promise<ParsedJobPosting> => {
  const res = await api.post('/api/job/parse', { jobText });
  return res.data.data as ParsedJobPosting;
};

// ── Assessment ────────────────────────────────────────────────────────────────
export const generateAssessment = async (
  resumeJson: ParsedResume,
  jobJson: ParsedJobPosting,
  mcqCount = 10,
  openEndedCount = 2
): Promise<AssessmentSession> => {
  const res = await api.post('/api/assessment/generate', {
    resumeJson,
    jobJson,
    mcqCount,
    openEndedCount,
  });
  return res.data.data as AssessmentSession;
};

export const evaluateAnswer = async (
  answer: string,
  questionJson: object,
  resumeJson: ParsedResume,
  jobJson: ParsedJobPosting
): Promise<object> => {
  const res = await api.post('/api/assessment/evaluate-answer', {
    answer,
    questionJson,
    resumeJson,
    jobJson,
  });
  return res.data.data;
};

// ── Analysis ──────────────────────────────────────────────────────────────────
export const generateGapAnalysis = async (
  resumeJson: ParsedResume,
  jobJson: ParsedJobPosting,
  assessmentScores: object
): Promise<GapAnalysis> => {
  const res = await api.post('/api/analysis/gap', {
    resumeJson,
    jobJson,
    assessmentScores,
  });
  return res.data.data as GapAnalysis;
};

export const generateStudyPlan = async (
  gapAnalysis: GapAnalysis,
  resumeJson: ParsedResume,
  jobJson: ParsedJobPosting,
  daysUntilInterview = 14
): Promise<StudyPlan> => {
  const res = await api.post('/api/analysis/study-plan', {
    gapAnalysis,
    resumeJson,
    jobJson,
    daysUntilInterview,
  });
  return res.data.data as StudyPlan;
};
