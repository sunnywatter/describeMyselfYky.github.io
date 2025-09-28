(function() {
  'use strict';

  // Year in footer
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function() {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-expanded', String(!expanded));
    });
  }

  // Smooth scroll for internal links
  document.addEventListener('click', function(e) {
    var target = e.target;
    if (target.tagName === 'A' && target.getAttribute('href') && target.getAttribute('href').startsWith('#')) {
      var id = target.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
      }
    }
  });

  // Intersection reveals
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var revealObserver = null;
  if ('IntersectionObserver' in window && reveals.length) {
    revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseFloat(el.getAttribute('data-delay') || '0');
          el.style.transitionDelay = delay + 's';
          el.classList.add('is-in');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    reveals.forEach(function(el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('is-in'); });
  }

  // Stagger container support
  var staggers = Array.prototype.slice.call(document.querySelectorAll('.reveal-stagger'));
  staggers.forEach(function(container) {
    var selector = container.getAttribute('data-stagger') || ':scope > *';
    var children = Array.prototype.slice.call(container.querySelectorAll(selector));
    children.forEach(function(c, i) {
      c.classList.add('reveal');
      c.style.setProperty('--reveal-delay', (i * 0.08) + 's');
    });
  });

  // Hero background particles (canvas)
  var canvas = document.getElementById('hero-bg');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var particleCount = 36;
    var rafId = 0;

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    function initParticles() {
      particles = [];
      var rect = canvas.getBoundingClientRect();
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: 1 + Math.random() * 2.2,
          a: 0.3 + Math.random() * 0.6,
          vx: -0.6 + Math.random() * 1.2,
          vy: -0.6 + Math.random() * 1.2
        });
      }
    }

    function draw() {
      var rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      // gradient glow
      var grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, 'rgba(37, 99, 235, .10)');
      grad.addColorStop(1, 'rgba(219, 39, 119, .10)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // particles
      particles.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37, 99, 235,' + p.a + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = rect.width + 5; if (p.x > rect.width + 5) p.x = -5;
        if (p.y < -5) p.y = rect.height + 5; if (p.y > rect.height + 5) p.y = -5;
      });
      ctx.restore();
      rafId = requestAnimationFrame(draw);
    }

    function start() { resizeCanvas(); initParticles(); draw(); }
    function stop() { cancelAnimationFrame(rafId); }

    var home = document.getElementById('home');
    var homeObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) start(); else stop();
      });
    }, { threshold: 0.01 });
    if (home) homeObserver.observe(home);
    window.addEventListener('resize', resizeCanvas);
  }

  // Parallax on avatar
  var parallaxEl = document.querySelector('.parallax');
  if (parallaxEl) {
    var depth = parseFloat(parallaxEl.getAttribute('data-parallax-depth') || '20');
    var bounds = null;
    function updateBounds() { bounds = parallaxEl.getBoundingClientRect(); }
    updateBounds();
    window.addEventListener('resize', updateBounds);
    document.addEventListener('mousemove', function(e) {
      if (!bounds) return;
      var cx = bounds.left + bounds.width / 2;
      var cy = bounds.top + bounds.height / 2;
      var dx = (e.clientX - cx) / bounds.width;
      var dy = (e.clientY - cy) / bounds.height;
      var tx = -dx * depth;
      var ty = -dy * depth;
      parallaxEl.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
    });
    document.addEventListener('mouseleave', function() {
      parallaxEl.style.transform = 'translate3d(0,0,0)';
    });
  }

  // Filters
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  filterButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterButtons.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var filter = btn.getAttribute('data-filter') || 'all';
      cards.forEach(function(card) {
        var cat = card.getAttribute('data-category');
        var visible = (filter === 'all') || (cat === filter);
        card.style.display = visible ? '' : 'none';
      });
    });
  });

  // Modal
  var modal = document.getElementById('modal');
  if (modal) {
    var openers = Array.prototype.slice.call(document.querySelectorAll('.card-media'));
    var titleEl = modal.querySelector('#modal-title');
    var backdrop = modal.querySelector('.modal-backdrop');
    var closeEls = Array.prototype.slice.call(modal.querySelectorAll('[data-close]'));
    var bodyEl = modal.querySelector('.modal-body');

    openers.forEach(function(opener) {
      opener.addEventListener('click', function() {
        var title = opener.getAttribute('data-modal') || '项目详情';
        if (titleEl) titleEl.textContent = title;
        modal.setAttribute('aria-hidden', 'false');
        // trap focus simple
        setTimeout(function() { modal.querySelector('.modal-close').focus(); }, 50);
      });
    });

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
    }
    closeEls.forEach(function(el) { el.addEventListener('click', closeModal); });
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
  }

  // Contact form: simple client-side validation and mailto fallback
  var form = document.getElementById('contact-form');
  var mailtoBtn = document.getElementById('mailto-btn');
  if (mailtoBtn) {
    mailtoBtn.addEventListener('click', function() {
      var name = (document.getElementById('name') || {}).value || '';
      var email = (document.getElementById('email') || {}).value || '';
      var message = (document.getElementById('message') || {}).value || '';
      var subject = encodeURIComponent('网站联系 · ' + name);
      var body = encodeURIComponent('来自：' + name + ' (' + email + ')\n\n' + message);
      window.location.href = 'mailto:you@example.com?subject=' + subject + '&body=' + body;
    });
  }
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();
      if (!name || !email || !message) {
        alert('请完整填写信息。');
        return;
      }
      alert('感谢你的留言！当前为演示站点，可使用“邮件联系”按钮。');
      form.reset();
    });
  }
})();

