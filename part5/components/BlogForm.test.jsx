import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'
import { describe, test, expect, vi } from 'vitest'

describe('<BlogForm />', () => {
  test('form calls event handler with correct details when new blog is created', async () => {
    const createBlog = vi.fn()
    const user = userEvent.setup()

    render(<BlogForm createBlog={createBlog} />)

    const titleInput = screen.getByPlaceholderText('title')
    const authorInput = screen.getByPlaceholderText('author')
    const urlInput = screen.getByPlaceholderText('url')
    const createButton = screen.getByText('create')

    await user.type(titleInput, 'Testing forms with react-testing-library')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://example.com')

    await user.click(createButton)

    expect(createBlog.mock.calls).toHaveLength(1)

    expect(createBlog.mock.calls[0][0]).toEqual({
      title: 'Testing forms with react-testing-library',
      author: 'Test Author',
      url: 'https://example.com'
    })
  })
})