import PageHero from '../components/PageHero.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { pageFields } from '../content/pageCopy.js';
import { waLink } from '../lib/api.js';

export default function BookNow() {
  const { settings } = useContent();
  const copy = pageFields(settings, 'book');
  return (
    <>
      <Seo
        title="Book Now | United Scuba"
        description="Enquire to book scuba diving, snorkelling or a PADI course with United Scuba."
        path="/book-now"
      />
      <PageHero
        kicker={copy.kicker}
        title={copy.title}
        intro={copy.intro}
        image="/assets/sd7.jpg"
      />
      <section className="section section-dark">
        <div className="container book-layout">
          <div className="book-aside">
            <span className="kicker">{copy.stepsKicker}</span>
            <h2>{copy.stepsTitle}</h2>
            <ol className="book-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>{copy.step1Title}</strong>
                  <p>{copy.step1Text}</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>{copy.step2Title}</strong>
                  <p>{copy.step2Text}</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>{copy.step3Title}</strong>
                  <p>{copy.step3Text}</p>
                </div>
              </li>
            </ol>
            {settings.whatsapp && (
              <a className="btn btn-ghost" href={waLink(settings.whatsapp, 'Hello United Scuba, I would like to book a dive.')} target="_blank" rel="noreferrer">
                Prefer WhatsApp? Message us
              </a>
            )}
          </div>
          <EnquiryForm source="book-now" />
        </div>
      </section>
    </>
  );
}
