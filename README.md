# 🐰 Bunny Climb

An addicting endless vertical climbing game! Hop from platform to platform, collect carrots, avoid spikes, and climb as high as you can.

## Features

- 🎮 Tap left/right to steer your bunny
- 🥕 Collect carrots for points
- ⭐ Gold stars give power jumps
- 🥕🛡️ Golden carrots give spike immunity shields
- 🟢 Springs launch you sky-high
- ⚠️ Crumbling platforms fall beneath you
- 🔺 Spikes on platforms — don't touch them!
- 🐰 6 unique hand-drawn bunny costumes that unlock as you climb
- 🔊 Sound effects for every action
- 📸 Screenshot capture on game over for sharing
- 📱 Share scores to X, Facebook, Instagram, and more
- 🌌 Sky changes from blue → purple → space as you climb higher

## Quick Start

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build
```

## Deploy to Vercel (Free)

### Option 1: GitHub + Vercel (Recommended)

1. Create a GitHub account at github.com if you don't have one
2. Install Git on your computer: https://git-scm.com/downloads
3. Open terminal in this project folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Bunny Climb"
   ```
4. Create a new repository on GitHub (github.com/new)
   - Name it "bunny-climb"
   - Keep it public
   - Don't add README (we already have one)
5. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/bunny-climb.git
   git branch -M main
   git push -u origin main
   ```
6. Go to vercel.com and sign up with your GitHub account
7. Click "New Project" → Import your bunny-climb repository
8. Vercel auto-detects Vite — just click "Deploy"
9. Your game is live! You'll get a URL like bunny-climb.vercel.app

### Option 2: Vercel CLI (Quick)

```bash
npm install -g vercel
vercel
```

Follow the prompts and your site is live in seconds.

## Adding Ads (Google AdSense)

1. Sign up at https://adsense.google.com
2. Add the AdSense script tag to `index.html` in the `<head>`
3. Add ad units between game overs or in the menu screen
4. Google will review your site and start serving ads once approved

## Converting to Mobile App

To put this on Google Play ($25 one-time fee):

1. Install Capacitor: `npm install @capacitor/core @capacitor/cli`
2. Initialize: `npx cap init "Bunny Climb" com.yourdomain.bunnyclimb`
3. Add Android: `npx cap add android`
4. Build: `npm run build && npx cap sync`
5. Open in Android Studio: `npx cap open android`
6. Build APK and submit to Google Play Console

## Tech Stack

- React 18
- Vite
- Tone.js (sound effects)
- HTML5 Canvas (game rendering)
- PWA-ready (installable on phones)

## License

All rights reserved. This game was created by Twilight.
