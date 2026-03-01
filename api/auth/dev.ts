// @ts-ignore
import type { VercelRequest, VercelResponse } from 'vercel';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('Dev auth request received');
    const { telegramId, username, firstName } = req.body;
    
    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId required' });
    }

    const tid = BigInt(telegramId);
    
    let user = await prisma.user.findUnique({ where: { telegramId: tid } });

    if (!user) {
      console.log('Creating dev user...');
      user = await prisma.user.create({
        data: {
          telegramId: tid,
          username: username || 'dev_user',
          firstName: firstName || 'Dev',
          languageCode: 'ru',
          sphereWeights: { create: { sleep: 15, water: 10, nutrition: 10, fitness: 15, work: 15, finance: 15, mood: 10, selfDevelopment: 5, personalLife: 5 } },
        },
      });
    }

    const token = jwt.sign({ telegramId: tid.toString() }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ 
      success: true, 
      user: { id: user.id, telegramId: user.telegramId.toString() }, 
      token 
    });
  } catch (error: any) {
    console.error('Dev auth error:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
