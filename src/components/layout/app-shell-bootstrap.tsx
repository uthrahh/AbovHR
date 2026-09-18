// Sets data-standalone on <html> before first paint so the app shell
// (bottom tabs, minimal header) can render for installed-app users only,
// with zero flash of the website chrome. Runs as a blocking inline script
// (next/script strategy="beforeInteractive") rather than a useEffect, which
// would only run after the website chrome had already painted once.
const DETECT_STANDALONE_SCRIPT = `
try {
  var nav = window.navigator;
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    nav.standalone === true; // legacy iOS Safari
  if (isStandalone) {
    document.documentElement.setAttribute('data-standalone', 'true');
  }
} catch (e) {}
`;

export function appShellBootstrapScript() {
  return DETECT_STANDALONE_SCRIPT;
}
