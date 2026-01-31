# VideoFly - AI Video Generation Platform

## Project Overview

VideoFly is a SaaS platform for AI-powered video generation. It's built as a standalone Next.js application with AI video generation capabilities.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Database**: PostgreSQL with **Drizzle ORM**
- **Auth**: Better Auth + Google OAuth + Magic Link
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Package Manager**: pnpm

## Project Structure

```
videofly/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API Routes
│   │   │   ├── v1/           # REST API v1
│   │   │   ├── auth/         # Better Auth endpoints
│   │   │   ├── trpc/         # Legacy tRPC
│   │   │   └── webhooks/     # Webhooks (Stripe, Creem)
│   │   └── [locale]/         # i18n pages (marketing, dashboard, tool)
│   ├── ai/                   # AI provider abstraction
│   │   ├── providers/        # evolink, kie providers
│   │   └── types.ts
│   ├── components/           # React components
│   ├── config/               # Configuration
│   │   ├── credits.ts        # Credit/Model pricing config
│   │   └── pricing-user.ts   # User-facing pricing config
│   ├── db/                   # Database
│   │   ├── schema.ts         # Drizzle schema
│   │   └── index.ts
│   ├── lib/                  # Utilities
│   │   ├── auth/             # Better Auth configuration
│   │   ├── storage.ts        # R2/S3 storage
│   │   └── ...
│   ├── payment/              # Payment integration
│   │   ├── index.ts          # Stripe client
│   │   ├── plans.ts          # Subscription plans
│   │   └── webhooks.ts       # Stripe webhooks
│   ├── services/             # Business services
│   │   ├── credit.ts         # Credit system (freeze/settle/release)
│   │   ├── video.ts          # Video generation lifecycle
│   │   └── billing.ts
│   ├── stores/               # Zustand state stores
│   ├── hooks/                # React hooks
│   ├── i18n/                 # Internationalization
│   └── middleware.ts
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
└── public/                   # Static assets
```

## Core Modules

### 1. AI Provider Layer (`src/ai/`)

Unified abstraction for multiple AI video generation providers.

**Supported Providers:**
- **evolink** - Primary provider
  - Sora 2 (image-to-video, 10-15s, 16:9/9:16)
  - Wan 2.6 (image-to-video, 5-15s, multiple ratios)
  - Veo 3.1 (short clips, 4-8s)
  - Seedance 1.5 Pro (multiple qualities 480P-1080P)
- **kie** - Secondary provider

**Key Files:**
- `index.ts` - Provider factory
- `providers/evolink.ts` - Evolink implementation
- `providers/kie.ts` - Kie implementation
- `types.ts` - Interface definitions

**Usage:**
```typescript
import { getProvider } from "@/ai";
const provider = getProvider("evolink");
const task = await provider.createTask({ prompt, duration, aspectRatio });
```

### 2. Credit System (`src/services/credit.ts`)

FIFO-based credit management with freeze/settle/release pattern.

**Features:**
- Credit packages with expiration dates
- Freeze credits during video generation
- Settle on success, release on failure
- Transaction history tracking
- Expiring credits warning

**Key Methods:**
- `getBalance(userId)` - Get available/frozen/used credits
- `freeze({ userId, credits, videoUuid })` - Freeze credits for task
- `settle(videoUuid)` - Confirm credit consumption
- `release(videoUuid)` - Release frozen credits on failure
- `recharge({ userId, credits, orderNo, transType })` - Add credits from purchase

### 3. Video Service (`src/services/video.ts`)

Handles video generation lifecycle.

**Flow:**
1. `generate()` - Create task, freeze credits, call AI API
2. AI provider processes asynchronously
3. `handleCallback()` - Receive completion webhook
4. `tryCompleteGeneration()` - Download video, upload to R2, settle credits

**Key Methods:**
- `generate(params)` - Start video generation
- `handleCallback(provider, payload, videoUuid)` - Process AI callback
- `refreshStatus(uuid, userId)` - Poll status for frontend
- `listVideos(userId, options)` - Get user's videos

### 4. Storage (`src/lib/storage.ts`)

R2/S3-compatible storage for video files.

**Features:**
- Presigned upload URLs
- Download from AI provider and re-upload to R2
- Public URL generation

## Authentication (`src/lib/auth/`)

**Providers:**
- Google OAuth
- Magic Link (email)
- Creem payment integration

**Key Files:**
- `auth.ts` - Better Auth configuration with Creem plugin
- `index.ts` - Server-side auth helpers (`getCurrentUser`, `requireAuth`)

## Payment Channels

### Creem (Primary)
- `@creem_io/better-auth` plugin
- Handles subscriptions and one-time credit purchases
- Webhook automatically credits user account

### Stripe (Secondary/Backup)
- Full Stripe SDK integration
- Stripe Webhooks support
- Customer/subscription management

