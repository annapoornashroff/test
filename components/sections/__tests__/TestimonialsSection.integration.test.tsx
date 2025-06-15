import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react'
import TestimonialsSection from '../TestimonialsSection'
import { apiClient } from '@/lib/api-client'
import { ReviewResponse, BusinessRating } from '@/lib/types/api'
import { mockReviews, mockBusinessRating } from '@/lib/mocks'
import { useToast } from '@/hooks/use-toast'

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn()
  }
}))

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}))

// Remove these lines (lines 22-28):
// Mock next/image
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: (props: any) => {
//     // eslint-disable-next-line jsx-a11y/alt-text
//     return <img {...props} />
//   },
// }))

describe('TestimonialsSection Integration', () => {
  const mockToast = {
    toast: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue(mockToast)
    ;(apiClient.getFeaturedReviews as jest.Mock).mockResolvedValue(mockReviews)
    ;(apiClient.getBusinessRating as jest.Mock).mockResolvedValue(mockBusinessRating)
    // Mock console.error to prevent it from showing in test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('ApiErrorBoundary Integration', () => {
    it('shows error boundary when API fails', async () => {
      const errorMessage = 'Network Error'
      // Mock initial failure
      ;(apiClient.getFeaturedReviews as jest.Mock).mockRejectedValueOnce(new Error(errorMessage))

      await act(async () => {
        render(<TestimonialsSection />)
      })

      // Verify error state
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      // Mock successful retry with delay
      const mockResponse = {
        data: {
          reviews: [
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
              city: 'New York',
              platform: 'Google'
            }
          ],
          business_rating: {
            rating: 4.5,
            total_reviews: 100,
            business_name: 'Forever N Co.',
            place_id: 'mock-place-id'
          }
        }
      }

      console.log('Mock Response:', JSON.stringify(mockResponse, null, 2))

      ;(apiClient.getFeaturedReviews as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )
      ;(apiClient.getBusinessRating as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      )

      // Click retry button and wait for loading state
      await act(async () => {
        fireEvent.click(screen.getByText('Try Again'))
      })

      // Wait for loading spinner to appear
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      })

      // Wait for loading spinner to disappear
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Debug: Log the current DOM state
      console.log('Current DOM:', document.body.innerHTML)

      // Wait for the content to be rendered after retry
      await waitFor(() => {
        const reviewerName = screen.getByText('John Doe')
        expect(reviewerName).toBeInTheDocument()
      }, { timeout: 2000 })

      // Verify the review content is displayed
      await waitFor(() => {
        expect(screen.getByText('Amazing experience!')).toBeInTheDocument()
        expect(screen.getByText('Wedding Date: March 15, 2024')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('handles offline state correctly', async () => {
      // Mock navigator.onLine
      const originalNavigator = { ...window.navigator }
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true
      })

      await act(async () => {
        render(<TestimonialsSection />)
      })

      await waitFor(() => {
        expect(screen.getByText("You're Offline")).toBeInTheDocument()
      })

      // Restore navigator
      Object.defineProperty(window.navigator, 'onLine', {
        value: originalNavigator.onLine,
        writable: true
      })
    })
  })

  describe('ReviewCard Integration', () => {
    it('displays review cards with correct data', async () => {
      // Ensure we're online for this test
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true
      })

      // Debug: Log the mock data
      console.log('Mock Reviews:', mockReviews)

      await act(async () => {
        render(<TestimonialsSection />)
      })

      // Wait for loading to complete and content to be rendered
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 3000 })

      // Debug: Log the entire DOM structure
      console.log('Current DOM structure:', document.body.innerHTML)

      // Debug: Log all h4 elements
      const allH4Elements = document.querySelectorAll('h4')
      console.log('All h4 elements:', Array.from(allH4Elements).map(el => ({
        text: el.textContent,
        classes: el.className,
        parentClasses: el.parentElement?.className
      })))

      // Wait for the review card to be fully rendered
      await waitFor(() => {
        // Find all reviewer names
        const reviewerNames = screen.getAllByTestId('reviewer-name')
        // Find the one that's in a visible card (has opacity-100 class)
        const visibleCard = reviewerNames.find(name => 
          name.closest('div[class*="opacity-100"]')
        )
        expect(visibleCard).toHaveTextContent('John Doe')
      }, { timeout: 3000 })

      // Verify first review card
      const firstReview = screen.getAllByTestId('reviewer-name')
        .find(name => name.closest('div[class*="opacity-100"]'))
        ?.closest('div[role="article"]')
      expect(firstReview).toHaveClass('rounded-lg')
      expect(firstReview).toHaveClass('border')
      expect(firstReview).toHaveClass('bg-card')
      expect(firstReview).toHaveClass('text-card-foreground')
      expect(firstReview).toHaveClass('shadow-lg')
      expect(firstReview).toHaveClass('scale-105')

      // Verify review content
      expect(screen.getByText('Amazing experience!')).toBeInTheDocument()
      expect(screen.getByText('Wedding Date: March 15, 2024')).toBeInTheDocument()
    })

    it('handles review card transitions', async () => {
      // Ensure we're online for this test
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true
      })

      await act(async () => {
        render(<TestimonialsSection />)
      })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Wait for the content to be rendered and stable
      await waitFor(() => {
        const firstCard = screen.getByText('John Doe').closest('[role="article"]')
        expect(firstCard).toBeInTheDocument()
      }, { timeout: 2000 })

      // Add a small delay to allow for any initial transitions
      await new Promise(resolve => setTimeout(resolve, 100))

      // Initial state - check the wrapper div that contains the opacity class
      const firstCardWrapper = screen.getByText('John Doe')
        .closest('[role="article"]')
        ?.parentElement
      expect(firstCardWrapper).toHaveClass('opacity-100')
      expect(firstCardWrapper).toHaveClass('scale-100')

      // Navigate to next review
      await act(async () => {
        fireEvent.click(screen.getByLabelText('Next review'))
      })

      // Wait for transition to complete and check the new active card
      await waitFor(() => {
        const secondCardWrapper = screen.getByText('Jane Smith')
          .closest('[role="article"]')
          ?.parentElement
        expect(secondCardWrapper).toHaveClass('opacity-100')
        expect(secondCardWrapper).toHaveClass('scale-100')
      }, { timeout: 2000 })
    })
  })

  describe('LoadingSpinner Integration', () => {
    it('shows loading spinner during initial load', async () => {
      // Ensure we're online for this test
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true
      })

      // Delay the API response
      ;(apiClient.getFeaturedReviews as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockReviews), 100))
      )
      ;(apiClient.getBusinessRating as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBusinessRating), 100))
      )

      render(<TestimonialsSection />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin')
    })

    it('shows loading spinner during retry', async () => {
      // Ensure we're online for this test
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true
      })

      const errorMessage = 'Network Error'
      ;(apiClient.getFeaturedReviews as jest.Mock)
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve(mockReviews), 100))
        )
      ;(apiClient.getBusinessRating as jest.Mock)
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve(mockBusinessRating), 100))
        )

      await act(async () => {
        render(<TestimonialsSection />)
      })

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })

      await act(async () => {
        fireEvent.click(screen.getByText('Try Again'))
      })

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('GoogleReviewsBadge Integration', () => {
    it('displays business rating correctly', async () => {
      // Ensure we're online for this test
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true
      })

      await act(async () => {
        render(<TestimonialsSection />)
      })

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      }, { timeout: 2000 })

      // Wait for the content to be rendered
      await waitFor(() => {
        expect(screen.getByText('4.5')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Verify business rating display
      const ratingSection = screen.getByText('4.5').closest('div')
      expect(ratingSection).toHaveClass('flex')
      expect(ratingSection).toHaveClass('items-center')
      expect(ratingSection).toHaveClass('ml-2')

      // Verify Google link
      const googleLink = screen.getByLabelText('View on Google')
      expect(googleLink).toHaveAttribute(
        'href',
        'https://www.google.com/maps/place/?q=place_id:ChIJ1234567890'
      )
      expect(googleLink).toHaveAttribute('target', '_blank')
      expect(googleLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})