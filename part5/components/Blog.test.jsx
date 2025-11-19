import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { describe, test, expect, vi } from 'vitest'

describe('<Blog />', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'https://testing-library.com',
    likes: 5,
    user: {
      id: '123',
      username: 'testuser',
      name: 'Test User'
    }
  }

  const user = {
    username: 'testuser',
    name: 'Test User'
  }

  test('renders title and author, but not url or likes by default', () => {
    render(<Blog blog={blog} user={user} />)

    const element = screen.getByText('Component testing is done with react-testing-library Test Author')
    expect(element).toBeDefined()

    const urlElement = screen.queryByText('https://testing-library.com')
    expect(urlElement).toBeNull()

    const likesElement = screen.queryByText('likes 5')
    expect(likesElement).toBeNull()
  })

  test('url and likes are shown when the view button is clicked', async () => {
    render(<Blog blog={blog} user={user} />)

    const userEventSession = userEvent.setup()
    const button = screen.getByText('view')
    await userEventSession.click(button)

    const urlElement = screen.getByText('https://testing-library.com')
    expect(urlElement).toBeDefined()

    const likesElement = screen.getByText('likes 5')
    expect(likesElement).toBeDefined()
  })

  test('if like button is clicked twice, event handler is called twice', async () => {
    const mockHandler = vi.fn()

    render(<Blog blog={blog} updateBlog={mockHandler} user={user} />)

    const userEventSession = userEvent.setup()

    const viewButton = screen.getByText('view')
    await userEventSession.click(viewButton)

    const likeButton = screen.getByText('like')
    await userEventSession.click(likeButton)
    await userEventSession.click(likeButton)

    expect(mockHandler.mock.calls).toHaveLength(2)
  })
})