export const PAGE_CONTENT = [
  {
    id: 'home',
    title: 'Home',
    hint: 'Headings and text on the home page',
    fields: [
      { name: 'centreKicker', label: 'Centre label', default: 'Established 2018' },
      { name: 'centreTitle', label: 'Centre heading', default: 'Dive deeper. Explore more.' },
      { name: 'centreText', label: 'Centre text', type: 'textarea', legacy: 'about', default: 'United Scuba Dive Centre, established in 2018, is a professional scuba diving centre in Swaraj Dweep (Havelock Island), Andaman & Nicobar Islands. We offer safe and memorable diving experiences for beginners and certified divers, helping guests discover the vibrant coral reefs and marine life of the Andaman Sea.' },
      { name: 'highlights', label: 'Why choose us — one point per line', type: 'textarea', legacy: 'whyChoose', default: 'Maintaining high standards of diving safety and professionalism.\nProviding quality scuba diving experiences and training.\nCreating a comfortable and enjoyable experience for every diver.\nPromoting responsible and sustainable interaction with marine ecosystems.\nHelping divers build confidence, knowledge, and respect for the ocean.\nCreating unforgettable memories on every dive around Swaraj Dweep.' },
      { name: 'scubaKicker', label: 'Scuba label', default: 'Scuba' },
      { name: 'scubaTitle', label: 'Scuba heading', default: 'First dives and fun dives.' },
      { name: 'scubaText', label: 'Scuba text', type: 'textarea', default: 'A regulator for the first time, or a reef matched to the card you already hold. The briefing happens before anyone gets in.' },
      { name: 'snorkelKicker', label: 'Snorkelling label', default: 'Snorkelling' },
      { name: 'snorkelTitle', label: 'Snorkelling heading', default: 'The reef, from the surface.' },
      { name: 'snorkelText', label: 'Snorkelling text', type: 'textarea', default: 'Shore and boat snorkels with kit, a guide, and a site picked for the conditions that morning.' },
      { name: 'coursesKicker', label: 'Courses label', default: 'Training' },
      { name: 'coursesTitle', label: 'Courses heading', default: 'PADI courses, taught on these reefs.' },
      { name: 'coursesLead', label: 'Courses text', type: 'textarea', default: 'From a first confined-water session to professional programmes. Each course lists what is included, how long it takes, and how to book.' },
      { name: 'reelKicker', label: 'Reel label', default: 'The thrill' },
      { name: 'reelTitle', label: 'Reel heading', default: 'Feel the peak thrill of the Andaman.' },
      { name: 'reelText', label: 'Reel caption', type: 'textarea', default: 'Step off the boat. Your heart races. Clear water and a living reef rush in around you.' },
      { name: 'reelDesc', label: 'Reel description', type: 'textarea', default: 'United Scuba satisfies each guest with the Andaman itself: clear water, living reefs, and a dive suited to the person in our care. A clear briefing, correctly fitted equipment, and close supervision in the water ensure every guest experiences these islands safely and leaves fully satisfied.' },
      { name: 'reelVideo', label: 'Reel video URL', hint: 'Direct MP4 link or a file in the site, such as /assets/scubavideo.mp4.', default: '/assets/scubavideo.mp4' },
      { name: 'galleryKicker', label: 'Gallery label', default: 'On the water' },
      { name: 'galleryTitle', label: 'Gallery heading', default: 'The boat, the reef, the light.' },
      { name: 'galleryLead', label: 'Gallery text', type: 'textarea', default: 'Photographs from Havelock. The same water the courses and fun dives use.' },
      { name: 'reviewsKicker', label: 'Reviews label', default: 'Guests' },
      { name: 'reviewsTitle', label: 'Reviews heading', default: 'What people write after the dive.' },
      { name: 'faqKicker', label: 'FAQ label', default: 'Practical' },
      { name: 'faqTitle', label: 'FAQ heading', default: 'Before you leave Port Blair.' },
      { name: 'ctaTitle', label: 'Closing heading', default: 'Tell us the dates. We will tell you the dive.' },
      { name: 'ctaText', label: 'Closing text', default: 'Courses, a first scuba dive, or a boat day from Beach No. 02.' },
    ],
  },
  {
    id: 'scuba',
    title: 'Scuba diving',
    hint: 'Scuba diving page. Snorkelling copy is edited on this same page.',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Scuba diving' },
      { name: 'title', label: 'Heading', default: 'Dive the Andaman Islands' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Whether you have never used a regulator or you are a certified diver looking for fun dives, we brief, kit and guide you within your limits.' },
      { name: 'expectTitle', label: 'What to expect heading', default: 'What to expect' },
      { name: 'expectText', label: 'What to expect', type: 'textarea', default: 'Arrive for check-in, complete paperwork, fit equipment and listen to the briefing. Sites are chosen for the day’s sea conditions.' },
      { name: 'safetyTitle', label: 'Safety heading', default: 'Safety' },
      { name: 'safetyText', label: 'Safety', type: 'textarea', legacy: 'safety' },
      { name: 'equipmentTitle', label: 'Equipment heading', default: 'Equipment' },
      { name: 'equipmentText', label: 'Equipment', type: 'textarea', legacy: 'equipment' },
      { name: 'whoTitle', label: 'Who can dive heading', default: 'Who can dive?' },
      { name: 'whoText', label: 'Who can dive', type: 'textarea', default: 'Beginners use Discover Scuba / beginner programmes. Certified divers must bring a card. We may ask for a refresher if you have not dived recently.' },
      { name: 'bookTitle', label: 'How to book heading', default: 'How to book' },
      { name: 'bookText', label: 'How to book', type: 'textarea', default: 'Send dates, numbers and certification level via Book Now or WhatsApp. We confirm the plan in writing.' },
    ],
  },
  {
    id: 'snorkelling',
    title: 'Snorkelling',
    hidden: true,
    hint: 'Edited inside Scuba diving',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Snorkelling' },
      { name: 'title', label: 'Heading', default: 'See the reef from the surface' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Guided snorkelling with kit, flotation if you need it, and sites chosen for the day’s conditions.' },
      { name: 'whoTitle', label: 'Who can snorkel heading', default: 'Who can snorkel?' },
      { name: 'whoText', label: 'Who can snorkel', type: 'textarea', default: 'Most swimmers can snorkel. Tell us about children or non-swimmers when you book so we can plan flotation and a suitable site.' },
      { name: 'expectTitle', label: 'What to expect heading', default: 'What to expect' },
      { name: 'expectText', label: 'What to expect', type: 'textarea', default: 'Briefing, kit fitting, time in the water and a return to the centre or jetty. Boat trips add a transfer to the reef.' },
    ],
  },
  {
    id: 'courses',
    title: 'Courses',
    hint: 'Header and group titles on the courses page',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Courses' },
      { name: 'title', label: 'Heading', default: 'PADI training pathway' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'From Discover Scuba to instructor-level programmes. Open a course for structure, duration, inclusions and how to book.' },
      { name: 'recreationalTitle', label: 'Recreational group heading', default: 'Beginner & recreational' },
      { name: 'professionalTitle', label: 'Professional group heading', default: 'Professional' },
      { name: 'faqTitle', label: 'FAQ heading', default: 'Course questions' },
    ],
  },
  {
    id: 'about',
    title: 'About us',
    hint: 'About, mission, vision, certifications, safety and equipment',
    fields: [
      { name: 'kicker', label: 'Label', default: 'About us' },
      { name: 'title', label: 'Heading', default: 'United Scuba Dive Centre' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Established in 2018, United Scuba Dive Centre is a professional scuba diving centre located in Swaraj Dweep (Havelock Island), Andaman & Nicobar Islands, India.' },
      { name: 'storyTitle', label: 'Story heading', default: '' },
      { name: 'story', label: 'About text', type: 'textarea', default: 'With a passion for the ocean and underwater exploration, we provide safe, professional, and memorable scuba diving experiences for beginners, certified divers, and adventure seekers.\n\nOver the years, United Scuba has grown with a strong focus on safety, professional diving standards, quality training, and exceptional underwater experiences. Our team is dedicated to helping every diver discover the incredible coral reefs, marine life, and underwater beauty of the Andaman Islands.\n\nWhether you are experiencing scuba diving for the first time or looking to advance your diving skills, United Scuba offers diving experiences and training designed to make your underwater journey exciting, comfortable, and unforgettable.\n\nOur goal is simple — to connect people with the underwater world while creating a safe, responsible, and enjoyable diving experience.' },
      { name: 'missionTitle', label: 'Mission heading', default: 'Our mission' },
      { name: 'mission', label: 'Mission', type: 'textarea', default: 'Our mission is to provide safe, professional, and unforgettable scuba diving experiences while introducing more people to the beauty of the underwater world.' },
      { name: 'missionPoints', label: 'Mission points — one per line', type: 'textarea', default: 'Maintaining high standards of diving safety and professionalism.\nProviding quality scuba diving experiences and training.\nCreating a comfortable and enjoyable experience for every diver.\nPromoting responsible and sustainable interaction with marine ecosystems.\nHelping divers build confidence, knowledge, and respect for the ocean.' },
      { name: 'visionTitle', label: 'Vision heading', default: 'Our vision' },
      { name: 'vision', label: 'Vision', type: 'textarea', default: 'Our vision is to become a trusted and recognised scuba diving centre in Swaraj Dweep (Havelock), Andaman & Nicobar Islands, known for professional standards, safety, quality training, and exceptional underwater experiences.\n\nWe aim to inspire more people to explore, appreciate, and protect the ocean while building a community of passionate and responsible divers.' },
      { name: 'visionLine', label: 'Vision line', default: 'Explore. Dive. Discover. Protect the Ocean.' },
      { name: 'certTitle', label: 'Certifications heading', default: 'Certifications and affiliations' },
      { name: 'certifications', label: 'Certifications', type: 'textarea', legacy: 'certifications' },
      { name: 'safetyTitle', label: 'Safety heading', default: 'Safety' },
      { name: 'safety', label: 'Safety', type: 'textarea', legacy: 'safety' },
      { name: 'equipmentTitle', label: 'Equipment heading', default: 'Equipment' },
      { name: 'equipment', label: 'Equipment', type: 'textarea', legacy: 'equipment' },
      { name: 'whyTitle', label: 'Why choose us heading', default: 'Why choose United Scuba' },
      { name: 'highlights', label: 'Why choose us — one point per line', type: 'textarea', legacy: 'whyChoose' },
      { name: 'faqTitle', label: 'FAQ heading', default: 'Questions' },
    ],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    hint: 'Header on the gallery page',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Gallery' },
      { name: 'title', label: 'Heading', default: 'Photos and videos' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Scuba, snorkelling and training days from Beach No. 02.' },
    ],
  },
  {
    id: 'blog',
    title: 'Blog',
    hint: 'Header on the blog page',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Blog' },
      { name: 'title', label: 'Heading', default: 'Guides and diving information' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Practical articles to help guests choose a course, try-dive or snorkel trip.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    hint: 'Header, address and the note under opening hours',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Contact' },
      { name: 'title', label: 'Heading', default: 'Talk to the centre before you book the ferry.' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Call, WhatsApp, or send the form. We reply with what is actually running at Beach No. 02.' },
      { name: 'locationShort', label: 'Short location', default: 'Swaraj Dweep (Havelock)' },
      { name: 'addressName', label: 'Place name', default: 'United Scuba Dive Centre' },
      { name: 'addressLine1', label: 'Address line 1', default: 'Sands Marina Resort, Govind Nagar' },
      { name: 'addressLine2', label: 'Address line 2', default: 'Beach No. 02, Swaraj Dweep (Havelock Island)' },
      { name: 'addressLine3', label: 'Address line 3', default: 'Andaman and Nicobar Islands 744211, India' },
      { name: 'hoursNote', label: 'Note under hours', default: 'Arrive 30 minutes before the briefing.' },
    ],
  },
  {
    id: 'book',
    title: 'Book now',
    hint: 'Header and the three booking steps',
    fields: [
      { name: 'kicker', label: 'Label', default: 'Book now' },
      { name: 'title', label: 'Heading', default: 'Plan your dive' },
      { name: 'intro', label: 'Intro', type: 'textarea', default: 'Share dates, group size and the activity you want. We confirm availability, price and what to bring.' },
      { name: 'stepsKicker', label: 'Steps label', default: 'How booking works' },
      { name: 'stepsTitle', label: 'Steps heading', default: 'Three short steps. Then a confirmed dive.' },
      { name: 'step1Title', label: 'Step 1 heading', default: 'Send the form' },
      { name: 'step1Text', label: 'Step 1', type: 'textarea', default: 'Dates, how many people, and whether you want a course, a first dive, or a fun dive.' },
      { name: 'step2Title', label: 'Step 2 heading', default: 'We check the water' },
      { name: 'step2Text', label: 'Step 2', type: 'textarea', default: 'Calendar, group size, and sea conditions. If a day will not work, we say so and offer another.' },
      { name: 'step3Title', label: 'Step 3 heading', default: 'You get it in writing' },
      { name: 'step3Text', label: 'Step 3', type: 'textarea', default: 'Meeting point at Beach No. 02, what is included, and what to bring the night before.' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    hint: 'Privacy policy page',
    fields: [
      { name: 'title', label: 'Heading', default: 'Privacy Policy' },
      { name: 'body', label: 'Page text', type: 'textarea', legacy: 'privacy' },
    ],
  },
  {
    id: 'terms',
    title: 'Terms',
    hint: 'Terms and conditions page',
    fields: [
      { name: 'title', label: 'Heading', default: 'Terms & Conditions' },
      { name: 'body', label: 'Page text', type: 'textarea', legacy: 'terms' },
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation',
    hint: 'Cancellation and refund page',
    fields: [
      { name: 'title', label: 'Heading', default: 'Cancellation / Refund Policy' },
      { name: 'body', label: 'Page text', type: 'textarea', legacy: 'cancellation' },
    ],
  },
];

function legacyValue(settings, key) {
  const value = settings?.[key];
  if (Array.isArray(value)) return value.join('\n');
  return value == null ? '' : String(value);
}

export function fieldValue(settings, pageId, field) {
  const saved = settings?.pages?.[pageId]?.[field.name];
  if (saved != null && String(saved).trim() !== '') return String(saved);
  if (field.legacy) {
    const legacy = legacyValue(settings, field.legacy);
    if (legacy.trim()) return legacy;
  }
  return field.default || '';
}

export function pageFields(settings, pageId) {
  const page = PAGE_CONTENT.find((entry) => entry.id === pageId);
  const values = {};
  if (!page) return values;
  for (const field of page.fields) values[field.name] = fieldValue(settings, pageId, field);
  return values;
}

export function lines(text) {
  return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
}