## API Routes

### REST API (`/api/v1/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/video/generate` | POST | Start video generation |
| `/api/v1/video/list` | GET | List user's videos |
| `/api/v1/video/[uuid]` | GET/DELETE | Get/delete video |
| `/api/v1/video/task` | GET | Get task status |
| `/api/v1/video/callback/[provider]` | POST | AI provider webhook |
| `/api/v1/credit/history` | GET | Get credit transactions |
| `/api/v1/config/models` | GET | Get available models |

### Auth API (`/api/auth/`)

Handled by Better Auth - includes login, register, session management.

### tRPC API (`/api/trpc/`)

Legacy tRPC endpoints for existing features (K8s, etc.).

## Database Schema

### Key Tables

```sql
-- Users (Better Auth)
user (
  id, name, email, email_verified, image,
  is_admin, created_at, updated_at
)

-- Credit packages (FIFO consumption with expiration)
credit_packages (
  id, user_id, initial_credits, remaining_credits,
  frozen_credits, trans_type, order_no, status,
  expired_at, created_at, updated_at
)

-- Frozen credits holds
credit_holds (
  id, user_id, video_uuid, credits, status,
  package_allocation, package_id, created_at, settled_at
)

-- Credit transactions history
credit_transactions (
  id, trans_no, user_id, trans_type, credits,
  balance_after, package_id, video_uuid, order_no,
  hold_id, remark, created_at
)

-- Video generation records
videos (
  id, uuid, user_id, prompt, model, parameters,
  status, provider, external_task_id, error_message,
  start_image_url, original_video_url, video_url,
  thumbnail_url, duration, resolution, aspect_ratio,
  file_size, credits_used, created_at, updated_at,
  completed_at, generation_time, is_deleted
)

-- Payment
customers (
  id, auth_user_id, name, plan, stripe_customer_id,
  stripe_subscription_id, stripe_price_id,
  stripe_current_period_end, created_at, updated_at
)

creem_subscriptions (
  id, user_id, product_id, subscription_id, status,
  current_period_end, created_at, updated_at
)
```

### Enums

- `VideoStatus`: PENDING, GENERATING, UPLOADING, COMPLETED, FAILED
- `CreditTransType`: NEW_USER, ORDER_PAY, SUBSCRIPTION, VIDEO_CONSUME, REFUND, EXPIRED, SYSTEM_ADJUST
- `CreditPackageStatus`: ACTIVE, DEPLETED, EXPIRED
- `SubscriptionPlan`: FREE, PRO, BUSINESS

## Frontend Pages

Route groups with `(locale)`:

| Route Group | Path | Description |
|-------------|------|-------------|
| `(marketing)` | `/[lang]/` | Landing page |
| `(marketing)` | `/[lang]/pricing` | Pricing page |
| `(tool)` | `/[lang]/demo` | Video generator demo |
| `(dashboard)` | `/[lang]/dashboard` | User dashboard |
| `(dashboard)` | `/[lang]/dashboard/videos` | Video history |
| `(auth)` | `/[lang]/login` | Login page |
| `(auth)` | `/[lang]/register` | Registration |
| `(admin)` | `/[lang]/admin` | Admin panel |

## Key Components

- `VideoGeneratorInput` - Main video generation form
- `VideoStatusCard` - Shows generation progress
- `VideoCard` - Video card for history list
- `CreationCard` - Creation preview card

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=...

# Auth
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage (R2/S3)
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
STORAGE_DOMAIN=...

# AI Providers
EVOLINK_API_KEY=...
KIE_API_KEY=...
AI_CALLBACK_URL=https://your-domain.com/api/v1/video/callback
AI_CALLBACK_SECRET=...

# Payment - Creem (Primary)
CREEM_API_KEY=...
CREEM_WEBHOOK_SECRET=...

# Payment - Stripe (Secondary)
STRIPE_API_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
RESEND_FROM=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Database operations
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema (dev only)
pnpm db:studio     # Open Drizzle Studio

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format

# Run scripts
pnpm script:add-credits   # Add credits to user
pnpm script:check-credits # Check user credits
pnpm script:reset-credits # Reset user credits
```

## Architecture Decisions

1. **Drizzle ORM over Kysely/Prisma** - Better TypeScript inference, lighter runtime, simpler migrations
2. **Single package over Turborepo** - Simpler project structure for this scale
3. **REST API over tRPC for new features** - Simpler for webhook integrations, Better Auth compatibility
4. **Creem as primary payment** - Better developer experience with better-auth plugin
5. **FIFO credit consumption** - Fair expiration handling across multiple packages
6. **Callback-based AI integration** - Async generation with webhook completion
7. **R2 storage** - Cost-effective video storage with CDN
8. **Route groups for page organization** - Clean separation of marketing/dashboard/tool/auth/admin pages
