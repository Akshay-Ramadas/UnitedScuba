import { Link, useParams } from 'react-router-dom';
import { useContent } from '../hooks/useContent.jsx';
import PageHero from '../components/PageHero.jsx';
import FaqList from '../components/FaqList.jsx';
import { Seo } from '../lib/seo.jsx';
import { courseJsonLd, faqJsonLd, graphJsonLd } from '../lib/siteSchema.js';
import { waLink } from '../lib/api.js';
import '../styles/course.css';

function Block({ title, children }) {
  if (!children) return null;
  return (
    <section className="cd-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Lines({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="cd-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function Paragraphs({ text }) {
  const lines = String(text || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <div className="cd-copy">
      {lines.map((line, index) => <p key={index}>{line}</p>)}
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { courses, settings } = useContent();
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    return (
      <section className="section container">
        <h1>Course not found</h1>
        <Link className="text-link" to="/courses">Back to courses</Link>
      </section>
    );
  }

  const related = courses.filter((c) => (course.relatedSlugs || []).includes(c.slug));
  const facts = [
    ['Duration', course.duration],
    ['Price', course.price],
    ['Certificate', course.certification],
    ['Dates', course.availableDates],
  ].filter(([, value]) => value);

  return (
    <>
      <Seo
        title={course.seoTitle || `${course.title} | United Scuba`}
        description={course.seoDescription || course.excerpt}
        path={`/courses/${course.slug}`}
        jsonLd={graphJsonLd(courseJsonLd(course, settings), faqJsonLd(course.faqs))}
      />
      <PageHero
        kicker={course.category === 'professional' ? 'Professional' : 'Recreational'}
        title={course.title}
        intro={course.excerpt || course.overview}
      />
      <section className="section section-dark">
        <div className="container">
          {course.heroImage && (
            <div className="cd-hero-photo">
              <img src={course.heroImage} alt={course.title} />
            </div>
          )}

          {facts.length > 0 && (
            <div className="cd-facts">
              {facts.map(([label, value]) => (
                <div className="cd-fact" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}

          <div className="cd-layout">
            <div>
              {course.whoFor && <Block title="Who this is for"><Paragraphs text={course.whoFor} /></Block>}
              {(course.whatYouLearn || []).length > 0 && <Block title="What you will learn"><Lines items={course.whatYouLearn} /></Block>}
              {course.overview && <Block title="The course"><Paragraphs text={course.overview} /></Block>}
              {[course.structure, course.schedule, course.divingDetails].some(Boolean) && (
                <Block title="How it runs">
                  <Paragraphs text={[course.structure, course.schedule, course.divingDetails].filter(Boolean).join('\n')} />
                </Block>
              )}
              <div className="cd-split">
                {(course.included || []).length > 0 && <Block title="Included"><Lines items={course.included} /></Block>}
                {(course.notIncluded || []).length > 0 && <Block title="Not included"><Lines items={course.notIncluded} /></Block>}
              </div>
              {(course.prerequisites || []).length > 0 && <Block title="Eligibility"><Lines items={course.prerequisites} /></Block>}
              {(course.documents || []).length > 0 && <Block title="Documents"><Lines items={course.documents} /></Block>}
              {course.equipment && <Block title="Equipment"><Paragraphs text={course.equipment} /></Block>}
              {course.safety && <Block title="Safety"><Paragraphs text={course.safety} /></Block>}
              {course.paymentInfo && <Block title="Price list"><Paragraphs text={course.paymentInfo} /></Block>}
              {(course.faqs || []).length > 0 && (
                <Block title="Questions">
                  <FaqList items={course.faqs} />
                </Block>
              )}
              {related.length > 0 && (
                <Block title="You might also look at">
                  <div className="cd-related">
                    {related.map((item) => (
                      <Link key={item.slug} to={`/courses/${item.slug}`}>{item.title}</Link>
                    ))}
                  </div>
                </Block>
              )}
            </div>

            <aside className="cd-side">
              <span className="kicker">Book this course</span>
              <p className="price">{course.price || 'Ask for the rate'}</p>
              <p>Tell us your dates. We confirm the start, the meeting point at Beach No. 02, and what to bring.</p>
              <Link className="btn btn-primary" to="/book-now">Book this course</Link>
              {settings.whatsapp && (
                <a className="btn btn-ghost" href={waLink(settings.whatsapp, `Hello, I want to book ${course.title}.`)} target="_blank" rel="noreferrer">
                  WhatsApp the centre
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
