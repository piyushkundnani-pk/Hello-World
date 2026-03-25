import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  generateMCQs,
  generateOpenEndedQuestions,
  evaluateAnswer,
} from '../services/claude';

const router = Router();

// POST /api/assessment/generate
// Generates a full quick assessment (10 MCQs + 2 open-ended)
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { resumeJson, jobJson, mcqCount = 10, openEndedCount = 2 } = req.body;

    if (!resumeJson || !jobJson) {
      return res.status(400).json({ error: 'resumeJson and jobJson are required.' });
    }

    // Generate both in parallel for speed
    const [mcqs, openEndedQuestions] = await Promise.all([
      generateMCQs(resumeJson, jobJson, mcqCount),
      generateOpenEndedQuestions(resumeJson, jobJson, openEndedCount),
    ]);

    const sessionId = uuidv4();

    return res.json({
      success: true,
      data: {
        session_id: sessionId,
        type: 'quick',
        mcqs,
        open_ended: openEndedQuestions,
        total_questions: (mcqs as object[]).length + (openEndedQuestions as object[]).length,
        estimated_minutes: 15,
      },
    });
  } catch (err) {
    console.error('Assessment generation error:', err);
    return res.status(500).json({ error: 'Failed to generate assessment. Please try again.' });
  }
});

// POST /api/assessment/evaluate-answer
// Evaluates a single answer (MCQ or open-ended)
router.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { answer, questionJson, resumeJson, jobJson } = req.body;

    if (!answer || !questionJson || !resumeJson || !jobJson) {
      return res.status(400).json({ error: 'answer, questionJson, resumeJson, jobJson are required.' });
    }

    // For MCQ, do a quick local evaluation + Claude evaluation for open-ended
    const questionType = (questionJson as { type?: string }).type;

    if (questionType === 'mcq' || (questionJson as { options?: unknown[] }).options) {
      // MCQ: local evaluation based on is_correct flag
      const options = (questionJson as { options: { label: string; is_correct: boolean; explanation: string }[] }).options;
      const selectedOption = options?.find((o) => o.label === answer);
      const correctOption = options?.find((o) => o.is_correct);

      const isCorrect = selectedOption?.is_correct ?? false;
      const score = isCorrect ? 8 : 2;

      return res.json({
        success: true,
        data: {
          is_correct: isCorrect,
          selected_explanation: selectedOption?.explanation ?? '',
          correct_answer: correctOption?.label ?? '',
          correct_explanation: correctOption?.explanation ?? '',
          score,
          overall_explanation: (questionJson as { overall_explanation?: string }).overall_explanation ?? '',
          common_mistake: (questionJson as { common_mistake?: string }).common_mistake ?? '',
          pro_tip: (questionJson as { pro_tip?: string }).pro_tip ?? '',
        },
      });
    }

    // Open-ended: use Claude for rich evaluation
    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a more detailed answer (at least a sentence).' });
    }

    const evaluation = await evaluateAnswer(answer, questionJson, resumeJson, jobJson);
    return res.json({ success: true, data: evaluation });
  } catch (err) {
    console.error('Answer evaluation error:', err);
    return res.status(500).json({ error: 'Failed to evaluate answer. Please try again.' });
  }
});

export default router;
