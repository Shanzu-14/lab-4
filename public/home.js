// Fills the page text from the open event in events.js (the HTML holds the same text as a fallback).
(function () {
  var ev = (window.EVENTS || []).filter(function (e) { return e.open; })[0];
  if (!ev) return;
  document.querySelectorAll("[data-ev]").forEach(function (el) {
    if (ev[el.dataset.ev]) el.textContent = ev[el.dataset.ev];
  });
})();
