// Entry: static host without SPA fallback (case study artifact) opens the app as /index.html, a path the
// router has no route for. Drop the file name before expo-router reads the URL, then start the router.
if (typeof window !== 'undefined' && window.location && window.location.pathname.endsWith('/index.html')) {
  window.history.replaceState(window.history.state, '', window.location.pathname.slice(0, -'index.html'.length) + window.location.search + window.location.hash);
}
require('expo-router/entry');
