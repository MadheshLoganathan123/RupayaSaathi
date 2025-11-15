# Quick Fix for OpenRouter Setup

## The Setup
Your backend now uses OpenRouter API instead of HuggingFace.

## Required Steps

### Step 1: Get OpenRouter API Key
1. Go to: https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Update `.env` File
Open your `.env` file and replace the placeholder:
```env
OPENROUTER_API_KEY=sk-or-v1-your_actual_key_here
NODE_ENV=development
```

### Step 3: Restart Dev Server
In your terminal where `npm run dev` is running:
```
Ctrl + C  (to stop)
npm run dev  (to restart)
```

### Step 4: Test
Try generating a story in your browser.

## If You Still Get Errors

### Check the Terminal Output
Look for these specific error messages:

1. **"OPENROUTER_API_KEY not configured"**
   - Your API key isn't being loaded
   - Make sure `.env` file is in the root directory
   - Verify the key starts with `sk-or-v1-`

2. **"OpenRouter API error"**
   - Your API key might be invalid
   - Check if you have credits in your OpenRouter account
   - Get a new key from: https://openrouter.ai/keys

3. **"Request timeout"**
   - The API took too long (rare)
   - Wait a few seconds and try again

4. **"Unexpected response format from OpenRouter"**
   - Check console logs for the actual response
   - This shouldn't happen with DeepSeek Chat model

## Test the API Directly

Open a new terminal and test:

```bash
curl -X POST http://localhost:3001/api/generateStory -H "Content-Type: application/json" -d "{\"language\":\"english\",\"topic\":\"saving money\"}"
```

This will show you the exact response from the API.

## OpenRouter Benefits

- ✅ More reliable than HuggingFace
- ✅ Faster response times
- ✅ Better JSON output consistency
- ✅ Access to multiple AI models
- ✅ Very affordable pricing (~$0.00008 per story)

## Need Help?

Check the full documentation in `BACKEND_SETUP.md`
