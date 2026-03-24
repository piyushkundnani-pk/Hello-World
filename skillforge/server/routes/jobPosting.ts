import { Router, Request, Response } from 'express';
import { parseJobPosting } from '../services/claude';

const router = Router();

// POST /api/job/parse
router.post('/parse', async (req: Request, res: Response) => {
  try {
    const { jobText } = req.body;
    if (!jobText || typeof jobText !== 'string' || jobText.length < 50) {
      return res.status(400).json({ error: 'Job posting text must be at least 50 characters.' });
    }

    const parsed = await parseJobPosting(jobText);
    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Job parse error:', err);
    return res.status(500).json({ error: 'Failed to parse job posting. Please try again.' });
  }
});

export default router;
