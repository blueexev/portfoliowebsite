// =========================================================
// PORTFOLIO SCRIPT
// nav toggle, active-link tracking, reveal-on-scroll,
// custom cursor, tilt cards, draggable corkboard
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
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

  // =========================================================
  // CUSTOM CURSOR — only on devices with a real mouse
  // =========================================================
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer) {
    document.body.classList.add('has-custom-cursor');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    const ringLabel = document.createElement('span');
    ring.appendChild(ringLabel);
    document.body.append(dot, ring);

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let ringX = mouseX, ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
    });

    // smooth trailing ring
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // grow + label on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .sticker, .ticket');
    hoverTargets.forEach(el => {
      const label = el.classList.contains('sticker') ? 'Drag'
                  : el.classList.contains('ticket') ? 'View'
                  : el.tagName === 'BUTTON' ? 'Tap'
                  : 'Open';
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-active');
        ringLabel.textContent = label;
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-active');
      });
    });
  }

  // =========================================================
  // TILT CARDS — subtle 3D tilt on .ticket hover
  // =========================================================
  const tiltCards = document.querySelectorAll('.ticket');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 6;   // left/right tilt
      const rotateX = ((midY - y) / midY) * 6;   // up/down tilt
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // =========================================================
  // DRAGGABLE CORKBOARD — pointer-based drag, click-to-flip
  // =========================================================
  const boards = document.querySelectorAll('.corkboard');
  boards.forEach(board => {
    let zCounter = 10;
    const stickers = board.querySelectorAll('.sticker');

    // scatter stickers into a loose grid with random offsets on load
    // (only if they don't already have inline left/top set in HTML)
    stickers.forEach((sticker, i) => {
      if (!sticker.style.left) {
        const cols = Math.max(2, Math.floor(board.clientWidth / 200));
        const col = i % cols;
        const row = Math.floor(i / cols);
        const jitterX = Math.random() * 20 - 10;
        const jitterY = Math.random() * 16 - 8;
        sticker.style.left = `${28 + col * 190 + jitterX}px`;
        sticker.style.top = `${28 + row * 210 + jitterY}px`;
      }
    });

    stickers.forEach(sticker => {
      let startX = 0, startY = 0, origLeft = 0, origTop = 0, moved = false;

      sticker.addEventListener('pointerdown', (e) => {
        sticker.setPointerCapture(e.pointerId);
        startX = e.clientX;
        startY = e.clientY;
        origLeft = sticker.offsetLeft;
        origTop = sticker.offsetTop;
        moved = false;
        sticker.classList.add('dragging');
        zCounter += 1;
        sticker.style.zIndex = zCounter;

        const ring = document.querySelector('.cursor-ring');
        if (ring) ring.classList.add('is-drag');
      });

      sticker.addEventListener('pointermove', (e) => {
        if (!sticker.classList.contains('dragging')) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;

        const board_ = sticker.closest('.corkboard');
        const maxLeft = board_.clientWidth - sticker.offsetWidth;
        const maxTop = board_.clientHeight - sticker.offsetHeight;
        const newLeft = Math.min(Math.max(0, origLeft + dx), Math.max(0, maxLeft));
        const newTop = Math.min(Math.max(0, origTop + dy), Math.max(0, maxTop));
        sticker.style.left = `${newLeft}px`;
        sticker.style.top = `${newTop}px`;
      });

      sticker.addEventListener('pointerup', (e) => {
        sticker.classList.remove('dragging');
        const ring = document.querySelector('.cursor-ring');
        if (ring) ring.classList.remove('is-drag');
        if (!moved) {
          // treat as a click -> flip the card to reveal detail
          sticker.classList.toggle('flipped');
        }
      });
    });
  });

});
