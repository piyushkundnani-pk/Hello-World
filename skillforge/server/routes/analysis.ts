import { Router, Request, Response } from 'express';
import { generateGapAnalysis, generateStudyPlan } from '../services/claude';

const router = Router();

// POST /api/analysis/gap
router.post('/gap', async (req: Request, res: Response) => {
  try {
    const { resumeJson, jobJson, assessmentScores } = req.body;

    if (!resumeJson || !jobJson || !assessmentScores) {
      return res.status(400).json({ error: 'resumeJson, jobJson, and assessmentScores are required.' });
    }

    const gapAnalysis = await generateGapAnalysis(resumeJson, jobJson, assessmentScores);
    return res.json({ success: true, data: gapAnalysis });
  } catch (err) {
    console.error('Gap analysis error:', err);
    return res.status(500).json({ error: 'Failed to generate gap analysis. Please try again.' });
  }
});

// POST /api/analysis/study-plan
router.post('/study-plan', async (req: Request, res: Response) => {
  try {
    const { gapAnalysis, resumeJson, jobJson, daysUntilInterview = 14 } = req.body;

    if (!gapAnalysis || !resumeJson || !jobJson) {
      return res.status(400).json({ error: 'gapAnalysis, resumeJson, and jobJson are required.' });
    }

    const studyPlan = await generateStudyPlan(gapAnalysis, resumeJson, jobJson, daysUntilInterview);
    return res.json({ success: true, data: studyPlan });
  } catch (err) {
    console.error('Study plan error:', err);
    return res.status(500).json({ error: 'Failed to generate study plan. Please try again.' });
  }
});

export default router;
