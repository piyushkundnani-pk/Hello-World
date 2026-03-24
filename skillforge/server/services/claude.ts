import Anthropic from '@anthropic-ai/sdk';
import {
  buildResumeParsingPrompt,
  RESUME_PARSING_SYSTEM_PROMPT,
  buildJobParsingPrompt,
  JOB_PARSING_SYSTEM_PROMPT,
  buildMCQGenerationPrompt,
  buildOpenEndedGenerationPrompt,
  buildAnswerEvaluationPrompt,
  buildGapAnalysisPrompt,
  buildStudyPlanPrompt,
} from './prompts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(system: string, userPrompt: string, maxTokens = 4096): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude');
  return content.text;
}

function parseJsonResponse<T>(raw: string): T {
  // Strip markdown code blocks if present
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
  return JSON.parse(cleaned) as T;
}

export async function parseResume(resumeText: string): Promise<object> {
  const raw = await callClaude(
    RESUME_PARSING_SYSTEM_PROMPT,
    buildResumeParsingPrompt(resumeText),
    4096
  );
  return parseJsonResponse<object>(raw);
}

export async function parseJobPosting(jobText: string): Promise<object> {
  const raw = await callClaude(
    JOB_PARSING_SYSTEM_PROMPT,
    buildJobParsingPrompt(jobText),
    4096
  );
  return parseJsonResponse<object>(raw);
}

export async function generateMCQs(
  resumeJson: object,
  jobJson: object,
  count = 10
): Promise<object[]> {
  const raw = await callClaude(
    'You are an expert PM interviewer. Generate high-quality scenario-based MCQs.',
    buildMCQGenerationPrompt(resumeJson, jobJson, count),
    8192
  );
  return parseJsonResponse<object[]>(raw);
}

export async function generateOpenEndedQuestions(
  resumeJson: object,
  jobJson: object,
  count = 2
): Promise<object[]> {
  const raw = await callClaude(
    'You are an expert PM interviewer. Generate insightful open-ended questions.',
    buildOpenEndedGenerationPrompt(resumeJson, jobJson, count),
    4096
  );
  return parseJsonResponse<object[]>(raw);
}

export async function evaluateAnswer(
  answer: string,
  questionJson: object,
  resumeJson: object,
  jobJson: object
): Promise<object> {
  const raw = await callClaude(
    'You are a calibrated PM interview evaluator with 500+ interviews experience.',
    buildAnswerEvaluationPrompt(answer, questionJson, resumeJson, jobJson),
    2048
  );
  return parseJsonResponse<object>(raw);
}

export async function generateGapAnalysis(
  resumeJson: object,
  jobJson: object,
  assessmentScores: object
): Promise<object> {
  const raw = await callClaude(
    'You are a senior PM hiring consultant. Generate honest, calibrated gap analyses.',
    buildGapAnalysisPrompt(resumeJson, jobJson, assessmentScores),
    6144
  );
  return parseJsonResponse<object>(raw);
}

export async function generateStudyPlan(
  gapAnalysis: object,
  resumeJson: object,
  jobJson: object,
  daysUntilInterview = 14
): Promise<object> {
  const raw = await callClaude(
    'You are a senior PM career coach. Create actionable, prioritized study plans.',
    buildStudyPlanPrompt(gapAnalysis, resumeJson, jobJson, daysUntilInterview),
    6144
  );
  return parseJsonResponse<object>(raw);
}
