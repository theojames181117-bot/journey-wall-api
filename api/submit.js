export default async function handler(req, res) {

  // ✅ CORS (fixes "failed to fetch")
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Basic validation
    if (!data.message || data.message.length < 5) {
      return res.status(400).json({ error: 'Message too short' });
    }

    if (!data.consent) {
      return res.status(400).json({ error: 'Consent required' });
    }

    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Stories`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            baby_name: data.baby_name || '',
            gestation_weeks: Number(data.gestation_weeks),
            gestation_days: Number(data.gestation_days || 0),
            "birth_weight (g)": Number(data.birth_weight || 0),
            message: data.message,
            consent: data.consent,
            status: "pending"
          },
        }),
      }
    );

    const result = await airtableRes.json();

    // Show Airtable errors if any
    if (!airtableRes.ok) {
      return res.status(400).json(result);
    }

    return res.status(200).json({ success: true, result });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
