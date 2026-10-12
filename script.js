(() => {
  const hero = document.querySelector('.hero');
  const slides = [...hero.querySelectorAll('.slide')];
  const dotsBox = hero.querySelector('.dots');
  const header = document.querySelector('.site-header');
  const menu = document.getElementById('menu');
  const menuBtn = document.querySelector('.menu-btn');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DELAY = 5500; // ms between automatic slide changes
  let i = 0, timer, lock = false;

  // dots
  slides.forEach((_, n) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Photo ' + (n + 1));
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

  // header turns solid once the slides are scrolled past
  const onScroll = () => header.classList.toggle('solid', scrollY > innerHeight * 0.85);
  addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const setMenu = open => {
    menu.classList.toggle('open', open);
    header.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.onclick = () => setMenu(!menu.classList.contains('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  go(0);
  onScroll();
  restart();
})();
