import ResourceAdmin from './ResourceAdmin.jsx';

export default function DiveSitesAdmin() {
  return (
    <ResourceAdmin
      title="Dive sites"
      description="These sites appear in the Dive sites menu on the website. Drag a card to change the order."
      path="dive-sites"
      imageField="heroImage"
      cardView
      createTemplate={{ slug: '', title: '', published: true }}
      fields={[
        { name: 'title', label: 'Name' },
        { name: 'slug', label: 'URL slug' },
        { name: 'excerpt', label: 'Short line', type: 'textarea' },
        { name: 'description', label: 'About this site', type: 'textarea' },
        { name: 'overview', label: 'Overview', type: 'textarea' },
        { name: 'included', label: "What's included", type: 'lines', hint: 'one item per line' },
        { name: 'depth', label: 'Max depth', hint: 'fact bar' },
        { name: 'photos', label: 'Photos & videos', hint: 'fact bar' },
        { name: 'duration', label: 'Duration', hint: 'fact bar' },
        { name: 'minAge', label: 'Min age', hint: 'fact bar' },
        { name: 'price', label: 'Price', hint: 'fact bar' },
        { name: 'level', label: 'Who it suits' },
        { name: 'certifiedOnly', label: 'Certified divers only', type: 'checkbox' },
        { name: 'heroImage', label: 'Photo', type: 'image' },
        { name: 'published', label: 'Show on the site', type: 'checkbox' },
      ]}
    />
  );
}
