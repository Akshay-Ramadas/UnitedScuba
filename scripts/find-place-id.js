/**
 * find-place-id.js
 * ─────────────────────────────────────────────────────────────
 * One-shot helper: finds the Google Place ID for United Scuba
 * Dive Centre and tests that live review data is reachable.
 *
 * Usage:
 *   node scripts/find-place-id.js YOUR_GOOGLE_PLACES_API_KEY
 *
 * Then copy the Place ID into your .env:
 *   GOOGLE_PLACES_API_KEY=<your key>
 *   GOOGLE_PLACE_ID=<place id from this script>
 *   GOOGLE_MAPS_REVIEW_URL=<review url from this script>
 * ─────────────────────────────────────────────────────────────
 */

import 'dotenv/config';

const QUERY   = 'United Scuba Dive Centre Havelock Island Andaman';
const API_KEY = process.argv[2] || process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error('\nUsage:  node scripts/find-place-id.js YOUR_GOOGLE_API_KEY\n');
  console.error('Get a key at: https://console.cloud.google.com/apis/credentials');
  console.error('Enable: "Places API" on that project.\n');
  process.exit(1);
}

async function main() {
  console.log('\n🔍  Searching for:', QUERY);
  console.log('🔑  Using API key:', API_KEY.slice(0, 8) + '…\n');

  /* ── Step 1: Find Place ID ── */
  const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  searchUrl.searchParams.set('input', QUERY);
  searchUrl.searchParams.set('inputtype', 'textquery');
  searchUrl.searchParams.set('fields', 'place_id,name,formatted_address,rating,user_ratings_total');
  searchUrl.searchParams.set('key', API_KEY);

  const searchRes  = await fetch(searchUrl.toString());
  const searchData = await searchRes.json();

  if (searchData.status !== 'OK' || !searchData.candidates?.length) {
    console.error('❌  Search failed:', searchData.status, searchData.error_message || '');
    if (searchData.status === 'REQUEST_DENIED') {
      console.error('\n💡  Make sure the "Places API" is ENABLED in your Google Cloud project.');
      console.error('    https://console.cloud.google.com/apis/library/places-backend.googleapis.com\n');
    }
    process.exit(1);
  }

  const place   = searchData.candidates[0];
  const placeId = place.place_id;

  console.log('✅  Found:');
  console.log('   Name:    ', place.name || '—');
  console.log('   Address: ', place.formatted_address || '—');
  console.log('   Rating:  ', place.rating, `(${place.user_ratings_total} reviews)`);
  console.log('   Place ID:', placeId);

  /* ── Step 2: Fetch full details to confirm ── */
  const detailUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  detailUrl.searchParams.set('place_id', placeId);
  detailUrl.searchParams.set('fields', 'name,rating,user_ratings_total,url');
  detailUrl.searchParams.set('key', API_KEY);

  const detailRes  = await fetch(detailUrl.toString());
  const detailData = await detailRes.json();
  const mapsUrl    = detailData.result?.url || `https://search.google.com/local/writereview?placeid=${placeId}`;

  /* ── Output ── */
  console.log('\n══════════════════════════════════════════════════');
  console.log('  Copy these into your .env (or Hostinger env):');
  console.log('══════════════════════════════════════════════════\n');
  console.log(`GOOGLE_PLACES_API_KEY=${API_KEY}`);
  console.log(`GOOGLE_PLACE_ID=${placeId}`);
  console.log(`GOOGLE_MAPS_REVIEW_URL=${mapsUrl}\n`);
  console.log('══════════════════════════════════════════════════');
  console.log('\n🎉  Done! Restart the server after updating .env.\n');
}

main().catch((err) => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
