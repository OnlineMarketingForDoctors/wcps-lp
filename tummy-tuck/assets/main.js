(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---------- Sticky header state + back to top ---------- */
  const header = document.querySelector('.site-header');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 900);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  document.querySelectorAll('a[href="#top"]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  }));

  /* ---------- Mobile menu ---------- */
  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('.menu-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Active nav link ---------- */
  const navLinks = [...document.querySelectorAll('.main-nav ul a')];
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navIO.observe(s));

  /* ---------- Hero video: "Watch with sound" opens a lightbox ---------- */
  const video = document.getElementById('hero-video');
  if (video && reduced) { video.removeAttribute('autoplay'); video.pause(); }
  const lightbox = document.getElementById('video-lightbox');
  const lbVideo = document.getElementById('lightbox-video');
  const closeVideo = () => { if (lightbox.open) lightbox.close(); };
  document.getElementById('sound-toggle').addEventListener('click', () => {
    if (video) video.pause();
    lightbox.showModal();
    lbVideo.currentTime = 0;
    lbVideo.muted = false;
    lbVideo.play().catch(() => {});
  });
  document.getElementById('close-video').addEventListener('click', closeVideo);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeVideo(); });
  lightbox.addEventListener('close', () => {
    lbVideo.pause();
    if (video && !reduced) video.play().catch(() => {});
  });

  /* ---------- Reveal on scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal, .reveal-img').forEach((el) => revealIO.observe(el));

  /* ---------- Satellite parallax ---------- */
  const floats = [...document.querySelectorAll('[data-parallax]')];
  if (!reduced && floats.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      floats.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax);
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Before and after sliders ---------- */
  document.querySelectorAll('.ba-compare').forEach((box) => {
    const range = box.querySelector('.ba-range');
    const set = (v) => box.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => set(range.value));
    // Hint the interaction once when a slider first scrolls into view
    if (!reduced) {
      const hint = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting) return;
        hint.disconnect();
        const frames = [50, 38, 62, 50];
        frames.forEach((v, i) => setTimeout(() => { set(v); range.value = v; }, 350 * (i + 1)));
      }, { threshold: 0.6 });
      hint.observe(box);
      box.querySelectorAll('.ba-after').forEach((l) => (l.style.transition = 'clip-path .35s ease'));
      box.querySelector('.ba-handle').style.transition = 'left .35s ease';
      range.addEventListener('pointerdown', () => {
        box.querySelector('.ba-after').style.transition = 'none';
        box.querySelector('.ba-handle').style.transition = 'none';
      });
    }
  });

  const baTrack = document.getElementById('ba-track');
  const baPage = document.getElementById('ba-page');
  const baPages = document.getElementById('ba-pages');
  const baPrev = document.querySelector('[data-ba="prev"]');
  const baNext = document.querySelector('[data-ba="next"]');
  let baIndex = 0;
  const perView = () => (window.matchMedia('(max-width: 720px)').matches ? 1 : 2);
  const baTotal = () => Math.ceil(baTrack.children.length / perView());
  const baGo = (i) => {
    baIndex = Math.max(0, Math.min(i, baTotal() - 1));
    const target = baTrack.children[baIndex * perView()];
    baTrack.scrollTo({ left: target.offsetLeft - baTrack.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    baPage.textContent = baIndex + 1;
    baPages.textContent = baTotal();
    baPrev.disabled = baIndex === 0;
    baNext.disabled = baIndex === baTotal() - 1;
  };
  baPrev.addEventListener('click', () => baGo(baIndex - 1));
  baNext.addEventListener('click', () => baGo(baIndex + 1));
  window.addEventListener('resize', () => baGo(Math.min(baIndex, baTotal() - 1)));
  baGo(0);

  /* ---------- Is this you? ---------- */
  const concerns = [...document.querySelectorAll('.concern')];
  const concernMsg = document.getElementById('concern-msg');
  const messages = [
    'Most people who choose a tummy tuck recognise at least two of these.',
    'You ticked 1. A consultation can tell you whether surgery or another option suits you best.',
    'You ticked {n}. These are exactly the changes a tummy tuck is designed to treat.',
  ];
  concerns.forEach((btn) => btn.addEventListener('click', () => {
    btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
    const n = concerns.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    concernMsg.textContent = n === 0 ? messages[0] : n === 1 ? messages[1] : messages[2].replace('{n}', n);
  }));

  /* ---------- Journey carousel ---------- */
  const jTrack = document.getElementById('journey-track');
  const jBar = document.getElementById('journey-bar');
  const jPrev = document.querySelector('[data-journey="prev"]');
  const jNext = document.querySelector('[data-journey="next"]');
  const jStep = () => jTrack.children[0].getBoundingClientRect().width + 24;
  const jUpdate = () => {
    const max = jTrack.scrollWidth - jTrack.clientWidth;
    const p = max > 0 ? jTrack.scrollLeft / max : 1;
    jBar.style.width = (15 + p * 85) + '%';
    jPrev.disabled = jTrack.scrollLeft < 4;
    jNext.disabled = jTrack.scrollLeft > max - 4;
  };
  jPrev.addEventListener('click', () => jTrack.scrollBy({ left: -jStep(), behavior: reduced ? 'auto' : 'smooth' }));
  jNext.addEventListener('click', () => jTrack.scrollBy({ left: jStep(), behavior: reduced ? 'auto' : 'smooth' }));
  jTrack.addEventListener('scroll', jUpdate, { passive: true });
  window.addEventListener('resize', jUpdate);
  jUpdate();

  /* ---------- Types tabs ---------- */
  const types = [
    { name: 'Full abdominoplasty', icon: 'traditional-tummy-tuck-full-abdominoplasty',
      desc: 'The most common tummy tuck. It treats the whole abdomen above and below the navel, repairs the muscle wall and removes loose skin through a low hip-to-hip scar. Your belly button is kept and repositioned.',
      for: 'Skin laxity and muscle separation after pregnancy or weight loss', scar: 'Low, hip to hip, plus around the navel' },
    { name: 'Mini tummy tuck', icon: 'mini-tummy-tuck-partial-abdominoplasty',
      desc: 'A smaller operation focused below the belly button. A modest amount of skin is removed and the lower muscles can be tightened, with a shorter scar and a quicker recovery.',
      for: 'A small pouch or skin excess limited to the lower abdomen', scar: 'Short and low, similar to a caesarean scar' },
    { name: 'Extended tummy tuck', icon: 'extended-tummy-tuck',
      desc: 'Takes the full tummy tuck further around the sides, tightening the flanks and the love handle area as well as the front of the abdomen.',
      for: 'Loose skin that wraps around the hips, often after major weight loss', scar: 'Low, continuing around towards the back' },
    { name: 'Reverse tummy tuck', icon: 'reverse-tummy-tuck',
      desc: 'Lifts loose skin of the upper abdomen upwards, with the incision hidden in the fold beneath the breasts. Often combined with breast surgery.',
      for: 'Laxity mainly above the belly button', scar: 'In the crease under the breasts' },
    { name: 'Fleur-de-lis tummy tuck', icon: 'fleur-de-lis-tummy-tuck',
      desc: 'Adds a vertical incision to the standard horizontal one, so skin can be tightened side to side as well as top to bottom. It gives the greatest waist definition where skin excess is significant.',
      for: 'Substantial skin excess in both directions after massive weight loss', scar: 'Low horizontal scar plus a vertical midline scar' },
    { name: 'Circumferential body lift', icon: 'circumferential-tummy-tuck-body-lift',
      desc: 'A 360 degree procedure that treats the abdomen, flanks, lower back and buttocks in one operation, often lifting the outer thighs too.',
      for: 'Loose skin all the way around the lower body after major weight loss', scar: 'Around the entire waistline, placed low' },
  ];
  const tabs = [...document.querySelectorAll('.types-tabs [role="tab"]')];
  const panel = document.getElementById('panel-types');
  const setType = (i, focus) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    const t = types[i];
    panel.setAttribute('aria-labelledby', tabs[i].id);
    document.getElementById('type-icon').style.setProperty('--icon', `url(/tummy-tuck/assets/icons/${t.icon}.webp)`);
    document.getElementById('type-name').textContent = t.name;
    document.getElementById('type-desc').textContent = t.desc;
    document.getElementById('type-for').textContent = t.for;
    document.getElementById('type-scar').textContent = t.scar;
    panel.classList.remove('is-swapping'); void panel.offsetWidth; panel.classList.add('is-swapping');
    if (focus !== undefined && window.matchMedia('(max-width: 1024px)').matches) {
      panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    }
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => setType(i, false));
    t.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); setType((i + 1) % tabs.length, true); }
      if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); setType((i - 1 + tabs.length) % tabs.length, true); }
      if (k === 'Home') { e.preventDefault(); setType(0, true); }
      if (k === 'End') { e.preventDefault(); setType(tabs.length - 1, true); }
    });
  });

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = [...document.querySelectorAll('.faq-list details')];
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
