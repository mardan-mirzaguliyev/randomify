import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SAMPLE_BLOG_POSTS } from '../data/sampleBlogPosts.js';
import './BlogPage.css';

const CATEGORIES = ['All', 'Films', 'Books', 'Lifestyle'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts =
    selectedCategory === 'All'
      ? SAMPLE_BLOG_POSTS
      : SAMPLE_BLOG_POSTS.filter((post) => post.category === selectedCategory);

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

        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="blog-card">
              <div className="blog-card-image">{post.image}</div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{post.date}</span>
                </div>
                <h3 className="blog-card-title">{post.title}</h3>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <span className="blog-read-time">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
