// /api/story.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'Invalid JSON in request body' }); }
    }
    body = body || {};

    const { test = false } = body;
    const { language = 'english', numStories = 1, options } = body;
    const { topic = 'saving money', difficulty = 'easy', length = 'short' } = options || {};

    // API Key test support (keeps previous behavior)
    if (test === true) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) return res.status(200).json({ message: 'Invalid or missing API key.', apiKeyPresent: false });

      try {
        const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'deepseek/deepseek-r1', messages: [{ role: 'user', content: 'test' }], max_tokens: 5 })
        });
        if (resp.ok) return res.status(200).json({ message: 'DeepSeek API reachable.', apiKeyPresent: true, status: 'connected' });
        return res.status(200).json({ message: 'Invalid or missing API key.', apiKeyPresent: true, status: 'error', httpStatus: resp.status });
      } catch (err) {
        return res.status(200).json({ message: 'Invalid or missing API key.', apiKeyPresent: true, status: 'error', error: String(err) });
      }
    }

    const lang = String(language || 'english').toLowerCase().trim();
    if (!['english', 'hindi', 'tamil'].includes(lang)) return res.status(400).json({ error: 'Unsupported language. Use english, hindi or tamil.' });

    const sanitizedTopic = String(topic || 'saving money').trim().slice(0, 100).replace(/[<>"']/g, '');
    const sanitizedDifficulty = String(difficulty || 'easy').trim().slice(0, 20);
    const sanitizedLength = String(length || 'short').trim().slice(0, 20);

    const requestedCount = Math.max(5, Math.min(10, Number(numStories || 5)));

    const prompt = `You are an assistant that writes short, simple financial-lesson stories for learners.\nReturn a JSON ARRAY with exactly ${requestedCount} objects.\nEach object MUST use the EXACT keys: title, story, question, options, correct.\n- title: short title string (max 6 words)\n- story: very short story (1-4 sentences), simple language for ${lang}\n- question: one question about the story (single sentence)\n- options: array of exactly 10 option strings (10 choices for each question)\n- correct: integer from 0-9 indicating the correct option index\n\nLanguage: ${lang}\nTopic hint: ${sanitizedTopic}\nDifficulty: ${sanitizedDifficulty}\nLength: ${sanitizedLength}\n\nReturn only a JSON array with ${requestedCount} complete story objects.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    let generated = '';

    if (apiKey) {
      const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(openRouterUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ model: 'deepseek/deepseek-r1', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 3000 }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data = await response.json();
          if (data?.choices && data.choices[0]?.message?.content) generated = data.choices[0].message.content;
          else if (typeof data === 'string') generated = data;
          else generated = JSON.stringify(data);
        } else {
          const txt = await response.text().catch(() => '');
          console.error('OpenRouter API error', response.status, txt.slice(0, 300));
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') console.error('OpenRouter request timed out');
        else console.error('OpenRouter request failed', String(err));
      }
    }

    // If nothing generated, build deterministic fallback array
    if (!generated || generated.trim().length === 0) {
      const base = sanitizedTopic.split(' ')[0] || 'Lesson';
      const templates = {
        english: (i) => ({ title: `${base} ${i+1}`, story: `Once there was a child who learned about ${sanitizedTopic}. They saved a little each week and noticed the difference.`, question: 'What was the best choice the child made?', options: ['Saved money regularly','Spent all money immediately'], correct: 0 }),
        hindi: (i) => ({ title: `${base} ${i+1}`, story: `एक बच्चे ने ${sanitizedTopic} के बारे में सीखा। उसने हर हफ्ते थोड़ा बचाया और फर्क देखा।`, question: 'बच्चे ने सबसे अच्छा क्या किया?', options: ['नियमित रूप से पैसे बचाए','सारे पैसे तुरंत खर्च किए'], correct: 0 }),
        tamil: (i) => ({ title: `${base} ${i+1}`, story: `${sanitizedTopic} பற்றி ஒரு குழந்தை கற்றுக் கொண்டது. அது வாரம் சிறிது சேமித்தது மற்றும் மாற்றத்தை கண்டது.`, question: 'இந்தக் கதையில் சிறுவன் செய்த சிறந்த செயல் எது?', options: ['பணம் சேமித்தது','அனைத்து பணத்தையும் உடனே செலவு செய்தது'], correct: 0 })
      };
      const arr = [];
      for (let i=0;i<requestedCount;i++) arr.push(templates[lang]?.(i) ?? templates['english'](i));
      return res.status(200).json(arr);
    }

    // Try to parse generated output as JSON array/object
    let parsed = null;
    try { parsed = JSON.parse(generated.trim()); } catch (e) {
      // try to extract array from text
      const arrayMatch = generated.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        try { parsed = JSON.parse(arrayMatch[0]); } catch (e2) { parsed = null; }
      }
    }

    // If parsed is still null, fallback
    if (!parsed) {
      console.error('Could not parse model output, returning fallback array');
      const base = sanitizedTopic.split(' ')[0] || 'Lesson';
      const arr = [];
      for (let i=0;i<requestedCount;i++) arr.push({ title: `${base} ${i+1}`, story: generated.slice(0,400) || 'A story about financial responsibility.', question: 'What is the best choice?', options: ['Option A','Option B'], correct: 0 });
      return res.status(200).json(arr);
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];

    const normalize = (p) => ({
      title: String(p.title || 'Financial Lesson').trim().slice(0,100),
      story: String(p.story || '').trim().slice(0,1000),
      question: String(p.question || 'What is the best choice?').trim().slice(0,200),
      options: Array.isArray(p.options) && p.options.length >= 2 ? p.options.slice(0,2).map((o)=>String(o).trim().slice(0,200)) : ['Option A','Option B'],
      correct: p.correct === 1 || p.correct === '1' ? 1 : 0
    });

    const normalized = items.slice(0, requestedCount).map(normalize);
    // pad if needed
    while (normalized.length < requestedCount) {
      normalized.push({ title: 'Financial Lesson', story: 'A story about financial responsibility.', question: 'What is the best choice?', options: ['Option A','Option B'], correct: 0 });
    }

    return res.status(200).json(normalized);

  } catch (err) {
    console.error('story endpoint error:', err);
    return res.status(500).json({ error: 'Server error', message: process.env.NODE_ENV === 'development' ? String(err) : 'An internal error occurred' });
  }
}
