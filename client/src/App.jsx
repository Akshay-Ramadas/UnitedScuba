import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ContentProvider, useContent } from './hooks/useContent.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import ScubaDiving from './pages/ScubaDiving.jsx';
import Snorkelling from './pages/Snorkelling.jsx';
import ActivityDetail from './pages/ActivityDetail.jsx';
import Gallery from './pages/Gallery.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import Contact from './pages/Contact.jsx';
import BookNow from './pages/BookNow.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';
import { lazy, Suspense, useEffect } from 'react';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function Ga4() {
  const { settings } = useContent();
  const id = settings.ga4Id || import.meta.env.VITE_GA4_ID;
  useEffect(() => {
    if (!id) return undefined;
    if (document.getElementById('ga4')) return undefined;
    const s = document.createElement('script');
    s.id = 'ga4';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id);
    return undefined;
  }, [id]);
  return null;
}

function Public() {
  return (
    <Layout>
      <Ga4 />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/scuba-diving" element={<ScubaDiving />} />
        <Route path="/scuba-diving/:slug" element={<ActivityDetail />} />
        <Route path="/snorkelling" element={<Snorkelling />} />
        <Route path="/snorkelling/:slug" element={<ActivityDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/book-now" element={<BookNow />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/cancellation" element={<Legal type="cancellation" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route
            path="/admin/*"
            element={(
              <Suspense fallback={<p style={{ padding: 24 }}>Loading admin…</p>}>
                <AdminApp />
              </Suspense>
            )}
          />
          <Route path="*" element={<Public />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}
