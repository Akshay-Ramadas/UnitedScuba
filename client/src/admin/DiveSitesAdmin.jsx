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
        { name: 'depth', label: 'Depth' },
        { name: 'level', label: 'Who it suits' },
        { name: 'certifiedOnly', label: 'Certified divers only', type: 'checkbox' },
        { name: 'heroImage', label: 'Photo', type: 'image' },
        { name: 'published', label: 'Show on the site', type: 'checkbox' },
      ]}
    />
  );
}
