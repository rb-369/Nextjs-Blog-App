# VELO

VELO is a full-stack creator platform built with Next.js App Router, PostgreSQL, and Drizzle ORM.
It combines blogging, social interactions, creator analytics, moderation tools, and personalized discovery.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- PostgreSQL + Drizzle ORM
- Better Auth
- Tailwind CSS
- Recharts (analytics visualizations)
- Cloudinary (image uploads)

## Core Features

- Authentication and protected routes
- Create, edit, delete posts
- Drafts, scheduled posts, auto-publish of due posts
- Post revision history with restore
- Reactions, comments, bookmarks, shares, reporting
- Follow authors and follow-based feed
- Smart recommendations
- Advanced search and filtering
- Analytics dashboard with time filters and comparison mode
- Moderation dashboard (reports, pending comments, blocked words)
- Notification center with granular notification preferences

## Project Structure

- `src/app` - routes and pages
- `src/components` - UI and feature components
- `src/actions` - server actions
- `src/lib/db` - schema and query layer
- `drizzle` - SQL migrations

## Environment Variables

Create `.env` in `blog-project`:

```env
DB_URL=postgresql://<user>:<password>@<host>:<port>/<database>
BETTER_AUTH_SECRET=<strong-random-secret>
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_URL=cloudinary://<api-key>:<api-secret>@<cloud-name>
UPSTASH_REDIS_REST_URL=<upstash-redis-rest-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-redis-rest-token>
```

Notes:

- Use a strong `BETTER_AUTH_SECRET` (at least 32 chars).
- In production (Vercel), set `BASE_URL` and `NEXT_PUBLIC_BASE_URL` to your deployed domain, e.g. `https://nextjs-blog-app-eight-blush.vercel.app`.
- Cloudinary is configured for remote image rendering in `next.config.ts`.

## Setup

```bash
npm install
```

Run migrations:

```bash
npx drizzle-kit migrate
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

## Analytics Notes

- Time filters: `Today`, `Last 7 Days`, `Last 30 Days`, `Custom`
- Optional previous-period comparison
- Metrics include:
  - views
  - unique visitors
  - returning visitors
  - average session duration
  - likes/comments/bookmarks/shares/dislikes/subscribers

## Key Routes

- `/` - home feed
- `/analytics` - creator analytics
- `/following` - followed authors feed
- `/moderation` - moderation tools
- `/notifications` - notification center
- `/search` - advanced search
- `/yourPosts` - creator post management

## What To Build Next

Recommended next features in order:

1. **Best Publish Time Engine**
	- Heatmap by weekday/hour
	- Suggest publish window based on historical engagement

2. **Creator Goal Tracking**
	- Weekly targets (views, comments, followers)
	- Progress cards and streaks in analytics

3. **Saved Search + Alert Subscriptions**
	- Let users save filters
	- Notify when matching new posts appear

4. **Post A/B Title Experiments**
	- Try title variants
	- Compare CTR and engagement over time

5. **Team Roles for Authors**
	- Owner/editor/moderator permissions
	- Shared moderation and publishing workflows

## Troubleshooting

- If `next dev` says port is in use, stop old Node processes and restart.
- If analytics or scheduling errors mention missing DB columns, run:
  - `npx drizzle-kit migrate`
- If image errors mention unconfigured host, verify `next.config.ts` includes your image host in `images.remotePatterns`.

## License

Private project.
