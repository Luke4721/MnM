import type { VercelRequest, VercelResponse } from '@vercel/node';
import { VERCEL_DEPLOY_WEBHOOK } from '../../config/appConfig.ts';

// Simple authentication token verification
const WEBHOOK_SECRET = process.env.CRM_WEBHOOK_SECRET;
const DEPLOY_WEBHOOK_URL = VERCEL_DEPLOY_WEBHOOK;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Validate the incoming webhook secret (from the external CRM)
  const authHeader = req.headers.authorization || '';
  if (!WEBHOOK_SECRET || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized webhook request' });
  }

  try {
    const payload = req.body;
    
    // Example: The CRM tells us an article was published or updated
    if (payload.event === 'blog.published' || payload.event === 'blog.updated') {
      console.log(`Received CRM event ${payload.event} for blog ID ${payload.data?.id}`);
      
      // Since this is a static site (SSG), we must trigger a Vercel Rebuild to fetch the latest DB file from S3
      if (DEPLOY_WEBHOOK_URL) {
        const deployRes = await fetch(DEPLOY_WEBHOOK_URL, { method: 'POST' });
        if (!deployRes.ok) {
          throw new Error('Failed to trigger Vercel deployment hook');
        }
        
        return res.status(200).json({ 
          success: true, 
          message: 'Webhook received. Vercel rebuild triggered.' 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'VERCEL_DEPLOY_WEBHOOK env var is not configured.' 
        });
      }
    }

    // Acknowledge other events without triggering a rebuild
    return res.status(200).json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error('CRM Webhook error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
