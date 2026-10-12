function beginHydration() {
  void import('./hydrate.client').then(({ hydrate }) => hydrate());
}

// Keep the server-rendered page usable and visible before React performs the
// heavier storefront hydration work. Native links remain functional during
// this one-frame handoff.
window.requestAnimationFrame(() => {
  window.setTimeout(beginHydration, 0);
});