// About carousel init (premium)
(function initAboutCarousel() {
  var root = document.getElementById('about-carousel');
  if (!root) return;
  var viewport = root.querySelector('.ac-viewport');
  var track = root.querySelector('.ac-track');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.ac-slide'));
  var dots = root.querySelector('.ac-dots');
  var prev = root.querySelector('.ac-arrow.prev');
  var next = root.querySelector('.ac-arrow.next');
  var index = 0; var timer = 0; var autoplayMs = 6500;
  var dragging = false; var startX = 0; var currentX = 0; var startTx = 0;

  function update(i) {
    index = (i + slides.length) % slides.length;
    var tx = -index * viewport.clientWidth;
    track.style.transform = 'translate3d(' + tx + 'px,0,0)';
    updateDots();
  }
  function updateDots() {
    if (!dots) return; dots.innerHTML = '';
    slides.forEach(function(_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 张');
      if (i === index) b.setAttribute('aria-selected', 'true');
      b.addEventListener('click', function() { stop(); update(i); start(); });
      dots.appendChild(b);
    });
  }
  function start() { stop(); timer = window.setInterval(function() { update(index + 1); }, autoplayMs); }
  function stop() { if (timer) { clearInterval(timer); timer = 0; } }

  if (prev) prev.addEventListener('click', function() { stop(); update(index - 1); start(); });
  if (next) next.addEventListener('click', function() { stop(); update(index + 1); start(); });
  window.addEventListener('resize', function() { update(index); });

  function onDown(clientX) {
    dragging = true; root.setAttribute('data-dragging', 'true');
    startX = clientX; currentX = clientX;
    var m = track.style.transform.match(/-?\d+(?:\.\d+)?/);
    startTx = m ? parseFloat(m[0]) : -index * viewport.clientWidth;
    stop();
  }
  function onMove(clientX) {
    if (!dragging) return; currentX = clientX;
    var dx = currentX - startX;
    track.style.transform = 'translate3d(' + (startTx + dx) + 'px,0,0)';
  }
  function onUp() {
    if (!dragging) return; dragging = false; root.removeAttribute('data-dragging');
    var dx = currentX - startX;
    if (Math.abs(dx) > viewport.clientWidth * 0.18) update(index + (dx < 0 ? 1 : -1)); else update(index);
    start();
  }
  if (viewport) {
    viewport.addEventListener('mousedown', function(e) { onDown(e.clientX); });
    window.addEventListener('mousemove', function(e) { onMove(e.clientX); });
    window.addEventListener('mouseup', onUp);
    viewport.addEventListener('touchstart', function(e) { onDown(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchmove', function(e) { onMove(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', onUp);
    viewport.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') { stop(); update(index - 1); start(); }
      if (e.key === 'ArrowRight') { stop(); update(index + 1); start(); }
    });
  }
  update(0);
  start();
})();

