import ResourceAdmin from './ResourceAdmin.jsx';

export default function BlogAdmin() {
  return (
    <ResourceAdmin
      title="Blog"
      description="Articles, dive guides and travel tips. Write the article as normal text. Drag a card to change the order."
      path="posts"
      imageField="coverImage"
      cardView={true}
      createTemplate={{ slug: '', title: '', category: 'info', published: true, content: '' }}
      fields={[
        { name: 'slug', label: 'URL slug' },
        { name: 'title', label: 'Title' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
        {
          name: 'content',
          label: 'Article',
          type: 'article',
          hint: 'Blank line between paragraphs. Start a line with # for a heading, - for a bullet, and write a link as [Open Water](/courses/padi-open-water-diver).',
        },
        { name: 'category', label: 'Category', type: 'select', allowOther: true, options: ['scuba', 'snorkelling', 'beginner', 'courses', 'info', 'travel', 'safety'] },
        { name: 'coverImage', label: 'Cover image', type: 'image' },
        { name: 'seoTitle', label: 'SEO title' },
        { name: 'seoDescription', label: 'SEO description', type: 'textarea' },
        { name: 'published', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
