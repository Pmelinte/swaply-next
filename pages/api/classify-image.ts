// pages/api/classify-image.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN!;
const MODEL = 'microsoft/resnet-50'; // model sigur și stabil

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // crește limita dacă ai imagini mari
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: 'No image provided' });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
        'Content-Type': 'image/jpeg',
      },
      body: Buffer.from(imageBase64, 'base64'),
    });

    const text = await response.text(); // citim ca text, nu direct json
    console.log("📥 Răspuns brut de la Hugging Face:", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({ message: 'Invalid JSON response', raw: text });
    }

    if (Array.isArray(result)) {
      const best = result[0];
      return res.status(200).json({ label: best.label, score: best.score });
    }

    return res.status(500).json({ message: 'Unexpected response from Hugging Face', result });
  } catch (err) {
    console.error("Hugging Face error:", err);
    return res.status(500).json({ message: 'Server error', error: String(err) });
  }
}
