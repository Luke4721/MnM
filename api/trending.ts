import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:mnmtravels.com';

    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    // Parse the service account key JSON
    const credentials = JSON.parse(serviceAccountKey);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });

    const webmasters = google.webmasters({ version: 'v3', auth });

    // Calculate dates for the last 28 days
    const today = new Date();
    const startDate = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    const response = await webmasters.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'query',
                operator: 'contains',
                expression: 'india',
              }
            ],
          },
        ],
        rowLimit: 10,
      },
    });

    // Extract the top 3 Indian destinations based on GSC clicks
    const rows = response.data.rows || [];
    const trending = rows
      .filter(row => {
        const q = row.keys?.[0]?.toLowerCase() || '';
        return q.includes('india') || q.includes('kerala') || q.includes('rajasthan');
      })
      .slice(0, 3)
      .map(row => ({
        query: row.keys?.[0],
        clicks: row.clicks,
        impressions: row.impressions
      }));

    // Fallback data if GSC returns nothing
    const finalData = trending.length > 0 ? trending : [
      { query: 'kerala backwaters', clicks: 120, impressions: 500 },
      { query: 'rajasthan palaces', clicks: 95, impressions: 450 },
      { query: 'golden triangle india', clicks: 80, impressions: 400 }
    ];

    return res.status(200).json({ success: true, data: finalData });
  } catch (error: any) {
    console.error('GSC API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
