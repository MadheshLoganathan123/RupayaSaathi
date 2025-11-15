# Local Development Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start:
- **Vite dev server** on `http://localhost:8080` (frontend)
- **API server** on `http://localhost:3001` (backend)

The Vite server automatically proxies `/api/*` requests to the API server.

## Scripts

- `npm run dev` - Start both frontend and API servers
- `npm run dev:vite` - Start only Vite dev server
- `npm run dev:api` - Start only API server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### API returns 404
- Make sure both servers are running (`npm run dev`)
- Check that the API server is running on port 3001
- Verify your `.env` file has `OPENROUTER_API_KEY` set

### Environment variables not loading
- Ensure `.env` file exists in the project root
- Restart the API server after changing `.env`

## Production Deployment

On Vercel, the `/api` directory is automatically recognized as serverless functions. No additional configuration needed!

Just make sure to set environment variables in Vercel dashboard:
- `OPENROUTER_API_KEY`

