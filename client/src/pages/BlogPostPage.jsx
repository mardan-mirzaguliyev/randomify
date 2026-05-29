import { useParams, Link } from 'react-router-dom';
import './BlogPostPage.css';

// Sample blog posts data - in a real app, this would come from an API
const BLOG_POSTS = {
  '1': {
    id: '1',
    title: 'Top 10 Films of 2024',
    category: 'Films',
    date: 'December 15, 2024',
    readTime: '5 min read',
    image: '🎬',
    content: `
      <p>As we wrap up another incredible year of cinema, it's time to reflect on the films that truly captivated audiences and critics alike. From intimate indie dramas to blockbuster spectacles, 2024 has been a remarkable year for storytelling.</p>
      
      <h2>1. The Last Horizon</h2>
      <p>A sweeping epic that redefines the science fiction genre, this film combines stunning visuals with a deeply human story about exploration and sacrifice.</p>
      
      <h2>2. Whispers in the Wind</h2>
      <p>An intimate character study that showcases incredible performances and masterful direction. A quiet masterpiece that lingers long after the credits roll.</p>
      
      <h2>3. Urban Symphony</h2>
      <p>A vibrant celebration of city life through the lens of multiple interconnected stories. The ensemble cast delivers uniformly excellent performances.</p>
      
      <h2>4. The Silent Forest</h2>
      <p>A haunting environmental thriller that balances entertainment with a powerful message about conservation. Visually breathtaking and emotionally resonant.</p>
      
      <h2>5. Midnight in Tokyo</h2>
      <p>A stylish neo-noir that pays homage to classic cinema while carving out its own unique identity. The cinematography alone is worth the price of admission.</p>
      
      <h2>6. Family Ties</h2>
      <p>A heartwarming comedy-drama that explores the complexities of modern family dynamics with humor and heart. Perfect for all ages.</p>
      
      <h2>7. The Quantum Paradox</h2>
      <p>Mind-bending science fiction that challenges viewers while delivering an entertaining ride. Great for repeated viewings to catch all the details.</p>
      
      <h2>8. Songs of the Sea</h2>
      <p>A beautiful animated feature that proves animation isn't just for children. A touching story about family, identity, and finding your voice.</p>
      
      <h2>9. The Detective's Last Case</h2>
      <p>A gripping mystery that keeps you guessing until the very end. Expertly paced with a script that respects the audience's intelligence.</p>
      
      <h2>10. Summer of '69</h2>
      <p>A nostalgic coming-of-age story that captures a specific time and place with authenticity and charm. The soundtrack alone is worth experiencing.</p>
      
      <p>Each of these films offers something unique and memorable. Whether you're looking for entertainment, enlightenment, or emotional connection, 2024's cinematic landscape has delivered in abundance.</p>
    `
  },
  '2': {
    id: '2',
    title: 'Summer Reading Recommendations',
    category: 'Books',
    date: 'June 20, 2024',
    readTime: '4 min read',
    image: '📚',
    content: `
      <p>Summer is the perfect time to dive into a great book. Whether you're lounging by the pool, relaxing at the beach, or enjoying a quiet afternoon at home, these recommendations will keep you engaged and entertained.</p>
      
      <h2>Fiction Picks</h2>
      <p><strong>The Midnight Library</strong> by Matt Haig - A thought-provoking exploration of the choices we make and the lives we could have lived.</p>
      <p><strong>Project Hail Mary</strong> by Andy Weir - An exhilarating space adventure that's as scientifically accurate as it is thrilling.</p>
      
      <h2>Non-Fiction</h2>
      <p><strong>Atomic Habits</strong> by James Clear - Practical advice on building good habits and breaking bad ones, backed by science.</p>
      <p><strong>Thinking, Fast and Slow</strong> by Daniel Kahneman - A fascinating look at how our minds work and the biases that affect our decisions.</p>
      
      <h2>Mystery & Thriller</h2>
      <p><strong>The Silent Patient</strong> by Alex Michaelides - A psychological thriller that will keep you guessing until the final page.</p>
      <p><strong>The Thursday Murder Club</strong> by Richard Osman - A charming cozy mystery with humor and heart.</p>
      
      <p>Happy reading!</p>
    `
  },
  '3': {
    id: '3',
    title: 'The Art of Random Selection',
    category: 'Lifestyle',
    date: 'March 10, 2024',
    readTime: '6 min read',
    image: '🎲',
    content: `
      <p>In a world obsessed with optimization and control, there's something liberating about embracing randomness. This post explores how letting chance guide your decisions can lead to unexpected discoveries and reduced decision fatigue.</p>
      
      <h2>The Paradox of Choice</h2>
      <p>Psychologist Barry Schwartz famously argued that having too many choices can actually lead to anxiety and dissatisfaction. When every decision feels weighty, we become paralyzed by the fear of making the wrong choice.</p>
      
      <h2>Randomness as a Tool</h2>
      <p>By introducing randomness into your decision-making process, you can:</p>
      <ul>
        <li>Reduce decision fatigue</li>
        <li>Discover new preferences you didn't know you had</li>
        <li>Break out of routine patterns</li>
        <li>Add an element of surprise to daily life</li>
      </ul>
      
      <h2>Practical Applications</h2>
      <p>Try using random selection for low-stakes decisions: what to eat for dinner, which movie to watch, or which book to read next. You might be surprised by how freeing it feels to let go of the need to always make the "perfect" choice.</p>
      
      <h2>Embracing the Unexpected</h2>
      <p>Some of life's best moments come from unexpected places. By being open to randomness, you open yourself to new experiences and opportunities that careful planning might have missed.</p>
    `
  },
  '4': {
    id: '4',
    title: 'Hidden Gems: Underrated Films You Missed',
    category: 'Films',
    date: 'February 28, 2024',
    readTime: '7 min read',
    image: '🎥',
    content: `
      <p>While blockbusters get all the attention, countless excellent films fly under the radar. Here are some hidden gems that deserve more recognition.</p>
      
      <h2>The Fall (2006)</h2>
      <p>A visually stunning fantasy film that was years ahead of its time. The story within a story structure and incredible cinematography make this a must-watch.</p>
      
      <h2>Coherence (2013)</h2>
      <p>A mind-bending sci-fi thriller made on a shoestring budget. Proof that great storytelling doesn't require a massive budget.</p>
      
      <h2>The Secret Life of Walter Mitty (2013)</h2>
      <p>Often dismissed as a simple comedy, this film is actually a beautiful exploration of escapism and finding meaning in life.</p>
      
      <h2>These films may not have had massive marketing campaigns, but they offer unique cinematic experiences that reward attentive viewers.</p>
    `
  },
  '5': {
    id: '5',
    title: 'Building Your Reading List',
    category: 'Books',
    date: 'January 15, 2024',
    readTime: '5 min read',
    image: '📖',
    content: `
      <p>A well-curated reading list is more than just a collection of titles—it's a roadmap for your intellectual journey. Here's how to build one that actually works for you.</p>
      
      <h2>Start with Your Interests</h2>
      <p>Begin by listing topics you're genuinely curious about. Don't worry about what you "should" read—focus on what excites you.</p>
      
      <h2>Mix It Up</h2>
      <p>Balance different genres, time periods, and perspectives. A diverse reading list keeps things interesting and broadens your horizons.</p>
      
      <h2>Be Realistic</h2>
      <p>Don't create a list of 100 books you'll never finish. Start with 5-10 titles and add more as you go.</p>
      
      <h2>Track Your Progress</h2>
      <p>Use a simple system to track what you've read and what you want to read next. This helps maintain momentum and motivation.</p>
      
      <h2>Stay Flexible</h2>
      <p>Your reading list should evolve as your interests change. Don't be afraid to remove books that no longer appeal to you.</p>
    `
  }
};

export default function BlogPostPage() {
  const { id } = useParams();
  const post = BLOG_POSTS[id];

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
