import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '../textarea'

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text" />)
    const textarea = screen.getByPlaceholderText('Enter text')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('flex min-h-[80px] w-full rounded-md')
  })

  it('handles user input', async () => {
    render(<Textarea placeholder="Type here" />)
    const textarea = screen.getByPlaceholderText('Type here')
    await userEvent.type(textarea, 'Hello,\nWorld!')
    expect(textarea).toHaveValue('Hello,\nWorld!')
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('handles rows and cols attributes', () => {
    render(<Textarea rows={5} cols={40} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea).toHaveAttribute('cols', '40')
  })

  it('handles maxLength attribute', () => {
    render(<Textarea maxLength={100} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('maxLength', '100')
  })
}) 