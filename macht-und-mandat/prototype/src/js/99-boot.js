/* ---------- Start ---------- */
applySettings();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
window.addEventListener('error', e => { try { console.error(e.message); } catch (x) {} });
show('start');
