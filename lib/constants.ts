import type { CreatorRole } from './types/api';

export const SUPPORTED_CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Kolkata',
  'Jaipur',
  'Goa'
] as const;

export type SupportedCity = typeof SUPPORTED_CITIES[number];

export const CREATOR_ROLES: { value: CreatorRole; label: string }[] = [
  { value: 'groom', label: 'Groom' },
  { value: 'bride', label: 'Bride' },
  { value: 'family', label: 'Family' },
  { value: 'other', label: 'Other' }
];

export const WEDDING_EVENTS = [
  'Mehendi', 'Sangeet', 'Wedding', 'Reception', 'Engagement', 'Others'
] as const;

export const SERVICE_CATEGORIES = [
  'Photography', 'Catering', 'Decoration', 'Music', 'Venue', 'Makeup', 'Others'
] as const;