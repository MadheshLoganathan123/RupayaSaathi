// Test script for DeepSeek API integration
import 'dotenv/config';

const API_BASE = 'http://localhost:3001/api/story';
const testCases = [
  // Test 1: API Connection Test
  {
    name: 'API Connection Test',
    body: { test: true }
  },
  // Test 2: English story - single
  {
    name: 'English Story - Single (Topic: budgeting)',
    body: { language: 'english', topic: 'budgeting', numStories: 1 }
  },
  // Test 3: Hindi story - single
  {
    name: 'Hindi Story - Single (Topic: investing)',
    body: { language: 'hindi', topic: 'investing', numStories: 1 }
  },
  // Test 4: Tamil story - single
  {
    name: 'Tamil Story - Single (Topic: emergency fund)',
    body: { language: 'tamil', topic: 'emergency fund', numStories: 1 }
  },
  // Test 5: Multiple stories - English
  {
    name: 'English Stories - Multiple (3 stories, Topic: credit cards)',
    body: { language: 'english', topic: 'credit cards', numStories: 3 }
  },
  // Test 6: Random topic
  {
    name: 'English Story - Random Topic (retirement planning)',
    body: { language: 'english', topic: 'retirement planning', numStories: 1 }
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.log(`❌ Error (${response.status}):`, data);
      return false;
    }

    if (testCase.body.test) {
      // API test response
      console.log(`✅ Status: ${data.status || 'unknown'}`);
      console.log(`📝 Message: ${data.message}`);
      console.log(`🔑 API Key Present: ${data.apiKeyPresent}`);
      return data.status === 'connected';
    } else {
      // Story generation response - handle both array and single object
      const stories = Array.isArray(data) ? data : [data];
      
      if (stories.length > 0 && stories[0].title) {
        console.log(`✅ Generated ${stories.length} story/stories`);
        stories.forEach((story, idx) => {
          console.log(`\n📖 Story ${idx + 1}:`);
          console.log(`   Title: ${story.title}`);
          console.log(`   Story: ${story.story.substring(0, 80)}...`);
          console.log(`   Question: ${story.question}`);
          console.log(`   Options: ${story.options.join(' | ')}`);
          console.log(`   Correct: ${story.correct}`);
          
          // Validate structure
          const hasAllKeys = ['title', 'story', 'question', 'options', 'correct'].every(k => k in story);
          const hasTwoOptions = Array.isArray(story.options) && story.options.length === 2;
          const validCorrect = story.correct === 0 || story.correct === 1;
          
          if (hasAllKeys && hasTwoOptions && validCorrect) {
            console.log(`   ✅ Structure valid`);
          } else {
            console.log(`   ❌ Structure invalid`);
            console.log(`      Has all keys: ${hasAllKeys}`);
            console.log(`      Has 2 options: ${hasTwoOptions}`);
            console.log(`      Valid correct: ${validCorrect}`);
          }
        });
        
        // Check if expected count matches
        const expectedCount = testCase.body.numStories || 1;
        if (stories.length === expectedCount) {
          console.log(`   ✅ Count matches expected (${expectedCount})`);
        } else {
          console.log(`   ⚠️  Count mismatch: expected ${expectedCount}, got ${stories.length}`);
        }
        
        return true;
      } else {
        console.log(`❌ Unexpected response format:`, data);
        return false;
      }
    }
  } catch (error) {
    console.log(`❌ Request failed:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting DeepSeek API Tests');
  console.log('='.repeat(60));
  console.log(`📍 API Endpoint: ${API_BASE}`);
  console.log(`🔑 API Key: ${process.env.OPENROUTER_API_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log('='.repeat(60));

  const results = [];
  
  for (const testCase of testCases) {
    const success = await runTest(testCase);
    results.push({ name: testCase.name, success });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  results.forEach((result, idx) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} Test ${idx + 1}: ${result.name}`);
  });
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n📈 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests
runAllTests().catch(console.error);

