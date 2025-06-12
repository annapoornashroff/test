import { ReviewResponse, BusinessRating } from './types/api'

export const mockReviews: ReviewResponse[] = [
  {
    id: 1,
    name: 'John Doe',
    city: 'New York',
    rating: 5,
    comment: 'Amazing experience!',
    wedding_date: '2024-03-15',
    source: 'google_places',
    created_at: '2024-03-01T00:00:00Z',
    relative_time: '2 days ago'
  },
  {
    id: 2,
    name: 'Jane Smith',
    city: 'Los Angeles',
    rating: 4,
    comment: 'Great service!',
    wedding_date: '2024-03-16',
    source: 'google_places',
    created_at: '2024-03-03T00:00:00Z',
    relative_time: '1 day ago'
  }
]

export const mockBusinessRating: BusinessRating = {
  rating: 4.5,
  total_reviews: 100,
  business_name: 'Test Business',
  source: 'google_places',
  place_id: 'ChIJ1234567890'
} 