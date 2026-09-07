# EduPulse Admin (Enterprise Portal)

Next.js 14 enterprise admin portal for the EduPulse school management platform.

## Features

- Enterprise dashboard with platform-wide metrics
- School management (add, activate, lock, suspend schools)
- Subscription & plan management
- Platform analytics
- Support ticket management
- Broadcast announcements across schools
- User & role management

## Setup

```bash
npm install
cp .env.local.example .env.local   # set your API URL
npm run dev
```

Runs on port 3000 by default.

## Build

```bash
npm run build
npm start
```

Uses Next.js static export (`output: 'export'` in `next.config.js`).

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://your-backend-url
```

## Related Repos

- **edupulse-backend** — Node.js + Express REST API
- **edupulse-mobile** — Flutter mobile app
- **edupulse-schools** — School admin portal (Next.js)
