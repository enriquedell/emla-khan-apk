/* املاخوان — پیوند صدای درس‌ها (سایت رشد). طراح: منوچهر کریمی */
(function () {
  'use strict';
  var FA = '۰۱۲۳۴۵۶۷۸۹';
  var box = null, link = null;

  function lessonNo() {
    var t = (document.getElementById('workTitle') || {}).textContent || '';
    var m = t.match(/درس\s+([۰-۹0-9]+)/);
    if (!m) return null;
    return m[1].replace(/[۰-۹]/g, function (d) { return FA.indexOf(d); });
  }
  function update() {
    var n = lessonNo();
    if (!n) { box.hidden = true; return; }
    box.hidden = false;
    link.href = 'https://www.roshd.ir/503-' + n;
  }
  function build() {
    var bar = document.querySelector('#work .workbar');
    if (!bar || box) return;
    box = document.createElement('div');
    box.className = 'panel';
    box.style.textAlign = 'center';
    link = document.createElement('a');
    link.textContent = '🎧 شنیدن صدای این درس (سایت رشد)';
    link.style.cssText = 'display:inline-block;padding:8px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700';
    var hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'صفحه‌ی صدا داخل خود برنامه باز می‌شود و اینترنت لازم دارد. با دکمه‌ی برگشت گوشی به درس برمی‌گردی.';
    box.appendChild(link);
    box.appendChild(hint);
    bar.insertAdjacentElement('afterend', box);
    update();
    var title = document.getElementById('workTitle');
    if (title) new MutationObserver(update).observe(title, { childList: true, characterData: true, subtree: true });
  }
  build();
})();
