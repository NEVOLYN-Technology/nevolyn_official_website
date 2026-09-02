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
  address: {
    label: string
    mapsUrl: string
  }
  phones: PhoneEntry[]
  email: string
  mapEmbedUrl: string
}

/**
 * NEVOLYN Technology official contact information.
 *
 * Update this object when office address, phone numbers, or email change.
 */
export const CONTACT: ContactDetails = {
  address: {
    label: '13/2, Abdus Sattar Master Road, Tongi, Gazipur',
    mapsUrl: 'https://maps.app.goo.gl/rTMDffWdKmaRdSth6?g_st=ac',
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
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3645.979573698516!2d90.39695911543293!3d23.895097884556836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1139c39f7a9%3A0x2df6b3e8d2017d1e!2sTongi%2C%20Gazipur!5e0!3m2!1sen!2sbd!4v1690000000000!5m2!1sen!2sbd',
} as const
