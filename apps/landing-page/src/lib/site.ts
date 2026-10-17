// Single source of truth for public-facing company details.
// Update values here (or via NEXT_PUBLIC_* env vars) instead of editing pages.

export const site = {
  name: 'SuberFood',
  tagline: 'From Farm to Table, Fully Traceable',
  domain: 'suberfoods.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://suberfoods.com',
  country: 'Cameroon',
  currency: 'XAF',

  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@suberfoods.com',
    businessEmail: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'business@suberfoods.com',
    careersEmail: process.env.NEXT_PUBLIC_CAREERS_EMAIL || 'careers@suberfoods.com',
    pressEmail: process.env.NEXT_PUBLIC_PRESS_EMAIL || 'press@suberfoods.com',
    privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@suberfoods.com',
    // Set NEXT_PUBLIC_CONTACT_PHONE / NEXT_PUBLIC_WHATSAPP_NUMBER in production.
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+237 6XX XXX XXX',
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    address: 'SuberFood Distribution Center',
    city: 'Douala',
    region: 'Littoral Region',
    hours: 'Mon – Sat, 8:00 – 18:00 (WAT)',
  },

  serviceCities: ['Douala', 'Buea', 'Limbe', 'Yaoundé', 'Bamenda', 'Kumba'],

  paymentMethods: ['MTN Mobile Money', 'Orange Money', 'SuberFood Wallet', 'Cash on delivery'],

  social: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
    x: process.env.NEXT_PUBLIC_X_URL || '',
  },
} as const

export function whatsappLink(message?: string) {
  const digits = site.contact.whatsapp.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export function formatXAF(amount: number | string | null | undefined) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0
  return `${Math.round(value || 0).toLocaleString('fr-FR')} XAF`
}
