/* املاخوان — برنامه‌ی اصلی
   طراح: منوچهر کریمی */
(function () {
  'use strict';
  var E = window.Emla, LESSONS = window.LESSONS, CHAPTERS = window.CHAPTERS, FREE = window.FREE_LESSONS;
  var fa = E.faNum;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- ذخیره‌سازی ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('emla.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('emla.' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  var settings = Object.assign({ rate: 0.85, pause: 1, intro: true, twice: false, showText: false, bg: 'green' }, store.get('settings', {}));
  function saveSettings() { store.set('settings', settings); }
  var custom = store.get('custom', {});
  var history = store.get('history', []);

  function lessonText(l) { var c = custom[l.n]; return (c && c.trim()) ? c : l.text; }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- صفحه‌ی درس‌ها ---------- */
  function bestScore(n) {
    var b = null;
    history.forEach(function (h) { if (h.n === n && (b === null || h.score > b)) b = h.score; });
    return b;
  }
  function renderHome() {
    var box = $('#lessonList'); box.innerHTML = '';
    CHAPTERS.forEach(function (ch) {
      var items = LESSONS.filter(function (l) { return l.chapter === ch.id; }).map(function (l) { return { l: l, free: false }; })
        .concat(FREE.filter(function (f) { return f.chapter === ch.id; }).map(function (f) { return { l: f, free: true }; }));
      items.sort(function (a, b) { return a.l.n - b.l.n; });
      var h = document.createElement('h3'); h.className = 'chapter'; h.textContent = ch.title; box.appendChild(h);
      var g = document.createElement('div'); g.className = 'grid'; box.appendChild(g);
      items.forEach(function (it) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'lesson' + (it.free ? ' free' : '');
        var sub = it.free ? 'درس آزاد؛ املا ندارد' : (it.l.kind === 'poem' ? 'شعر' + (it.l.author ? ' — ' + it.l.author : '') : 'نثر');
        var best = it.free ? null : bestScore(it.l.n);
        b.innerHTML = '<span class="num">' + fa(it.l.n) + '</span><span><div class="t">' + esc(it.l.title) + '</div><div class="s">' + esc(sub) + '</div></span>' +
          (best !== null ? '<span class="best">بهترین: ' + fa(best) + '</span>' : '');
        if (it.free) b.disabled = true; else b.addEventListener('click', function () { openLesson(it.l); });
        g.appendChild(b);
      });
    });
  }

  /* ---------- تخته ---------- */
  var board = new window.Board($('#boardWrap'));
  var TOOLS = [['pen', '✏️', 'قلم'], ['hl', '🖍️', 'ماژیک'], ['erase', '🧽', 'پاک‌کن'], ['line', '📏', 'خط'], ['arrow', '➡️', 'پیکان'],
    ['rect', '▭', 'مستطیل'], ['ellipse', '⭕', 'بیضی'], ['text', '🔤', 'نوشتن'], ['laser', '🔴', 'لیزر']];
  var COLORS = ['#f5f5f0', '#111827', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

  function buildTools() {
    var t = $('#tools'); t.innerHTML = '';
    function grp() { var d = document.createElement('div'); d.className = 'grp'; t.appendChild(d); return d; }
    function btn(parent, label, title, fn, cls) {
      var b = document.createElement('button'); b.type = 'button'; b.innerHTML = label; b.title = title || '';
      if (cls) b.className = cls; b.addEventListener('click', fn); parent.appendChild(b); return b;
    }
    var g
