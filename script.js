// Simple mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('.headerarea');
  if (!header) return;

  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('.navlinks');
  const log = header.querySelector('.log');

  if (!toggle || !nav) return;

  // helper to open/close
  function setOpen(open) {
    nav.classList.toggle('open', open);
    if (log) log.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  }

  // click / activate
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  // keyboard support: Enter / Space to toggle, Escape to close
  toggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(!nav.classList.contains('open'));
    } else if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
    }
  });

  // close on Escape when focus is inside nav
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // close nav when clicking outside
  document.addEventListener('click', function (e) {
    if (!nav.classList.contains('open')) return;
    if (header.contains(e.target)) return; // click inside header (toggle already handled)
    setOpen(false);
  });
});
