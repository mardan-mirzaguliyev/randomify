import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { formatDate } from '../utils/formatDate.js';
import { readingTime } from '../utils/readingTime.js';
import './BlogPage.css';

const CATEGORIES = ['All', 'Films', 'Books', 'Lifestyle'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get('/blog-posts/public')
      .then(({ data }) => {
        if (active) setPosts(data.posts);
      })
      .catch(() => {
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="blog-page">
      <div className="page">
        <div className="page-header">
          <h1>Blog</h1>
          <p>Thoughts on films, books, and the art of decision-making.</p>
        </div>

        <div className="blog-filters">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading posts…</p>
        ) : filteredPosts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <Link key={post._id} to={`/blog/${post._id}`} className="blog-card">
                <div className="blog-card-image">{post.coverImage}</div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-category">{post.category}</span>
                    <span className="blog-date">{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  <span className="blog-read-time">{readingTime(post.content)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
