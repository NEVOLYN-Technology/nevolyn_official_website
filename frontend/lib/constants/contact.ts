/**
 * contact.ts — Centralized NEVOLYN Technology contact details.
 *
 * The single source of truth for all public-facing contact information.
 * Both `Footer.tsx` and `ContactSection.tsx` import from here so any
 * address, phone, or email change only ever needs to happen in one place.
 *
 * When the Spring Boot backend is integrated, consider pulling this data
 * from a `/api/config` endpoint instead so it can be updated server-side
 * without a frontend re-deploy.
 *
 * @module lib/constants/contact
 */

/** A phone number entry with a display label and a tel: href. */
export interface PhoneEntry {
  /** Display-formatted number (e.g., "+880 1679-248064") */
  label: string
  /** Raw tel: URI value (e.g., "+8801679248064") */
  href: string
  /** Accessible aria-label for screen readers */
  ariaLabel: string
}

/** Complete contact details for NEVOLYN Technology. */
export interface ContactDetails {
  companyName: string
  address: {
    label: string
    mapsUrl: string
  }
  phones: PhoneEntry[]
  email: string
}

/**
 * NEVOLYN Technology official contact information.
 *
 * Update this object when office address, phone numbers, or email change.
 */
export const CONTACT: ContactDetails = {
  companyName: 'NEVOLYN',
  address: {
    label: 'Level 5, Jaroms Textile Building, 13/2 Abdus Sattar Master Road, Tongi 1710',
    mapsUrl:
      'https://www.google.com/maps/place/NEVOLYN/@23.9250899,90.3904398,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c554bdcff14f:0x591c436a33915bae!8m2!3d23.9250899!4d90.3904398!16s%2Fg%2F11z_c1p6hs',
  },
  phones: [
    {
      label: '+880 1679-248064',
      href: 'tel:+8801679248064',
      ariaLabel: 'Call +880 1679-248064',
    },
    {
      label: '+880 1939-444451',
      href: 'tel:+8801939444451',
      ariaLabel: 'Call +880 1939-444451',
    },
  ],
  email: 'info@nevolyn.com',
} as const
