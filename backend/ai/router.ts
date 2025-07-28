import { Router } from 'express';
import { ConciergeAI } from './concierge';

const router = Router();
const concierge = new ConciergeAI();

router.post('/chat', async (req, res) => {
  const { prompt, role } = req.body;
  if (!prompt || !role) {
    return res.status(400).send({ error: 'Prompt and role are required' });
  }

  const response = await concierge.getResponse(prompt, role);
  res.send({ response });
});

export default router;

