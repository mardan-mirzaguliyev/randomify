import { useMemo, useState } from 'react';
import BlogPostModal from '../components/blog/BlogPostModal.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Badge from '../components/ui/Badge.jsx';
import { useBlogPosts } from '../hooks/useBlogPosts.js';
import { formatDate } from '../utils/formatDate.js';
import './BlogPostsPage.css';

export default function BlogPostsPage() {
  const { posts, loading, error, createPost, updatePost, deletePost, refetch } = useBlogPosts();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const counts = useMemo(
    () => ({
      published: posts.filter((post) => post.status === 'published').length,
      draft: posts.filter((post) => post.status === 'draft').length,
    }),
    [posts]
  );

  const openCreate = () => {
    setEditingPost(null);
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleSave = (payload) => {
    if (editingPost) {
      return updatePost(editingPost._id, payload);
    }

    return createPost(payload);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingPost(null);
  };

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    await deletePost(post._id);
  };

  return (
    <div className="page blog-page">
      <div className="page-header blog-page-header">
        <div>
          <h1>Blog posts</h1>
          <p>Create, revise, and publish updates from one place.</p>
        </div>
        <Button onClick={openCreate}>New post</Button>
      </div>

      <div className="blog-summary">
        <div>
          <span>{posts.length}</span>
          <p>Total posts</p>
        </div>
        <div>
          <span>{counts.published}</span>
          <p>Published</p>
        </div>
        <div>
          <span>{counts.draft}</span>
          <p>Drafts</p>
        </div>
      </div>

      {loading && (
        <div className="spinner-page">
          <Spinner label="Loading blog posts..." />
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <div className="blog-empty">
              <h2>No posts yet</h2>
              <p>Start a draft, publish an announcement, or keep notes for the next update.</p>
              <Button onClick={openCreate}>Create your first post</Button>
            </div>
          ) : (
            <div className="blog-post-list">
              {posts.map((post) => (
                <article key={post._id} className="blog-post-card card">
                  <div className="blog-post-card-main">
                    <div className="blog-post-card-title">
                      <h2>{post.title}</h2>
                      <Badge>{post.status === 'published' ? 'Published' : 'Draft'}</Badge>
                    </div>

                    <p className="blog-post-card-meta">
                      Updated {formatDate(post.updatedAt)}
                      {post.publishedAt ? ` · Published ${formatDate(post.publishedAt)}` : ''}
                    </p>

                    {post.excerpt && <p className="blog-post-card-excerpt">{post.excerpt}</p>}

                    {post.tags?.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="blog-post-card-actions">
                    <Button variant="secondary" size="sm" onClick={() => openEdit(post)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(post)}>
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      <BlogPostModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSave={handleSave}
        post={editingPost}
      />
    </div>
  );
}
