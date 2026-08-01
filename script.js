(function () {
  const c = window.VP_NEST_CONFIG;
  if (!c) return;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const track = (event, params = {}) => window.gtag?.("event", event, params);
  const ref = () => `VPN-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const source = () => new URLSearchParams(location.search).get("source") || localStorage.getItem("vpn_source") || "Website";
  const waUrl = (message) => `https://wa.me/${c.phone}?text=${encodeURIComponent(message)}`;
  const defaultMessage = () => `Hello VP Nest,\n\nI want to check studio availability.\n\nPlease share:\n- Available studio\n- Real photos and video\n- Final price\n- Exact check-in and checkout\n- Booking terms\n- Payment instructions\n\nSource: ${source()}\nEnquiry Reference: ${ref()}`;

  const qSource = new URLSearchParams(location.search).get("source");
  if (qSource) localStorage.setItem("vpn_source", qSource);
  $$('input[type="date"]').forEach((input) => {
    const now = new Date();
    input.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  $$('[data-current-year]').forEach((el) => el.textContent = new Date().getFullYear());
  $$('[data-phone]').forEach((el) => el.textContent = c.phoneDisplay);
  $$('[data-phone-link]').forEach((el) => el.href = `tel:+${c.phone}`);
  $$('[data-official-phone]').forEach((el) => el.textContent = c.officialPhoneDisplay);
  $$('[data-official-phone-link]').forEach((el) => el.href = `tel:+${c.officialPhone}`);
  $$('[data-email]').forEach((el) => { el.textContent = c.email; el.href = `mailto:${c.email}`; });
  $$('[data-whatsapp]').forEach((el) => { el.href = waUrl(el.dataset.message || defaultMessage()); el.target = "_blank"; el.rel = "noopener"; });

  const navToggle = $('.nav-toggle');
  navToggle?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  $$('[data-track]').forEach((el) => el.addEventListener('click', () => track(el.dataset.track)));
  $$('[data-whatsapp]').forEach((el) => el.addEventListener('click', () => track('whatsapp_click', { source: source() })));
  $$('[data-phone-link]').forEach((el) => el.addEventListener('click', () => track('phone_click')));
  $$('[data-official-phone-link]').forEach((el) => el.addEventListener('click', () => track('official_phone_click')));

  const pricing = $('#pricingTables');
  if (pricing) {
    pricing.innerHTML = Object.entries(c.pricing).map(([key, rows]) => `<article class="price-card"><p class="kicker">${key === 'weekdays' ? 'MONDAY–FRIDAY' : 'SATURDAY–SUNDAY'}</p><h3>${key[0].toUpperCase() + key.slice(1)}</h3>${rows.map(([stay, price]) => `<div class="price-row"><span>${stay}</span><strong>${price}</strong></div>`).join('')}</article>`).join('');
  }
  const amenities = $('#amenitiesGrid');
  if (amenities) amenities.innerHTML = c.amenities.map((x) => `<div class="amenity"><span aria-hidden="true">✓</span><p>${x}</p></div>`).join('');

  const gallery = $('#galleryGrid');
  const lightbox = $('#lightbox');
  let activeImage = 0;
  if (gallery && c.gallery.length) {
    gallery.innerHTML = c.gallery.map((item, index) => `<button class="concept-card" type="button" data-gallery-index="${index}" aria-label="Open ${item.category} concept visual"><img src="${item.src}" alt="${item.alt}" width="${item.width}" height="${item.height}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span class="concept-card-overlay"><strong>${item.category}</strong><span>AI CONCEPT</span></span></button>`).join('');
  }
  const showImage = (index) => {
    if (!lightbox || !c.gallery.length) return;
    activeImage = (index + c.gallery.length) % c.gallery.length;
    const item = c.gallery[activeImage];
    $('#lightboxImage').src = item.src;
    $('#lightboxImage').alt = item.alt;
    $('#lightboxCaption').textContent = item.category;
    $('#lightboxCounter').textContent = `${activeImage + 1} / ${c.gallery.length}`;
  };
  gallery?.addEventListener('click', (event) => {
    const card = event.target.closest('[data-gallery-index]');
    if (!card) return;
    showImage(Number(card.dataset.galleryIndex));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox-close')?.focus();
    track('gallery_photo_open', { category: c.gallery[activeImage].category });
  });
  const closeLightbox = () => { if (lightbox) lightbox.hidden = true; document.body.style.overflow = ''; };
  $('.lightbox-close')?.addEventListener('click', closeLightbox);
  $('.lightbox-prev')?.addEventListener('click', () => showImage(activeImage - 1));
  $('.lightbox-next')?.addEventListener('click', () => showImage(activeImage + 1));
  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(activeImage - 1);
    if (event.key === 'ArrowRight') showImage(activeImage + 1);
  });
  let touchStartX = 0;
  lightbox?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  lightbox?.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 45) showImage(activeImage + (delta < 0 ? 1 : -1));
  }, { passive: true });

  async function saveLead(payload) {
    const leads = JSON.parse(localStorage.getItem('vpn_leads') || '[]');
    leads.push(payload); localStorage.setItem('vpn_leads', JSON.stringify(leads.slice(-20)));
    if (!c.leadWebhookUrl) return;
    try {
      const res = await fetch(c.leadWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Webhook failed');
      track('lead_webhook_success');
    } catch { track('lead_webhook_failure'); }
  }

  const form = $('#bookingAssistant');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const enquiryReference = ref();
    const recommendation = /night/i.test(d.duration) ? 'Multiple-Night Stay' : /24/i.test(d.duration) ? '24-Hour Stay' : /4|6/i.test(d.duration) ? 'Short Stay' : 'Day Stay';
    const payload = { enquiryReference, ...d, recommendation, source: source(), pageUrl: location.href, createdTimestamp: new Date().toISOString() };
    await saveLead(payload);
    const message = `Hello VP Nest,\n\nI want to check availability.\n\nName: ${d.name}\nMobile: ${d.phone}\nCheck-in Date: ${d.checkinDate}\nCheck-in Time: ${d.checkinTime}\nDuration: ${d.duration}\nGuests: ${d.guests}\nStudio Preference: ${d.preference}\nBudget: ${d.budget}\nVisit Purpose: ${d.purpose}\nOptional Request: ${d.request || 'None'}\nSuggested Stay: ${recommendation}\nSource: ${source()}\nEnquiry Reference: ${enquiryReference}\n\nPlease share:\n- Available studio\n- Real photos and video\n- Final price\n- Exact check-in and checkout\n- Booking terms\n- Payment instructions`;
    $('#assistantResult').innerHTML = `<strong>Suggested: ${recommendation}</strong><span>Availability and final price require manual confirmation on WhatsApp.</span>`;
    $('#assistantResult').hidden = false;
    track('booking_assistant_complete', { recommendation });
    window.open(waUrl(message), '_blank', 'noopener');
  });
  form?.addEventListener('focusin', () => track('booking_assistant_start'), { once: true });

  const review = $('#googleReviewButton');
  if (review) {
    if (c.googleReviewUrl) { review.href = c.googleReviewUrl; review.textContent = 'Read and Review VP Nest on Google'; }
    else { review.href = waUrl('Hello VP Nest, please share your verified Google review link.'); review.textContent = 'Request Google Review Link on WhatsApp'; }
    review.addEventListener('click', () => track('google_review_click'));
  }

  if (/^G-[A-Z0-9]+$/.test(c.analyticsId)) {
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${c.analyticsId}`; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', c.analyticsId);
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(location.hostname)) {
    const va = document.createElement('script');
    va.defer = true; va.src = '/_vercel/insights/script.js'; document.head.appendChild(va);
  }
  const viewed = new Set();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting || viewed.has(entry.target.id)) return;
    viewed.add(entry.target.id); track(entry.target.id === 'pricingTables' ? 'pricing_view' : 'gallery_view');
  }), { threshold: .25 }) : null;
  ['pricingTables', 'galleryGrid'].forEach((id) => { const el = document.getElementById(id); if (el && observer) observer.observe(el); });
})();
