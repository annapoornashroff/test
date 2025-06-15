import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { ReviewCard } from '../review-card'
import { type ReviewResponse } from '@/lib/types/api'

// Remove these lines (lines 7-13):
// Mock next/image
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line jsx-a11y/alt-text
//     return <img {...props} />
//   },
// }))

describe('ReviewCard', () => {
  const mockReview: ReviewResponse = {
    id: '1',
    author_name: 'John Doe',
    author_url: 'https://example.com',
    profile_photo_url: 'https://example.com/image.jpg',
    rating: 5,
    text: 'Amazing experience!',
    relative_time_description: '2 weeks ago',
    time: Date.now(),
    wedding_date: '2024-03-15',
    city: 'New York'
  }

  it('renders review information correctly', () => {
    render(<ReviewCard review={mockReview} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('Amazing experience!')).toBeInTheDocument()
    expect(screen.getByText('Wedding Date: March 15, 2024')).toBeInTheDocument()
  })

  it('displays correct number of filled stars', () => {
    render(<ReviewCard review={mockReview} />)
    
    const filledStars = screen.getAllByTestId('star-icon').filter(
      star => star.classList.contains('text-yellow-500')
    )
    expect(filledStars).toHaveLength(5)
  })

  it('handles invalid wedding date gracefully', () => {
    const invalidReview = {
      ...mockReview,
      wedding_date: 'invalid-date'
    }
    render(<ReviewCard review={invalidReview} />)
    
    expect(screen.getByText('Wedding Date: invalid-date')).toBeInTheDocument()
  })

  it('applies active state styles when isActive is true', () => {
    render(<ReviewCard review={mockReview} isActive={true} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('scale-105')
    expect(card).toHaveClass('shadow-lg')
  })

  it('applies custom className', () => {
    render(<ReviewCard review={mockReview} className="custom-class" />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveClass('custom-class')
  })

  it('displays Google indicator for Google Places reviews', () => {
    render(<ReviewCard review={mockReview} />)
    
    expect(screen.getByText('Google')).toBeInTheDocument()
  })

  it('uses fallback image when no image is provided', () => {
    const reviewWithoutImage = {
      ...mockReview,
      profile_photo_url: ''
    }
    render(<ReviewCard review={reviewWithoutImage} />)
    
    const fallbackContainer = screen.getByRole('img', { name: 'Default profile image' })
    expect(fallbackContainer).toBeInTheDocument()
    expect(fallbackContainer).toHaveClass('w-full', 'h-full', 'bg-gray-200')
    
    const fallbackText = screen.getByText('J')
    expect(fallbackText).toBeInTheDocument()
    expect(fallbackText).toHaveClass('text-2xl', 'text-gray-500')
  })
})