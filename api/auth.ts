// @ts-ignore
import type { VercelRequest, VercelResponse } from 'vercel';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function validateTelegramData(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...restData } = data;
  if (!hash) return false;
  
  const sortedKeys = Object.keys(restData).sort();
  const dataCheckString = sortedKeys.map(key => `${key}=${restData[key]}`).join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return computedHash === hash;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    console.log('Auth request received');
    const { initData } = req.body;
    console.log('InitData:', initData ? 'present' : 'missing');
    
    if (!initData) {
      console.log('No initData');
      return res.status(400).json({ error: 'initData required' });
    }

    const params = new URLSearchParams(initData);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('Bot token:', botToken ? 'configured' : 'MISSING!');
    
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    if (!validateTelegramData(data, botToken)) {
      console.log('Invalid Telegram data');
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    const userString = data.user;
    console.log('User data:', userString ? 'present' : 'missing');
    
    if (!userString) {
      return res.status(400).json({ error: 'User data not found' });
    }

    const userData = JSON.parse(decodeURIComponent(userString));
    const telegramId = BigInt(userData.id);
    console.log('Telegram ID:', telegramId.toString());
    
    let user = await prisma.user.findUnique({ where: { telegramId } });
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          telegramId,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          languageCode: userData.language_code || 'ru',
          sphereWeights: { create: { sleep: 15, water: 10, nutrition: 10, fitness: 15, work: 15, finance: 15, mood: 10, selfDevelopment: 5, personalLife: 5 } },
        },
      });
      console.log('User created:', user.id);
    }

    const token = jwt.sign({ telegramId: telegramId.toString() }, JWT_SECRET, { expiresIn: '30d' });
    console.log('Token generated');

    res.status(200).json({ 
      success: true, 
      user: { id: user.id, telegramId: user.telegramId.toString() }, 
      token 
    });
  } catch (error: any) {
    console.error('Auth error:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
