// @ts-ignore
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== DEV AUTH REQUEST ===');
    const body = req.body || {};
    console.log('Request body:', JSON.stringify(body));
    
    const { telegramId, username, firstName } = body;
    
    if (!telegramId) {
      console.log('Missing telegramId');
      return res.status(400).json({ error: 'telegramId is required' });
    }

    console.log('Telegram ID:', telegramId);
    console.log('JWT_SECRET configured:', JWT_SECRET ? 'YES' : 'NO');
    console.log('DATABASE_URL configured:', process.env.DATABASE_URL ? 'YES' : 'NO');

    const tid = BigInt(telegramId);
    
    console.log('Looking up user...');
    let user = await prisma.user.findUnique({ 
      where: { telegramId: tid } 
    });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          telegramId: tid,
          username: username || 'dev_user',
          firstName: firstName || 'Dev',
          languageCode: 'ru',
          sphereWeights: { 
            create: { 
              sleep: 15, 
              water: 10, 
              nutrition: 10, 
              fitness: 15, 
              work: 15, 
              finance: 15, 
              mood: 10, 
              selfDevelopment: 5, 
              personalLife: 5 
            } 
          },
        },
      });
      console.log('User created with ID:', user.id);
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { telegramId: tid.toString() }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    console.log('=== DEV AUTH SUCCESS ===');
    
    return res.status(200).json({ 
      success: true, 
      user: { 
        id: user.id, 
        telegramId: user.telegramId.toString() 
      }, 
      token 
    });
  } catch (error: any) {
    console.error('=== DEV AUTH ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}
