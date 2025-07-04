
export const SUPPORTED_CITIES = [
  'DELHI',
  'BENGALURU',
] as const;

export const CREATOR_ROLES = [
  'GROOM',
  'BRIDE',
  'FAMILY',
  'OTHER'
] as const;

export const WEDDING_STATUS = [
  "PLANNING",
  "PARTIALLY_BOOKED",
  "BOOKED",
  "COMPLETED"
] as const;

// Wedding events with UPPERCASE value-label pairs for consistent backend usage
export const WEDDING_EVENTS: { value: string; label: string }[] = [
  { value: 'MEHENDI', label: 'Mehendi' },
  { value: 'SANGEET', label: 'Sangeet' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'OTHERS', label: 'Others' }
];

// Service categories with UPPERCASE value-label pairs for consistent backend usage
export const SERVICE_CATEGORIES: { value: string; label: string }[] = [
  { value: 'PHOTOGRAPHY', label: 'Photography' },
  { value: 'CATERING', label: 'Catering' },
  { value: 'DECORATION', label: 'Decoration' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'VENUE', label: 'Venue' },
  { value: 'MAKEUP', label: 'Makeup' },
  { value: 'OTHERS', label: 'Others' }
];