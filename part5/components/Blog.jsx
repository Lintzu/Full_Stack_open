import { useState } from 'react'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id
    }
    updateBlog(blog.id, updatedBlog)
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  const showDeleteButton = user && blog.user && (user.username === blog.user.username)

  return (
    <div style={blogStyle} className="blog">
      <div className="blogTitleAuthor">
        {blog.title} {blog.author}
        <button onClick={toggleVisibility} className="toggleButton">
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className="blogDetails">
          <div className="blogUrl">{blog.url}</div>
          <div className="blogLikes">
            likes {blog.likes}
            <button onClick={handleLike} className="likeButton">like</button>
          </div>
          <div>{blog.user && blog.user.name}</div>
          {showDeleteButton && (
            <button onClick={handleDelete} style={{ backgroundColor: '#1E90FF' }}>
              remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog