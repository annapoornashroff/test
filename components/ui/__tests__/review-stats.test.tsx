import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { ReviewStats } from '../review-stats'
import { type ReviewStats as ReviewStatsType } from '@/lib/types/api'

describe('ReviewStats', () => {
  const mockStats: ReviewStatsType = {
    total_reviews: 100,
    average_rating: 4.5,
    recent_reviews_count: 25,
    wedding_related_count: 75,
    rating_distribution: {
      5: 60,
      4: 25,
      3: 10,
      2: 3,
      1: 2
    },
    source: 'google_places',
    business_name: 'Test Business',
    last_updated: '2024-03-15T12:00:00Z'
  }

  it('renders stats information correctly', () => {
    render(<ReviewStats stats={mockStats} />)
    
    expect(screen.getByText('Customer Reviews')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('Based on 100 reviews')).toBeInTheDocument()
  })

  it('displays correct number of filled stars', () => {
    render(<ReviewStats stats={mockStats} />)
    
    const filledStars = screen.getAllByTestId('star-icon').filter(
      star => star.classList.contains('text-yellow-500') && !star.classList.contains('opacity-50')
    )
    expect(filledStars).toHaveLength(4) // 4 full stars for 4.5 rating
  })

  it('calculates and displays rating distribution percentages', () => {
    render(<ReviewStats stats={mockStats} />)
    
    expect(screen.getByTestId('rating-5-percentage')).toHaveTextContent('60%')
    expect(screen.getByTestId('rating-4-percentage')).toHaveTextContent('25%')
    expect(screen.getByTestId('rating-3-percentage')).toHaveTextContent('10%')
    expect(screen.getByTestId('rating-2-percentage')).toHaveTextContent('3%')
    expect(screen.getByTestId('rating-1-percentage')).toHaveTextContent('2%')
  })

  it('shows correct data source', () => {
    render(<ReviewStats stats={mockStats} />)
    
    expect(screen.getByText(/Data source: Google Places API/)).toBeInTheDocument()
  })

  it('formats last updated date correctly', () => {
    render(<ReviewStats stats={mockStats} />)
    
    expect(screen.getByText(/Last updated: 3\/15\/2024, 12:00:00 PM/)).toBeInTheDocument()
  })

  it('displays wedding and recent review counts', () => {
    render(<ReviewStats stats={mockStats} />)
    
    expect(screen.getByText('75')).toBeInTheDocument()
    expect(screen.getByText('Wedding Reviews')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Recent Reviews')).toBeInTheDocument()
  })

  it('handles zero reviews correctly', () => {
    const zeroStats = {
      ...mockStats,
      total_reviews: 0,
      rating_distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    }
    render(<ReviewStats stats={zeroStats} />)
    
    expect(screen.getByTestId('rating-5-percentage')).toHaveTextContent('0%')
    expect(screen.getByTestId('rating-4-percentage')).toHaveTextContent('0%')
    expect(screen.getByTestId('rating-3-percentage')).toHaveTextContent('0%')
    expect(screen.getByTestId('rating-2-percentage')).toHaveTextContent('0%')
    expect(screen.getByTestId('rating-1-percentage')).toHaveTextContent('0%')
  })
}) 