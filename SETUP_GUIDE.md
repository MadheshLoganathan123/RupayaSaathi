# RupayaSaathi - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rupayasaathi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your_actual_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## 📱 Features

### Authentication
- **Sign Up**: Create new account with username, email, password
- **Login**: Access your account
- **Auto-save**: Progress saved automatically

### Pages
- **Home** (`/`) - Main learning interface
- **Dashboard** (`/dashboard`) - Visual analytics with charts
- **Progress Tracker** (`/progress`) - Milestones and achievements

### Data Storage
- Local JSON database using localStorage
- Persistent user accounts
- 30-day progress history
- Automatic backups

## 🎯 Usage

### First Time Setup
1. Go to http://localhost:5173
2. Click "Sign Up" tab
3. Create your account
4. Log in with your credentials

### Learning Stories
1. Select language (English, Hindi, Tamil)
2. Choose topic and difficulty
3. Generate stories
4. Answer questions
5. Track your progress

### View Analytics
1. Click "Dashboard" in header
2. See charts of your progress
3. View performance by difficulty
4. Check recent activity

### Track Milestones
1. Click "Progress" in header
2. View unlocked achievements
3. See current streak
4. Monitor weekly/monthly goals

## 🔧 Development

### Project Structure
```
src/
├── components/       # React components
├── pages/           # Page components
├── hooks/           # Custom hooks
├── lib/             # Utilities and database
└── App.tsx          # Main app component

api/
├── story.js         # Story generation endpoint
├── generateStory.js # Alternative story endpoint
└── checkAnswer.js   # Answer validation endpoint
```

### Key Files
- `src/lib/database.ts` - Local database implementation
- `src/hooks/useProgress.ts` - Progress tracking hook
- `src/pages/DashboardPage.tsx` - Analytics dashboard
- `src/pages/ProgressTrackerPage.tsx` - Progress tracker
- `src/pages/LoginPage.tsx` - Authentication

### API Endpoints
- `POST /api/story` - Generate multiple stories
- `POST /api/generateStory` - Generate single story
- `POST /api/checkAnswer` - Validate answer

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY`
   - `NODE_ENV=production`

### Environment Variables (Vercel)
1. Go to project settings
2. Navigate to "Environment Variables"
3. Add:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `NODE_ENV`: `production`

## 🔒 Security

### Current Implementation
- Client-side authentication
- localStorage for data persistence
- Plain text passwords (development only)

### Production Recommendations
1. **Hash passwords** using bcrypt
2. **Implement JWT** for session management
3. **Add server-side validation**
4. **Use HTTPS** for all requests
5. **Implement rate limiting**
6. **Add CSRF protection**
7. **Sanitize all inputs**

## 📊 Data Management

### User Data
Stored in `localStorage` under:
- `rupayasaathi_users` - User accounts
- `rupayasaathi_progress` - Progress data

### Export Data
```javascript
// In browser console
const users = localStorage.getItem('rupayasaathi_users');
const progress = localStorage.getItem('rupayasaathi_progress');
console.log(JSON.parse(users));
console.log(JSON.parse(progress));
```

### Clear Data
```javascript
// In browser console
localStorage.removeItem('rupayasaathi_users');
localStorage.removeItem('rupayasaathi_progress');
```

## 🐛 Troubleshooting

### API Key Issues
- Verify key starts with `sk-or-v1-`
- Check `.env` file exists in root
- Restart dev server after changing `.env`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Kill process on port 3001
npx kill-port 3001

# Kill process on port 5173
npx kill-port 5173
```

### Database Issues
- Clear browser localStorage
- Check browser console for errors
- Verify data format in localStorage

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🎨 Customization

### Change Theme
Edit `src/index.css` for color scheme

### Add Languages
Update language options in:
- `src/components/UserSettings.tsx`
- `api/story.js` (backend validation)

### Modify Difficulty Levels
Update in:
- `src/components/StoryOptionsForm.tsx`
- Backend API validation

## 📚 Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)

## 🤝 Support

For issues or questions:
1. Check this guide
2. Review `IMPLEMENTATION_SUMMARY.md`
3. Check browser console for errors
4. Review API logs in terminal

## 📄 License

This project is for educational purposes.
