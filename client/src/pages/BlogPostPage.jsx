import { useParams, Link } from 'react-router-dom';
import { SAMPLE_BLOG_POST_MAP } from '../data/sampleBlogPosts.js';
import './BlogPostPage.css';

export default function BlogPostPage() {
  const { id } = useParams();
  const post = SAMPLE_BLOG_POST_MAP[id];

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
              <span className="blog-date">{post.date}</span>
              <span className="blog-read-time">{post.readTime}</span>
            </div>
            <h1 className="blog-post-title">{post.title}</h1>
          </header>

          <div className="blog-post-image">{post.image}</div>

          <div 
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  );
}
