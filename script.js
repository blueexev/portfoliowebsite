// =========================================================
// PORTFOLIO SCRIPT — nav toggle, active-link tracking, reveal-on-scroll
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
    // close menu after a link is tapped (mobile)
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // ---- highlight active nav link while scrolling (index page only) ----
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length) {
    const setActive = () => {
      let currentId = sections[0].id;
      const scrollPos = window.scrollY + 140;
      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) currentId = sec.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
      });
    };
    document.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  // ---- reveal-on-scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

});
