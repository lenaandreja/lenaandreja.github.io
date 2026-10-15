(() => {
  /* ---------- TEXTS (English / Deutsch) ---------- */
  const T = {
    en: {
      'nav.portfolio': 'Portfolio', 'nav.about': 'About', 'nav.reviews': 'Reviews', 'nav.contact': 'Contact',
      'cta': 'Send inquiry',
      'about.title': 'A few words about me',
      'about.p1': "I'm Olena, a wedding photographer based in City. For more than 13 years I have been photographing couples, and I never look for the staged pose. I look for the small, true moments: a quiet glance, a familiar smile, a tender gesture.",
      'about.p2': "I notice the details that get lost in the rush of a wedding day, so you can look back and feel how it really was. City is home, but I'm happy to travel to wherever you celebrate.",
      'reviews.title': 'What clients say',
      'review.sample': 'Sample review. Replace this with a real client quote about the experience and the photos.',
      'review.cite': 'Client name, location',
      'contact.title': "Let's work together",
      'contact.text': 'Tell me your date, location and what you have in mind.',
      'contact.loc': 'City, Austria',
      'footer': '\u00a9 2026 Olena Photography. All rights reserved.',
      'aria.menu': 'Menu', 'aria.prev': 'Previous photo', 'aria.next': 'Next photo', 'aria.photo': 'Photo {n}',
      'alt.photo': 'Photo {n} by Olena', 'alt.portrait': 'Portrait of Olena',
      'meta.title': 'Olena Photography \u2013 Wedding Photographer in City',
      'meta.desc': 'Wedding photographer in City. Honest, timeless photos of real moments, by Olena.'
    },
    de: {
      'nav.portfolio': 'Portfolio', 'nav.about': '\u00dcber mich', 'nav.reviews': 'Kundenstimmen', 'nav.contact': 'Kontakt',
      'cta': 'Anfrage senden',
      'about.title': 'Ein paar Worte \u00fcber mich',
      'about.p1': 'Ich bin Olena (Lena) Andreichuk, Hochzeitsfotografin in City. Seit \u00fcber 13 Jahren fotografiere ich Brautpaare, und ich suche nie nach der gestellten Pose. Mich interessieren die kleinen, echten Momente: ein stiller Blick, ein vertrautes L\u00e4cheln, eine zarte Geste.',
      'about.p2': 'Ich achte auf die Details, die im Trubel des Hochzeitstages leicht untergehen, damit ihr euch sp\u00e4ter daran erinnern k\u00f6nnt, wie es sich wirklich angef\u00fchlt hat. City ist mein Zuhause, aber ich reise gerne dorthin, wo ihr feiert.',
      'reviews.title': 'Das sagen meine Kunden',
      'review.sample': 'Beispiel-Rezension. Ersetze diesen Text durch ein echtes Zitat eines Kunden \u00fcber die Zusammenarbeit und die Fotos.',
      'review.cite': 'Name des Kunden, Ort',
      'contact.title': 'Lasst uns zusammenarbeiten',
      'contact.text': 'Erz\u00e4hlt mir von eurem Datum, dem Ort und euren Ideen.',
      'contact.loc': 'City, \u00d6sterreich',
      'footer': '\u00a9 2026 Olena Photography. Alle Rechte vorbehalten.',
      'aria.menu': 'Men\u00fc', 'aria.prev': 'Vorheriges Foto', 'aria.next': 'N\u00e4chstes Foto', 'aria.photo': 'Foto {n}',
      'alt.photo': 'Foto {n} von Olena', 'alt.portrait': 'Portr\u00e4t von Olena',
      'meta.title': 'Olena Photography \u2013 Hochzeitsfotografin in City',
      'meta.desc': 'Hochzeitsfotografin in City. Ehrliche, zeitlose Fotos echter Momente von Olena.'
    }
  };

  /* ---------- LANGUAGE ---------- */
  const root = document.documentElement;
  const store = {
    get() { try { return localStorage.getItem('lang'); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem('lang', v); } catch (e) {} }
  };
  let lang = 'en';

  function t(key, n) { return (T[lang][key] || '').replace('{n}', n); }

  function applyLang(l, save) {
    lang = l;
    root.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    document.querySelectorAll('img[data-n]').forEach(el => el.alt = t('alt.photo', el.dataset.n));
    document.querySelectorAll('img[data-i18n-alt]').forEach(el => el.alt = t(el.dataset.i18nAlt));
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    document.querySelectorAll('.dots button').forEach((b, k) => b.setAttribute('aria-label', t('aria.photo', k + 1)));
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]').content = t('meta.desc');
    if (save) store.set(l);
  }

  // Germany / Austria -> Deutsch, everyone else -> English (country comes from the visitor's IP).
  // If the lookup fails, the browser language is used instead.
  function detectLang() {
    const saved = store.get();
    if (saved === 'en' || saved === 'de') return Promise.resolve(saved);
    const fallback = (navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en';
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 1500);
    return fetch('https://api.country.is/', { signal: ctl.signal })
      .then(r => r.json())
      .then(d => {
        const l = ['DE', 'AT'].includes(String(d.country).toUpperCase()) ? 'de' : 'en';
        store.set(l);
        return l;
      })
      .catch(() => fallback)
      .finally(() => clearTimeout(timer));
  }

  /* ---------- SLIDES ---------- */
  const hero = document.querySelector('.hero');
  const slides = [...hero.querySelectorAll('.slide')];
  const dotsBox = hero.querySelector('.dots');
  const header = document.querySelector('.site-header');
  const menu = document.getElementById('menu');
  const menuBtn = document.querySelector('.menu-btn');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DELAY = 5500; // ms between automatic slide changes
  let i = 0, timer, lock = false;

  slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.onclick = () => go(n, true);
    dotsBox.append(b);
  });
  const dots = [...dotsBox.children];

  function go(n, manual) {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    if (manual) restart();
  }
  function restart() {
    clearInterval(timer);
    if (!reduce) timer = setInterval(() => go(i + 1), DELAY);
  }

  // manual control: arrows, keyboard, swipe, trackpad sideways scroll
  hero.querySelector('.prev').onclick = () => go(i - 1, true);
  hero.querySelector('.next').onclick = () => go(i + 1, true);
  document.addEventListener('keydown', e => {
    if (scrollY > innerHeight * 0.6) return;
    if (e.key === 'ArrowLeft') go(i - 1, true);
    if (e.key === 'ArrowRight') go(i + 1, true);
  });
  let x0 = null;
  hero.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), true);
    x0 = null;
  });
  hero.addEventListener('wheel', e => {
    if (lock || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    go(i + (e.deltaX > 0 ? 1 : -1), true);
    lock = true; setTimeout(() => { lock = false; }, 700);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : restart());

  /* ---------- HEADER + MENU ---------- */
  const onScroll = () => header.classList.toggle('solid', scrollY > innerHeight * 0.85);
  addEventListener('scroll', onScroll, { passive: true });

  const setMenu = open => {
    menu.classList.toggle('open', open);
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.onclick = () => setMenu(!menu.classList.contains('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang, true)));

  /* ---------- START ---------- */
  go(0);
  onScroll();
  restart();
  applyLang('en', false);
  detectLang().then(l => applyLang(l, false)).finally(() => root.classList.remove('i18n-wait'));
})();
