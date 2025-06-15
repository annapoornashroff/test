// Learn more: https://github.com/testing-library/jest-dom
import React from 'react'
import '@testing-library/jest-dom'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    }
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, ...props }) => {
    // Create a more realistic mock that mimics Next.js Image behavior
    return React.createElement('img', {
      src,
      alt,
      width,
      height,
      ...props,
      'data-testid': 'next-image-mock'
    })
  },
})) 