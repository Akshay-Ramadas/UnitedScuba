import ResourceAdmin from './ResourceAdmin.jsx';

export default function BlogAdmin() {
  return (
    <ResourceAdmin
      title="Blog"
      description="Articles, dive guides and travel tips. Drag a card to change the order."
      path="posts"
      imageField="coverImage"
      cardView={true}
      createTemplate={{ slug: '', title: '', category: 'info', published: true, content: '' }}
      fields={[
        { name: 'slug', label: 'URL slug' },
        { name: 'title', label: 'Title' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { name: 'content', label: 'HTML content', type: 'textarea' },
        { name: 'category', label: 'Category', type: 'select', options: ['scuba', 'snorkelling', 'beginner', 'courses', 'info', 'travel', 'safety'] },
        { name: 'coverImage', label: 'Cover image', type: 'image' },
        { name: 'seoTitle', label: 'SEO title' },
        { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
        { name: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
