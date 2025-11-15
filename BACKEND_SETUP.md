# Backend Setup Guide - OpenRouter API

## ✅ Backend Refactored for OpenRouter

All backend code has been refactored to use OpenRouter API instead of HuggingFace. Your backend is fully compatible with Vercel serverless functions.

## 🔄 What Changed

### Removed (HuggingFace):
- ❌ `HF_API_KEY` environment variable
- ❌ `HF_MODEL` environment variable
- ❌ HuggingFace API endpoint (`https://api-inference.huggingface.co/models/...`)
- ❌ HuggingFace-specific headers (`Authorization: Bearer`)
- ❌ HuggingFace request format (`inputs`, `parameters`, `options`)
- ❌ HuggingFace response parsing (`generated_text` field)

### Added (OpenRouter):
- ✅ `OPENROUTER_API_KEY` environment variable
- ✅ OpenRouter API endpoint (`https://openrouter.ai/api/v1/chat/completions`)
- ✅ OpenRouter-specific headers (`HTTP-Referer`, `X-Title`)
- ✅ OpenRouter request format (chat completions with `messages`)
- ✅ OpenRouter response parsing (`choices[0].message.content`)
- ✅ Model: `deepseek/deepseek-chat`
- ✅ Temperature: `0.3` (more consistent outputs)
- ✅ Max tokens: `500`

## 🚀 Deployment Steps

### Step 1: Get OpenRouter API Key
1. Go to: https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Update Local `.env` File
Replace the placeholder in your `.env` file:
```env
OPENROUTER_API_KEY=sk-or-v1-your_actual_key_here
NODE_ENV=development
```

### Step 3: Set Environment Variables on Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your_actual_key_here
   NODE_ENV=production
   ```

### Step 4: Deploy to Vercel
```bash
# Option 1: Deploy via Git (recommended)
git add .
git commit -m "Refactor backend to use OpenRouter API"
git push

# Option 2: Deploy via Vercel CLI
vercel --prod
```

## 📡 API Endpoints

### POST `/api/generateStory`
**Request:**
```json
{
  "language": "english",
  "topic": "saving money"
}
```

**Response:**
```json
{
  "title": "The Piggy Bank Lesson",
  "story": "Sarah saved her allowance in a piggy bank...",
  "question": "What should Sarah do with her savings?",
  "options": ["Spend it all immediately", "Keep saving for her goal"],
  "correct": 1
}
```

### POST `/api/checkAnswer`
**Request:**
```json
{
  "userAnswer": 1,
  "correctAnswer": 1
}
```

**Response:**
```json
{
  "correct": true,
  "userAnswer": 1,
  "correctAnswer": 1
}
```

## 🧪 Testing Locally

1. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   This starts both the Vite frontend (port 5173) and API server (port 3001)

2. **Test the API directly:**
   ```bash
   # Test generateStory
   curl -X POST http://localhost:3001/api/generateStory \
     -H "Content-Type: application/json" \
     -d '{"language":"english","topic":"saving money"}'

   # Test checkAnswer
   curl -X POST http://localhost:3001/api/checkAnswer \
     -H "Content-Type: application/json" \
     -d '{"userAnswer":1,"correctAnswer":1}'
   ```

## ✨ Key Features

- ✅ **OpenRouter Integration**: Uses DeepSeek Chat model via OpenRouter
- ✅ **ES Module Compatible**: All files use ES modules for Vercel
- ✅ **Clean JSON Output**: No text wrapping, just pure JSON objects
- ✅ **Proper Error Handling**: Comprehensive error messages and logging
- ✅ **Environment Variables**: Uses `process.env.OPENROUTER_API_KEY`
- ✅ **CORS Enabled**: Proper CORS headers for all endpoints
- ✅ **Input Validation**: Sanitizes and validates all inputs
- ✅ **Timeout Protection**: 30-second timeout for API calls
- ✅ **Fallback Logic**: Graceful degradation when model output is invalid
- ✅ **Security**: Sanitizes error messages and user inputs
- ✅ **4-Strategy JSON Extraction**: Handles various response formats

## 🔍 Troubleshooting

### Issue: "OPENROUTER_API_KEY not configured"
**Solution:** Make sure you've set the `OPENROUTER_API_KEY` environment variable in Vercel and your local `.env` file.

### Issue: "OpenRouter API error"
**Solution:** 
- Check if your API key is valid (starts with `sk-or-v1-`)
- Verify you have credits in your OpenRouter account
- Check the console logs for detailed error messages

### Issue: "Request timeout"
**Solution:** OpenRouter API took too long. This is rare but can happen. Try again in a few seconds.

### Issue: "Unexpected response format from OpenRouter"
**Solution:** The API response structure changed. Check console logs for the actual response format.

### Issue: 502 Bad Gateway on Vercel
**Solution:** Check Vercel logs for specific errors. Usually related to missing environment variables or API key issues.

## 💰 OpenRouter Pricing

OpenRouter charges per token usage. The DeepSeek Chat model is very affordable:
- Input: ~$0.14 per 1M tokens
- Output: ~$0.28 per 1M tokens

Each story generation uses approximately:
- Input: ~150 tokens (prompt)
- Output: ~200 tokens (story response)
- Cost per story: ~$0.00008 (less than 0.01 cents)

Monitor your usage at: https://openrouter.ai/activity

## 📝 Notes

- The backend is now 100% compatible with Vercel serverless functions
- All responses return clean JSON objects (no text wrapping)
- Frontend code remains unchanged and will work seamlessly
- Local development mimics Vercel's serverless environment
- OpenRouter provides access to multiple AI models through one API
- DeepSeek Chat is fast, affordable, and produces high-quality outputs
