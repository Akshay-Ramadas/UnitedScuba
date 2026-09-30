import PageHero from '../components/PageHero.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';

const META = {
  privacy: ['Privacy Policy', '/privacy', 'How United Scuba handles enquiry and booking information.'],
  terms: ['Terms & Conditions', '/terms', 'Participation, fitness and booking terms for United Scuba.'],
  cancellation: ['Cancellation / Refund Policy', '/cancellation', 'How changes, weather and cancellations are handled.'],
};

export default function Legal({ type }) {
  const { settings } = useContent();
  const [, path, desc] = META[type];
  const copy = pageFields(settings, type);
  const paragraphs = String(copy.body || 'This page will be updated with the dive centre’s final legal copy.').split('\n').map((line) => line.trim()).filter(Boolean);
  return (
    <>
      <Seo title={`${copy.title} | United Scuba`} description={desc} path={path} />
      <PageHero kicker="Legal" title={copy.title} />
      <section className="section">
        <div className="container prose">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      </section>
    </>
  );
}
