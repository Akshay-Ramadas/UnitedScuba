export default function PageHero({ kicker, title, intro, image }) {
  return (
    <section className={`page-hero${image ? ' has-photo' : ''}`} style={image ? { backgroundImage: `url(${image})` } : undefined}>
      <div className="container">
        {kicker && <span className="kicker">{kicker}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}
