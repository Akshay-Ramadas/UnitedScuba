export default function PageHero({ kicker, title, intro, image }) {
  const photo = image ? { '--hero-photo': `url("${String(image).replace(/"/g, '')}")` } : undefined;
  return (
    <section className={`page-hero${image ? ' has-photo' : ''}`} style={photo}>
      <div className="container">
        {kicker && <span className="kicker">{kicker}</span>}
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}
