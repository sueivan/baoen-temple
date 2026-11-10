(function () {
  'use strict';
  const fatal = document.getElementById('fatal');
  function showFailure() {
    if (window.Temple && window.Temple.failed) return;
    window.Temple = window.Temple || {};
    window.Temple.failed = true;
    fatal.hidden = false;
    const retry = document.getElementById('retry');
    retry.onclick = () => location.reload();
    retry.focus();
  }
  window.Temple = { showFailure, ready: false, failed: false };
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement || (!window.Temple.ready && event.error)) showFailure();
  }, true);
  window.setTimeout(() => { if (!window.Temple.ready) showFailure(); }, 25000);
  document.getElementById('retry').onclick = () => location.reload();
})();
