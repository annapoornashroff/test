import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { GoogleReviewsBadge } from '../google-reviews-badge'

describe('GoogleReviewsBadge', () => {
  it('renders with default business name', () => {
    render(<GoogleReviewsBadge rating={4.5} totalReviews={100} />)
    
    expect(screen.getByText('Forever N Co.')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(100)')).toBeInTheDocument()
  })

  it('renders with custom business name', () => {
    render(<GoogleReviewsBadge rating={4.5} totalReviews={100} businessName="Custom Business" />)
    
    expect(screen.getByText('Custom Business')).toBeInTheDocument()
  })

  it('formats rating to one decimal place', () => {
    render(<GoogleReviewsBadge rating={4.666} totalReviews={100} />)
    
    expect(screen.getByText('4.7')).toBeInTheDocument()
  })

  it('formats large review numbers with commas', () => {
    render(<GoogleReviewsBadge rating={4.5} totalReviews={1234567} />)
    
    expect(screen.getByText('(1,234,567)')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<GoogleReviewsBadge rating={4.5} totalReviews={100} className="custom-class" />)
    
    const badge = screen.getByRole('complementary')
    expect(badge).toHaveClass('custom-class')
  })

  it('displays Google logo', () => {
    render(<GoogleReviewsBadge rating={4.5} totalReviews={100} />)
    
    const googleLogo = screen.getByRole('img', { hidden: true })
    expect(googleLogo).toBeInTheDocument()
    expect(googleLogo).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('handles zero reviews', () => {
    render(<GoogleReviewsBadge rating={0} totalReviews={0} />)
    
    expect(screen.getByText('0.0')).toBeInTheDocument()
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })

  it('handles negative rating gracefully', () => {
    render(<GoogleReviewsBadge rating={-1} totalReviews={100} />)
    
    expect(screen.getByText('-1.0')).toBeInTheDocument()
  })
}) 