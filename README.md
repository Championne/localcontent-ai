# LocalContent.ai

AI-powered content generation for local businesses. Create SEO-optimized content in minutes, not hours.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/localcontent-ai.git
cd localcontent-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - Copy your API keys to `.env.local`

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
localcontent_ai/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard pages
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client setup
├── types/                 # TypeScript types
└── supabase/             # Database schema
```

## Features

### Implemented
- [x] User authentication (login, signup, forgot password)
- [x] Dashboard with sidebar navigation
- [x] Content creation wizard
- [x] Template library
- [x] Content library
- [x] Analytics page (placeholder)
- [x] Settings page
- [x] Content generation API

### Coming Soon
- [ ] OpenAI integration for real AI content
- [ ] Google Business Profile integration
- [ ] Stripe payments
- [ ] Impact Analytics Dashboard
- [ ] Review response generator
- [ ] Content scheduling

## Environment Variables

See `.env.example` for all required environment variables.

## Database

The database schema is in `supabase/schema.sql`. It includes:

- **profiles**: User profiles
- **businesses**: Business information
- **subscriptions**: Plan/subscription data
- **content**: Generated content
- **templates**: Content templates
- **analytics**: Metrics and analytics

All tables have Row Level Security (RLS) policies.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

MIT
