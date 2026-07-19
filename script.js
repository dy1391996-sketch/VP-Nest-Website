document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim() || 'Guest';
    const email = data.get('email')?.toString().trim() || '';
    const phone = data.get('phone')?.toString().trim() || '';
    const service = data.get('service')?.toString() || 'General inquiry';
    const message = data.get('message')?.toString().trim() || '';

    const mailtoLink = `mailto:thestudio99stay@gmail.com?subject=${encodeURIComponent(`New inquiry from ${name} - ${service}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}`)}`;

    formStatus.textContent = 'Thank you! Your inquiry has been prepared for VP Nest.';
    form.reset();
    window.location.href = mailtoLink;
  });
});
