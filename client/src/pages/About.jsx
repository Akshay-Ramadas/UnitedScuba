import PageHero from '../components/PageHero.jsx';
import CtaBanner from '../components/CtaBanner.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { useContent } from '../hooks/useContent.jsx';
import { lines, pageFields } from '../content/pageCopy.js';
import { useScrollReveal } from '../hooks/useScrollReveal.jsx';

function Reveal({ children }) {
  const [ref, visible] = useScrollReveal();
  return <div ref={ref} className={`reveal${visible ? ' visible' : ''}`}>{children}</div>;
}

export default function About() {
  const { settings, faqs } = useContent();
  const copy = pageFields(settings, 'about');
  const highlights = lines(copy.highlights);
  const missionPoints = lines(copy.missionPoints);
  const story = String(copy.story || '').split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const vision = String(copy.vision || '').split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const aboutFaqs = (faqs || []).filter((item) => item.page === 'about');
  return (
    <>
      <Seo
        title="About Us | United Scuba"
        description="United Scuba Dive Centre, established in 2018 in Swaraj Dweep (Havelock Island), Andaman & Nicobar Islands."
        path="/about"
      />
      <PageHero kicker={copy.kicker} title={copy.title} intro={copy.intro} image="/assets/sd4.jpg" />
      <section className="section section-dark">
        <div className="container">
          <div className="prose" style={{ margin: '0 auto' }}>
            {story.length > 0 && (
              <Reveal>
                {story.map((part) => <p key={part}>{part}</p>)}
              </Reveal>
            )}
            {copy.mission && (
              <Reveal>
                <h2>{copy.missionTitle}</h2>
                <p>{copy.mission}</p>
                {missionPoints.length > 0 && (
                  <ul className="list">
                    {missionPoints.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </Reveal>
            )}
            {vision.length > 0 && (
              <Reveal>
                <h2>{copy.visionTitle}</h2>
                {vision.map((part) => <p key={part}>{part}</p>)}
                {copy.visionLine && <p>{copy.visionLine}</p>}
              </Reveal>
            )}
            {copy.certifications && (
              <Reveal>
                <h2>{copy.certTitle}</h2>
                <p>{copy.certifications}</p>
              </Reveal>
            )}
            {copy.safety && (
              <Reveal>
                <h2>{copy.safetyTitle}</h2>
                <p>{copy.safety}</p>
              </Reveal>
            )}
            {copy.equipment && (
              <Reveal>
                <h2>{copy.equipmentTitle}</h2>
                <p>{copy.equipment}</p>
              </Reveal>
            )}
            {missionPoints.length === 0 && highlights.length > 0 && (
              <Reveal>
                <h2>{copy.whyTitle}</h2>
                <ul className="list">
                  {highlights.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </Reveal>
            )}
          </div>
          {aboutFaqs.length > 0 && (
            <Reveal>
              <h2 style={{ fontSize: '1.7rem', fontWeight: 500, letterSpacing: '-0.03em', margin: '2.5rem 0 1.25rem', color: 'var(--text)' }}>{copy.faqTitle}</h2>
              <FaqList items={aboutFaqs} />
            </Reveal>
          )}
          <CtaBanner />
        </div>
      </section>
    </>
  );
}
