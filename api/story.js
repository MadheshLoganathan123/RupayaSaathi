// /api/story.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST allowed' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    body = body || {};

    const { language = 'english', test = false } = body;

    // API Key Test Mode
    if (test === true) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ 
          message: 'Invalid or missing API key.',
          apiKeyPresent: false 
        });
      }

      // Test API connectivity
      try {
        const testResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          })
        });

        if (testResponse.ok) {
          return res.status(200).json({ 
            message: 'DeepSeek API reachable.',
            apiKeyPresent: true,
            status: 'connected'
          });
        } else {
          return res.status(200).json({ 
            message: 'Invalid or missing API key.',
            apiKeyPresent: true,
            status: 'error',
            httpStatus: testResponse.status
          });
        }
      } catch (error) {
        return res.status(200).json({ 
          message: 'Invalid or missing API key.',
          apiKeyPresent: true,
          status: 'error',
          error: String(error)
        });
      }
    }

    const lang = String(language || 'english').toLowerCase().trim();
    if (!['english', 'hindi', 'tamil'].includes(lang)) {
      return res.status(400).json({ error: 'Unsupported language. Use english, hindi or tamil.' });
    }

    // Build strict JSON-only prompt for the model
    const prompt = `You are an assistant that writes short, simple financial-lesson stories for learners.
Output MUST be valid JSON only (no extra text). Use the EXACT keys: title, story, question, options, correct.
- title: short title string (max 6 words)
- story: very short story (1-4 sentences), simple language for ${lang}
- question: one question about the story (single sentence)
- options: array of two option strings [optionA, optionB]
- correct: integer 0 or 1 indicating the correct option index

Language: ${lang}

Return only JSON.`;

    // Try to use OpenRouter DeepSeek if API key present
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
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
            'X-Title': 'RupayaSaathi'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 500
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const txt = await response.text();
          console.error('OpenRouter API error', response.status, txt.slice(0, 300));
          // fall through to deterministic fallback
        } else {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
            generated = data.choices[0].message.content;
          } else if (typeof data === 'string') {
            generated = data;
          } else {
            generated = JSON.stringify(data);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          console.error('OpenRouter request timed out');
        } else {
          console.error('OpenRouter request failed', String(err));
        }
        // fall through to fallback
      }
    }

    // If no generated content from model, build deterministic fallback
    if (!generated || generated.trim().length === 0) {
      const smallTitle = `${sanitizedTopic.split(' ')[0]} Lesson`;
      const stories = {
        english: {
          title: smallTitle,
          story: `Once there was a child who learned about ${sanitizedTopic}. They decided to save a little every week and saw the difference.`,
          question: 'What was the best choice the child made?',
          options: ['Saved money regularly', 'Spent all money immediately'],
          correct: 0
        },
        hindi: {
          title: smallTitle,
          story: `एक बच्चे ने ${sanitizedTopic} के बारे में सीखा। उसने हर हफ्ते थोड़ा बचाया और फर्क देखा।`,
          question: 'बच्चे ने सबसे अच्छा क्या किया?',
          options: ['नियमित रूप से पैसे बचाए', 'सारे पैसे तुरंत खर्च किए'],
          correct: 0
        },
        tamil: {
          title: smallTitle,
          story: `${sanitizedTopic} பற்றி ஒரு குழந்தை கற்றுக் கொண்டது. அது வாரம் ஒன்றுக்கு சிறு சேமிப்பு செய்தது மற்றும் வேறுபாடு கண்டது.`,
          question: 'இந்தக் கதையில் சிறுவன் செய்த சிறந்த தேர்வு எது?',
          options: ['பணம் சேமித்தது', 'அனைத்து பணத்தையும் உடனே செலவு செய்தது'],
          correct: 0
        }
      };

      const fallback = stories[lang] || stories['english'];
      // Ensure types and lengths
      const result = {
        title: String(fallback.title).slice(0, 100),
        story: String(fallback.story).slice(0, 1000),
        question: String(fallback.question).slice(0, 200),
        options: Array.isArray(fallback.options) ? fallback.options.slice(0, 2).map(o => String(o).slice(0, 200)) : ['Option A', 'Option B'],
        correct: fallback.correct === 1 ? 1 : 0
      };

      return res.status(200).json(result);
    }

    // Try to extract JSON from generated text (several strategies)
    let parsed = null;
    try {
      parsed = JSON.parse(generated.trim());
    } catch (e) {
      // code block
      const codeBlockMatch = generated.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try { parsed = JSON.parse(codeBlockMatch[1]); } catch (e2) {}
      }
      if (!parsed) {
        const firstBrace = generated.indexOf('{');
        const lastBrace = generated.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonSubstring = generated.slice(firstBrace, lastBrace + 1);
          try { parsed = JSON.parse(jsonSubstring); } catch (e3) {}
        }
      }
      if (!parsed) {
        const arrayMatch = generated.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          try {
            const potentialArray = JSON.parse(arrayMatch[0]);
            if (Array.isArray(potentialArray) && potentialArray.length > 0) {
              parsed = potentialArray[0];
            }
          } catch (e4) {}
        }
      }
    }

    if (!parsed) {
      // As last resort return fallback
      console.error('Could not parse model output, returning fallback');
      const fallbackResult = {
        title: 'Financial Lesson',
        story: generated.slice(0, 400) || 'A story about financial responsibility.',
        question: 'What is the best choice?',
        options: ['Option A', 'Option B'],
        correct: 0
      };
      return res.status(200).json(fallbackResult);
    }

    // Normalize and validate parsed object
    const keys = ['title', 'story', 'question', 'options', 'correct'];
    const missingKeys = keys.filter(k => !(k in parsed));
    if (missingKeys.length > 0) {
      // return fallback instead of error to keep UX smooth
      console.error('Model output missing keys:', missingKeys);
    }

    const result = {
      title: String(parsed.title || 'Financial Lesson').trim().slice(0, 100),
      story: String(parsed.story || '').trim().slice(0, 1000),
      question: String(parsed.question || 'What is the best choice?').trim().slice(0, 200),
      options: Array.isArray(parsed.options) && parsed.options.length >= 2
        ? parsed.options.slice(0, 2).map(opt => String(opt).trim().slice(0, 200))
        : ['Option A', 'Option B'],
      correct: parsed.correct === 1 || parsed.correct === '1' ? 1 : 0
    };

    if (!result.title || !result.story || !result.question) {
      console.error('Parsed result missing non-empty required fields, using fallback');
      const fallbackResult = {
        title: 'Financial Lesson',
        story: generated.slice(0, 400) || 'A story about financial responsibility.',
        question: 'What is the best choice?',
        options: ['Option A', 'Option B'],
        correct: 0
      };
      return res.status(200).json(fallbackResult);
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error('story endpoint error:', err);
    return res.status(500).json({ error: 'Server error', message: process.env.NODE_ENV === 'development' ? String(err) : 'An internal error occurred' });
  }
}
