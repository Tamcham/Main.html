'use strict';
/* ---------- Helfer ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rnd = () => Math.random();
const pick = a => a[Math.floor(rnd() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gauss = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
const f1 = x => (Math.round(x * 10) / 10).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f0 = x => Math.round(x).toLocaleString('de-DE');
const sgn = x => (x > 0 ? '+' : x < 0 ? '−' : '±') + Math.abs(x);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const seeded = seed => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* ---------- Einstellungen (Barrierefreiheit) ---------- */
const SET_KEY = 'mum.settings.v1', SAVE_KEY = 'mum.save.v1';
const SET = Object.assign({ fs: 16, hc: 0, cb: 0, haptic: 1, voice: 0, rm: 0 }, (() => { try { return JSON.parse(localStorage.getItem(SET_KEY)) || {}; } catch (e) { return {}; } })());
function applySettings() {
  const r = document.documentElement;
  r.style.setProperty('--fs', SET.fs + 'px');
  r.dataset.hc = SET.hc; r.dataset.rm = SET.rm;
  document.body.classList.toggle('cb', !!SET.cb);
  try { localStorage.setItem(SET_KEY, JSON.stringify(SET)); } catch (e) {}
}
function buzz(ms) { if (SET.haptic && navigator.vibrate) try { navigator.vibrate(ms || 12); } catch (e) {} }
function speak(t) {
  if (!SET.voice || !window.speechSynthesis) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = 1.02; speechSynthesis.speak(u); } catch (e) {}
}

/* ---------- Toast / Sheet ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2400); }
function openSheet(html) { $('#sheet').innerHTML = html; $('#sheetbg').classList.add('on'); $('#sheet').scrollTop = 0; }
function closeSheet() { $('#sheetbg').classList.remove('on'); }

/* ---------- Spielstand ---------- */
let G = null;
function save() { if (!G) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {} }
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.v === 1 ? s : null; } catch (e) { return null; } }
function wipeSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }
