(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menu'); }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('open', open);
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  document.querySelectorAll('.closing .eyebrow, .closing h2, .closing .button, .selection-footer').forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.06});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const photo = document.querySelector('.lifestyle');
    photo.classList.add('motion-photo');
    observer.observe(photo);
    const serviceObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('motion-services'); serviceObserver.unobserve(entry.target); }
    }), {threshold:.3});
    serviceObserver.observe(document.querySelector('.service-bar'));
    const contact = document.querySelector('.mobile-contact');
    new IntersectionObserver(entries => contact.classList.toggle('show', !entries[0].isIntersecting), {threshold:0}).observe(document.querySelector('.hero'));
  }
  // Event-driven depth: no permanent animation loop, no scroll hijacking.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const heroImage = document.querySelector('.hero-image');
  let frame = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function updateDepth() {
    frame = 0;
    if (motionPreference.matches || document.hidden) return;
    const mobile = window.innerWidth <= 700;
    const height = window.innerHeight;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0 && heroRect.top < height) {
      heroImage.style.setProperty('--hero-depth', `${clamp(-heroRect.top * .035, 0, mobile ? 10 : 22)}px`);
    }

  }
  function scheduleDepth() {
    if (!frame && !motionPreference.matches && !document.hidden) frame = requestAnimationFrame(updateDepth);
  }
  window.addEventListener('scroll', scheduleDepth, {passive:true});
  window.addEventListener('resize', scheduleDepth, {passive:true});
  document.addEventListener('visibilitychange', scheduleDepth);
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      cancelAnimationFrame(frame); frame = 0;
      heroImage.style.removeProperty('--hero-depth');
    } else scheduleDepth();
  });
  scheduleDepth();
})();

(() => {
  const carousel = document.querySelector('.reviews-carousel');
  if (!carousel) return;
  const cards = [...carousel.querySelectorAll('.review-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reviews-progress');
  const status = carousel.querySelector('.reviews-status');
  const pauseButton = carousel.querySelector('.review-pause');
  let current = 0, timer, visible = false, paused = reducedMotion.matches, hovered = false;

  function schedule() {
    clearTimeout(timer);
    if (visible && !paused && !hovered && !document.hidden && !carousel.contains(document.activeElement)) {
      timer = setTimeout(() => show(current + 1), 6500);
    }
  }
  function show(index, manual = false) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === current);
      card.setAttribute('aria-hidden', String(i !== current));
      card.querySelector('a').tabIndex = i === current ? 0 : -1;
    });
    progress.textContent = `0${current + 1} / 08`;
    if (manual) status.textContent = `Avaliação ${current + 1} de ${cards.length}`;
    schedule();
  }
  carousel.querySelector('.review-prev').addEventListener('click', () => show(current - 1, true));
  carousel.querySelector('.review-next').addEventListener('click', () => show(current + 1, true));
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Reproduzir' : 'Pausar';
    pauseButton.setAttribute('aria-label', paused ? 'Reproduzir avaliações' : 'Pausar avaliações');
    schedule();
  });
  carousel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; schedule(); } });
  carousel.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    pauseButton.textContent = paused ? 'Reproduzir' : 'Pausar';
    pauseButton.setAttribute('aria-label', paused ? 'Reproduzir avaliações' : 'Pausar avaliações');
    schedule();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, {threshold:.15}).observe(carousel);
  } else visible = true;
  show(0);

  // One discreet notice per page visit, sourced from an actual quoted review.
  const toast = document.querySelector('.review-toast');
  const choices = cards.slice(1).filter(card => card.querySelector('blockquote').textContent.length < 85);
  const selected = choices[Math.floor(Math.random() * choices.length)];
  toast.querySelector('.review-toast-quote').textContent = selected.querySelector('blockquote').textContent;
  const author = toast.querySelector('.review-toast-author');
  author.textContent = selected.querySelector('.review-credit a').textContent.trim() + ' · Ver avaliação';
  author.href = selected.querySelector('.review-credit a').href;
  let toastTimeout;
  const dismiss = () => { toast.hidden = true; clearTimeout(toastTimeout); };
  toast.querySelector('.review-toast-close').addEventListener('click', dismiss);
  setTimeout(() => {
    if (document.hidden) return;
    toast.hidden = false;
    toastTimeout = setTimeout(dismiss, 8000);
  }, 24000);
})();

