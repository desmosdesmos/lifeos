// @ts-ignore
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('=== SIMPLE AUTH REQUEST ===');
    console.log('JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT SET');
    
    const { telegramId } = req.body || {};
    if (!telegramId) return res.status(400).json({ error: 'telegramId required' });

    console.log('Telegram ID:', telegramId);
    
    // Generate token WITHOUT database
    const token = jwt.sign(
      { telegramId: telegramId.toString() }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    console.log('Token generated successfully');
    
    return res.status(200).json({ 
      success: true, 
      user: { id: 1, telegramId: telegramId.toString() }, 
      token,
      message: 'Auth works without DB!'
    });
  } catch (error: any) {
    console.error('Simple auth error:', error.message);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
