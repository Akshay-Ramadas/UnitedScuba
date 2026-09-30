import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const ContentContext = createContext(null);

const empty = {
  settings: {},
  courses: [],
  activities: [],
  faqs: [],
  reviews: [],
  posts: [],
  gallery: [],
};

function byOrder(list) {
  return [...(list || [])].sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
}

export function ContentProvider({ children }) {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/content')
      .then((next) => setData({
        ...next,
        courses: byOrder(next.courses),
        activities: byOrder(next.activities),
        reviews: byOrder(next.reviews),
        posts: byOrder(next.posts),
        gallery: byOrder(next.gallery),
        faqs: [...(next.faqs || [])].sort((a, b) => (
          String(a.page || '').localeCompare(String(b.page || ''))
          || (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0)
        )),
      }))
      .catch(() => setData(empty))
      .finally(() => setLoading(false));
  }, []);

  return <ContentContext.Provider value={{ ...data, loading }}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext) || { ...empty, loading: true };
}