(() => {
  const carousel = document.querySelector('.brand-carousel');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.brand-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dots button')];
  const names = ['Tommy Hilfiger', 'Armani Exchange', 'Abercrombie & Fitch'];
  const pause = carousel.querySelector('.carousel-pause');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer = 0, visible = false, hovered = false;
  let paused = preference.matches, touchStart = null;
  function syncTimer() {
    clearTimeout(timer);
    if (!paused && !document.hidden && visible && !hovered && !carousel.contains(document.activeElement)) {
      timer = setTimeout(() => { show(current + 1); }, 4500);
    }
  }
  function show(index, manual = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-pressed', String(i === current));
    });
    carousel.querySelector('.carousel-name').textContent = names[current];
    carousel.querySelector('.carousel-count').textContent = `0${current + 1} / 03`;
    if (manual) carousel.querySelector('.carousel-status').textContent = `${names[current]}, ${current + 1} de 3`;
    syncTimer();
  }
  function syncPause() {
    pause.textContent = paused ? 'Reproduzir' : 'Pausar';
    pause.setAttribute('aria-label', paused ? 'Reproduzir carrossel' : 'Pausar carrossel');
    syncTimer();
  }
  pause.addEventListener('click', () => { paused = !paused; syncPause(); });
  carousel.querySelector('.carousel-prev').addEventListener('click', () => show(current - 1, true));
  carousel.querySelector('.carousel-next').addEventListener('click', () => show(current + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1), true); }
  });
  carousel.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; syncTimer(); } });
  carousel.addEventListener('pointerleave', () => { hovered = false; syncTimer(); });
  carousel.addEventListener('focusin', syncTimer);
  carousel.addEventListener('focusout', () => setTimeout(syncTimer, 0));
  carousel.addEventListener('touchstart', e => { const t = e.changedTouches[0]; touchStart = {x:t.clientX,y:t.clientY}; clearTimeout(timer); }, {passive:true});
  carousel.addEventListener('touchend', e => {
    if (!touchStart) return;
    const t = e.changedTouches[0], dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) show(current + (dx < 0 ? 1 : -1), true);
    else syncTimer();
    touchStart = null;
  }, {passive:true});
  carousel.addEventListener('touchcancel', () => { touchStart = null; syncTimer(); }, {passive:true});
  document.addEventListener('visibilitychange', syncTimer);
  preference.addEventListener('change', () => { paused = preference.matches; syncPause(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncTimer(); }, {threshold:.2}).observe(carousel);
  } else { visible = true; }
  syncPause();
})();

(() => {
  const opening = document.querySelector('.opening');
  const hero = opening?.querySelector('.hero');
  const overlay = opening?.querySelector('.opening-overlay');
  if (!opening || !hero || !overlay) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const heroContent = [hero.querySelector('.hero-copy'), hero.querySelector('.hero-bottom')];
  let frame = 0;
  const clamp = value => Math.min(1, Math.max(0, value));

  function update() {
    frame = 0;
    if (reducedMotion.matches) return;
    const distance = Math.max(1, opening.offsetHeight - hero.offsetHeight);
    const progress = clamp(-opening.getBoundingClientRect().top / distance);
    const opacity = 1 - clamp((progress - .04) / .76);
    overlay.style.setProperty('--opening-progress', progress.toFixed(3));
    overlay.style.setProperty('--opening-opacity', opacity.toFixed(3));
    const accessible = progress >= .7;
    header.inert = !accessible;
    heroContent.forEach(element => { element.inert = !accessible; });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function configure() {
    document.documentElement.classList.toggle('intro-ready', !reducedMotion.matches);
    if (reducedMotion.matches) {
      header.inert = false;
      heroContent.forEach(element => { element.inert = false; });
      overlay.style.removeProperty('--opening-opacity');
    } else schedule();
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  reducedMotion.addEventListener('change', configure);
  configure();
})();
