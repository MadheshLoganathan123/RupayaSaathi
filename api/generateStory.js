// /api/generateStory.js
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

    // Parse request body - Vercel serverless functions may not auto-parse
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }
    body = body || {};

    const { language = 'english', topic = 'saving money' } = body;

    // Input validation and sanitization
    const lang = String(language || 'english').toLowerCase().trim();
    if (!['english', 'hindi', 'tamil'].includes(lang)) {
      return res.status(400).json({ error: 'Unsupported language. Use english, hindi or tamil.' });
    }

    // Sanitize topic: remove special characters, limit length
    const sanitizedTopic = String(topic || 'saving money')
      .trim()
      .slice(0, 100) // Limit length
      .replace(/[<>\"']/g, ''); // Remove potentially dangerous characters

    if (!sanitizedTopic || sanitizedTopic.length === 0) {
      return res.status(400).json({ error: 'Topic cannot be empty' });
    }

    // Build prompt for the model — request strict JSON output
    const prompt = `You are an assistant that writes short, simple financial-lesson stories for learners.
Output MUST be valid JSON only (no extra text). Use the EXACT keys: title, story, question, options, correct.
- title: short title string (max 6 words)
- story: very short story (1-4 sentences), simple language for ${lang}
- question: one question about the story (single sentence)
- options: array of two option strings [optionA, optionB]
- correct: integer 0 or 1 indicating the correct option index

Language: ${lang}
Topic hint: ${sanitizedTopic}

Return only JSON.`;

    // Validate prompt length (rough estimate: 1 token ≈ 4 characters)
    const estimatedPromptTokens = Math.ceil(prompt.length / 4);
    const maxInputTokens = 2000; // Conservative limit
    if (estimatedPromptTokens > maxInputTokens) {
      return res.status(400).json({ error: 'Prompt too long. Please use a shorter topic.' });
    }

    // OpenRouter API key from env
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured on server' });
    }

    // Call OpenRouter API with timeout
    const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://rupayasaathi.vercel.app',
          'X-Title': 'RupayaSaathi'
        },
        body: JSON.stringify({
          model: 'mistral-7b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 300
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timeout. OpenRouter API took too long to respond.' });
      }
      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      // Sanitize error message to avoid exposing sensitive info
      const sanitizedError = errorText.length > 200 
        ? errorText.slice(0, 200) + '...' 
        : errorText.replace(/Bearer\s+[\w-]+/gi, 'Bearer [REDACTED]');
      
      console.error('OpenRouter API error:', response.status, sanitizedError);
      return res.status(502).json({ 
        error: 'OpenRouter API error', 
        status: response.status 
      });
    }

    // OpenRouter returns messages with content
    const apiData = await response.json();
    let generated = '';
    if (apiData.choices && apiData.choices[0] && apiData.choices[0].message && apiData.choices[0].message.content) {
      generated = apiData.choices[0].message.content;
    } else if (typeof apiData === 'string') {
      generated = apiData;
    } else {
      // If response format differs, stringify whole body as fallback
      generated = JSON.stringify(apiData);
    }

    // Enhanced JSON extraction: try multiple strategies
    let parsed = null;
    
    // Strategy 1: Try parsing the entire generated text
    try {
      parsed = JSON.parse(generated.trim());
    } catch (e) {
      // Strategy 2: Extract JSON from markdown code blocks
      const codeBlockMatch = generated.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          parsed = JSON.parse(codeBlockMatch[1]);
        } catch (e2) {
          // Continue to next strategy
        }
      }
      
      // Strategy 3: Find first { ... } block (handles text before/after JSON)
      if (!parsed) {
        const firstBrace = generated.indexOf('{');
        const lastBrace = generated.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonSubstring = generated.slice(firstBrace, lastBrace + 1);
          try {
            parsed = JSON.parse(jsonSubstring);
          } catch (e3) {
            // Continue to fallback
          }
        }
      }
      
      // Strategy 4: Try to find JSON array pattern
      if (!parsed) {
        const arrayMatch = generated.match(/\[[\s\S]*?\]/);
        if (arrayMatch) {
          try {
            const potentialArray = JSON.parse(arrayMatch[0]);
            if (Array.isArray(potentialArray) && potentialArray.length > 0) {
              parsed = potentialArray[0];
            }
          } catch (e4) {
            // Continue to fallback
          }
        }
      }
    }

    if (!parsed) {
      // Fallback: build minimal structure
      const fallback = {
        title: 'Financial Lesson',
        story: generated.slice(0, 400) || 'A story about financial responsibility.',
        question: 'What is the best choice?',
        options: ['Option A', 'Option B'],
        correct: 0
      };
      return res.status(200).json(fallback);
    }

    // Validate and normalize parsed object
    const keys = ['title', 'story', 'question', 'options', 'correct'];
    const missingKeys = keys.filter(k => !(k in parsed));
    
    if (missingKeys.length > 0) {
      return res.status(422).json({ 
        error: 'Model output missing required keys', 
        missingKeys 
      });
    }

    // Normalize and validate data types
    const result = {
      title: String(parsed.title || 'Financial Lesson').trim().slice(0, 100),
      story: String(parsed.story || '').trim().slice(0, 1000),
      question: String(parsed.question || 'What is the best choice?').trim().slice(0, 200),
      options: Array.isArray(parsed.options) && parsed.options.length >= 2
        ? parsed.options.slice(0, 2).map(opt => String(opt).trim().slice(0, 200))
        : ['Option A', 'Option B'],
      correct: parsed.correct === 1 || parsed.correct === '1' ? 1 : 0
    };

    // Validate non-empty strings
    if (!result.title || !result.story || !result.question) {
      return res.status(422).json({ 
        error: 'Model output contains empty required fields' 
      });
    }

    // Return clean formatted JSON (direct object, not wrapped)
    return res.status(200).json(result);

  } catch (err) {
    console.error('generateStory error:', err);
    return res.status(500).json({ 
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? String(err) : 'An internal error occurred'
    });
  }
}
  