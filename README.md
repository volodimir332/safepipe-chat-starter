# SafePipe Chat Starter

A minimal, ChatGPT-like AI chat interface with built-in PII protection. Perfect as a secure AI workspace for your employees.

![SafePipe Chat](https://safepipe.eu/og-image.png)

## Features

- 🛡️ **Safe Mode Toggle** — Auto-redact PII before sending to AI
- 📎 **File Upload** — Extract and sanitize text from PDFs
- 💬 **Minimal Design** — Clean, ChatGPT-inspired interface
- ⚡ **Real-time Streaming** — Instant AI responses
- 🔒 **Enterprise Ready** — Deploy on your own domain

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/volodimir332/safepipe-chat-starter.git
cd safepipe-chat-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment

```bash
cp env.example .env.local
```

Edit `.env.local` and add your SafePipe API key:

```
SAFEPIPE_API_KEY=sp_your_api_key_here
```

Get your API key at [safepipe.eu/dashboard](https://safepipe.eu/dashboard)

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat endpoint (proxies to SafePipe)
│   │   └── extract/route.ts   # PDF text extraction
│   ├── page.tsx               # Main chat page
│   └── layout.tsx             # App layout
├── components/
│   └── chat/
│       └── chat-interface.tsx # Chat UI component
├── lib/
│   └── hooks/
│       └── use-secure-chat.ts # Chat logic hook
└── env.example                # Environment template
```

## How It Works

1. User types a message or uploads a file
2. **Safe Mode ON**: PII is automatically redacted before sending
3. Request goes through SafePipe → AI Provider (OpenAI, Anthropic, etc.)
4. AI response streams back to user
5. All sensitive data stays protected

## Customization

### Change AI Model

Edit `app/api/chat/route.ts`:

```typescript
body: JSON.stringify({
  model: "gpt-4o",  // or "claude-3-sonnet", "gemini-1.5-pro"
  // ...
}),
```

### Add More File Types

Edit `app/api/extract/route.ts`:

```typescript
const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "image/png",  // Add image support
  "image/jpeg",
];
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

## License

MIT — Free for commercial use.

## Support

- 📚 [Documentation](https://safepipe.eu/docs)
- 💬 [Discord](https://discord.gg/safepipe)
- 📧 [support@safepipe.eu](mailto:support@safepipe.eu)

---

Built with ❤️ by [SafePipe](https://safepipe.eu)
