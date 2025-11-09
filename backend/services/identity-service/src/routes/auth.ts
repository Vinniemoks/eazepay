import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../repositories/users';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'user not found' });
    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev', { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'user exists' });
    const user = await createUser(email);
    res.status(201).json({ message: 'registered', user });
  } catch (err: any) {
    console.error('register error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;