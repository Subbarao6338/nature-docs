# Nature Docs

A unified document reader for local and cloud sources.

## Features

- **Multi-source support**: Local files, Google Drive, Notion, Mega.
- **Multi-account support**: Connect multiple accounts for each cloud provider.
- **Integrated Viewers**:
  - PDF (via `react-pdf`)
  - Markdown (via `markdown-it`)
  - HTML (direct rendering)
- **Modern UI**: Built with Next.js 15, Tailwind CSS, and Framer Motion.
- **Vercel Ready**: Optimized for deployment on Vercel.

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration

Add your API keys and OAuth credentials in `.env.local`:

```env
NOTION_API_KEY=your_notion_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## License

MIT
