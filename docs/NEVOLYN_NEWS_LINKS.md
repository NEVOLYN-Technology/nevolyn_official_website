# 📰 NEVOLYN News Guidelines & Verified Links Registry

This document serves as the **official developer and AI agent guideline** for adding and managing news updates on the NEVOLYN Technology website, as well as the **source of truth for official NEVOLYN social media links**.

---

## 🤖 Agent Guide: Where, What, and How to Add News

When you need to add or update news for NEVOLYN, follow this standard procedure:

### 1. 📂 Where to Change (File Map)

| Target | File Path | Status | Purpose |
|---|---|---|---|
| **Primary News Store** | `frontend/lib/data/latest-news.ts` | **Mandatory** | Single source of truth for chronological news timeline cards and detail modals. |
| **Links Registry** | `docs/NEVOLYN_NEWS_LINKS.md` | **Mandatory** | Keep official NEVOLYN social URLs documented by News ID. |
| **Static Assets** | `frontend/public/` | **Mandatory** | Image assets (e.g. `news_fabinsXdcci.jpg`), referenced via root URL (`/news_...`). |
| **Featured Milestones** | `frontend/lib/data/featured-milestones.ts` | **Optional** | Reserved for major flagship institutional breakthroughs showcased in the top 3D carousel. |
| **Section Component** | `frontend/components/sections/LatestNewsSection.tsx` | Reference | Contains rendering logic, scroll behaviors, and responsive grid layouts. |
| **Modal Component** | `frontend/components/ui/NewsDetailModal.tsx` | Reference | Detail pop-up window with auto-linked text, contact cards, and gallery lightbox. |

---

### 2. 📝 What to Add (Data Schema & Specs)

Every news entry in `frontend/lib/data/latest-news.ts` implements the `NewsItem` interface:

```typescript
export interface NewsItem {
  id: string              // Kebab-case unique slug (e.g., 'news-dcci-ai-summit-2026')
  title: string           // Headline title (e.g., 'Bangladesh AI Business Summit 2026 - Selected to Showcase')
  description: string     // Short 1-2 sentence preview text for timeline card
  content: string         // Full announcement text with \n\n paragraph breaks
  category: string        // Classification tag (determines badge color styling)
  date: string            // ISO publication date string (YYYY-MM-DD)
  image: string           // Main image path from public root (e.g., '/news_fabinsXdcci.jpg')
  secondaryImage?: string // Optional secondary image
  images?: string[]       // Array of image paths for modal gallery & fullscreen zoom
  linkedinUrl: string     // Direct link to official NEVOLYN LinkedIn post
  facebookUrl: string     // Direct link to official NEVOLYN Facebook post
}
```

#### Category Badge Color Rules
Badges in `LatestNewsSection.tsx` dynamically apply styling based on category keywords:
- **Emerald Green**: Categories containing `partner`, `award`, or `prize` (e.g., `'Award & Prize'`, `'Strategic Partnership'`).
- **Rose Red**: Categories containing `poc` or `demonstration` (e.g., `'POC Demonstration'`).
- **Sky Blue**: All other categories (e.g., `'AI Summit Showcase'`, `'Innovation Challenge'`, `'VIP Exhibition'`, `'Top 50 Selection'`).

#### Standard Signature Contact Block
At the end of the `content` string, always include the standard signature blocks separated by `\n\n`:
```text
FABINS | Fabric Inspection Automation
Website: https://fabins.nevolyn.com
Email: fabins@nevolyn.com

NEVOLYN Technology
Website: https://nevolyn.com
Email: info@nevolyn.com
```
> **Note**: `NewsDetailModal.tsx` parses these blocks automatically via `parseContactBlock()` and converts them into rich, interactive contact cards with direct email and website buttons.

---

### 3. 🚀 Step-by-Step: How to Add a New News Item

1. **Verify / Add the Image**:
   - Ensure the image file is in `frontend/public/` (e.g. `news_fabinsXdcci.jpg`).
   - Reference it as `/news_fabinsXdcci.jpg`.

2. **Add Entry to `frontend/lib/data/latest-news.ts`**:
   - Add the new object at **index `0`** of `export const news: NewsItem[] = [ ... ]`.
   - Maintain strict **reverse chronological order** (Newest -> Top, Oldest -> Bottom).
   - Update the chronological list in the top docstring header of `latest-news.ts`.

3. **Clean Up Content Text**:
   - Strip all social tracking query parameters (such as `?__cft__=...`, `?fbclid=...`, `&__tn__=...`).
   - Use clean Markdown and standard paragraph breaks (`\n\n`).

4. **Update `docs/NEVOLYN_NEWS_LINKS.md`**:
   - Add the News ID and its verified Facebook and LinkedIn links to the registry below.

5. **Check Flagship Status (`featured-milestones.ts`)**:
   - If the event is a key institutional milestone to feature in the horizontal 3D carousel, also sync it into `frontend/lib/data/featured-milestones.ts`.

6. **Validate Build**:
   - Run `npm run type-check` or `npm run build` inside `frontend/` to ensure TypeScript types and Next.js routes compile cleanly.

---

## 🔗 Official NEVOLYN News Links Registry

*(Ordered newest first — exact verified links used in `frontend/lib/data/latest-news.ts`)*

## News ID: news-dcci-ai-summit-2026

- Facebook: https://www.facebook.com/share/p/19xgeHqdiE/
- LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7518267793624969217

## News ID: news-needle-innovation-challenge-3

- Facebook: https://www.facebook.com/share/p/1Bgapc31MN/
- LinkedIn: https://www.linkedin.com/feed/update/urn:li:activity:7514731472616988673

## News ID: news-fair-award-top50

- Facebook: https://www.facebook.com/share/p/1Dic4Zk1C1/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508553026446512128-zo3h?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-pm-visit-stall-15

- Facebook: https://www.facebook.com/share/p/1EWaRZbEjL/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508552627731722240-UWcm?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-fair-selection-top50

- Facebook: https://www.facebook.com/share/p/1Dneow7TW9/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-bangladeshinnovationfair2026-activity-7508552213913419776-FhHB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-axentec-nda

- Facebook: https://www.facebook.com/share/p/1KFM2uWrgb/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_nevolyn-fabins-fabricinspection-activity-7508471434042785792-6YqT?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-nsu-startups-next

- Facebook: https://www.facebook.com/share/p/1CCYuHFcQ4/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_nevolyn-fabins-nsu-activity-7508470824220303362-3Cqq?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-ontik-technology

- Facebook: https://www.facebook.com/share/p/196S5r5pyA/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508467193739853824-OYF7?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-buet-irab-showcase

- Facebook: https://www.facebook.com/share/p/1ExQkVx3WH/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508466089102643200-nWOb?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-saturn-partnership

- Facebook: https://www.facebook.com/share/p/1Cu2GnNnWQ/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508463008101056512-7NoV?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk

## News ID: news-saturn-poc

- Facebook: https://www.facebook.com/share/p/14qC7DiQEA4/
- LinkedIn: https://www.linkedin.com/posts/nevolyn_fabins-nevolyn-fabricinspection-activity-7508451195204718592-72CT?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAADz_70oBqriO2ZWG-YtRkXzgRBDHA7NFaTk
