import { Link, useParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { articleJsonLd, graphJsonLd } from '../lib/siteSchema.js';

export default function BlogPost() {
  const { slug } = useParams();
  const { posts, settings } = useContent();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    return <section className="section container"><h1>Article not found</h1><Link to="/blog">Back to blog</Link></section>;
  }
  return (
    <>
      <Seo
        title={post.seoTitle || `${post.title} | United Scuba`}
        description={post.seoDescription || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.coverImage}
        jsonLd={graphJsonLd(articleJsonLd(post, settings))}
      />
      <PageHero kicker={post.category} title={post.title} intro={post.excerpt} />
      <section className="section">
        <div className="container prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>
    </>
  );
}
