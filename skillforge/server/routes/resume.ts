import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parseResume } from '../services/claude';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/resume/parse-text
router.post('/parse-text', async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.length < 50) {
      return res.status(400).json({ error: 'Resume text must be at least 50 characters.' });
    }

    const parsed = await parseResume(resumeText);
    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('Resume parse error:', err);
    return res.status(500).json({ error: 'Failed to parse resume. Please try again.' });
  }
});

// POST /api/resume/parse-pdf
router.post('/parse-pdf', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    // Dynamically import pdf-parse to avoid startup issues
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Try pasting the text instead.' });
    }

    const parsed = await parseResume(resumeText);
    return res.json({ success: true, data: parsed, raw_text: resumeText });
  } catch (err) {
    console.error('PDF parse error:', err);
    return res.status(500).json({ error: 'Failed to parse PDF. Please try pasting resume text instead.' });
  }
});

export default router;
