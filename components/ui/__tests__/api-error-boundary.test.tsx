import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApiErrorBoundary } from '../api-error-boundary'

// Mock child component that throws an error
const ThrowError = () => {
  throw new Error('Test error')
}

describe('ApiErrorBoundary', () => {
  beforeEach(() => {
    // Reset navigator.onLine before each test
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    })
  })

  it('renders children when there is no error', () => {
    render(
      <ApiErrorBoundary>
        <div>Test Content</div>
      </ApiErrorBoundary>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders error UI when child throws error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ApiErrorBoundary>
        <ThrowError />
      </ApiErrorBoundary>
    )

    expect(screen.getByText('API Error')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('renders custom error message when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ApiErrorBoundary errorMessage="Custom error message">
        <ThrowError />
      </ApiErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('renders custom fallback when provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <ApiErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ThrowError />
      </ApiErrorBoundary>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    
    consoleSpy.mockRestore()
  })

  it('calls onReset when retry button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const onReset = jest.fn()
    
    render(
      <ApiErrorBoundary onReset={onReset}>
        <ThrowError />
      </ApiErrorBoundary>
    )

    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onReset).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('shows offline UI when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false })
    
    render(
      <ApiErrorBoundary>
        <div>Test Content</div>
      </ApiErrorBoundary>
    )

    expect(screen.getByText("You're Offline")).toBeInTheDocument()
    expect(screen.getByText('Please check your internet connection and try again')).toBeInTheDocument()
  })

  it('updates UI when online status changes', () => {
    const { rerender } = render(
      <ApiErrorBoundary>
        <div>Test Content</div>
      </ApiErrorBoundary>
    )

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false })
    fireEvent(window, new Event('offline'))
    expect(screen.getByText("You're Offline")).toBeInTheDocument()

    // Simulate going online
    Object.defineProperty(navigator, 'onLine', { value: true })
    fireEvent(window, new Event('online'))
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
}) 