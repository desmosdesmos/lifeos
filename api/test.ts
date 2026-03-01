// @ts-ignore
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== TEST REQUEST ===');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET');
    
    const body = req.body || {};
    console.log('Body:', JSON.stringify(body));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Test endpoint works!',
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      }
    });
  } catch (error: any) {
    console.error('Test error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
