import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex h-10 w-full rounded-md')
  })

  it('handles different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />)
    expect(screen.getByPlaceholderText('Text input')).toHaveAttribute('type', 'text')

    rerender(<Input type="password" placeholder="Password input" />)
    const passwordInput = screen.getByPlaceholderText('Password input')
    expect(passwordInput).toHaveAttribute('type', 'password')

    rerender(<Input type="email" placeholder="Email input" />)
    const emailInput = screen.getByPlaceholderText('Email input')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('handles user input', async () => {
    render(<Input placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')
    await userEvent.type(input, 'Hello, World!')
    expect(input).toHaveValue('Hello, World!')
  })

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="Ref input" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom class input" />)
    const input = screen.getByPlaceholderText('Custom class input')
    expect(input).toHaveClass('custom-class')
  })

  it('handles file input type', () => {
    render(<Input type="file" placeholder="Choose a file" />)
    const input = screen.getByPlaceholderText('Choose a file')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveClass('file:border-0 file:bg-transparent')
  })
}) 