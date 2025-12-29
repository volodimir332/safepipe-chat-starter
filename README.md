# SafePipe Chat Starter

A production-ready secure corporate chat implementation with automatic PII redaction.

## Quick Start

```bash
# Clone and install
git clone https://github.com/safepipe/safepipe-chat-starter.git
cd safepipe-chat-starter
npm install

# Configure environment
cp .env.example .env.local
# Add your SAFEPIPE_API_KEY

# Run
npm run dev
```

## Architecture

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Proxy to SafePipe API
│   │   └── extract/route.ts   # PDF/Text extraction
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── chat/
│       └── chat-interface.tsx # UI components
├── lib/
│   └── hooks/
│       └── use-secure-chat.ts # Chat logic
```

## Features

- **Safe Mode Toggle**: Enable/disable PII protection
- **File Upload**: PDF and text file extraction
- **Redaction Highlighting**: Visual indication of protected data
- **Streaming Responses**: Real-time AI responses

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SAFEPIPE_API_KEY` | Yes | Your SafePipe API key |
| `OPENAI_API_KEY` | No | For BYOK mode only |

## Deployment

### Vercel

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT

