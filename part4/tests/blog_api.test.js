const { test, after, beforeEach, describe, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')

describe('when there is initially some blogs saved', () => {
  before(async () => {
    // Wait for MongoDB connection to be established
    if (mongoose.connection.readyState === 0) {
      await new Promise((resolve) => {
        mongoose.connection.once('open', resolve)
      })
    }
  })

  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  // Exercise 4.8
  describe('viewing all blogs', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')

      assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
      const response = await api.get('/api/blogs')

      const titles = response.body.map(r => r.title)
      assert(titles.includes('React patterns'))
    })
  })

  // Exercise 4.9
  describe('blog identifier', () => {
    test('unique identifier property is named id', async () => {
      const response = await api.get('/api/blogs')
      
      const blog = response.body[0]
      assert(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  // Exercise 4.10
  describe('addition of a new blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'Test Author',
        url: 'https://example.com/async-await',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('async/await simplifies making async calls'))
    })

    test('blog content is saved correctly', async () => {
      const newBlog = {
        title: 'Test Blog',
        author: 'Test Author',
        url: 'https://example.com/test',
        likes: 5
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.title, newBlog.title)
      assert.strictEqual(response.body.author, newBlog.author)
      assert.strictEqual(response.body.url, newBlog.url)
      assert.strictEqual(response.body.likes, newBlog.likes)
    })

    // Exercise 4.11
    test('if likes property is missing, it defaults to 0', async () => {
      const newBlog = {
        title: 'Blog without likes',
        author: 'Test Author',
        url: 'https://example.com/no-likes'
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    // Exercise 4.12
    test('blog without title is not added', async () => {
      const newBlog = {
        author: 'Test Author',
        url: 'https://example.com/no-title',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without url is not added', async () => {
      const newBlog = {
        title: 'Blog without URL',
        author: 'Test Author',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('blog without both title and url is not added', async () => {
      const newBlog = {
        author: 'Test Author',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  // Exercise 4.13 - DELETE tests
  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)
    })

    test('fails with status code 400 if id is malformed', async () => {
      const invalidId = 'notavalidid'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  // Exercise 4.14 - PUT tests
  describe('updating a blog', () => {
    test('succeeds with valid data and id', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
    })

    test('updates only the likes of a blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        likes: 100
      }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlogInDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)
      
      assert.strictEqual(updatedBlogInDb.likes, 100)
    })

    test('returns the updated blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: 999
      }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

      assert.strictEqual(response.body.id, blogToUpdate.id)
      assert.strictEqual(response.body.title, blogToUpdate.title)
      assert.strictEqual(response.body.author, blogToUpdate.author)
      assert.strictEqual(response.body.url, blogToUpdate.url)
      assert.strictEqual(response.body.likes, 999)
    })

    test('fails with status code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      const updatedBlog = {
        likes: 50
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .expect(400)
    })

    test('fails with status code 400 if id is malformed', async () => {
      const invalidId = 'notavalidid'

      const updatedBlog = {
        likes: 50
      }

      await api
        .put(`/api/blogs/${invalidId}`)
        .send(updatedBlog)
        .expect(400)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})