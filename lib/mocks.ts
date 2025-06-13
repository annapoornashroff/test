import { ReviewResponse, BusinessRating } from './types/api'

export const mockReviews: ReviewResponse[] = [
  {
    id: '1',
    author_name: 'John Doe',
    author_url: 'https://example.com/john',
    profile_photo_url: 'https://example.com/photo1.jpg',
    rating: 5,
    text: 'Amazing experience!',
    relative_time_description: '2 months ago',
    time: 1615000000,
    wedding_date: '2024-03-15',
    city: 'New York'
  },
  {
    id: '2',
    author_name: 'Jane Smith',
    author_url: 'https://example.com/jane',
    profile_photo_url: 'https://example.com/photo2.jpg',
    rating: 4,
    text: 'Great service!',
    relative_time_description: '1 month ago',
    time: 1616000000,
    wedding_date: '2024-03-16',
    city: 'Los Angeles'
  }
]

export const mockBusinessRating: BusinessRating = {
  rating: 4.5,
  total_reviews: 100,
  business_name: 'Test Business',
  source: 'google_places',
  place_id: 'ChIJ1234567890'
} 