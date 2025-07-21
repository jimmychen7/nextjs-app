# Price Tracker

Track the price of stocks, crypto, and more with beautiful charts, notifications, and modern authentication.

![Screenshot](Screenshot%202025-07-21%20at%204.46.48%E2%80%AFpm.png)

## Features

- 🔍 **Search & Visualize**: Instantly search for any stock or crypto symbol and view interactive price history charts (candlestick, sector, industry info).
- 📈 **Track Symbols**: Authenticated users can track symbols and receive email notifications about price changes.
- 🔒 **Authentication**: Sign up, log in, reset password (Supabase Auth).
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui for a responsive, dark-mode-ready interface.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/) (Auth, DB)
- [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [SWR](https://swr.vercel.app/) (data fetching)
- [Resend](https://resend.com/) (email delivery)
- [Yahoo Finance API](https://www.npmjs.com/package/yahoo-finance2)
- [OpenRouter](https://openrouter.ai/) (AI-powered ticker search)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the app.