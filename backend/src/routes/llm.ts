import { Router, Request, Response, NextFunction } from 'express';
import { generateLlmReport } from '../services/llmService';

const router = Router();

router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  const { childProfile, sessionData, computedMetrics, recentHistory, sessionId } = req.body;

  if (!childProfile || !sessionData || !computedMetrics) {
    res.status(400).json({ error: "Certaines données requises (childProfile, sessionData, computedMetrics) sont manquantes." });
    return;
  }

  try {
    const report = await generateLlmReport({
      childProfile,
      sessionData,
      computedMetrics,
      recentHistory,
    });

    res.json(report);
  } catch (error) {
    next(error);
  }
});

export default router;
