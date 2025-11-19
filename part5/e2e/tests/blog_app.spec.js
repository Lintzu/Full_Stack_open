const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'password123'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('Log in to application')
    await expect(locator).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'password123')
      await expect(page.getByText('Test User logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testuser', 'wrongpassword')
      
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('Wrong username or password')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      
      await expect(page.getByText('Test User logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'testuser', 'password123')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test Blog Title', 'Test Author', 'https://test.com')
      await expect(page.getByText('Test Blog Title Test Author')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Blog to Like', 'Like Author', 'https://like.com')
      
      await page.getByRole('button', { name: 'view' }).click()
      
      await page.getByRole('button', { name: 'like' }).click()
      
      await expect(page.getByText('likes 1')).toBeVisible()
    })

    test('user who added the blog can delete it', async ({ page }) => {
      await createBlog(page, 'Blog to Delete', 'Delete Author', 'https://delete.com')
      
      await page.getByRole('button', { name: 'view' }).click()
      
      page.on('dialog', dialog => dialog.accept())
      await page.getByRole('button', { name: 'remove' }).click()
      
      await expect(page.getByText('Blog to Delete Delete Author')).not.toBeVisible()
    })

    test('only the creator sees the delete button', async ({ page, request }) => {
      await createBlog(page, 'First User Blog', 'First Author', 'https://first.com')
      await page.getByRole('button', { name: 'logout' }).click()

      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Second User',
          username: 'seconduser',
          password: 'password456'
        }
      })

      await loginWith(page, 'seconduser', 'password456')
      
      await page.getByRole('button', { name: 'view' }).click()
      
      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are arranged in order according to likes', async ({ page }) => {
      await createBlog(page, 'Blog with least likes', 'Author A', 'https://a.com')
      await createBlog(page, 'Blog with most likes', 'Author B', 'https://b.com')
      await createBlog(page, 'Blog with medium likes', 'Author C', 'https://c.com')

      const blogs = await page.locator('.blog').all()
      
      await blogs[1].getByRole('button', { name: 'view' }).click()
      await blogs[1].getByRole('button', { name: 'like' }).click()
      await page.waitForTimeout(500)
      await blogs[1].getByRole('button', { name: 'like' }).click()
      await page.getByText('likes 2').waitFor()
      
      await blogs[2].getByRole('button', { name: 'view' }).click()
      await blogs[2].getByRole('button', { name: 'like' }).click()
      await page.getByText('likes 1').waitFor()

      await page.reload()

      const blogsAfterSort = await page.locator('.blog').all()
      await expect(blogsAfterSort[0].getByText('Blog with most likes')).toBeVisible()
      await expect(blogsAfterSort[1].getByText('Blog with medium likes')).toBeVisible()
      await expect(blogsAfterSort[2].getByText('Blog with least likes')).toBeVisible()
    })
  })
})