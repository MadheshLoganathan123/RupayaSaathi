// /api/story.js
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

    const { language = 'english' } = body;

    // Input validation and sanitization
    const lang = String(language || 'english').toLowerCase().trim();
    if (!['english', 'hindi', 'tamil'].includes(lang)) {
      return res.status(400).json({ error: 'Unsupported language. Use english, hindi or tamil.' });
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

Return only JSON.`;

    // Validate prompt length (rough estimate: 1 token ≈ 4 characters)
    const estimatedPromptTokens = Math.ceil(prompt.length / 4);
    const maxInputTokens = 2000; // Conservative limit
    if (estimatedPromptTokens > maxInputTokens) {
      return res.status(400).json({ error: 'Prompt too long. Please use a shorter topic.' });
    }

    // Fallback stories for each language when AI is unavailable
    const fallbackStories = {
      english: [
        {
          title: 'Save First',
          story: 'Priya got her monthly salary. She saved 20% first, then used the rest for expenses. She built an emergency fund.',
          question: 'What did Priya do with her salary first?',
          options: ['Paid bills', 'Saved 20%'],
          correct: 1
        },
        {
          title: 'Budget Planning',
          story: 'Rahul made a monthly budget. He tracked all expenses and found he was spending too much on snacks. He reduced snack spending.',
          question: 'What did Rahul discover from budgeting?',
          options: ['He needed more income', 'He overspent on snacks'],
          correct: 1
        },
        {
          title: 'Smart Shopping',
          story: 'Anita wanted to buy a phone. She compared prices online, waited for a sale, and saved 30% on the purchase.',
          question: 'How did Anita save money on her phone?',
          options: ['Bought immediately', 'Waited for sale'],
          correct: 1
        }
      ],
      hindi: [
        {
          title: 'पहले बचाएं',
          story: 'प्रिया को उसकी मासिक सैलरी मिली। उसने पहले 20% बचाई, फिर बाकी खर्चों के लिए इस्तेमाल किया। उसने एक आपातकालीन फंड बनाया।',
          question: 'प्रिया ने अपनी सैलरी सबसे पहले क्या किया?',
          options: ['बिल चुकाए', '20% बचाए'],
          correct: 1
        },
        {
          title: 'बजट योजना',
          story: 'राहुल ने मासिक बजट बनाया। उसने सभी खर्चों को ट्रैक किया और पाया कि वह नाश्ते पर ज्यादा खर्च कर रहा था। उसने नाश्ते के खर्च को कम किया।',
          question: 'राहुल को बजटिंग से क्या पता चला?',
          options: ['उसे ज्यादा आय की जरूरत है', 'वह नाश्ते पर ज्यादा खर्च करता था'],
          correct: 1
        }
      ],
      tamil: [
        {
          title: 'முதலில் சேமிக்கவும்',
          story: 'பிரியாவுக்கு அவளது மாதச் சம்பளம் கிடைத்தது. அவள் முதலில் 20% சேமித்தாள், பிறகு மீதமுள்ளவற்றைச் செலவழித்தாள். அவள் அவசரகால நிதியை உருவாக்கினாள்.',
          question: 'பிரியா தனது சம்பளத்தை முதலில் என்ன செய்தாள்?',
          options: ['பில்கள் செலுத்தினாள்', '20% சேமித்தாள்'],
          correct: 1
        }
      ]
    };

    // OpenRouter API key from env
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Try AI generation if API key is available, otherwise use fallback
    if (!apiKey) {
      console.log('OPENROUTER_API_KEY not configured, using fallback stories');
      const stories = fallbackStories[lang] || fallbackStories.english;
      const randomStory = stories[Math.floor(Math.random() * stories.length)];
      return res.status(200).json(randomStory);
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'RupayaSaathi'
        },
        body: JSON.stringify({
          model: 'deepseek',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
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
      // Use fallback stories if AI generation fails validation
      console.log('AI generation validation failed, using fallback stories');
      const stories = fallbackStories[lang] || fallbackStories.english;
      const randomStory = stories[Math.floor(Math.random() * stories.length)];
      return res.status(200).json(randomStory);
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
  