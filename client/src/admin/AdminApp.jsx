import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from './auth.jsx';
import RequireAdmin from './RequireAdmin.jsx';
import AdminLayout from './AdminLayout.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import Enquiries from './Enquiries.jsx';
import CoursesAdmin from './CoursesAdmin.jsx';
import ActivitiesAdmin from './ActivitiesAdmin.jsx';
import GalleryAdmin from './GalleryAdmin.jsx';
import FaqsAdmin from './FaqsAdmin.jsx';
import ReviewsAdmin from './ReviewsAdmin.jsx';
import BlogAdmin from './BlogAdmin.jsx';
import SettingsAdmin from './SettingsAdmin.jsx';

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          element={(
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          )}
        >
          <Route index element={<Dashboard />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="courses" element={<CoursesAdmin />} />
          <Route path="activities" element={<ActivitiesAdmin />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="faqs" element={<FaqsAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
          <Route path="blog" element={<BlogAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}
