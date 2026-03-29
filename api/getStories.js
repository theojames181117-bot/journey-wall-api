import Airtable from 'airtable';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID);

    // Get records (no filter)
    const records = await base('Stories')
      .select({
        sort: [{ field: "createdTime", direction: "desc" }],
      })
      .all();

    // Filter in JS (safe + reliable)
    const stories = records
      .filter(record => record.fields.status === 'approved')
      .map(record => ({
        id: record.id,
        baby_name: record.fields.baby_name || '',
        gestation_weeks: record.fields.gestation_weeks || 0,
        gestation_days: record.fields.gestation_days || 0,
        birth_weight: record.fields['birth_weight (g)'] || null,
        message: record.fields.message || '',
      }));

    return res.status(200).json({ stories });

  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
