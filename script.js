window.va = window.va || function () {
  (window.vaq = window.vaq || []).push(arguments);
};

const vercelAnalytics = document.createElement('script');
vercelAnalytics.defer = true;
vercelAnalytics.src = '/_vercel/insights/script.js';
if (!['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)) {
  document.head.appendChild(vercelAnalytics);
}

// Booking and review configuration. Add the official Google review URL only after the owner verifies it.
const VP_NEST_CONFIG = Object.freeze({
  whatsappNumber: '919211701998',
  googleReviewUrl: '' // TODO(owner): Replace with the verified VP Nest Google review URL.
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  if (nav && navToggle && navLinksContainer) {
    if (!navLinksContainer.id) navLinksContainer.id = 'primary-navigation';
    navToggle.setAttribute('aria-controls', navLinksContainer.id);

    const closeMenu = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
    };

    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-open', open);
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const localDateValue = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const normaliseSource = (value) => {
    const source = String(value || '').trim().slice(0, 60);
    if (!source) return '';

    const knownSources = {
      instagram: 'Instagram',
      google: 'Google',
      whatsapp: 'WhatsApp',
      facebook: 'Facebook'
    };

    return knownSources[source.toLowerCase()] || source;
  };

  const getCampaignSource = () => {
    const params = new URLSearchParams(window.location.search);
    const querySource = normaliseSource(
      params.get('source') || params.get('utm_source') || params.get('ref')
    );

    if (querySource) {
      try {
        sessionStorage.setItem('vpNestSource', querySource);
      } catch (_) {
        // Source tracking is non-essential; booking continues without storage.
      }
      return querySource;
    }

    try {
      const savedSource = normaliseSource(sessionStorage.getItem('vpNestSource'));
      if (savedSource) return savedSource;
    } catch (_) {
      // Fall through to the required direct-traffic label.
    }

    return 'Direct Website';
  };

  const createBookingReference = () => {
    const now = new Date();
    const datePart = [
      String(now.getFullYear()).slice(-2),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
    let recentReferences = [];
    try {
      recentReferences = JSON.parse(sessionStorage.getItem('vpNestBookingReferences') || '[]');
      if (!Array.isArray(recentReferences)) recentReferences = [];
    } catch (_) {
      recentReferences = [];
    }

    let bookingReference = '';
    do {
      let randomPart;
      if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint16Array(1);
        window.crypto.getRandomValues(values);
        randomPart = 1000 + (values[0] % 9000);
      } else {
        randomPart = Math.floor(1000 + Math.random() * 9000);
      }
      bookingReference = `VPN-${datePart}-${randomPart}`;
    } while (recentReferences.includes(bookingReference));

    try {
      recentReferences.push(bookingReference);
      sessionStorage.setItem('vpNestBookingReferences', JSON.stringify(recentReferences.slice(-100)));
    } catch (_) {
      // The generated reference remains usable when storage is unavailable.
    }

    return bookingReference;
  };

  const availabilityMessage = ({
    bookingReference = createBookingReference(),
    source = getCampaignSource(),
    name = '',
    mobile = '',
    checkinDate = '',
    checkinTime = '',
    duration = '',
    guests = '',
    room = ''
  } = {}) => [
    'Hello VP Nest, I want to check studio availability.',
    '',
    `Check-in Date: ${formatDate(checkinDate)}`,
    `Check-in Time: ${checkinTime}`,
    `Stay Duration: ${duration}`,
    `Number of Guests: ${guests}`,
    `Preferred Room: ${room}`,
    `Name: ${name}`,
    `Mobile Number: ${mobile}`,
    `Source: ${source}`,
    `Booking Reference: ${bookingReference}`
  ].join('\n');

  const trackEvent = (eventName, details = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...details });
    window.dispatchEvent(new CustomEvent('vpnest:conversion', {
      detail: { eventName, ...details }
    }));
  };

  const buildWhatsAppUrl = (message) =>
    `https://wa.me/${VP_NEST_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  const openWhatsApp = (message, bookingReference, origin) => {
    trackEvent('whatsapp_booking_click', {
      booking_reference: bookingReference,
      booking_origin: origin,
      campaign_source: getCampaignSource()
    });
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const createSiteBookingActions = () => {
    if (document.querySelector('.site-booking-actions')) return;

    const actions = document.createElement('aside');
    actions.className = 'site-booking-actions';
    actions.setAttribute('aria-label', 'Booking actions');
    actions.innerHTML = `
      <a class="btn btn-blue" href="https://wa.me/${VP_NEST_CONFIG.whatsappNumber}" data-availability-cta target="_blank" rel="noopener">Check Availability</a>
      <a class="btn btn-whatsapp" href="https://wa.me/${VP_NEST_CONFIG.whatsappNumber}" data-whatsapp-booking target="_blank" rel="noopener">Book on WhatsApp</a>
    `;
    document.body.appendChild(actions);
    document.body.classList.add('has-booking-actions');
  };

  createSiteBookingActions();

  document.querySelectorAll('[data-availability-cta], [data-whatsapp-booking]').forEach((link) => {
    link.addEventListener('click', () => {
      const bookingReference = createBookingReference();
      link.href = buildWhatsAppUrl(availabilityMessage({ bookingReference }));
      trackEvent('whatsapp_booking_click', {
        booking_reference: bookingReference,
        booking_origin: link.hasAttribute('data-availability-cta') ? 'site_check_availability' : 'site_book_whatsapp',
        campaign_source: getCampaignSource()
      });
    });
  });

  document.querySelectorAll(`a[href^="https://wa.me/${VP_NEST_CONFIG.whatsappNumber}"]`).forEach((link) => {
    if (link.matches('[data-whatsapp-review-request], [data-availability-cta], [data-whatsapp-booking]')) return;

    link.addEventListener('click', () => {
      const bookingReference = createBookingReference();
      const source = getCampaignSource();
      let originalMessage = '';

      try {
        originalMessage = (new URL(link.href).searchParams.get('text') || '')
          .replace(/\n\nSource:[\s\S]*$/, '');
      } catch (_) {
        // The structured availability fallback below remains usable.
      }

      const isAvailabilityLink = /check (studio )?availability/i.test(originalMessage)
        || /check current availability/i.test(link.textContent);
      const message = isAvailabilityLink
        ? availabilityMessage({ bookingReference, source })
        : [
            originalMessage || 'Hello VP Nest, I want booking support.',
            '',
            `Source: ${source}`,
            `Booking Reference: ${bookingReference}`
          ].join('\n');

      link.href = buildWhatsAppUrl(message);
      trackEvent('whatsapp_booking_click', {
        booking_reference: bookingReference,
        booking_origin: 'page_whatsapp_link',
        campaign_source: source
      });
    });
  });

  const setDateValidation = (form) => {
    const dateInput = form?.querySelector('[name="checkinDate"]');
    if (!dateInput) return null;

    const today = localDateValue();
    dateInput.min = today;
    const validate = () => {
      dateInput.setCustomValidity(
        dateInput.value && dateInput.value < today
          ? 'Check-in date cannot be in the past.'
          : ''
      );
    };
    dateInput.addEventListener('input', validate);
    dateInput.addEventListener('change', validate);
    return validate;
  };

  const quickForm = document.getElementById('quickBookingForm');
  if (quickForm) {
    const validateDate = setDateValidation(quickForm);
    quickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      validateDate?.();
      if (!quickForm.reportValidity()) return;

      const data = new FormData(quickForm);
      const bookingReference = createBookingReference();
      const message = availabilityMessage({
        bookingReference,
        checkinDate: data.get('checkinDate'),
        checkinTime: data.get('checkinTime'),
        duration: data.get('duration')
      });

      openWhatsApp(message, bookingReference, 'homepage_quick_form');
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');
  if (bookingForm) {
    const validateDate = setDateValidation(bookingForm);
    const phoneInput = bookingForm.querySelector('[name="phone"]');

    const validatePhone = () => {
      if (!phoneInput) return;
      const digitCount = phoneInput.value.replace(/\D/g, '').length;
      phoneInput.setCustomValidity(
        digitCount >= 10 && digitCount <= 15
          ? ''
          : 'Enter a valid 10 to 15 digit mobile number.'
      );
    };

    phoneInput?.addEventListener('input', validatePhone);

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      validateDate?.();
      validatePhone();
      if (!bookingForm.reportValidity()) return;

      const data = new FormData(bookingForm);
      const bookingReference = createBookingReference();
      const message = availabilityMessage({
        bookingReference,
        name: data.get('name'),
        mobile: data.get('phone'),
        checkinDate: data.get('checkinDate'),
        checkinTime: data.get('checkinTime'),
        duration: data.get('duration'),
        guests: data.get('guests'),
        room: data.get('stayType')
      });

      if (formStatus) {
        formStatus.textContent = `Booking reference ${bookingReference} is ready — opening WhatsApp…`;
      }
      openWhatsApp(message, bookingReference, 'contact_booking_form');
    });
  }

  const googleReviewButton = document.getElementById('googleReviewButton');
  if (googleReviewButton && VP_NEST_CONFIG.googleReviewUrl) {
    googleReviewButton.disabled = false;
    googleReviewButton.removeAttribute('aria-disabled');
    googleReviewButton.addEventListener('click', () => {
      window.open(VP_NEST_CONFIG.googleReviewUrl, '_blank', 'noopener,noreferrer');
    });
  }

  document.querySelectorAll('[data-whatsapp-review-request]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = 'Thank you for staying with VP Nest. We hope you had a comfortable experience. Please share your genuine Google review using our official review link.';
      button.href = buildWhatsAppUrl(message);
      trackEvent('whatsapp_review_request_click');
    });
  });
});
