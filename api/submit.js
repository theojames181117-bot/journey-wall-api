export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Basic validation
    if (!data.message || data.message.length < 20) {
      return res.status(400).json({ error: 'Message too short' });
    }

    if (!data.consent) {
      return res.status(400).json({ error: 'Consent required' });
    }

    const airtableRes = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          baby_name: data.baby_name || '',
          gestation_weeks: data.gestation_weeks,
          gestation_days: data.gestation_days || 0,
          birth_weight: data.birth_weight,
          message: data.message,
          image_url: data.image_url || '',
          consent: true,
          status: 'pending',
        },
      }),
    });

    const result = await airtableRes.json();

    return res.status(200).json({ success: true, result });

  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
