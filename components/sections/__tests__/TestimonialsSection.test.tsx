import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import TestimonialsSection from '../TestimonialsSection'
import { apiClient } from '@/lib/api-client'
import { ReviewResponse, BusinessRating } from '@/lib/types/api'
import { mockReviews, mockBusinessRating } from '@/lib/mocks'
import { useToast } from '@/hooks/use-toast'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getFeaturedReviews: jest.fn(),
    getBusinessRating: jest.fn()
  }
}))

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}))

describe('TestimonialsSection', () => {
  const mockToast = {
    toast: jest.fn()
  }

  const mockReviews = [
    {
      id: '1',
      author_name: 'John Doe',
      author_url: 'https://example.com/john',
      profile_photo_url: 'https://example.com/photo1.jpg',
      rating: 5,
      relative_time_description: '2 months ago',
      text: 'Amazing experience!',
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
      relative_time_description: '1 month ago',
      text: 'Great service!',
      time: 1616000000,
      wedding_date: 'invalid-date',
      city: 'Los Angeles'
    }
  ]

  const mockBusinessRating = {
    rating: 4.5,
    total_reviews: 100,
    business_name: 'Test Business',
    place_id: 'mock-place-id'
  }

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
    // With this:
    (apiClient.getFeaturedReviews as jest.Mock).mockResolvedValue(mockReviews);
    (apiClient.getBusinessRating as jest.Mock).mockResolvedValue(mockBusinessRating);
  });

  it('renders loading state initially', async () => {
    // Delay the API response to ensure loading state is visible
    (apiClient.getFeaturedReviews as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockReviews), 100))
    );
    (apiClient.getBusinessRating as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockBusinessRating), 100))
    );
  
    render(<TestimonialsSection />);
    
    // The loading spinner should be immediately visible
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  })

  it('renders reviews and business rating after loading', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    // Wait for loading to complete and data to be rendered
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('(100)')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    const errorMessage = 'Failed to fetch reviews'
    const originalConsoleError = console.error
    console.error = jest.fn()
    ;(apiClient.getFeaturedReviews as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))

    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(console.error).toHaveBeenCalledWith('Error fetching reviews:', expect.any(Error))
    
    console.error = originalConsoleError
  })

  it('rotates through reviews automatically', async () => {
    jest.useFakeTimers()
    ;(apiClient.getFeaturedReviews as jest.Mock).mockResolvedValueOnce({
      data: {
        reviews: mockReviews,
        business_rating: mockBusinessRating
      }
    })

    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    await act(async () => {
      jest.advanceTimersByTime(5000)
    })

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('allows manual navigation through reviews', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Next review'))
    })

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Previous review'))
    })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('formats dates correctly', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText('Wedding Date: March 15, 2024')).toBeInTheDocument()
    })
  })

  it('handles invalid dates gracefully', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Next review'))
    })

    await waitFor(() => {
      expect(screen.getByText('Wedding Date: invalid-date')).toBeInTheDocument()
    })
  })

  it('displays correct number of filled stars', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const reviewCard = screen.getByText('John Doe').closest('[role="article"]')
    const stars = reviewCard?.querySelectorAll('[data-testid="star-icon"]')
    const filledStars = Array.from(stars || []).filter(star => 
      star.classList.contains('text-yellow-500')
    )

    expect(filledStars).toHaveLength(5)
  })

  it('provides Google review link', async () => {
    await act(async () => {
      render(<TestimonialsSection />)
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      expect(screen.getByLabelText('View on Google')).toBeInTheDocument()
    })

    const googleLink = screen.getByLabelText('View on Google')
    expect(googleLink).toHaveAttribute(
      'href',
      'https://www.google.com/maps/place/?q=place_id:mock-place-id'
    )
  })
})