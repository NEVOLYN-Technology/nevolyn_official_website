/**
 * Team directory data store — NEVOLYN Technology.
 *
 * This file houses all full-time engineers, researchers, and operational team members.
 * The core leadership entries from `lib/data/leaders.ts` are automatically prepended
 * as the FIRST entries of the organization-wide directory.
 *
 * ## 📋 Template for Adding a New Team Member
 *
 * When creating a new employee profile, follow the exact structure:
 * ```ts
 * {
 *   id: 'jane-doe',
 *   slug: 'janedoe',
 *   aliases: ['jane', 'jane-doe'],
 *   name: 'Jane Doe',
 *   title: 'Junior Machine Learning Engineer',
 *   department: 'engineering',
 *   bio: 'Developing edge AI models and computer vision inspection pipelines at NEVOLYN.',
 *   extendedBio: [
 *     'Jane contributes to dataset curation and deep learning model training for FABINS...',
 *     'She completed her undergraduate degree in Computer Science...',
 *     'Her academic research focused on real-time neural network inference...'
 *   ],
 *   email: 'jane@nevolyn.com',
 *   responsibilities: [
 *     'Annotation and model evaluation for defect detection',
 *     'Edge deployment optimization on embedded hardware',
 *     'Unit testing and automated model benchmarking'
 *   ],
 *   social: {
 *     github: 'https://github.com/janedoe',
 *     linkedin: 'https://linkedin.com/in/janedoe',
 *   },
 *   image: '/team/jane-doe.png',
 * }
 * ```
 *
 * @module lib/data/team
 */

import { leaders, teamDepartments, type TeamMember, type Department } from './leaders'

export type { TeamMember, Department }

/**
 * Extended member interface with optional department classification.
 */
export interface TeamDirectoryMember extends TeamMember {
  /** Optional departmental grouping ID */
  department?: 'leadership' | 'engineering' | 'hardware' | 'operations' | 'research'
}

/**
 * Additional full-time engineers, researchers, and operations staff.
 * Note: Leaders from `leaders.ts` are automatically placed FIRST in `allTeamMembers`.
 */
export const team: TeamDirectoryMember[] = [
  // Additional team members can be added here following the standard template above.
]

/**
 * Complete unified roster of all NEVOLYN team members.
 * Leaders from `leaders.ts` are AUTOMATICALLY the first entries.
 */
export const allTeamMembers: TeamMember[] = [
  ...leaders,
  ...team,
]

/**
 * The two directors (Managing Director & Director of Finance & Operations)
 * who sit in the first line.
 */
export const directorMembers: TeamMember[] = allTeamMembers.filter(
  (m) => m.id === 'chagla' || m.id === 'lutfar' || m.title.toLowerCase().includes('director')
)

/**
 * All other team members, researchers, and engineers (excluding the 2 directors).
 */
export const nonDirectorMembers: TeamMember[] = allTeamMembers.filter(
  (m) => !directorMembers.some((d) => d.id === m.id)
)

/**
 * All organizational departments for the team page directory.
 * The primary Leadership & Engineering Team from `leaders.ts` is always first.
 */
export const allDepartments: Department[] = [
  // 1. Leadership (always the first entry)
  teamDepartments[0],
]

/**
 * Finds any member (leader or employee) by slug, ID, or alias.
 */
export function findAnyMemberBySlug(slug: string): TeamMember | undefined {
  if (!slug) return undefined
  const raw = decodeURIComponent(slug)
    .toLowerCase()
    .trim()
    .replace(/^#/, '')
    .replace(/^(?:team|leaders|innovators|employees)\//, '')
    .trim()

  const normalized = raw.replace(/[^a-z0-9]/g, '')

  return allTeamMembers.find((member) => {
    if (member.slug && member.slug.toLowerCase() === raw) return true
    if (member.id && member.id.toLowerCase() === raw) return true
    if (member.name && member.name.toLowerCase().replace(/[\s.]+/g, '-').replace(/-+/g, '-') === raw) return true

    if (member.slug && member.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized) return true
    if (member.name && member.name.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized) return true
    if (member.id && member.id.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized) return true

    if (
      member.aliases?.some((a) => {
        const aliasClean = a.toLowerCase().trim()
        return aliasClean === raw || aliasClean.replace(/[^a-z0-9]/g, '') === normalized
      })
    ) {
      return true
    }

    return false
  })
}
