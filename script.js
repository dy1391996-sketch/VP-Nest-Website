document.addEventListener('DOMContentLoaded', () => {
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

  const formatDate = (value) => {
    if (!value) return 'Not specified';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openWhatsApp = (message) => {
    const url = `https://wa.me/919211701998?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const quickForm = document.getElementById('quickBookingForm');
  if (quickForm) {
    const quickDate = quickForm.querySelector('[name="checkinDate"]');
    if (quickDate) quickDate.min = new Date().toISOString().split('T')[0];

    quickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(quickForm);
      const message = [
        'Hello VP Nest, I want to check studio availability.',
        '',
        `Check-in date: ${formatDate(data.get('checkinDate'))}`,
        `Preferred time: ${data.get('checkinTime') || 'Not specified'}`,
        `Stay duration: ${data.get('duration') || 'Not specified'}`,
        '',
        'Please share the available options and current price.'
      ].join('\n');
      openWhatsApp(message);
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  const formStatus = document.getElementById('formStatus');
  if (bookingForm) {
    const dateInput = bookingForm.querySelector('[name="checkinDate"]');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(bookingForm);
      const message = [
        'Hello VP Nest, I would like to book a furnished studio stay.',
        '',
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

      if (formStatus) formStatus.textContent = 'Opening WhatsApp with your booking details…';
      openWhatsApp(message);
    });
  }
});
