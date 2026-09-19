export interface SeedAuthor {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface SeedPost {
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string;
  content: string;
  authorEmail: string;
  tags: string[];
}

export const SEED_AUTHORS: SeedAuthor[] = [
  {
    id: "usr_elena_vance",
    name: "Elena Vance",
    email: "elena.vance@velo.design",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "usr_marcus_chen",
    name: "Marcus Chen",
    email: "marcus.chen@velo.design",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "usr_aris_thorne",
    name: "Dr. Aris Thorne",
    email: "aris.thorne@velo.design",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "usr_sofia_rostova",
    name: "Sofia Rostova",
    email: "sofia.rostova@velo.design",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "usr_jordan_blake",
    name: "Jordan Blake",
    email: "jordan.blake@velo.design",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
  },
];

export const SEED_POSTS: SeedPost[] = [
  {
    title: "Architecting Event-Driven Microfrontends with Next.js 16 and RSC",
    slug: "architecting-event-driven-microfrontends-nextjs-16",
    description:
      "A deep dive into decomposing monolithic interfaces into composable, zero-runtime React Server Components orchestrated via streaming events.",
    category: "Engineering",
    coverImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "elena.vance@velo.design",
    tags: ["Next.js", "Architecture", "RSC", "TypeScript", "Performance"],
    content: `## The Monolith Decomposition Dilemma

Modern web engineering often faces an architectural inflection point: when is an application too large for a singular bundle boundary, yet too interconnected to cleanly divide across independent deployment boundaries?

With Next.js 16 and refined React Server Components, the traditional tradeoffs between microfrontends and unified design systems are undergoing a fundamental shift.

### 1. Server-Driven Composition

Instead of dynamic script injection and client-side iframe choreography, modern server components allow teams to compose modules directly at the edge:

\`\`\`typescript
export async function FeedContainer({ userId }: { userId: string }) {
  const [personalization, stream] = await Promise.all([
    fetchUserSignals(userId),
    openEventStream(),
  ]);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Suspense fallback={<ModuleSkeleton />}>
        <ActivityStream signals={personalization} />
      </Suspense>
      <Suspense fallback={<SidebarSkeleton />}>
        <RecommendationEngine context={stream.meta} />
      </Suspense>
    </section>
  );
}
\`\`\`

### 2. State Synchronization Across Autonomous Boundaries

The primary failure mode in microfrontend architecture has always been ambient synchronization. When one component modifies active state (e.g. following an author or saving a bookmark), how do peripheral components receive instant reconciliation without triggering global re-renders?

1. **Lightweight Broadcast Channels**: Leverage the browser Native BroadcastChannel API for intra-tab messaging.
2. **Server-Sent Revalidation**: Trigger granular router cache invalidation using optimistic tags.
3. **Deterministic Contract Schemas**: Use shared Zod validators to guarantee message contracts across independent service teams.

### Looking Ahead

As edge runtimes gain lower latency boundaries, composing web interfaces will resemble distributed microservices more than bundled client scripts. The teams that master this boundary early will build the fastest, most scalable experiences on the web.`,
  },
  {
    title: "The Death of Flat Design: Crafting Tactile, High-End Interfaces",
    slug: "death-of-flat-design-tactile-interfaces",
    description:
      "Why modern software is moving away from corporate sterile minimalism toward rich textural surfaces, calibrated lighting, and physical feedback.",
    category: "Design Systems",
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "marcus.chen@velo.design",
    tags: ["UI/UX", "Design Systems", "CSS", "Aesthetics", "Typography"],
    content: `## The Homogenization of Modern Software

For a decade, digital interfaces have suffered from an excess of aesthetic conservatism. Flat design, while efficient for early responsive mobile web viewports, stripped away affordance, physical hierarchy, and emotional delight.

Today, high-craft digital products are reclaiming material depth without falling into the gaudy traps of early skeuomorphism.

### The New Principles of Tactile Craft

1. **Photometric Light Calibration**: Surfaces should have directional light awareness. A 1px translucent highlight on the top edge paired with a soft ambient ambient shadow creates immediate physical grounding.
2. **Kinetic Resistance**: Motion is not decoration; motion is mass. Interactive elements should possess subtle spring kinematics that reflect their visual weight.
3. **Intentional Typographic Densities**: High contrast between wide display headers and ultra-legible editorial body text gives content rhythm and dignity.

> "A great interface is not one you merely see, but one you feel through every micro-interaction."

### Implementing Dual-Tone Borders in CSS

\`\`\`css
.card-tactile {
  background: hsl(var(--card) / 0.85);
  border: 1px solid hsl(var(--border) / 0.7);
  box-shadow: 
    0 1px 2px 0 hsl(0 0% 0% / 0.05),
    inset 0 1px 0 0 hsl(0 0% 100% / 0.08);
  backdrop-filter: blur(16px);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
\`\`\`

When software feels solid, users trust it with their work. Depth is returning to the web, and it is better engineered than ever before.`,
  },
  {
    title: "Zero-Copy Context Streaming in Local LLM Agent Workflows",
    slug: "zero-copy-context-streaming-llm-agents",
    description:
      "Eliminating memory bottlenecks and token serialization overhead when piping multi-modal tool inputs through local reasoning engines.",
    category: "AI & Research",
    coverImage:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "aris.thorne@velo.design",
    tags: ["AI", "LLM", "Agents", "Performance", "Rust"],
    content: `## The Memory Ceiling of Agentic Orchestration

As autonomous software agents progress from single-turn prompts to long-horizon workflows spanning thousands of tool executions, standard tokenization pipelines create crippling memory and latency overheads.

When an agent searches a codebase, reads a hundred files, and generates diffs, naive string duplication across JSON-RPC boundaries wastes substantial clock cycles.

### The Pipeline Architecture

Our benchmark architecture implements shared-memory buffers and zero-copy byte slices for context propagation:

- **Memory-Mapped Vector Stores**: Read directly from disk caches without heap allocation.
- **Incremental KV-Cache Reuse**: Retain stable prefix prompts across consecutive tool executions.
- **Binary Streaming Protocols**: Swap heavy JSON tool responses for compact Arrow/Protobuf IPC formats.

### Benchmarking Latency Improvements

In synthetic benchmarks evaluating a 20-step codebase refactor:

| Optimization Layer | TTFT (Time to First Token) | Memory Footprint |
| :--- | :--- | :--- |
| Standard JSON Loop | 1,480 ms | 4.2 GB |
| Prefix Cache Reuse | 510 ms | 2.1 GB |
| Zero-Copy Buffer | 185 ms | 740 MB |

The results show that optimizing the data plane of LLM orchestrators is just as important as the underlying weights.`,
  },
  {
    title: "High-Throughput PostgreSQL: Partitioning Strategies for 100M+ Rows",
    slug: "high-throughput-postgresql-partitioning-strategies",
    description:
      "Lessons learned scaling time-series analytics, reaction streams, and notification logs in production with declarative partitioning.",
    category: "Architecture",
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "elena.vance@velo.design",
    tags: ["PostgreSQL", "Database", "Drizzle", "SQL", "Scaling"],
    content: `## Why Single-Table Architectures Collapse

In blogging platforms and creator networks, high-frequency tables like \`post_views\`, \`post_reactions\`, and \`activity_notifications\` exhibit distinct write patterns:
- Heavy append traffic during peak hours
- Read queries concentrated almost entirely on the latest 30 days
- Costly vacuum locks and index bloat over time

Declarative table partitioning allows us to maintain microsecond query performance regardless of total table cardinality.

### Partitioning by Range on Timestamps

\`\`\`sql
CREATE TABLE post_views_partitioned (
    id BIGSERIAL,
    post_id INT NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partition slices
CREATE TABLE post_views_2026_09 PARTITION OF post_views_partitioned
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
\`\`\`

### Key Takeaways for Drizzle ORM Teams

1. Always include the partition key in composite primary keys.
2. Ensure automated cron workers pre-allocate future partition slices.
3. Leverage partition pruning in query planner execution plans (\`EXPLAIN ANALYZE\`).`,
  },
  {
    title: "Designing for Kinetic Typographic Hierarchy on the Modern Web",
    slug: "kinetic-typographic-hierarchy-modern-web",
    description:
      "How variable fonts, optical sizing, and fluid clamp scales elevate digital storytelling into an editorial art form.",
    category: "Design Systems",
    coverImage:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "sofia.rostova@velo.design",
    tags: ["Typography", "CSS", "Design Systems", "Frontend", "Editorial"],
    content: `## Words as Architecture

Typography on the web is too often treated as an afterthought or a utility stylesheet. Yet in publishing platforms, the type is 95% of the user experience.

When typography is calibrated with precision:
- Reading fatigue vanishes
- Visual scanning becomes intuitive
- The brand voice resonates before the reader finishes the first sentence

### Fluid Optical Scaling

Using modern CSS \`clamp()\` and variable font axes, we can smoothly adjust character weight, width, and tracking across viewport boundaries:

\`\`\`css
:root {
  --fluid-display: clamp(2.5rem, 1.8rem + 3.5vw, 4.75rem);
  --fluid-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
}

.headline-editorial {
  font-size: var(--fluid-display);
  font-weight: 850;
  letter-spacing: -0.04em;
  line-height: 1.05;
  text-wrap: balance;
}
\`\`\`

Combining balanced headlines with comfortable line heights (1.7em) transforms digital articles into publication-grade reading experiences.`,
  },
  {
    title: "The Anatomy of a 10x Developer Platform: Lessons from Building VELO",
    slug: "anatomy-of-10x-developer-platform-lessons-from-velo",
    description:
      "Exploring the architectural patterns, latency optimizations, and developer ergonomics that power modern creator tools.",
    category: "Product Strategy",
    coverImage:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop",
    authorEmail: "jordan.blake@velo.design",
    tags: ["Product Strategy", "SaaS", "Creators", "Web Development", "Analytics"],
    content: `## What Separates Great Tools from Average Ones?

Developer and creator tools share a common truth: practitioners demand uncompromised speed, predictable feedback loops, and intuitive discovery.

When we designed VELO, our mission was to eliminate all friction between capturing an insight and publishing it to a global audience.

### 1. Zero-Friction Authoring
Markdown and rich visual previews should never drift out of sync. Autosaving to local drafts paired with optimistic UI updates ensures creators never lose a thought to connectivity blips.

### 2. Analytics with Actionable Narrative
Raw charts do not help creators grow. Instead, analytics must answer direct questions:
- Which topics drive loyal returning readership?
- What time of day generates the highest engagement?
- How does current reach compare to historical baselines?

### 3. Built for Longevity
By relying on standards-compliant PostgreSQL, cleanly separated server actions, and resilient caching fallbacks, modern applications can sustain continuous velocity without accumulating architectural debt.`,
  },
];
