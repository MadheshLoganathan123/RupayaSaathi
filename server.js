// Local development server for API routes
// This mimics Vercel's serverless function behavior for local development
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import and use the API routes
const handlers = {};

async function loadHandler(name) {
  if (!handlers[name]) {
    const module = await import(`./api/${name}.js`);
    handlers[name] = module.default;
  }
  return handlers[name];
}

// Helper to create Vercel-compatible wrapper
function createVercelHandler(handlerName) {
  return async (req, res) => {
    try {
      const apiHandler = await loadHandler(handlerName);
      
      // Create Vercel-compatible request/response objects
      const vercelReq = {
        method: req.method,
        body: req.body,
        headers: req.headers,
      };
      
      const vercelRes = {
        status: (code) => ({
          json: (data) => {
            res.status(code).json(data);
          },
          end: () => {
            res.status(code).end();
          },
        }),
        setHeader: (name, value) => {
          res.setHeader(name, value);
        },
        json: (data) => {
          res.json(data);
        },
      };
      
      await apiHandler(vercelReq, vercelRes);
    } catch (error) {
      console.error(`API route error (${handlerName}):`, error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal server error', 
          message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
      }
    }
  };
}

// API route handlers
app.all('/api/generateStory', createVercelHandler('generateStory'));
app.all('/api/checkAnswer', createVercelHandler('checkAnswer'));

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   - http://localhost:${PORT}/api/generateStory`);
  console.log(`   - http://localhost:${PORT}/api/checkAnswer`);
});

