(function() {
  var shell = document.getElementById('dropdown-shell');
  var backdrop = document.getElementById('backdrop');
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  var activePanel = null;
  var mobileOpen = false;

  var triggers = document.querySelectorAll('.nav-trigger');
  var panels = document.querySelectorAll('.dropdown-panel');

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var panelId = this.dataset.panel;

      if (activePanel === panelId) {
        closeDropdown();
        return;
      }

      triggers.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('is-active'); });

      trigger.classList.add('active');

      var panel = document.getElementById('panel-' + panelId);
      panel.classList.add('is-active');

      shell.style.maxHeight = (panel.scrollHeight + 80) + 'px';
      shell.classList.add('is-visible');
      backdrop.classList.add('is-visible');

      activePanel = panelId;
    });
  });

  function closeDropdown() {
    shell.style.maxHeight = '0';
    shell.classList.remove('is-visible');
    backdrop.classList.remove('is-visible');
    triggers.forEach(function(t) { t.classList.remove('active'); });

    var onEnd = function(e) {
      if (e.propertyName === 'max-height') {
        panels.forEach(function(p) { p.classList.remove('is-active'); });
        shell.removeEventListener('transitionend', onEnd);
      }
    };
    shell.addEventListener('transitionend', onEnd);

    activePanel = null;
  }

  backdrop.addEventListener('click', closeDropdown);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeDropdown();
      if (mobileOpen) closeMobile();
    }
  });

  hamburger.addEventListener('click', function() {
    mobileOpen ? closeMobile() : openMobile();
  });

  function openMobile() {
    mobileOpen = true;
    hamburger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    mobileOpen = false;
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    document.querySelectorAll('.mob-item').forEach(function(i) {
      i.classList.remove('is-open');
    });
  }

  document.querySelectorAll('.mob-trigger').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = document.getElementById(this.dataset.mob);
      item.classList.toggle('is-open');
    });
  });

  shell.addEventListener('click', function(e) {
    e.stopPropagation();
  });
})();


(function() {
  const tabs   = document.querySelectorAll('.human-ai-tab-btn');
  const panels = document.querySelectorAll('.human-ai-tab-panel');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const target = document.getElementById('panel-' + btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
})();


(function() {
  const track   = document.getElementById('uc-track');
  const prevBtn = document.getElementById('uc-prev');
  const nextBtn = document.getElementById('uc-next');
  const cards   = Array.from(track.querySelectorAll('.uc-card'));
  let index     = 0;

  function cardStep() {
    return cards[0].offsetWidth + 16;
  }

  function maxIndex() {
    const visible = Math.floor(track.parentElement.offsetWidth / cardStep());
    return Math.max(0, cards.length - visible);
  }

  function goTo(i) {
    index = i;
    track.style.transform = `translateX(-${index * cardStep()}px)`;
    prevBtn.disabled      = index <= 0;
    nextBtn.disabled      = index >= maxIndex();
  }

  nextBtn.addEventListener('click', () => {
    if (index < maxIndex()) goTo(index + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (index > 0) goTo(index - 1);
  });

  window.addEventListener('resize', () => {
    goTo(Math.min(index, maxIndex()));
  });

  let dragging   = false;
  let startX     = 0;
  let dragOffset = 0;

  track.addEventListener('mousedown', e => {
    dragging   = true;
    startX     = e.clientX;
    dragOffset = 0;
    track.style.transition = 'none';
    track.style.cursor     = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    dragOffset = e.clientX - startX;
    const snappedAt = index * cardStep();
    track.style.transform = `translateX(${-snappedAt + dragOffset}px)`;
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    track.style.cursor     = '';

    const enoughToSlide = cardStep() / 3;

    if      (dragOffset < -enoughToSlide && index < maxIndex()) goTo(index + 1);
    else if (dragOffset >  enoughToSlide && index > 0)          goTo(index - 1);
    else                                                         goTo(index);
  });

  track.addEventListener('click', e => {
    if (Math.abs(dragOffset) > 5) e.preventDefault();
  }, true);

  goTo(0);
})();


(function() {
  const slides   = Array.from(document.querySelectorAll('.trust-slide'));
  const prevBtn  = document.getElementById('trust-prev');
  const nextBtn  = document.getElementById('trust-next');
  const dotsWrap = document.getElementById('trust-dots');
  let current    = 0;
  let animating  = false;

  const colors = slides.map(s => s.dataset.color);

  const bgLayer = document.createElement('div');
  bgLayer.style.cssText = `
    position: absolute;
    inset: 0;
    left: 380px;
    background: ${colors[0]};
    transition: background 0.6s ease;
    border-radius: 0 16px 16px 0;
    z-index: 0;
  `;
  document.getElementById('trust-slider').appendChild(bgLayer);

  slides.forEach(s => {
    s.style.zIndex = '1';
    const right = s.querySelector('.slide-right');
    if (right) right.style.background = 'transparent';
  });

  slides.forEach((_, i) => {
    const dot            = document.createElement('button');
    dot.className        = 'trust-dot' + (i === 0 ? ' active' : '');
    dot.style.background = i === 0 ? '#f06060' : '#f0ede8';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getDots() {
    return Array.from(dotsWrap.querySelectorAll('.trust-dot'));
  }

  function updateArrows() {
    prevBtn.className = 'trust-arrow ' + (current === 0 ? 'inactive' : 'active');
    nextBtn.className = 'trust-arrow ' + (current === slides.length - 1 ? 'inactive' : 'active');
  }

  function goTo(next) {
    if (animating || next === current) return;
    animating = true;

    const prev = current;
    current = next;

    bgLayer.style.background = colors[current];

    slides[prev].classList.add('exit');

    slides[next].style.transform  = 'translateY(40px)';
    slides[next].style.opacity    = '0';
    slides[next].style.transition = 'none';
    slides[next].classList.add('active');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slides[next].style.transition = '';
        slides[next].style.transform  = 'translateY(0)';
        slides[next].style.opacity    = '1';
      });
    });

    setTimeout(() => {
      slides[prev].classList.remove('active', 'exit');
      slides[next].style.transform = '';
      slides[next].style.opacity   = '';
      animating = false;
    }, 500);

    getDots().forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.style.background = i === current ? '#f06060' : '#f0ede8';
    });

    updateArrows();
  }

  nextBtn.addEventListener('click', () => {
    if (current < slides.length - 1) goTo(current + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (current > 0) goTo(current - 1);
  });

  updateArrows();
})();
(function() {
  var langBtn = document.getElementById('lang-btn');
  var langDropdown = document.getElementById('lang-dropdown');

  langBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    langDropdown.classList.toggle('is-open');
  });

  document.addEventListener('click', function() {
    langDropdown.classList.remove('is-open');
  });
})();
