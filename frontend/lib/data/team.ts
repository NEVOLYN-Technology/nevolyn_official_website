/**
 * NEVOLYN Engineering Team content.
 *
 * Single source of truth for the **engineering team** shown in the expandable
 * "Engineering Team" subsection of `components/sections/LeadersSection.tsx`.
 *
 * Leadership profiles live separately in `lib/data/leaders.ts`. The two files
 * share the same {@link TeamMember} shape, so a person can be moved between them
 * by cutting and pasting the entry.
 *
 * ## Static by design
 * The roster is content, not application state: it changes a few times a year,
 * is identical for every visitor, and is entirely public. Keeping it in the
 * bundle means the section renders instantly, is reviewable in a pull request,
 * and has no runtime failure mode. Do not reintroduce a network fetch for it.
 *
 * ## How to add a team member
 * Append an entry to {@link engineeringTeamMembers} below, then redeploy the
 * frontend. Only `id`, `name`, `title`, `bio` and `responsibilities` are
 * required; everything else is optional and simply omitted from the card when
 * absent.
 *
 * ```ts
 * {
 *   id: 'jane-doe',                         // kebab-case, unique — used as the React key
 *   name: 'Jane Doe',
 *   title: 'Computer Vision Engineer',
 *   bio: 'Builds real-time defect segmentation models for FABINS.',
 *   responsibilities: [
 *     'Model training and evaluation',
 *     'Industrial camera integration',
 *   ],
 *   extendedBio: [                          // optional — shown in the detail modal
 *     'Jane leads the vision pipeline...',
 *     'She studied at BUET...',
 *   ],
 *   email: 'jane.doe@nevolyn.com',           // optional
 *   image: '/jane-photo.png',               // optional — file must exist in /public
 *   social: {                               // optional
 *     github: 'https://github.com/janedoe',
 *     linkedin: 'https://linkedin.com/in/janedoe',
 *   },
 * }
 * ```
 *
 * ## Notes
 * - **Order matters.** Cards render in array order; there is no sort key.
 * - **`image` must exist in `/public`.** A missing file renders a broken image,
 *   whereas omitting the field falls back to a placeholder avatar icon.
 * - **This is a public website.** Anything added here is world-readable, so
 *   include only details each person has agreed to publish.
 * - An empty array is valid — the section hides its toggle button entirely.
 *
 * @module lib/data/team
 */

import type { TeamMember } from '@/lib/data/leaders'

/**
 * Engineering team roster, rendered beneath the leadership grid once the
 * visitor expands "Show Team Members".
 *
 * Empty while no engineering profiles are cleared for publication. The toggle
 * button stays hidden until this array has at least one entry, so the homepage
 * shows leadership only.
 */
export const engineeringTeamMembers: TeamMember[] = []

/** Re-exported so consumers can type their own entries without a second import. */
export type { TeamMember }
