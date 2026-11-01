// Mark the section currently being read, including on direct anchor visits.
(() => {
  const links = [...document.querySelectorAll('.case-contents a')];
  const sections = links.map(link => document.querySelector(link.hash));
  if (!links.length || sections.some(section => !section)) return;
  let scheduled = false;
  function update() {
    scheduled = false;
    // Narrow layouts use ordinary jump links; no off-screen location indicator.
    if (innerWidth <= 700) {
      links.forEach(link => link.removeAttribute('aria-current'));
      return;
    }
    const threshold = 64;
    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= threshold) current = index;
    });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 8) current = sections.length - 1;
    links.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('load', update);
  update();
})();
