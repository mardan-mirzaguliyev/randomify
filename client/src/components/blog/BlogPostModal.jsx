import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  status: 'draft',
  category: '',
  coverImage: '',
  tags: '',
};

export default function BlogPostModal({ isOpen, onClose, onSave, post }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(post);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      post
        ? {
            title: post.title || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            status: post.status || 'draft',
            category: post.category || '',
            coverImage: post.coverImage || '',
            tags: post.tags?.join(', ') || '',
          }
        : emptyForm
    );
    setError('');
  }, [isOpen, post]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await onSave({
        ...form,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit post' : 'New post'}>
      <form className="stack blog-post-form" onSubmit={handleSubmit}>
        {error && <p className="field-error">{error}</p>}

        <div>
          <label htmlFor="blog-title">Title</label>
          <input
            id="blog-title"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            maxLength={140}
            placeholder="What should this post be called?"
          />
        </div>

        <div>
          <label htmlFor="blog-excerpt">Excerpt</label>
          <textarea
            id="blog-excerpt"
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Short summary for scanning."
          />
        </div>

        <div>
          <label htmlFor="blog-content">Content</label>
          <textarea
            id="blog-content"
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            required
            rows={9}
            maxLength={20000}
            placeholder="Write the post..."
          />
        </div>

        <div className="blog-post-form-grid">
          <div>
            <label htmlFor="blog-status">Status</label>
            <select
              id="blog-status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label htmlFor="blog-tags">Tags</label>
            <input
              id="blog-tags"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              maxLength={320}
              placeholder="updates, product"
            />
          </div>

          <div>
            <label htmlFor="blog-category">Category</label>
            <input
              id="blog-category"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              maxLength={40}
              placeholder="Films, Books, Lifestyle"
            />
          </div>

          <div>
            <label htmlFor="blog-cover">Cover emoji</label>
            <input
              id="blog-cover"
              value={form.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              maxLength={16}
              placeholder="🎬"
            />
          </div>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
