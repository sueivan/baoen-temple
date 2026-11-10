(function (root) {
  'use strict';
  const KEY = 'baoen-temple:v2';
  const actions = ['palm','bow','wood','beads'];
  function sanitize(input) {
    const s = input && typeof input === 'object' ? input : {};
    return {
      lang:['zh-Hant','zh-Hans','en'].includes(s.lang) ? s.lang : 'zh-Hant',
      quality:['auto','low'].includes(s.quality) ? s.quality : 'auto',
      sound:s.sound === true,
      ambient:s.ambient === true
    };
  }
  function read(storage) {
    try { return sanitize(JSON.parse((storage || root.localStorage).getItem(KEY))); }
    catch (_) { return sanitize(null); }
  }
  function write(value,storage) {
    try { (storage || root.localStorage).setItem(KEY,JSON.stringify(sanitize(value))); return true; }
    catch (_) { return false; }
  }
  const api = {KEY,sanitize,read,write,actions};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else (root.Temple = root.Temple || {}).State = api;
})(typeof window !== 'undefined' ? window : globalThis);
