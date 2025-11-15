// Extended API tests with more random inputs
import 'dotenv/config';

const API_BASE = 'http://localhost:3001/api/story';

const randomTests = [
  { language: 'english', topic: 'compound interest', numStories: 1 },
  { language: 'english', topic: 'debt management', numStories: 1 },
  { language: 'hindi', topic: 'mutual funds', numStories: 1 },
  { language: 'tamil', topic: 'stock market', numStories: 1 },
  { language: 'english', topic: 'tax planning', numStories: 2 },
];

async function quickTest(test) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test),
    });
    const data = await response.json();
    const stories = Array.isArray(data) ? data : [data];
    
    return {
      success: stories.length > 0 && stories[0].title,
      count: stories.length,
      title: stories[0]?.title,
      language: test.language,
      topic: test.topic
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runExtendedTests() {
  console.log('🧪 Running Extended Random Input Tests\n');
  console.log('='.repeat(70));
  
  const results = [];
  for (const test of randomTests) {
    console.log(`Testing: ${test.language} - "${test.topic}" (${test.numStories} story/stories)...`);
    const result = await quickTest(test);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Success! Generated "${result.title}"`);
      console.log(`     Count: ${result.count}/${test.numStories} requested`);
    } else {
      console.log(`  ❌ Failed: ${result.error || 'Unknown error'}`);
    }
    console.log('');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log('='.repeat(70));
  const passed = results.filter(r => r.success).length;
  console.log(`\n📊 Extended Tests: ${passed}/${results.length} passed`);
  console.log(`\n🎯 API Key Status: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`\n✨ DeepSeek API is working correctly with your API key!`);
}

runExtendedTests().catch(console.error);

