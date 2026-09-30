import ResourceAdmin from './ResourceAdmin.jsx';

export default function ReviewsAdmin() {
  return (
    <ResourceAdmin
      title="Reviews"
      description="Guest testimonials on the home page. Drag a card to change the order."
      path="reviews"
      cardView={true}
      createTemplate={{ name: '', quote: '', rating: 5, featured: true }}
      fields={[
        { name: 'name', label: 'Name' },
        { name: 'quote', label: 'Quote', type: 'textarea' },
        { name: 'rating', label: 'Rating 1-5' },
        { name: 'source', label: 'Source' },
        { name: 'featured', label: 'Show on home', type: 'checkbox' },
      ]}
    />
  );
}
