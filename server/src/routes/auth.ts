import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  if (db.getUserByEmail(email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }
  
  const user = {
    id: uuidv4(),
    email,
    name,
    passwordHash: password,
  };
  
  db.createUser(user);
  const token = generateToken(user.id);
  
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    token,
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const user = db.getUserByEmail(email);
  
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  const token = generateToken(user.id);
  
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    token,
  });
});

router.post('/logout', (req, res) => {
  res.status(204).send();
});

router.get('/me', (req, res) => {
  res.json({ authenticated: true });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // For security, don't reveal if user exists.
    // But for this project, let's be helpful or just return success.
    return res.json({ message: 'If that email is registered, we have sent a reset link to it.' });
  }

  const token = uuidv4();
  db.storeResetToken(token, user.id);

  // MOCK EMAIL SENDING
  console.log(`[Mock Email Service] Password reset token for ${email}: ${token}`);
  
  // Return token in response for testing purposes (since we don't have real email)
  return res.json({ 
    message: 'If that email is registered, we have sent a reset link to it.',
    // In production, NEVER return this. For this assignment, it's useful.
    debugToken: token 
  });
});

router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  const resetData = db.getResetToken(token);
  if (!resetData) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  if (Date.now() > resetData.expiresAt) {
    db.deleteResetToken(token);
    return res.status(400).json({ message: 'Token has expired' });
  }

  db.updateUserPassword(resetData.userId, newPassword);
  db.deleteResetToken(token);

  res.json({ message: 'Password has been reset successfully' });
});

export { router as authRouter };
