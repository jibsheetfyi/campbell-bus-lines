(function () {
  'use strict';

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = prefersDark ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function paintToggle() {
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      btns[i].setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
  var moonIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var sunIcon = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>';

  paintToggle();

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
    if (!t) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    paintToggle();
  });

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', open ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  }

  /* ---------- sticky header state ---------- */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('header--scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-shown', 'true');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  } else {
    for (var k = 0; k < items.length; k++) items[k].setAttribute('data-shown', 'true');
  }

  /* ---------- request forms → email ---------- */
  var EMAIL = 'tc@campbelltours.com';
  var forms = document.querySelectorAll('[data-quote-form]');

  function labelFor(form, el, name) {
    var lab = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
    if (lab) return lab.textContent.trim().replace(/\s+/g, ' ');
    var yn = el.closest('.yn');
    var q = yn ? yn.querySelector('.yn__q') : null;
    if (q) return q.textContent.trim().replace(/\s+/g, ' ');
    var fs = el.closest('fieldset');
    var lg = fs ? fs.querySelector('legend') : null;
    return lg ? lg.textContent.trim().replace(/\s+/g, ' ') : name;
  }

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var lines = [];
      var seen = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        if (el.type === 'radio' && !el.checked) return;
        if (el.type === 'checkbox' && !el.checked) return;
        if (seen[el.name] && el.type !== 'radio') return;
        var val = (el.value || '').toString().trim();
        if (!val) return;
        seen[el.name] = true;
        var label = labelFor(form, el, el.name);
        if (el.tagName === 'TEXTAREA') lines.push(label + ':\n' + val);
        else lines.push(label + ': ' + val);
      });

      var kind = form.getAttribute('data-kind') || 'Charter quote request';
      var who = '';
      if (form.elements.organization && form.elements.organization.value.trim()) who = form.elements.organization.value.trim();
      else if (form.elements.name && form.elements.name.value.trim()) who = form.elements.name.value.trim();
      else if (form.elements.first_name) who = (form.elements.first_name.value + ' ' + (form.elements.last_name ? form.elements.last_name.value : '')).trim();
      var subject = kind + (who ? ' — ' + who : '');
      var body = kind + ' from campbellbuslines.com\n\n' + lines.join('\n') +
        '\n\n— Sent from the Campbell Bus Lines website.';

      var status = form.querySelector('.form-status');
      var endpoint = form.getAttribute('data-endpoint');

      /* honeypot: bots fill hidden fields, people never see them */
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      if (endpoint && endpoint.indexOf('REPLACE') === -1) {
        var btn = form.querySelector('button[type="submit"], .btn--primary');
        var btnText = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Sending\u2026'; }
        if (status) {
          status.setAttribute('data-visible', 'true');
          status.removeAttribute('data-state');
          status.innerHTML = 'Sending your request\u2026';
        }

        var data = new FormData(form);
        data.append('_subject', subject);
        data.append('Form', kind);
        data.append('Submitted from', window.location.href);

        fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
          .then(function (r) { return r.ok ? r.json() : r.json().then(function (j) { throw j; }); })
          .then(function () {
            form.reset();
            if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
            if (status) {
              status.setAttribute('data-visible', 'true');
              status.setAttribute('data-state', 'ok');
              status.innerHTML = '<strong>Thank you \u2014 we have your request.</strong> ' +
                'A member of our team will be in touch shortly. If your trip is soon, call ' +
                '<a href="tel:+17247942440">(724) 794-2440</a> and we will get you an answer today.';
              status.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          })
          .catch(function () {
            if (btn) { btn.disabled = false; btn.innerHTML = btnText; }
            if (status) {
              status.setAttribute('data-visible', 'true');
              status.setAttribute('data-state', 'error');
              status.innerHTML = '<strong>That did not send.</strong> Please call ' +
                '<a href="tel:+17247942440">(724) 794-2440</a> or email ' +
                '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a> and we will take care of you.';
            }
          });
        return;
      }

      /* fallback: no endpoint configured — hand off to the visitor's mail app */
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) {
        status.setAttribute('data-visible', 'true');
        status.innerHTML = 'Your email app is opening with this ready to send to <strong>' + EMAIL +
          '</strong>. If nothing opened, email us directly or call <a href="tel:+17247942440">(724) 794-2440</a>.';
      }
      if (typeof window.onQuoteMailto === 'function') { window.onQuoteMailto(href); return; }
      window.location.href = href;
    });
  });

  /* ---- YouTube facade: swap poster for the player on click ---- */
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var btn = box.querySelector('[data-video-play]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = box.getAttribute('data-video');
      var custom = box.getAttribute('data-video-src');
      var f = document.createElement('iframe');
      f.src = custom || ('https://www.youtube.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0');
      f.title = 'Campbell Bus Lines video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.setAttribute('loading', 'eager');
      box.innerHTML = '';
      box.appendChild(f);
    });
  });
})();
