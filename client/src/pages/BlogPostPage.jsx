import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import { formatDate } from '../utils/formatDate.js';
import { readingTime } from '../utils/readingTime.js';
import './BlogPostPage.css';

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get(`/blog-posts/public/${id}`)
      .then(({ data }) => {
        if (active) setPost(data.post);
      })
      .catch(() => {
        if (active) setPost(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <p>Loading…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page">
        <h1>Post not found</h1>
        <Link to="/blog">← Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <div className="page">
        <Link to="/blog" className="back-link">← Back to blog</Link>

        <article className="blog-post">
          <header className="blog-post-header">
            <div className="blog-post-meta">
              <span className="blog-category">{post.category}</span>
              <span className="blog-date">{formatDate(post.publishedAt)}</span>
              <span className="blog-read-time">{readingTime(post.content)}</span>
            </div>
            <h1 className="blog-post-title">{post.title}</h1>
          </header>

          <div className="blog-post-image">{post.coverImage}</div>

          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
