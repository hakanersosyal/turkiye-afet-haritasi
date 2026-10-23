// Türkiye Afet Haritası · Simgeler, logo ve pusula (SVG)
'use strict';

const ICON = {
  iller: '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  deprem: '<path d="M2 12.5h4l2-5 3 11 3-14 2.5 10 1.5-2H22"/>',
  sel: '<path d="M12 2.8s-3.6 4-3.6 6.4a3.6 3.6 0 0 0 7.2 0c0-2.4-3.6-6.4-3.6-6.4z"/><path d="M2 16.2c1.7 0 1.7-1.4 3.3-1.4s1.7 1.4 3.4 1.4 1.6-1.4 3.3-1.4 1.6 1.4 3.3 1.4 1.7-1.4 3.4-1.4 1.6 1.4 3.3 1.4M2 20.6c1.7 0 1.7-1.4 3.3-1.4s1.7 1.4 3.4 1.4 1.6-1.4 3.3-1.4 1.6 1.4 3.3 1.4 1.7-1.4 3.4-1.4 1.6 1.4 3.3 1.4"/>',
  heyelan: '<path d="M2 20.5h20"/><path d="M2.5 20.5 18 5.5h4"/><path d="m7.5 15.6 2.9-2.8-2.8-2.9-2.9 2.8z"/><path d="m10.1 11.1 1.4-1.4M9.6 9.2l1.5-1.4"/><circle cx="3.9" cy="17.4" r="1.1"/>',
  cig: '<path d="M2 20.5 9.5 8l4 6 2.5-3.5 6 10z"/><path d="M7.2 11.8 9.5 8l2.2 3.3-1.2 1-1-1.2-1 1.2z"/><path d="M18.5 2.5v5M16.3 3.75l4.4 2.5M16.3 6.25l4.4-2.5"/>',
  yangin: '<path d="M12 21.5a6.5 6.5 0 0 0 6.5-6.5c0-3.6-2.4-5.6-3.6-8.8-1.3 2.1-2 3.1-2.3 5.1-1.2-.9-1.8-2.2-1.8-3.6C8.3 9.6 5.5 11.8 5.5 15a6.5 6.5 0 0 0 6.5 6.5z"/><path d="M12 21.5a2.8 2.8 0 0 1-2.8-2.8c0-1.8 1.4-2.8 2.8-4.6 1.4 1.8 2.8 2.8 2.8 4.6a2.8 2.8 0 0 1-2.8 2.8z"/>',
  kuraklik: '<circle cx="12" cy="8.5" r="3.2"/><path d="M12 2v1.6M12 13.4V15M5.5 8.5h1.6M16.9 8.5h1.6M7.4 3.9l1.1 1.1M15.5 12l1.1 1.1M7.4 13.1l1.1-1.1M15.5 5l1.1-1.1"/><path d="M2 18.5h20M7 18.5 8.6 21M14.5 18.5 13 21M18.5 18.5l1.5 2"/>',
  tsunami: '<path d="M2 17.5c3.2 0 4.6-1.6 5.6-4.1C9.2 9.3 12 6 16.4 6c3 0 5 1.9 5.6 3.9-2-.9-4.4-.5-5.4 1.5-1.1 2.3.4 4.6 3 4.6"/><path d="M2 21.5c2 0 3-1.1 5-1.1s3 1.1 5 1.1 3-1.1 5-1.1 3 1.1 5 1.1"/>',
  volkan: '<path d="M2.5 21 9 11.5h6L21.5 21z"/><path d="M10.6 11.5c.4 1.6-.4 2.7-1.4 3.6M13.6 11.5c-.2 1.3.6 2.3 1.6 3"/><path d="M9.2 7.4c-1.6-.1-2.4-1.5-1.6-2.6.6-.9 1.6-.9 2.2-.5.4-1.5 2.4-2 3.5-1 .6-.9 2.6-.7 2.9.8.9.3 1.3 1.7.4 2.6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><circle cx="12" cy="12" r="2.5"/>',
  full: '<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/>',
  pause: '<path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" fill="currentColor"/>',
  prev: '<path d="M15 5 8 12l7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  phone: '<path d="M5.2 3.5h3.3l1.6 4-2.1 1.3a11 11 0 0 0 5.2 5.2l1.3-2.1 4 1.6v3.3a2 2 0 0 1-2.2 2C9.7 18.2 5.8 14.3 5.2 7.7a2 2 0 0 1 2-2.2"/>',
  book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
  bag: '<rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5a3 3 0 0 1 6 0v2M4 12h16M12 11v3"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2.3-2.5 3.8M12 17v.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  fault: '<path d="M3 20 8 13l-2-3 6-7M21 4l-5 7 2 3-6 7"/>',
  bulb: '<path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 2.5a6.3 6.3 0 0 0-3.9 11.3c.8.7 1.4 1.6 1.4 2.7h5c0-1.1.6-2 1.4-2.7A6.3 6.3 0 0 0 12 2.5z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8.5 13.5h3v3h-3z"/>'
};
const ic = (name, cls) => `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ""}</svg>`;

const LOGO = '<svg class="logo" viewBox="0 0 40 40" aria-hidden="true"><rect class="c-signal" width="40" height="40" rx="11"/><path class="s-signal-ink" fill="none" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" d="M5 22h7l3-9 5 16 4-20 3 13 2-4h6"/></svg>';
const COMPASS = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle class="cmp-bg" cx="32" cy="32" r="29"/><path class="cmp-n" d="M32 8 38 32H26z"/><path class="cmp-s" d="M32 56 26 32h12z"/><circle class="cmp-bg" cx="32" cy="32" r="3"/><text class="cmp-t" x="32" y="6.5" text-anchor="middle">K</text></svg>';
