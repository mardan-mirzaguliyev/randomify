import { useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogPage.css';

// Sample blog posts - in a real app, these would come from an API
const BLOG_POSTS = [
  {
    id: '1',
    title: 'Top 10 Films of 2024',
    excerpt: 'A curated list of the must-watch films from this year, ranging from indie darlings to blockbuster hits.',
    category: 'Films',
    date: 'December 15, 2024',
    readTime: '5 min read',
    image: '🎬'
  },
  {
    id: '2',
    title: 'Summer Reading Recommendations',
    excerpt: 'Discover the best books to read this summer, from gripping thrillers to thought-provoking non-fiction.',
    category: 'Books',
    date: 'June 20, 2024',
    readTime: '4 min read',
    image: '📚'
  },
  {
    id: '3',
    title: 'The Art of Random Selection',
    excerpt: 'How embracing randomness can lead to better decision-making and more exciting discoveries in everyday life.',
    category: 'Lifestyle',
    date: 'March 10, 2024',
    readTime: '6 min read',
    image: '🎲'
  },
  {
    id: '4',
    title: 'Hidden Gems: Underrated Films You Missed',
    excerpt: 'A deep dive into lesser-known films that deserve more attention from cinema lovers.',
    category: 'Films',
    date: 'February 28, 2024',
    readTime: '7 min read',
    image: '🎥'
  },
  {
    id: '5',
    title: 'Building Your Reading List',
    excerpt: 'Tips and strategies for creating and maintaining a reading list that actually works for you.',
    category: 'Books',
    date: 'January 15, 2024',
    readTime: '5 min read',
    image: '📖'
  }
];

const CATEGORIES = ['All', 'Films', 'Books', 'Lifestyle'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? BLOG_POSTS 
    : BLOG_POSTS.filter(post => post.category === selectedCategory);

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
