import { Link } from 'react-router-dom';
import { Seo } from '../lib/seo.jsx';

export default function NotFound() {
  return (
    <div className="not-found">
      <Seo title="Page not found | United Scuba" description="This page does not exist." path="/404" />
      <div>
        <p className="kicker">404</p>
        <h1>This page is off the chart</h1>
        <p className="muted">The link may have changed. Head home or book a dive instead.</p>
        <p>
          <Link className="btn btn-primary" to="/">Home</Link>
          {' '}
          <Link className="btn btn-ghost" to="/book-now">Book now</Link>
        </p>
      </div>
    </div>
  );
}
