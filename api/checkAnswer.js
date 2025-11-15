// /api/checkAnswer.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    // Parse request body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    body = body || {};

    const { userAnswer, correctAnswer } = body;

    // Validate inputs
    if (userAnswer === undefined || userAnswer === null) {
      return res.status(400).json({ error: 'userAnswer is required' });
    }

    if (correctAnswer === undefined || correctAnswer === null) {
      return res.status(400).json({ error: 'correctAnswer is required' });
    }

    // Normalize to numbers for comparison
    const userAns = parseInt(userAnswer, 10);
    const correctAns = parseInt(correctAnswer, 10);

    if (isNaN(userAns) || isNaN(correctAns)) {
      return res.status(400).json({ error: 'Answers must be valid numbers' });
    }

    // Check if answer is correct
    const isCorrect = userAns === correctAns;

    return res.status(200).json({
      correct: isCorrect,
      userAnswer: userAns,
      correctAnswer: correctAns
    });

  } catch (err) {
    console.error('checkAnswer error:', err);
    return res.status(500).json({
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? String(err) : 'An internal error occurred'
    });
  }
}
