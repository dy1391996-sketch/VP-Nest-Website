document.addEventListener('DOMContentLoaded', () => {
  const BOOKING_NUMBER = '919211701998';
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  const yearNodes = document.querySelectorAll('[data-current-year]');

  yearNodes.forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  if (nav && navToggle) {
    const closeMenu = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    };

    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
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
    if (!value) return 'Not specified';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCampaignSource = () => {
    const params = new URLSearchParams(window.location.search);
    const campaignSource = params.get('utm_source') || params.get('ref');

    if (campaignSource) {
      try {
        sessionStorage.setItem('vpNestSource', campaignSource);
      } catch (_) {
        // Booking still works when storage is unavailable.
      }
      return campaignSource;
    }

    try {
      const savedSource = sessionStorage.getItem('vpNestSource');
      if (savedSource) return savedSource;
    } catch (_) {
      // Fall back to referrer or direct traffic.
    }

    if (document.referrer) {
      try {
        return new URL(document.referrer).hostname.replace(/^www\./, '');
      } catch (_) {
        return 'Referral';
      }
    }

    return 'Direct website';
  };

  const createEnquiryId = () => {
    const now = new Date();
    const datePart = localDateValue(now).replaceAll('-', '');
    let randomPart = '';

    if (window.crypto && window.crypto.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      randomPart = values[0].toString(36).slice(-4).toUpperCase().padStart(4, '0');
    } else {
      randomPart = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
    }

    return `VPN-${datePart}-${randomPart}`;
  };

  const trackEvent = (eventName, details = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...details });
    window.dispatchEvent(new CustomEvent('vpnest:conversion', { detail: { eventName, ...details } }));
  };

  const openWhatsApp = (message, enquiryId, origin) => {
    const url = `https://wa.me/${BOOKING_NUMBER}?text=${encodeURIComponent(message)}`;
    trackEvent('whatsapp_booking_click', {
      enquiry_id: enquiryId,
      booking_origin: origin,
      campaign_source: getCampaignSource()
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  document.querySelectorAll(`a[href^="https://wa.me/${BOOKING_NUMBER}"]`).forEach((link) => {
    link.addEventListener('click', () => {
      const enquiryId = createEnquiryId();
      const source = getCampaignSource();

      try {
        const url = new URL(link.href);
const originalMessage = (url.searchParams.get('text') || 'Hello VP Nest, I want to check availability.').replace(/\n\nEnquiry ID:[\s\S]*$/, '');
        url.searchParams.set('text', `${originalMessage}\n\nEnquiry ID: ${enquiryId}\nSource: ${source}`);
        link.href = url.toString();
      } catch (_) {
        // Keep the original WhatsApp link if URL parsing is unavailable.
      }

      trackEvent('whatsapp_cta_click', {
        enquiry_id: enquiryId,
        cta_text: link.textContent.trim(),
        campaign_source: source
      });
    });
  });

  const quickForm = document.getElementById('quickBookingForm');
  if (quickForm) {
    const quickDate = quickForm.querySelector('[name="checkinDate"]');
    if (quickDate) quickDate.min = localDateValue();

    quickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!quickForm.reportValidity()) return;

      const data = new FormData(quickForm);
      const enquiryId = createEnquiryId();
      const source = getCampaignSource();
      const message = [
        'Hello VP Nest, I want to check studio availability.',
        '',
        `Enquiry ID: ${enquiryId}`,
        `Source: ${source}`,
        `Check-in date: ${formatDate(data.get('checkinDate'))}`,
        `Preferred time: ${data.get('checkinTime') || 'Not specified'}`,
        `Stay duration: ${data.get('duration') || 'Not specified'}`,
        '',
        'Please share the available options and current price.'
      ].join('\n');

      openWhatsApp(message, enquiryId, 'homepage_quick_form');
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');
  if (bookingForm) {
    const dateInput = bookingForm.querySelector('[name="checkinDate"]');
    const phoneInput = bookingForm.querySelector('[name="phone"]');
    if (dateInput) dateInput.min = localDateValue();

    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        const digitCount = phoneInput.value.replace(/\D/g, '').length;
        phoneInput.setCustomValidity(digitCount >= 10 && digitCount <= 15 ? '' : 'Enter a valid 10 to 15 digit phone number.');
      });
    }

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!bookingForm.reportValidity()) return;

      const data = new FormData(bookingForm);
      const enquiryId = createEnquiryId();
      const source = getCampaignSource();
      const message = [
        'Hello VP Nest, I would like to book a furnished studio stay.',
        '',
        `Enquiry ID: ${enquiryId}`,
        `Source: ${source}`,
        `Name: ${data.get('name') || 'Not specified'}`,
        `Phone: ${data.get('phone') || 'Not specified'}`,
        `Check-in date: ${formatDate(data.get('checkinDate'))}`,
        `Check-in time: ${data.get('checkinTime') || 'Not specified'}`,
        `Duration: ${data.get('duration') || 'Not specified'}`,
        `Guests: ${data.get('guests') || 'Not specified'}`,
        `Stay type: ${data.get('stayType') || 'Standard furnished studio'}`,
        `Message: ${data.get('message') || 'No additional message'}`,
        '',
        'Please confirm availability, final price and booking terms.'
      ].join('\n');

      if (formStatus) formStatus.textContent = `Enquiry ${enquiryId} ready — opening WhatsApp…`;
      openWhatsApp(message, enquiryId, 'contact_booking_form');
    });
  }
});
